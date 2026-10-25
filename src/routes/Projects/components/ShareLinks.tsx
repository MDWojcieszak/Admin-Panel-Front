import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCheck, FiCopy, FiLink, FiLock } from 'react-icons/fi';
import { CreatedShareLinkResponse, ShareLinkAccess, ShareLinkResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { Field, PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { dueLabel } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Where a link opens: this panel's public page, outside the signed-in part. */
export const shareUrl = (token: string) => `${window.location.origin}/shared/${token}`;

const ACCESS_OPTIONS = [
  { value: ShareLinkAccess.Check, label: 'Can tick things off' },
  { value: ShareLinkAccess.View, label: 'Can only look' },
];

/**
 * Public links (D3), Immich-style: one per person, each revoked on its own.
 * The address is shown once, when the link is made.
 */
export const ShareLinks = ({ projectId }: { projectId: string }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const { projectsApi } = useApi();
  const toast = useToast();
  const [links, setLinks] = useState<ShareLinkResponse[]>([]);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [access, setAccess] = useState<ShareLinkAccess>(ShareLinkAccess.Check);
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<CreatedShareLinkResponse>();
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!projectsApi) return;
    const { data } = await projectsApi.projectControllerListLinks({ id: projectId });
    setLinks(data);
  };

  useEffect(() => {
    load().catch((e) => toast(getApiErrorMessage(e, 'Could not load the links.'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsApi, projectId]);

  const create = async () => {
    if (!projectsApi) return;
    setBusy(true);
    try {
      const { data } = await projectsApi.projectControllerCreateLink({
        id: projectId,
        createShareLinkDto: {
          label: label.trim() || null,
          access,
          // The end of the chosen day, so "until Sunday" includes Sunday.
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
          password: password || null,
        },
      });
      setCreated(data);
      setCopied(false);
      setCreating(false);
      setLabel('');
      setExpiresAt('');
      setPassword('');
      await load();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the link.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (link: ShareLinkResponse) => {
    if (!projectsApi) return;
    try {
      await projectsApi.projectControllerRevokeLink({ id: projectId, linkId: link.id });
      if (created?.id === link.id) setCreated(undefined);
      await load();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not revoke the link.'), 'error');
    }
  };

  const copy = (url: string) =>
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });

  return (
    <div style={styles.container}>
      <div style={{ ...shared.row, justifyContent: 'space-between' }}>
        <span style={shared.fieldLabel}>Links</span>
        {creating ? null : (
          <Button label='New link' variant='secondary' icon={<FiLink size={14} />} onClick={() => setCreating(true)} />
        )}
      </div>
      <span style={shared.muted}>Anyone with a link opens the project without an account. Revoke it any time.</span>

      {created ? (
        <div style={styles.created}>
          <span style={{ fontSize: 13, color: theme.colors.lightGreen }}>
            Link ready. Copy it now: it is not shown again.
          </span>
          <div style={{ ...shared.row, flexWrap: 'nowrap' }}>
            <input
              readOnly
              style={{ ...shared.textInput, ...shared.mono }}
              value={shareUrl(created.token)}
              onFocus={(e) => e.target.select()}
            />
            <Button
              label={copied ? 'Copied' : 'Copy'}
              icon={copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              onClick={() => copy(shareUrl(created.token))}
            />
          </div>
        </div>
      ) : null}

      {creating ? (
        <div style={styles.form}>
          <div style={shared.fieldGrid}>
            <Field label='For'>
              <input
                autoFocus
                style={shared.textInput}
                value={label}
                placeholder='Kasia — groceries'
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
            <Field label='They'>
              <PlainSelect value={access} options={ACCESS_OPTIONS} onChange={(v) => setAccess(v as ShareLinkAccess)} />
            </Field>
            <Field label='Until'>
              <input
                type='date'
                style={shared.textInput}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </Field>
            <Field label='Password'>
              <input
                type='password'
                autoComplete='new-password'
                style={shared.textInput}
                value={password}
                placeholder='None'
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </div>
          <div style={shared.row}>
            <Button label='Create link' onClick={create} loading={busy} disabled={!!password && password.length < 4} />
            <Button label='Cancel' variant='secondary' onClick={() => setCreating(false)} />
          </div>
        </div>
      ) : null}

      {links.length ? (
        <div style={shared.list}>
          {links.map((link) => (
            <div key={link.id} style={{ ...shared.listRow, opacity: link.active ? 1 : 0.55 }}>
              <div style={styles.linkText}>
                <span style={{ ...shared.row, fontSize: 14, fontWeight: 600 }}>
                  {link.label || 'Unnamed link'}
                  {link.hasPassword ? <FiLock size={12} color={theme.colors.dark05} /> : null}
                </span>
                <span style={{ ...shared.muted, fontSize: 12 }}>
                  {[
                    link.access === ShareLinkAccess.Check ? 'ticks off' : 'looks',
                    link.revokedAt
                      ? 'revoked'
                      : link.expiresAt
                        ? link.active
                          ? `until ${dueLabel(link.expiresAt)}`
                          : 'expired'
                        : '',
                    link.openCount
                      ? `opened ${link.openCount}×${
                          link.lastUsedAt
                            ? `, last ${formatDistanceToNow(new Date(link.lastUsedAt), { addSuffix: true })}`
                            : ''
                        }`
                      : 'not opened yet',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              {link.active ? (
                <Button label='Revoke' variant='danger' onClick={() => revoke(link)} />
              ) : (
                <Badge label={link.revokedAt ? 'Revoked' : 'Expired'} />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s },
  form: {
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  created: {
    gap: t.spacing.s,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.lightGreen + t.colorOpacity(0.35)}`,
    backgroundColor: t.colors.lightGreen + t.colorOpacity(0.06),
  },
  linkText: { flex: 1, minWidth: 0, gap: 2 },
}));
