import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiAlertTriangle, FiCheck, FiCopy } from 'react-icons/fi';
import { IntegrationPlatform } from '~/api/api';
import { Button } from '~/components/Button';
import { DateInput } from '~/components/DateInput';
import { Input } from '~/components/Input';
import { PermissionPicker } from '~/components/PermissionPicker';
import { Select } from '~/components/Select';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { usePermissionCatalog } from '~/hooks/usePermissionCatalog';
import { usePermissions } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { PLATFORM_OPTIONS } from '~/utils/integrationPlatform';
import { mkUseStyles } from '~/utils/theme';

/** Shared with the page so it can drive `hide()` while the built-in close is off. */
export const CREATE_INTEGRATION_TOKEN_MODAL_ID = 'create-integration-token';

type CreateIntegrationTokenModalProps = {
  /**
   * Closes the modal. The manager's own close is disabled for this modal, so a
   * misplaced backdrop click cannot discard a token that is shown exactly once.
   */
  onDone: () => void;
  onCreated?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const Schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(64, 'Use at most 64 characters'),
  platform: z.string().min(1, 'Platform is required'),
  expires: z.boolean(),
  expiresAt: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

export const CreateIntegrationTokenModal = (p: CreateIntegrationTokenModalProps) => {
  const styles = useStyles();
  const { integrationsApi } = useApi();
  const { grouped } = usePermissionCatalog();
  const { permissions, isOwner } = usePermissions();
  const toast = useToast();

  const [scopes, setScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>();
  const [copied, setCopied] = useState(false);

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', platform: IntegrationPlatform.Other, expires: true, expiresAt: '' },
  });

  const expires = formMethods.watch('expires');

  /**
   * A token's reach is the intersection of its scopes with what its owner has,
   * so offering a scope the user lacks would only mint dead access. An OWNER is
   * the exception in the other direction: the bypass does not carry into a
   * token, so they pick from the full catalog explicitly.
   */
  const available = useMemo(() => {
    if (isOwner) return grouped;
    const mine = new Set(permissions);
    return grouped
      .map((group) => ({ ...group, permissions: group.permissions.filter((d) => mine.has(d.key)) }))
      .filter((group) => group.permissions.length > 0);
  }, [grouped, permissions, isOwner]);

  const handleCreate = async (data: SchemaType) => {
    if (!integrationsApi) return;
    if (scopes.length === 0) {
      toast('Pick at least one permission for this token.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data: created } = await integrationsApi.integrationControllerCreateToken({
        createIntegrationTokenDto: {
          name: data.name.trim(),
          platform: data.platform as IntegrationPlatform,
          scopes,
          expires: data.expires,
          expiresAt: data.expires && data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
        },
      });
      setToken(created.token);
      await p.onCreated?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the token.'), 'error');
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
      toast('Could not copy — select the value and copy it manually.', 'error');
    }
  };

  if (token) {
    return (
      <div style={styles.container}>
        <span style={styles.heading}>Token created</span>

        <div style={styles.warningBanner}>
          <FiAlertTriangle size={16} />
          <span>Save it now — the value is never stored in the clear, so we cannot show it again.</span>
        </div>

        <div style={styles.tokenBox}>{token}</div>

        <div style={styles.actions}>
          <Button
            label={copied ? 'Copied' : 'Copy token'}
            variant={copied ? 'secondary' : 'primary'}
            icon={copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
            onClick={handleCopy}
          />
          <Button label='Done' variant={copied ? 'primary' : 'secondary'} onClick={p.onDone} />
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <span style={styles.heading}>Add an integration manually</span>
        <span style={styles.hint}>
          For scripts and CLI tools that cannot open a browser. Desktop apps should use their own “Authorize” button
          instead.
        </span>

        <Input name='name' label='Name' description='Where will this token be used?' type='text' />
        <Select name='platform' label='Platform' options={PLATFORM_OPTIONS} />

        <div style={styles.scopeBlock}>
          <div style={styles.scopeHeader}>
            <span style={styles.scopeTitle}>Permissions</span>
            <span style={styles.scopeCount}>{scopes.length} selected</span>
          </div>
          {available.length === 0 ? (
            <span style={styles.hint}>You have no permissions that a token could carry.</span>
          ) : (
            <PermissionPicker grouped={available} value={scopes} onChange={setScopes} columns={1} height={220} />
          )}
        </div>

        <div style={styles.switchRow}>
          <Switch
            checked={expires}
            onChange={(v) => formMethods.setValue('expires', v, { shouldValidate: true })}
            label='Expires'
          />
          <span style={styles.hint}>
            {expires ? 'Leave the date empty for the default of one year.' : 'This token will never expire.'}
          </span>
        </div>

        {expires ? <DateInput name='expiresAt' label='Expires at' description='Optional' /> : null}

        <div style={styles.actions}>
          <Button label='Cancel' variant='secondary' onClick={p.onDone} />
          <Button
            label='Create token'
            onClick={formMethods.handleSubmit(handleCreate)}
            loading={loading}
            disabled={scopes.length === 0}
          />
        </div>
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 'min(440px, calc(100vw - 48px))',
  },
  heading: {
    fontSize: 18,
    fontWeight: 700,
  },
  hint: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  scopeBlock: {
    gap: t.spacing.s,
    marginTop: t.spacing.s,
  },
  scopeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scopeTitle: {
    fontWeight: 700,
    fontSize: 14,
  },
  scopeCount: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  switchRow: {
    gap: t.spacing.xs,
    marginTop: t.spacing.s,
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
