import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConnectedServiceType } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type ServiceTokenModalProps = {
  onSaved?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

// Immich is configured through its dedicated config (URL + ping), not this generic saver.
const SERVICE_OPTIONS = Object.values(ConnectedServiceType)
  .filter((service) => service !== ConnectedServiceType.Immich)
  .map((service) => ({ label: service, value: service }));

const schema = z.object({
  service: z.string().min(1, 'Service is required'),
  value: z.string().min(1, 'Token is required'),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ServiceTokenModal = (p: ServiceTokenModalProps) => {
  const styles = useStyles();
  const { tokenApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: SERVICE_OPTIONS[0]?.value ?? '', value: '', name: '' },
  });

  const handleSave = async (data: FormValues) => {
    if (!tokenApi) return;
    setLoading(true);
    try {
      await tokenApi.tokenControllerSaveServiceToken({
        saveServiceTokenDto: {
          service: data.service as ConnectedServiceType,
          value: data.value.trim(),
          name: data.name?.trim() || undefined,
        },
      });
      toast('Service token saved', 'success');
      await p.onSaved?.();
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the token.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <span style={styles.hint}>
          Stores an encrypted token for a service. Saving again for the same service overwrites the previous token.
          Most services are placeholders today — the token is kept but not yet used.
        </span>

        <Select name='service' label='Service' options={SERVICE_OPTIONS} />
        <Input name='value' label='Token' description='The secret token value' type='text' />
        <Input name='name' label='Name' description='Display name (optional)' type='text' />

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
          <Button label='Save token' onClick={formMethods.handleSubmit(handleSave)} loading={loading} />
        </div>
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 420,
  },
  hint: {
    fontSize: 13,
    color: t.colors.dark05,
    marginBottom: t.spacing.s,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
