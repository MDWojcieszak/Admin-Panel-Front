import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CommandMatchType,
  CommandRuntimeStatus,
  CreateCommandProgressMarkerDto,
  ProcessLogLevel,
} from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Loader } from '~/components/Loader';
import { Select } from '~/components/Select';
import { ActionButtons } from '~/components/Table/ActionButtons';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useMarkers } from '~/routes/Servers/hooks/useMarkers';
import { mkUseStyles } from '~/utils/theme';

type CommandMarkersModalProps = {
  commandId?: string;
  commandName?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z
  .object({
    label: z.string().optional(),
    pattern: z.string().min(1, 'Pattern is required'),
    matchType: z.nativeEnum(CommandMatchType),
    progress: z.string().optional(),
    order: z.string().optional(),
    runtimeStatus: z.string().optional(),
    level: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.progress && !val.runtimeStatus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['progress'],
        message: 'Provide a progress value or a runtime status',
      });
    }
    if (val.progress && (Number(val.progress) < 0 || Number(val.progress) > 100)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['progress'], message: 'Progress must be between 0 and 100' });
    }
  });
type SchemaType = z.infer<typeof Schema>;

const EMPTY_FORM: SchemaType = {
  label: '',
  pattern: '',
  matchType: CommandMatchType.Contains,
  progress: '',
  order: '',
  runtimeStatus: '',
  level: '',
};

const matchTypeOptions = Object.values(CommandMatchType).map((mt) => ({ label: mt, value: mt }));
const runtimeStatusOptions = [
  { label: 'None', value: '' },
  ...Object.values(CommandRuntimeStatus).map((rs) => ({ label: rs, value: rs })),
];
const levelOptions = [
  { label: 'None', value: '' },
  ...Object.values(ProcessLogLevel).map((lvl) => ({ label: lvl, value: lvl })),
];

export const CommandMarkersModal = (p: CommandMarkersModalProps) => {
  const styles = useStyles();
  const { markers, loading, createMarker, updateMarker, deleteMarker } = useMarkers(p.commandId);
  const canManage = p.canManage ?? true;

  const [editingId, setEditingId] = useState<string>();
  const [saving, setSaving] = useState(false);

  const formMethods = useForm<SchemaType>({ resolver: zodResolver(Schema), defaultValues: EMPTY_FORM });

  const resetForm = () => {
    formMethods.reset(EMPTY_FORM);
    setEditingId(undefined);
  };

  const loadIntoForm = (markerId: string) => {
    const marker = markers.find((m) => m.id === markerId);
    if (!marker) return;
    setEditingId(marker.id);
    formMethods.reset({
      label: marker.label ?? '',
      pattern: marker.pattern,
      matchType: marker.matchType,
      progress: marker.progress != null ? String(marker.progress) : '',
      runtimeStatus: marker.runtimeStatus ?? '',
      level: marker.level ?? '',
      order: marker.order != null ? String(marker.order) : '',
    });
  };

  const buildDto = (data: SchemaType): CreateCommandProgressMarkerDto => {
    const dto: CreateCommandProgressMarkerDto = { pattern: data.pattern, matchType: data.matchType };
    if (data.label) dto.label = data.label;
    if (data.progress) dto.progress = Number(data.progress);
    if (data.runtimeStatus) dto.runtimeStatus = data.runtimeStatus as CommandRuntimeStatus;
    if (data.level) dto.level = data.level as ProcessLogLevel;
    if (data.order) dto.order = Number(data.order);
    return dto;
  };

  const handleSave = async (data: SchemaType) => {
    if (!canManage) return;
    setSaving(true);
    try {
      if (editingId) await updateMarker(editingId, buildDto(data));
      else await createMarker(buildDto(data));
      resetForm();
    } catch (e) {
      console.error('Error saving marker:', e);
    } finally {
      setSaving(false);
    }
  };

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
        <FormProvider {...formMethods}>
          <div style={styles.form}>
            <span style={styles.formTitle}>{editingId ? 'Edit marker' : 'Add marker'}</span>
            <div style={styles.row}>
              <Input name='label' label='Label' description='Optional display name' style={styles.field} />
              <Select
                name='matchType'
                label='Match type'
                description='How the pattern is matched'
                options={matchTypeOptions}
                style={styles.field}
              />
            </div>
            <Input name='pattern' label='Pattern' description='Text or regex to match in the log line' />
            <div style={styles.row}>
              <Input name='progress' label='Progress %' description='0–100 (optional)' type='number' style={styles.field} />
              <Input name='order' label='Order' description='Sort order (optional)' type='number' style={styles.field} />
            </div>
            <div style={styles.row}>
              <Select
                name='runtimeStatus'
                label='Runtime status'
                description='Optional runtime status'
                options={runtimeStatusOptions}
                style={styles.field}
              />
              <Select name='level' label='Log level' description='Optional log level' options={levelOptions} style={styles.field} />
            </div>
            <div style={styles.row}>
              <Button
                label={editingId ? 'Save marker' : 'Add marker'}
                onClick={formMethods.handleSubmit(handleSave)}
                loading={saving}
              />
              {editingId ? <Button label='Cancel' variant='secondary' onClick={resetForm} /> : null}
            </div>
          </div>
        </FormProvider>
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
    gap: t.spacing.m,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
}));
