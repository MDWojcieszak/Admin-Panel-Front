import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateServerTransferDto, ServerTransferMode, ServerTransferResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type TransferModalProps = {
  categoryId?: string;
  transfer?: ServerTransferResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  originPath: z.string().min(1, 'Origin path is required'),
  targetPath: z.string().min(1, 'Target path is required'),
  mode: z.nativeEnum(ServerTransferMode),
  enableMoveBackup: z.boolean(),
  moveBackupPath: z.string().optional(),
  bwLimitKbps: z.string().optional(),
  isEnabled: z.boolean(),
  secondsStart: z.string().optional(),
  secondsStop: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

const modeOptions = Object.values(ServerTransferMode).map((mode) => ({ label: mode, value: mode }));

export const TransferModal = (p: TransferModalProps) => {
  const styles = useStyles();
  const { defaultApi } = useApi();
  const canManage = p.canManage ?? true;
  const isEdit = Boolean(p.transfer);
  const [saving, setSaving] = useState(false);

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: p.transfer?.name ?? '',
      description: p.transfer?.description ?? '',
      originPath: p.transfer?.originPath ?? '',
      targetPath: p.transfer?.targetPath ?? '',
      mode: p.transfer?.mode ?? ServerTransferMode.Copy,
      enableMoveBackup: p.transfer?.enableMoveBackup ?? false,
      moveBackupPath: p.transfer?.moveBackupPath ?? '',
      bwLimitKbps: p.transfer?.bwLimitKbps != null ? String(p.transfer.bwLimitKbps) : '',
      isEnabled: true,
      secondsStart: '0',
      secondsStop: '0',
    },
  });

  const enableMoveBackup = formMethods.watch('enableMoveBackup');

  const handleSave = async (data: SchemaType) => {
    if (!defaultApi || !canManage) return;
    setSaving(true);
    try {
      const shared = {
        name: data.name,
        description: data.description || undefined,
        originPath: data.originPath,
        targetPath: data.targetPath,
        mode: data.mode,
        enableMoveBackup: data.enableMoveBackup,
        moveBackupPath: data.moveBackupPath || undefined,
        bwLimitKbps: data.bwLimitKbps ? Number(data.bwLimitKbps) : undefined,
      };
      if (isEdit && p.transfer) {
        await defaultApi.serverTransferControllerPatch({ id: p.transfer.id, patchServerTransferDto: shared });
      } else {
        const dto: CreateServerTransferDto = {
          ...shared,
          isEnabled: data.isEnabled,
          secondsStart: Number(data.secondsStart) || 0,
          secondsStop: Number(data.secondsStop) || 0,
        };
        await defaultApi.serverTransferControllerCreate({ id: p.categoryId ?? '', createServerTransferDto: dto });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving transfer:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <div style={styles.row}>
          <Input name='name' label='Name' description='Transfer name' style={styles.field} />
          <Select name='mode' label='Mode' description='Copy or move' options={modeOptions} style={styles.field} />
        </div>
        <Input name='description' label='Description' description='Optional description' />
        <Input name='originPath' label='Origin path' description='Source directory' />
        <Input name='targetPath' label='Target path' description='Destination directory' />

        <label style={styles.checkboxRow}>
          <input type='checkbox' disabled={!canManage} {...formMethods.register('isEnabled')} />
          <span>Enabled</span>
        </label>
        <label style={styles.checkboxRow}>
          <input type='checkbox' disabled={!canManage} {...formMethods.register('enableMoveBackup')} />
          <span>Enable move backup</span>
        </label>
        {enableMoveBackup ? (
          <Input name='moveBackupPath' label='Move backup path' description='Where moved files are backed up' />
        ) : null}

        <div style={styles.row}>
          <Input name='bwLimitKbps' label='Bandwidth limit (Kbps)' description='Optional' type='number' style={styles.field} />
          {!isEdit ? (
            <>
              <Input name='secondsStart' label='Start (s)' description='Delay before start' type='number' style={styles.field} />
              <Input name='secondsStop' label='Stop (s)' description='Auto-stop after' type='number' style={styles.field} />
            </>
          ) : null}
        </div>

        <Button
          label={isEdit ? 'Save transfer' : 'Create transfer'}
          onClick={formMethods.handleSubmit(handleSave)}
          loading={saving}
          disabled={!canManage}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 480,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  field: {
    flex: 1,
    minWidth: 0,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    cursor: 'pointer',
    fontSize: 14,
  },
}));
