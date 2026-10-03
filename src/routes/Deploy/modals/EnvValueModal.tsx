import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { LockedField } from '~/components/LockedField';
import { Switch } from '~/components/Switch';
import { TextArea } from '~/components/TextArea';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { ENV_KEY_PATTERN } from '~/routes/Deploy/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

export type EnvValueInput = { key: string; value: string; isSecret: boolean; description?: string };

type EnvValueModalProps = {
  /** Present when editing; the key is then fixed. */
  initial?: { key: string; value?: string; isSecret: boolean; description?: string | null };
  /** Global variables carry a description; application env entries do not. */
  withDescription?: boolean;
  onSave?: (input: EnvValueInput) => Promise<void>;
} & Partial<InternalModalProps>;

type EnvForm = { key: string; value: string; description: string };

/**
 * Add or change one `KEY=value`. A secret's current value is never sent to the
 * panel, so editing a secret means typing its replacement.
 */
export const EnvValueModal = (p: EnvValueModalProps) => {
  const styles = useStyles();
  const toast = useToast();
  const can = useCan();
  const canSecrets = can('deploy.secrets');

  const editing = Boolean(p.initial);
  const form = useForm<EnvForm>({
    mode: 'onChange',
    defaultValues: {
      key: p.initial?.key ?? '',
      value: p.initial?.isSecret ? '' : p.initial?.value ?? '',
      description: p.initial?.description ?? '',
    },
  });
  const [isSecret, setIsSecret] = useState(p.initial?.isSecret ?? false);
  const [saving, setSaving] = useState(false);
  const [key, value] = form.watch(['key', 'value']);

  const keyValid = ENV_KEY_PATTERN.test(key ?? '');
  const secretBlocked = isSecret && !canSecrets;
  const needsValue = isSecret && !value;

  const save = async ({ key, value, description }: EnvForm) => {
    if (!p.onSave || !keyValid || secretBlocked || needsValue) return;
    setSaving(true);
    try {
      await p.onSave({ key: key.trim(), value, isSecret, description: description || undefined });
      p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, `Could not save ${key}.`), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...form}>
      <div style={styles.container}>
        {editing ? (
          <LockedField label='Key' value={p.initial?.key} hint='The key of an existing entry cannot change' />
        ) : (
          <Input
            name='key'
            label='Key'
            description={
              key && !keyValid ? 'Letters, digits and underscores; not starting with a digit' : 'e.g. DB_HOST'
            }
          />
        )}
        <TextArea
          name='value'
          label='Value'
          rows={3}
          description={
            p.initial?.isSecret ? 'Type the new value — the current one cannot be shown' : 'May reference [[OTHER_KEY]]'
          }
        />
        {p.withDescription ? <Input name='description' label='Description' description='What it is for' /> : null}
        <Switch
          checked={isSecret}
          onChange={setIsSecret}
          label='Secret — encrypted, never shown again'
          disabled={!canSecrets && !isSecret}
        />
        {secretBlocked ? <span style={styles.error}>Writing a secret needs the deploy.secrets permission.</span> : null}
        <Button
          label={editing ? 'Save' : 'Add'}
          onClick={form.handleSubmit(save)}
          loading={saving}
          disabled={!keyValid || secretBlocked || needsValue}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 460 },
  error: { fontSize: 12, color: t.colors.red },
}));
