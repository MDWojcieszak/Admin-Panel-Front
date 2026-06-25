import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { MdLogout, MdOutlineMail } from 'react-icons/md';
import {
  PatchUserSettingsDto,
  SessionResponseDto,
  TestNotificationType,
  UserSettingsResponseDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { CenteredCard } from '~/components/CenteredCard';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { useToast } from '~/hooks/useToast';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SettingKey = keyof PatchUserSettingsDto;

/** The dead push channels — shown but not yet wired on the backend. */
const COMING_SOON: SettingKey[] = ['serverPushNotifications', 'processPushNotifications'];

const TEST_EMAILS: { type: TestNotificationType; label: string }[] = [
  { type: TestNotificationType.ServerOnline, label: 'Server online' },
  { type: TestNotificationType.ServerOffline, label: 'Server offline' },
  { type: TestNotificationType.ServerWakeFailed, label: 'Wake failed' },
  { type: TestNotificationType.ServerIdle, label: 'Server idle' },
  { type: TestNotificationType.ProcessFailed, label: 'Process failed' },
];

const Toggle = ({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <motion.div
      style={{ ...styles.toggle, backgroundColor: value ? theme.colors.blue : theme.colors.gray01 }}
      onClick={() => onChange(!value)}
      animate={{ backgroundColor: value ? theme.colors.blue : theme.colors.gray01 }}
    >
      <motion.div
        style={styles.knob}
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </motion.div>
  );
};

export const Settings = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { userApi, sessionApi, notificationsApi } = useApi();
  const auth = useAuth();
  const toast = useToast();

  const [settings, setSettings] = useState<UserSettingsResponseDto>();
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState<TestNotificationType>();

  const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!userApi) return;
    setLoading(true);
    userApi
      .userControllerGetSettings()
      .then((res) => setSettings(res.data))
      .catch((e) => console.error('Error loading user settings:', e))
      .finally(() => setLoading(false));
  }, [userApi]);

  useEffect(() => {
    if (!sessionApi) return;
    let active = true;
    setSessionsLoading(true);
    Promise.allSettled([
      sessionApi.sessionControllerGetAllForUser({ take: 50, skip: 0 }),
      sessionApi.sessionControllerGetCurrent(),
    ])
      .then(([listResult, currentResult]) => {
        if (!active) return;
        const list = listResult.status === 'fulfilled' ? listResult.value.data.sessions ?? [] : [];
        const current = currentResult.status === 'fulfilled' ? currentResult.value.data : undefined;
        setCurrentSessionId(current?.id);
        // Always surface the current session, even if /session/my comes back empty.
        const merged = current && !list.some((s) => s.id === current.id) ? [current, ...list] : list;
        setSessions(merged);
      })
      .catch((e) => console.error('Error loading sessions:', e))
      .finally(() => {
        if (active) setSessionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionApi]);

  const update = async (key: SettingKey, value: boolean) => {
    if (!userApi || !settings) return;
    const prev = settings;
    setSettings({ ...settings, [key]: value });
    try {
      await userApi.userControllerUpdateSettings({ patchUserSettingsDto: { [key]: value } });
    } catch (e) {
      console.error('Error updating settings:', e);
      setSettings(prev);
    }
  };

  // Fires a real email of the given type to the logged-in user only — the backend
  // ignores flags/permissions for this, so it's a direct "does email work?" probe.
  const sendTest = async (type: TestNotificationType) => {
    if (!notificationsApi || sendingTest) return;
    setSendingTest(type);
    try {
      const { data } = await notificationsApi.notificationControllerSendTest({
        sendTestNotificationDto: { type },
      });
      toast(`Test email sent to ${data.email}`, 'success');
    } catch (e) {
      const raw = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const message = Array.isArray(raw) ? raw.join(', ') : raw;
      toast(message || 'Could not send the test email. Check the mail server.', 'error');
    } finally {
      setSendingTest(undefined);
    }
  };

  const signOutSession = async (sessionId: string, isCurrent: boolean) => {
    if (!sessionApi) return;
    try {
      await sessionApi.sessionControllerRevokeOwn({ id: sessionId });
      if (isCurrent) {
        // Revoking the current session logs this device out.
        auth.removeTokens();
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      console.error('Error removing session:', e);
    }
  };

  const signOutOthers = async () => {
    if (!sessionApi) return;
    try {
      await sessionApi.sessionControllerRevokeOthers();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch (e) {
      console.error('Error signing out other sessions:', e);
    }
  };

  const groups: { title: string; rows: { key: SettingKey; label: string; description: string }[] }[] = [
    {
      title: 'Servers',
      rows: [
        {
          key: 'serverStatusEmailNotifications',
          label: 'Server status (email)',
          description: 'Email me when a server goes online or offline.',
        },
        {
          key: 'serverIdleEmailNotifications',
          label: 'Server idle (email)',
          description: 'Email me when a server has been idle.',
        },
        { key: 'serverPushNotifications', label: 'Server push', description: 'Push notifications for server events.' },
      ],
    },
    {
      title: 'Processes',
      rows: [
        {
          key: 'processEmailNotifications',
          label: 'Process updates (email)',
          description: 'Email me about command/process results.',
        },
        { key: 'processPushNotifications', label: 'Process push', description: 'Push notifications for processes.' },
      ],
    },
  ];

  return (
    <CenteredCard maxWidth={640}>
      <h2 style={styles.heading}>User Settings</h2>

      <div style={styles.block}>
        <span style={styles.blockTitle}>Notifications</span>
        {loading || !settings ? (
          <Loader />
        ) : (
          groups.map((group) => (
            <div key={group.title} style={styles.section}>
              <span style={styles.sectionTitle}>{group.title}</span>
              {group.rows.map((row) => {
                const comingSoon = COMING_SOON.includes(row.key);
                return (
                  <div key={row.key} style={{ ...styles.row, opacity: comingSoon ? 0.55 : 1 }}>
                    <div style={styles.rowText}>
                      <span style={styles.rowLabel}>{row.label}</span>
                      <span style={styles.rowDescription}>{row.description}</span>
                    </div>
                    {comingSoon ? (
                      <span style={styles.soonTag}>Soon</span>
                    ) : (
                      <Toggle value={!!settings[row.key]} onChange={(v) => update(row.key, v)} />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div style={styles.block}>
        <span style={styles.blockTitle}>Send a test email</span>
        <span style={styles.rowDescription}>
          Sends a sample email of each type to your own address — ignores the toggles above, so it always
          arrives. Use it to confirm the mail server works.
        </span>
        <div style={styles.testButtons}>
          {TEST_EMAILS.map((t) => (
            <Button
              key={t.type}
              label={t.label}
              icon={<MdOutlineMail size={16} />}
              variant='secondary'
              onClick={() => sendTest(t.type)}
              loading={sendingTest === t.type}
              disabled={!!sendingTest || !notificationsApi}
            />
          ))}
        </div>
      </div>

      <div style={styles.block}>
        <div style={styles.blockHeader}>
          <span style={styles.blockTitle}>Active sessions · {sessions.length}</span>
          {sessions.length > 1 ? (
            <Button label='Sign out other devices' variant='secondary' onClick={signOutOthers} />
          ) : null}
        </div>
        {sessionsLoading ? (
          <Loader />
        ) : (
          <div style={styles.sessionList}>
            {sessions.map((s) => {
              const current = !!s.isCurrent || s.id === currentSessionId;
              return (
                <div key={s.id} style={styles.sessionRow}>
                  <div style={styles.sessionInfo}>
                    <span>
                      {[s.browser, s.os].filter(Boolean).join(' · ') || 'Unknown device'}
                      {current ? <span style={styles.thisDevice}> · this device</span> : null}
                    </span>
                    <span style={styles.sessionMeta}>
                      {[s.platform, format(new Date(s.updatedAt), 'd MMM HH:mm')].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {current ? (
                    <span style={styles.thisDeviceTag}>current</span>
                  ) : (
                    <div style={styles.signOut} onClick={() => signOutSession(s.id, false)}>
                      <MdLogout size={15} color={theme.colors.red} />
                      <span>Sign out</span>
                    </div>
                  )}
                </div>
              );
            })}
            {sessions.length === 0 ? <span style={styles.muted}>No active sessions.</span> : null}
          </div>
        )}
      </div>
    </CenteredCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  heading: {
    fontSize: 22,
    fontWeight: 700,
  },
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  blockTitle: {
    fontWeight: 700,
    fontSize: 16,
  },
  section: {
    gap: t.spacing.s,
  },
  sectionTitle: {
    fontWeight: 700,
    color: t.colors.blue04,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.l,
    paddingTop: t.spacing.s,
    paddingBottom: t.spacing.s,
  },
  rowText: {
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontWeight: 600,
  },
  rowDescription: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  soonTag: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: t.colors.blue04,
    backgroundColor: t.colors.blue04 + t.colorOpacity(0.14),
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    whiteSpace: 'nowrap',
  },
  testButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.s,
  },
  toggle: {
    width: 44,
    minWidth: 44,
    height: 24,
    boxSizing: 'border-box',
    borderRadius: 999,
    padding: 2,
    cursor: 'pointer',
    justifyContent: 'center',
  },
  knob: {
    width: 20,
    height: 20,
    minWidth: 20,
    borderRadius: '50%',
    backgroundColor: t.colors.white,
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
  thisDevice: {
    color: t.colors.lightGreen,
    fontSize: 12,
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
  thisDeviceTag: {
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.lightGreen,
  },
  muted: {
    color: t.colors.dark05,
    fontSize: 13,
  },
}));
