import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiRefreshCw } from 'react-icons/fi';
import { PhotoEntryCountsSource, PhotoEntryDetailsResponse, PhotoEntryType } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { formatAmount } from '~/utils/formatAmount';
import { mkUseStyles } from '~/utils/theme';

type EntryProgressPanelProps = {
  entry: PhotoEntryDetailsResponse;
  onChanged?: () => void | Promise<void>;
};

/** `''` means "clear to unknown", which is a different instruction from "leave alone". */
type CountField = 'photoCount' | 'selectedCount' | 'editedCount';

const NO_WRAP = { flexShrink: 0, whiteSpace: 'nowrap' } as const;

const toInput = (value?: number | null): string => (value == null ? '' : String(value));

const parseInput = (value: string): number | null | undefined => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined;
};

/** Unknown is shown as a dash, never as zero — the two mean different things. */
const show = (value?: number | null): string => (value == null ? '—' : formatAmount(value));

export const EntryProgressPanel = ({ entry, onChanged }: EntryProgressPanelProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();
  const toast = useToast();

  // Kept locally because re-showing an already-visible modal does not refresh its
  // props, so this panel has to pull the entry back itself after it changes it.
  const [current, setCurrent] = useState(entry);
  const [values, setValues] = useState<Record<CountField, string>>({
    photoCount: toInput(entry.photoCount),
    selectedCount: toInput(entry.selectedCount),
    editedCount: toInput(entry.editedCount),
  });
  // Numbers are read far more often than they are typed, so the inputs only
  // appear on request; an always-open form made the card look half-finished.
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const resetValues = (source: PhotoEntryDetailsResponse) =>
    setValues({
      photoCount: toInput(source.photoCount),
      selectedCount: toInput(source.selectedCount),
      editedCount: toInput(source.editedCount),
    });

  useEffect(() => {
    setCurrent(entry);
    resetValues(entry);
  }, [entry]);

  const reloadEntry = async () => {
    if (!photoEntryApi) return;
    const { data } = await photoEntryApi.photoEntryControllerGetById({ id: entry.id });
    setCurrent(data);
    resetValues(data);
  };

  // Mirrors the backend's rule so the form refuses before the request does.
  const validationError = useMemo(() => {
    const photo = parseInput(values.photoCount);
    const selected = parseInput(values.selectedCount);
    const edited = parseInput(values.editedCount);

    if (photo === undefined || selected === undefined || edited === undefined) {
      return 'Counts must be whole numbers, or empty for unknown.';
    }
    if (edited != null && selected != null && edited > selected) return 'Edited cannot exceed selected.';
    if (selected != null && photo != null && selected > photo) return 'Selected cannot exceed the frame count.';

    return undefined;
  }, [values]);

  const handleSave = async () => {
    if (!photoEntryApi || validationError) return;
    setSaving(true);
    try {
      await photoEntryApi.photoEntryControllerPatchProgress({
        id: entry.id,
        patchPhotoEntryProgressDto: {
          photoCount: parseInput(values.photoCount),
          selectedCount: parseInput(values.selectedCount),
          editedCount: parseInput(values.editedCount),
        },
      });
      await reloadEntry();
      await onChanged?.();
      setEditing(false);
      toast('Progress saved', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the counts.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!photoEntryApi) return;
    setRefreshing(true);
    try {
      await photoEntryApi.photoEntryControllerRefreshCounts({ id: entry.id });
      await reloadEntry();
      await onChanged?.();
      toast('Counted from the folders', 'success');
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not count the folders.'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  /** Astro has no selection folders, and nothing can be counted before they exist. */
  const canRefresh =
    current.foldersCreated && (current.type === PhotoEntryType.General || current.type === PhotoEntryType.Work);

  if (editing) {
    return (
      <div style={styles.container}>
        <div style={styles.fields}>
          <CountInput
            label='Frames'
            hint='Everything shot. A RAW+JPEG pair is one frame.'
            value={values.photoCount}
            onChange={(v) => setValues((prev) => ({ ...prev, photoCount: v }))}
          />
          <CountInput
            label='Selected'
            hint='Exported to the selects folder.'
            value={values.selectedCount}
            onChange={(v) => setValues((prev) => ({ ...prev, selectedCount: v }))}
          />
          <CountInput
            label='Edited'
            hint='Finished frames.'
            value={values.editedCount}
            onChange={(v) => setValues((prev) => ({ ...prev, editedCount: v }))}
          />
        </div>

        <span style={styles.hint}>Leave a field empty to record it as unknown — that is not the same as zero.</span>

        {validationError ? <div style={styles.error}>{validationError}</div> : null}

        <div style={styles.actions}>
          <Button
            label='Cancel'
            variant='secondary'
            style={NO_WRAP}
            onClick={() => {
              resetValues(current);
              setEditing(false);
            }}
          />
          <Button
            label='Save counts'
            style={NO_WRAP}
            onClick={handleSave}
            loading={saving}
            disabled={Boolean(validationError)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.stats}>
        <Stat label='Frames' value={show(current.photoCount)} />
        <Stat label='Selected' value={show(current.selectedCount)} />
        <Stat label='Edited' value={show(current.editedCount)} />
        <RemainingStat remaining={current.remainingToEdit} />
      </div>

      <div style={styles.footer}>
        <div style={styles.sourceRow}>
          {current.countsSource ? (
            <Badge
              label={current.countsSource === PhotoEntryCountsSource.Scanned ? 'Counted from disk' : 'Reported'}
              tone={current.countsSource === PhotoEntryCountsSource.Scanned ? 'blue' : 'neutral'}
            />
          ) : (
            <span style={styles.hint}>No counts recorded yet</span>
          )}
          {current.countsUpdatedAt ? (
            <span style={styles.hint}>Updated {new Date(current.countsUpdatedAt).toLocaleString()}</span>
          ) : null}
        </div>

        <div style={styles.actions}>
          {canRefresh ? (
            <Button
              label='Count from folders'
              variant='secondary'
              style={NO_WRAP}
              icon={<FiRefreshCw size={14} />}
              onClick={handleRefresh}
              loading={refreshing}
            />
          ) : null}
          <Button
            label='Edit counts'
            variant='secondary'
            style={NO_WRAP}
            icon={<FiEdit2 size={14} />}
            onClick={() => setEditing(true)}
          />
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => {
  const styles = useStyles();
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
};

/**
 * The one figure on this panel that is a verdict rather than a count, so it
 * says so: outstanding work is amber, and reaching zero is marked as finished
 * with a tick that draws itself. Unknown stays a neutral dash — it must not be
 * mistaken for either.
 */
const RemainingStat = ({ remaining }: { remaining?: number | null }) => {
  const styles = useStyles();

  if (remaining == null) return <Stat label='Left to edit' value='—' />;

  if (remaining === 0) {
    return (
      <div style={{ ...styles.stat, ...styles.statDone }}>
        {/* Keyed so the tick redraws each time the count lands on zero. */}
        <motion.svg
          key='done'
          width='28'
          height='28'
          viewBox='0 0 28 28'
          fill='none'
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        >
          <motion.circle
            cx='14'
            cy='14'
            r='12'
            stroke='currentColor'
            strokeWidth='2'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
          <motion.path
            d='M8.5 14.5l3.6 3.6 7.4-8'
            stroke='currentColor'
            strokeWidth='2.4'
            strokeLinecap='round'
            strokeLinejoin='round'
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
          />
        </motion.svg>
        <span style={styles.statLabelStrong}>All done</span>
      </div>
    );
  }

  return (
    <div style={{ ...styles.stat, ...styles.statPending }}>
      <span style={styles.statValue}>{formatAmount(remaining)}</span>
      <span style={styles.statLabelStrong}>Left to edit</span>
    </div>
  );
};

const CountInput = ({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const styles = useStyles();

  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        type='number'
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='—'
        style={styles.input}
      />
      <span style={styles.hint}>{hint}</span>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    minWidth: 0,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
    gap: t.spacing.s,
  },
  stat: {
    gap: 2,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.medium,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.55),
  },
  statValue: { fontSize: 24, fontWeight: 700, lineHeight: 1.1 },
  statLabel: { fontSize: 12, color: t.colors.dark05 },
  statLabelStrong: { fontSize: 12, fontWeight: 600 },
  statPending: {
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.3)}`,
  },
  statDone: {
    color: t.colors.lightGreen,
    backgroundColor: t.colors.lightGreen + t.colorOpacity(0.1),
    border: `1px solid ${t.colors.lightGreen + t.colorOpacity(0.3)}`,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
    gap: t.spacing.m,
  },
  field: {
    gap: t.spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 700,
  },
  input: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 14,
    minWidth: 0,
  },
  hint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  error: {
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.red + t.colorOpacity(0.28)}`,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
}));
