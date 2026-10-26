import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCalendar, FiCheck, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { CalendarFeedResponse, CalendarScope } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { Loader } from '~/components/Loader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { Switch } from '~/components/Switch';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** The address a calendar app subscribes to: the API's, not the panel's. */
const feedUrl = (token: string) => `${import.meta.env.VITE_API_URL}/calendar/${token}.ics`;

const SCOPES = [
  { label: 'My tasks', value: CalendarScope.Mine },
  { label: 'Every dated task', value: CalendarScope.All },
];

/**
 * Due dates in the phone's own calendar: a private iCal address. The server
 * keeps only a hash of it, so the address is shown once, when it is made;
 * losing it means making a new one, which retires the old.
 */
export const CalendarFeedSection = () => {
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const { calendarApi } = useApi();
  const [feed, setFeed] = useState<CalendarFeedResponse>();
  const [url, setUrl] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const shared = useProjectStyles();
  const urlRef = useRef<HTMLInputElement>(null);
  const confirm = useModal('calendar-new-address', ConfirmModal, { title: 'New calendar address' });

  useEffect(() => {
    if (!calendarApi) return;
    calendarApi
      .calendarControllerGet()
      .then(({ data }) => setFeed(data))
      .catch(() => setFeed(undefined));
  }, [calendarApi]);

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    } finally {
      setBusy(false);
    }
  };

  const makeAddress = () =>
    run(async () => {
      if (!calendarApi) return;
      const { data } = await calendarApi.calendarControllerRotate({
        calendarFeedDto: { scope: feed?.scope ?? CalendarScope.Mine },
      });
      setFeed(data);
      setUrl(feedUrl(data.token));
      setCopied(false);
    }, 'Could not make the calendar address.');

  const turnOff = () =>
    run(async () => {
      if (!calendarApi) return;
      await calendarApi.calendarControllerRemove();
      setFeed({ enabled: false, scope: feed?.scope ?? CalendarScope.Mine, lastUsedAt: null, createdAt: null });
      setUrl(undefined);
    }, 'Could not turn the calendar off.');

  const setScope = (scope: CalendarScope) =>
    run(async () => {
      if (!calendarApi || !feed) return;
      if (!feed.enabled) return setFeed({ ...feed, scope });
      const { data } = await calendarApi.calendarControllerUpdate({ calendarFeedDto: { scope } });
      setFeed(data);
    }, 'Could not change what the calendar shows.');

  /** The clipboard needs https; without it the address is selected for copying by hand. */
  const copy = async () => {
    if (!url) return;
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast('Copied', 'success');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      urlRef.current?.focus();
      urlRef.current?.select();
      toast('Selected: copy it with Ctrl+C or a long press.', 'info');
    }
  };

  return (
    <div style={styles.block}>
      <div style={styles.header}>
        <span style={styles.title}>
          <FiCalendar size={16} color={theme.colors.blue04} />
          Calendar on your phone
        </span>
        {feed ? (
          <Switch
            checked={feed.enabled}
            disabled={busy}
            onChange={(on) => (on ? makeAddress() : turnOff())}
            title='Calendar subscription'
          />
        ) : null}
      </div>
      <span style={styles.muted}>
        Task due dates and project deadlines appear in your phone&rsquo;s calendar, reminders as alarms. It is
        read-only: change tasks here, the calendar follows on its next refresh.
      </span>

      {!feed ? (
        <Loader />
      ) : (
        <>
          <SegmentedTabs
            items={SCOPES}
            selected={feed.scope}
            handleSelect={(value) => setScope(value as CalendarScope)}
            layoutId='calendar-scope'
          />
          <span style={styles.muted}>
            {feed.scope === CalendarScope.Mine
              ? 'Tasks assigned to you and everything in your inbox.'
              : 'Every task with a due date in every project you are in.'}
          </span>

          {url ? (
            <div style={styles.address}>
              <span style={{ fontSize: 13, color: theme.colors.lightGreen }}>
                Your address. Copy it now: it is not shown again.
              </span>
              <div style={styles.urlRow}>
                <input
                  ref={urlRef}
                  readOnly
                  value={url}
                  style={{ ...shared.textInput, ...styles.url }}
                  onFocus={(e) => e.target.select()}
                  aria-label='Calendar address'
                />
                <Button
                  label={copied ? 'Copied' : 'Copy'}
                  variant='secondary'
                  icon={copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  onClick={copy}
                />
              </div>
            </div>
          ) : null}

          {feed.enabled ? (
            <div style={styles.footer}>
              <span style={styles.muted}>
                {feed.lastUsedAt
                  ? `Last fetched by a calendar ${formatDistanceToNow(new Date(feed.lastUsedAt), { addSuffix: true })}.`
                  : 'Not fetched by a calendar yet.'}
                {!url ? ' Lost the address? Make a new one: the old one stops working.' : ''}
              </span>
              <Button
                label='New address'
                variant='secondary'
                icon={<FiRefreshCw size={14} />}
                disabled={busy}
                onClick={() =>
                  confirm.show({
                    message: 'Make a new calendar address?',
                    description:
                      'Calendars subscribed to the current address stop getting updates; add the new one in their place.',
                    confirmLabel: 'New address',
                    onConfirm: makeAddress,
                  })
                }
              />
            </div>
          ) : null}

          <div style={styles.howto}>
            <span style={styles.howtoTitle}>Adding it</span>
            <span style={styles.muted}>
              <b>iPhone:</b> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar, paste the
              address. Under Accounts → Fetch New Data you can set how often it refreshes.
            </span>
            <span style={styles.muted}>
              <b>Android / Google:</b> on a computer, calendar.google.com → Other calendars → + → From URL, paste the
              address. It reaches the phone through your Google account; Google refreshes it every few hours.
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  block: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
    fontSize: 16,
  },
  muted: { fontSize: 13, color: t.colors.dark05, lineHeight: 1.5 },
  address: {
    gap: t.spacing.s,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.lightGreen + t.colorOpacity(0.35)}`,
    backgroundColor: t.colors.lightGreen + t.colorOpacity(0.06),
  },
  // On a phone the Copy button drops under the address.
  urlRow: { flexDirection: 'row', alignItems: 'stretch', gap: t.spacing.s, flexWrap: 'wrap' },
  url: {
    flex: '1 1 260px',
    width: 'auto',
    minWidth: 0,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    flexWrap: 'wrap',
  },
  howto: {
    gap: t.spacing.xs,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  howtoTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: t.colors.dark05 },
}));
