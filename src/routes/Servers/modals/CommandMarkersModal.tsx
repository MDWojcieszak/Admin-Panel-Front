import { useState } from 'react';
import {
  CommandMatchType,
  CommandRuntimeStatus,
  CreateCommandProgressMarkerDto,
  ProcessLogLevel,
} from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useMarkers } from '~/routes/Servers/hooks/useMarkers';
import { mkUseStyles } from '~/utils/theme';

type CommandMarkersModalProps = {
  commandId?: string;
  commandName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const EMPTY_FORM = {
  label: '',
  pattern: '',
  matchType: CommandMatchType.Contains as CommandMatchType,
  progress: '',
  runtimeStatus: '' as CommandRuntimeStatus | '',
  level: '' as ProcessLogLevel | '',
  order: '',
};

export const CommandMarkersModal = (p: CommandMarkersModalProps) => {
  const styles = useStyles();
  const { markers, loading, createMarker, updateMarker, deleteMarker } = useMarkers(p.commandId);
  const canManage = p.canManage ?? true;

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(undefined);
    setError(undefined);
  };

  const loadIntoForm = (markerId: string) => {
    const marker = markers.find((m) => m.id === markerId);
    if (!marker) return;
    setEditingId(marker.id);
    setForm({
      label: marker.label ?? '',
      pattern: marker.pattern,
      matchType: marker.matchType,
      progress: marker.progress != null ? String(marker.progress) : '',
      runtimeStatus: marker.runtimeStatus ?? '',
      level: marker.level ?? '',
      order: marker.order != null ? String(marker.order) : '',
    });
  };

  const buildDto = (): CreateCommandProgressMarkerDto => {
    const dto: CreateCommandProgressMarkerDto = { pattern: form.pattern, matchType: form.matchType };
    if (form.label) dto.label = form.label;
    if (form.progress !== '') dto.progress = Number(form.progress);
    if (form.runtimeStatus) dto.runtimeStatus = form.runtimeStatus;
    if (form.level) dto.level = form.level;
    if (form.order !== '') dto.order = Number(form.order);
    return dto;
  };

  const handleSave = async () => {
    if (!canManage) return;
    if (!form.pattern.trim()) {
      setError('Pattern is required');
      return;
    }
    if (form.progress === '' && !form.runtimeStatus) {
      setError('Provide at least a progress value or a runtime status');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      if (editingId) await updateMarker(editingId, buildDto());
      else await createMarker(buildDto());
      resetForm();
    } catch (e) {
      console.error('Error saving marker:', e);
      setError('Could not save the marker');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof typeof EMPTY_FORM, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div style={styles.container}>
      <span style={styles.subtitle}>{p.commandName}</span>

      <div style={styles.list}>
        {loading && markers.length === 0 ? <Loader /> : null}
        {markers.map((marker) => (
          <div key={marker.id} style={styles.markerRow}>
            <div style={styles.markerInfo}>
              <span style={styles.markerPattern}>{marker.label || marker.pattern}</span>
              <span style={styles.markerMeta}>
                {marker.matchType}
                {marker.progress != null ? ` · ${marker.progress}%` : ''}
                {marker.runtimeStatus ? ` · ${marker.runtimeStatus}` : ''}
              </span>
            </div>
            {canManage ? (
              <ActionButtons id={marker.id} onEdit={loadIntoForm} onDelete={(id) => deleteMarker(id)} />
            ) : null}
          </div>
        ))}
        {!loading && markers.length === 0 ? <span style={styles.empty}>No markers yet.</span> : null}
      </div>

      {canManage ? (
        <div style={styles.form}>
          <span style={styles.formTitle}>{editingId ? 'Edit marker' : 'Add marker'}</span>
          <div style={styles.row}>
            <input
              style={styles.input}
              placeholder='Label (optional)'
              value={form.label}
              onChange={(e) => setField('label', e.target.value)}
            />
            <select
              style={styles.input}
              value={form.matchType}
              onChange={(e) => setField('matchType', e.target.value)}
            >
              {Object.values(CommandMatchType).map((mt) => (
                <option key={mt} value={mt}>
                  {mt}
                </option>
              ))}
            </select>
          </div>
          <input
            style={styles.input}
            placeholder='Pattern'
            value={form.pattern}
            onChange={(e) => setField('pattern', e.target.value)}
          />
          <div style={styles.row}>
            <input
              style={styles.input}
              type='number'
              min={0}
              max={100}
              placeholder='Progress %'
              value={form.progress}
              onChange={(e) => setField('progress', e.target.value)}
            />
            <input
              style={styles.input}
              type='number'
              min={0}
              placeholder='Order'
              value={form.order}
              onChange={(e) => setField('order', e.target.value)}
            />
          </div>
          <div style={styles.row}>
            <select
              style={styles.input}
              value={form.runtimeStatus}
              onChange={(e) => setField('runtimeStatus', e.target.value)}
            >
              <option value=''>Runtime status —</option>
              {Object.values(CommandRuntimeStatus).map((rs) => (
                <option key={rs} value={rs}>
                  {rs}
                </option>
              ))}
            </select>
            <select style={styles.input} value={form.level} onChange={(e) => setField('level', e.target.value)}>
              <option value=''>Log level —</option>
              {Object.values(ProcessLogLevel).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          {error ? <span style={styles.error}>{error}</span> : null}
          <div style={styles.row}>
            <Button label={editingId ? 'Save marker' : 'Add marker'} onClick={handleSave} loading={saving} />
            {editingId ? <Button label='Cancel' variant='secondary' onClick={resetForm} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    width: 480,
  },
  subtitle: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  list: {
    gap: t.spacing.s,
    maxHeight: 220,
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  markerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  markerInfo: {
    gap: 2,
  },
  markerPattern: {
    fontSize: 14,
  },
  markerMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  empty: {
    color: t.colors.dark05,
  },
  form: {
    gap: t.spacing.s,
    borderTop: `1px solid ${t.colors.gray01}`,
    paddingTop: t.spacing.m,
  },
  formTitle: {
    fontWeight: 600,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: t.spacing.s,
    color: t.colors.white,
    fontSize: 14,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  error: {
    color: t.colors.red,
    fontSize: 13,
  },
}));
