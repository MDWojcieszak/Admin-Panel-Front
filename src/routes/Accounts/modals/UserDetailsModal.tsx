import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { MdLogout } from 'react-icons/md';
import { PermissionGroupResponseDto, Role, SessionResponseDto, UserResponseDto } from '~/api/api';
import { AuthService } from '~/apiOld/Auth';
import { Badge, roleTone } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { mkUseStyles, useTheme } from '~/utils/theme';

type UserDetailsModalProps = {
  user?: UserResponseDto;
} & Partial<InternalModalProps>;

export const UserDetailsModal = (p: UserDetailsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { aclApi, sessionApi } = useApi();
  const can = useCan();
  const canReadSessions = can('session.read');

  const user = p.user;
  const isOwner = user?.role === Role.Owner;

  const [groups, setGroups] = useState<PermissionGroupResponseDto[]>([]);
  const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.allSettled([
      aclApi ? aclApi.aclControllerGetUserGroups({ userId: user.id }) : Promise.reject(),
      canReadSessions && sessionApi
        ? sessionApi.sessionControllerGetAllForUserByAdmin({ userId: user.id, take: 20, skip: 0 })
        : Promise.reject(),
    ]).then((results) => {
      if (!active) return;
      if (results[0].status === 'fulfilled') setGroups(results[0].value.data.groups ?? []);
      if (results[1].status === 'fulfilled') setSessions(results[1].value.data.sessions ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, aclApi, sessionApi, canReadSessions]);

  const effectivePermissions = useMemo(() => {
    const set = new Set<string>();
    groups.forEach((g) => g.permissions.forEach((perm) => set.add(perm)));
    return Array.from(set).sort();
  }, [groups]);

  if (!user) return null;

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  const sendReset = async () => {
    try {
      await AuthService.resetPasswordRequest({ email: user.email });
      setResetSent(true);
    } catch (e) {
      console.error('Error sending reset:', e);
    }
  };

  const signOutSession = async (sessionId: string) => {
    if (!sessionApi) return;
    try {
      await sessionApi.sessionControllerRemoveSession({ sessionDto: { sessionId } });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      console.error('Error removing session:', e);
    }
  };

  return (
    <div style={styles.container}>
      {/* Profile */}
      <div style={styles.profile}>
        <div style={styles.avatar}>{(user.email[0] ?? '?').toUpperCase()}</div>
        <div style={styles.profileInfo}>
          <span style={styles.name}>{userName || user.email}</span>
          <span style={styles.email}>{user.email}</span>
          <div style={styles.metaRow}>
            <Badge label={user.role} tone={roleTone(user.role)} />
            <span style={styles.created}>joined {format(new Date(user.createdAt), 'd MMM y')}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Access (read-only) */}
          <div style={styles.section}>
            <span style={styles.sectionTitle}>
              Access {isOwner ? '· owner has full access' : `· ${effectivePermissions.length} permissions`}
            </span>
            {isOwner ? (
              <span style={styles.ownerNote}>This user is an OWNER and bypasses all permission checks.</span>
            ) : (
              <>
                <div style={styles.groupRow}>
                  {groups.length ? (
                    groups.map((group) => (
                      <span key={group.id} style={styles.groupChip}>
                        {group.name}
                      </span>
                    ))
                  ) : (
                    <span style={styles.muted}>No groups assigned. Manage access in Access Control.</span>
                  )}
                </div>
                {effectivePermissions.length ? (
                  <div style={styles.permChips}>
                    {effectivePermissions.map((perm) => (
                      <span key={perm} style={styles.permChip}>
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Sessions */}
          {canReadSessions ? (
            <div style={styles.section}>
              <span style={styles.sectionTitle}>Active sessions · {sessions.length}</span>
              <div style={styles.sessionList}>
                {sessions.map((s) => (
                  <div key={s.id} style={styles.sessionRow}>
                    <div style={styles.sessionInfo}>
                      <span>{[s.browser, s.os].filter(Boolean).join(' · ') || 'Unknown device'}</span>
                      <span style={styles.sessionMeta}>
                        {[s.platform, format(new Date(s.updatedAt), 'd MMM HH:mm')].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <div style={styles.signOut} onClick={() => signOutSession(s.id)}>
                      <MdLogout size={15} color={theme.colors.red} />
                      <span>Sign out</span>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 ? <span style={styles.muted}>No active sessions.</span> : null}
              </div>
            </div>
          ) : null}

          {/* Password */}
          {resetSent ? (
            <span style={styles.resetOk}>Password reset link sent to {user.email}.</span>
          ) : (
            <Button label='Send password reset' variant='secondary' onClick={sendReset} />
          )}
        </>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.l,
    width: 480,
    maxHeight: '70vh',
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  avatar: {
    width: 52,
    height: 52,
    minWidth: 52,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
  profileInfo: {
    gap: 2,
  },
  name: {
    fontWeight: 700,
    fontSize: 18,
  },
  email: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    marginTop: 4,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: 700,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.7),
    padding: `2px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  created: {
    fontSize: 12,
    color: t.colors.dark05,
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
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  groupChip: {
    fontSize: 13,
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    padding: `3px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  permChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
    marginTop: 4,
  },
  permChip: {
    fontSize: 11,
    color: t.colors.blue04,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: `2px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
  },
  sessionList: {
    gap: t.spacing.s,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  sessionInfo: {
    gap: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    cursor: 'pointer',
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.red + t.colorOpacity(0.25)}`,
    whiteSpace: 'nowrap',
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
