import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImmichStatusResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type ImmichConfigModalProps = {
  /** Current base URL when editing an existing connection. */
  baseUrl?: string;
  /** Current external library root when editing an existing connection. */
  libraryPath?: string;
  onSaved?: (status: ImmichStatusResponse) => void | Promise<void>;
} & Partial<InternalModalProps>;

const schema = z.object({
  baseUrl: z
    .string()
    .min(1, 'Server URL is required')
    .regex(/^https?:\/\//i, 'Must start with http:// or https://'),
  apiKey: z.string().min(1, 'API key is required'),
  libraryPath: z.string().optional(),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ImmichConfigModal = (p: ImmichConfigModalProps) => {
  const styles = useStyles();
  const { immichApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { baseUrl: p.baseUrl ?? '', apiKey: '', libraryPath: p.libraryPath ?? '', name: 'Immich' },
  });

  const handleSave = async (data: FormValues) => {
    if (!immichApi) return;
    setLoading(true);
    try {
      const { data: status } = await immichApi.immichControllerSaveConfig({
        saveImmichConfigDto: {
          baseUrl: data.baseUrl.trim(),
          apiKey: data.apiKey.trim(),
          libraryPath: data.libraryPath?.trim() || undefined,
          name: data.name?.trim() || undefined,
        },
      });

      if (status.connected) {
        toast(`Connected to Immich${status.serverVersion ? ` ${status.serverVersion}` : ''}`, 'success');
      } else {
        toast('Saved, but could not reach the server. Check the URL and API key.', 'info');
      }

      await p.onSaved?.(status);
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the Immich configuration.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <span style={styles.hint}>
          Get the API key from Immich → Account Settings → API Keys. The key is encrypted and never shown again,
          so it must be re-entered whenever you change the URL.
        </span>

        <Input name='baseUrl' label='Server URL' description='e.g. https://photo.example.com/api' type='text' />
        <Input name='apiKey' label='API key' description='Immich API key' type='text' />
        <Input
          name='libraryPath'
          label='Library path'
          description='External library root, e.g. /media/vault — required to create albums'
          type='text'
        />
        <Input name='name' label='Name' description='Display name (optional)' type='text' />

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
          <Button label='Save & verify' onClick={formMethods.handleSubmit(handleSave)} loading={loading} />
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
