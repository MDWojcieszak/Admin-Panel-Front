import { useCallback, useState } from 'react';
import { MdLogout } from 'react-icons/md';
import { AuthService } from '~/apiOld/Auth';
import { Badge, roleTone } from '~/components/Badge';
import { Button } from '~/components/Button';
import { CenteredCard } from '~/components/CenteredCard';
import { useAuth } from '~/hooks/useAuth';
import { usePermissions } from '~/hooks/usePermissions';
import { mkUseStyles } from '~/utils/theme';

export const Account = () => {
  const styles = useStyles();
  const auth = useAuth();
  const { role, isOwner, permissions } = usePermissions();
  const [resetSent, setResetSent] = useState(false);

  const email = auth.userData?.email ?? '';

  const sendReset = async () => {
    if (!email) return;
    try {
      await AuthService.resetPasswordRequest({ email });
      setResetSent(true);
    } catch (e) {
      console.error('Error sending reset:', e);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error('Error logging out:', e);
    }
    auth.removeTokens();
  }, [auth]);

  return (
    <CenteredCard maxWidth={560}>
      <div style={styles.profile}>
          <div style={styles.avatar}>{(email[0] ?? '?').toUpperCase()}</div>
          <div style={styles.profileInfo}>
            <span style={styles.email}>{email || '—'}</span>
            <Badge label={role ?? '—'} tone={roleTone(role)} />
          </div>
        </div>

        <div style={styles.section}>
          <span style={styles.sectionTitle}>
            Access {isOwner ? '· owner has full access' : `· ${permissions.length} permissions`}
          </span>
          {isOwner ? (
            <span style={styles.ownerNote}>You are an OWNER and have access to everything.</span>
          ) : permissions.length ? (
            <div style={styles.permChips}>
              {permissions.map((perm) => (
                <span key={perm} style={styles.permChip}>
                  {perm}
                </span>
              ))}
            </div>
          ) : (
            <span style={styles.muted}>No permissions assigned yet.</span>
          )}
        </div>

        {resetSent ? (
          <span style={styles.resetOk}>Password reset link sent to {email}.</span>
        ) : (
          <Button label='Reset password' variant='secondary' onClick={sendReset} />
        )}

        <Button label='Log out' variant='danger' icon={<MdLogout size={18} />} onClick={handleLogout} />
    </CenteredCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  avatar: {
    width: 56,
    height: 56,
    minWidth: 56,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  profileInfo: {
    gap: 4,
  },
  email: {
    fontWeight: 700,
    fontSize: 18,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
    padding: `2px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    alignSelf: 'flex-start',
  },
  section: {
    gap: t.spacing.s,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  ownerNote: {
    fontSize: 13,
    color: t.colors.lightGreen,
  },
  permChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  permChip: {
    fontSize: 11,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: `2px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  muted: {
    color: t.colors.dark05,
    fontSize: 13,
  },
  resetOk: {
    color: t.colors.lightGreen,
    fontSize: 14,
  },
}));
