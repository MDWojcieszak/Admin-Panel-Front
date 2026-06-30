import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiAlertTriangle, FiCheck, FiCopy } from 'react-icons/fi';
import { ApiKeyType } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type GenerateTokenModalProps = {
  onSaved?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const TYPE_OPTIONS = [
  { label: 'INTERNAL', value: ApiKeyType.Internal },
  { label: 'AI', value: ApiKeyType.Ai },
];

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    expiresAt: z.string().optional(),
  })
  .and(z.object({ expires: z.boolean() }))
  .refine((d) => !d.expires || !!d.expiresAt, {
    message: 'Pick an expiry date',
    path: ['expiresAt'],
  });

type FormValues = z.infer<typeof schema>;

export const GenerateTokenModal = (p: GenerateTokenModalProps) => {
  const styles = useStyles();
  const { tokenApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>();
  const [copied, setCopied] = useState(false);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: ApiKeyType.Internal, expires: false, expiresAt: '' },
  });

  const expires = formMethods.watch('expires');

  const handleGenerate = async (data: FormValues) => {
    if (!tokenApi) return;
    setLoading(true);
    try {
      const { data: res } = await tokenApi.tokenControllerGenerateToken({
        generateTokenDto: {
          name: data.name.trim(),
          type: data.type as ApiKeyType,
          expires: data.expires,
          expiresAt: data.expires && data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
        },
      });
      setToken(res.token);
      await p.onSaved?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not generate the token.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast('Token copied', 'success');
    } catch {
      toast('Could not copy — select and copy manually.', 'error');
    }
  };

  if (token) {
    return (
      <div style={styles.container}>
        <div style={styles.warningBanner}>
          <FiAlertTriangle size={16} />
          <span>Copy this token now — it is shown only once and cannot be recovered.</span>
        </div>

        <div style={styles.tokenBox}>{token}</div>

        <div style={styles.actions}>
          <Button
            label={copied ? 'Copied' : 'Copy'}
            variant='secondary'
            icon={copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            onClick={handleCopy}
          />
          <Button label='Done' onClick={() => p.handleClose?.()} />
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <span style={styles.hint}>
          Generates a personal write-once token. The value is shown only once after creation.
        </span>

        <Input name='name' label='Name' description='What is this token for?' type='text' />
        <Select name='type' label='Type' options={TYPE_OPTIONS} />

        <div style={styles.switchRow}>
          <Switch
            checked={expires}
            onChange={(v) => formMethods.setValue('expires', v, { shouldValidate: true })}
            label='Set an expiry date'
          />
        </div>

        {expires ? (
          <Input name='expiresAt' label='Expires at' description='Token expiry date' type='date' />
        ) : null}

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
          <Button label='Generate' onClick={formMethods.handleSubmit(handleGenerate)} loading={loading} />
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
  switchRow: {
    marginTop: t.spacing.xs,
    marginBottom: t.spacing.s,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.28)}`,
  },
  tokenBox: {
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    fontFamily: 'monospace',
    fontSize: 13,
    wordBreak: 'break-all',
    userSelect: 'all',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
