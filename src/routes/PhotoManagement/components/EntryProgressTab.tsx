import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { PhotoEntryCountsSource, PhotoEntryDetailsResponse, PhotoEntryType } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type EntryProgressTabProps = {
  entry: PhotoEntryDetailsResponse;
  onChanged?: () => void | Promise<void>;
};

/** `''` means "clear to unknown", which is a different instruction from "leave alone". */
type CountField = 'photoCount' | 'selectedCount' | 'editedCount';

const toInput = (value?: number | null): string => (value == null ? '' : String(value));

const parseInput = (value: string): number | null | undefined => {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined;
};

export const EntryProgressTab = ({ entry, onChanged }: EntryProgressTabProps) => {
  const styles = useStyles();
  const { photoEntryApi } = useApi();
  const toast = useToast();

  // Kept locally because re-showing an already-visible modal does not refresh its
  // props, so this tab has to pull the entry back itself after it changes it.
  const [current, setCurrent] = useState(entry);
  const [values, setValues] = useState<Record<CountField, string>>({
    photoCount: toInput(entry.photoCount),
    selectedCount: toInput(entry.selectedCount),
    editedCount: toInput(entry.editedCount),
  });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setCurrent(entry);
    setValues({
      photoCount: toInput(entry.photoCount),
      selectedCount: toInput(entry.selectedCount),
      editedCount: toInput(entry.editedCount),
    });
  }, [entry]);

  const reloadEntry = async () => {
    if (!photoEntryApi) return;
    const { data } = await photoEntryApi.photoEntryControllerGetById({ id: entry.id });
    setCurrent(data);
    setValues({
      photoCount: toInput(data.photoCount),
      selectedCount: toInput(data.selectedCount),
      editedCount: toInput(data.editedCount),
    });
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

      {current.remainingToEdit != null ? (
        <span style={styles.remaining}>{current.remainingToEdit} left to edit</span>
      ) : null}

      <div style={styles.actions}>
        {canRefresh ? (
          <Button
            label='Count from folders'
            variant='secondary'
            icon={<FiRefreshCw size={14} />}
            onClick={handleRefresh}
            loading={refreshing}
          />
        ) : null}
        <Button label='Save counts' onClick={handleSave} loading={saving} disabled={Boolean(validationError)} />
      </div>

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
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
  },
  hint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  remaining: {
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.blue04,
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
    gap: t.spacing.m,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    flexWrap: 'wrap',
  },
}));
