import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { io } from 'socket.io-client';
import { FiChevronDown, FiChevronRight, FiLock } from 'react-icons/fi';
import { SharedApi, SharedProjectResponse, SharedTaskResponse, StatusCategory } from '~/api/api';
import { Configuration } from '~/api/configuration';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { Checkbox, StatusDot, useProjectStyles } from '~/routes/Projects/components/shared';
import { donePercent, dueLabel, quantityLabel, TYPE_LABEL } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { TextField } from '~/components/ControlledFields';

const API_URL = import.meta.env.VITE_API_URL as string;
const RELOAD_DELAY = 250;

const passwordKey = (token: string) => `shared-password:${token}`;
const readPassword = (token: string) => {
  try {
    return sessionStorage.getItem(passwordKey(token)) ?? undefined;
  } catch {
    return undefined;
  }
};
const keepPassword = (token: string, password: string) => {
  try {
    sessionStorage.setItem(passwordKey(token), password);
  } catch {
    // Private mode: the password is asked again after a refresh.
  }
};

type State =
  | { kind: 'loading' }
  | { kind: 'gone' }
  | { kind: 'password'; wrong: boolean }
  | { kind: 'ready'; project: SharedProjectResponse };

/**
 * A project opened from a public link, without signing in (D3). It updates
 * live while open, and drops to "no longer shared" the moment the link is
 * revoked.
 */
export const SharedProject = () => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const { token = '' } = useParams<{ token: string }>();
  const api = useMemo(() => new SharedApi(new Configuration({ basePath: API_URL })), []);
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [password, setPassword] = useState(() => readPassword(token));
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState<string>();
  const liveToken = useRef<string>();

  const load = useCallback(
    async (reload: boolean, withPassword = password) => {
      try {
        const { data } = await api.sharedControllerView({ token, xSharePassword: withPassword, reload });
        liveToken.current = data.liveToken;
        setState({ kind: 'ready', project: data });
        if (withPassword) keepPassword(token, withPassword);
      } catch (e) {
        const status = isAxiosError(e) ? e.response?.status : undefined;
        if (status === 401) setState({ kind: 'password', wrong: !!withPassword });
        else if (status === 404) setState({ kind: 'gone' });
        else if (!reload) setState({ kind: 'gone' });
      }
    },
    [api, token, password],
  );

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const ready = state.kind === 'ready';
  useEffect(() => {
    if (!ready) return;
    let timer: number | undefined;
    // The auth callback runs on every (re)connect, so it always sends the
    // newest session, which each reload renews.
    const socket = io(API_URL, { auth: (cb) => cb({ shareToken: liveToken.current }) });
    socket.on('project.changed', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => load(true), RELOAD_DELAY);
    });
    // The server drops the socket when the link is revoked.
    socket.on('disconnect', (reason) => reason === 'io server disconnect' && load(true));
    return () => {
      window.clearTimeout(timer);
      socket.disconnect();
    };
  }, [ready, load]);

  /**
   * Ticked on screen at once, as the server will do it (first Done or first
   * To do status): in a shop the tick must not wait for the signal. The
   * answer settles it; a failure reloads the truth.
   */
  const toggle = async (task: SharedTaskResponse) => {
    if (busy === task.id || state.kind !== 'ready') return;
    const { statuses } = state.project;
    const isDone = statuses.find((x) => x.id === task.statusId)?.category === StatusCategory.Done;
    const next = statuses.find((x) => x.category === (isDone ? StatusCategory.Todo : StatusCategory.Done));
    if (next) {
      setState({
        kind: 'ready',
        project: {
          ...state.project,
          tasks: state.project.tasks.map((t) =>
            t.id === task.id ? { ...t, statusId: next.id, completedAt: isDone ? null : new Date().toISOString() } : t,
          ),
        },
      });
    }
    setBusy(task.id);
    try {
      const { data } = await api.sharedControllerToggle({ token, taskId: task.id, xSharePassword: password });
      liveToken.current = data.liveToken;
      setState({ kind: 'ready', project: data });
    } catch {
      load(true);
    } finally {
      setBusy(undefined);
    }
  };

  if (state.kind === 'loading') return <Loader />;

  if (state.kind === 'gone') {
    return (
      <div style={styles.center}>
        <span style={styles.title}>Not shared</span>
        <span style={shared.muted}>This link does not exist or is no longer shared.</span>
      </div>
    );
  }

  if (state.kind === 'password') {
    const submit = () => {
      if (!draft) return;
      setPassword(draft);
      load(false, draft);
    };
    return (
      <div style={styles.center}>
        <FiLock size={26} color={theme.colors.blue04} />
        <span style={styles.title}>This link has a password</span>
        {state.wrong ? <span style={shared.error}>That password is not right.</span> : null}
        <TextField
          label='Password'
          type='password'
          autoFocus
          style={{ width: 'min(320px, 100%)' }}
          value={draft}
          onChange={setDraft}
          onEnter={submit}
        />
        <Button label='Open' onClick={submit} disabled={!draft} />
      </div>
    );
  }

  const { project } = state;
  const checkable = project.access === 'CHECK';
  const shopping = project.type === 'LIST';
  const top = project.tasks.filter((t) => !t.parentTaskId);
  const subtasks = (id: string) => project.tasks.filter((t) => t.parentTaskId === id);
  const groups = project.statuses
    .map((status) => ({ status, tasks: top.filter((t) => t.statusId === status.id) }))
    .filter((g) => g.tasks.length);

  return (
    <Scrollbar style={styles.scroll} horizontal={false}>
      <div style={styles.page}>
        <div style={styles.header}>
          <span style={{ ...shared.row, ...shared.muted }}>
            <span style={shared.key}>{project.key}</span>
            {TYPE_LABEL[project.type]}
            {project.sharedBy ? ` · shared by ${project.sharedBy}` : ''}
          </span>
          <span style={styles.title}>{project.title}</span>
          {project.description ? (
            <span style={{ ...shared.muted, whiteSpace: 'pre-wrap' }}>{project.description}</span>
          ) : null}
          <span style={shared.muted}>
            {project.progress.total ? `${project.progress.done} of ${project.progress.total} done` : 'Nothing here yet'}
            {project.dueDate ? ` · due ${dueLabel(project.dueDate)}` : ''}
            {checkable ? ' · tap to tick off' : ''}
          </span>
          <div style={styles.bar}>
            <div style={{ ...styles.barFill, width: `${donePercent(project.progress)}%` }} />
          </div>
        </div>

        {groups.map(({ status, tasks }) => (
          <Group
            key={status.id}
            name={status.name}
            color={status.color}
            count={tasks.length}
            folded={shopping && status.category === StatusCategory.Done}
          >
            {tasks.map((task) => (
              <SharedTaskRow
                key={task.id}
                task={task}
                done={status.category === StatusCategory.Done}
                subtasks={subtasks(task.id)}
                doneStatusIds={project.statuses.filter((s) => s.category === StatusCategory.Done).map((s) => s.id)}
                shopping={shopping}
                checkable={checkable}
                onToggle={toggle}
              />
            ))}
          </Group>
        ))}
      </div>
    </Scrollbar>
  );
};

const Group = ({
  name,
  color,
  count,
  folded: startFolded,
  children,
}: {
  name: string;
  color?: string | null;
  count: number;
  folded: boolean;
  children: React.ReactNode;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const [folded, setFolded] = useState(startFolded);
  return (
    <div style={styles.group}>
      <button type='button' style={styles.groupHeader} onClick={() => setFolded(!folded)}>
        {folded ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
        <StatusDot color={color} />
        <span style={styles.groupTitle}>{name}</span>
        <span style={shared.muted}>{count}</span>
      </button>
      {folded ? null : <div style={shared.list}>{children}</div>}
    </div>
  );
};

const SharedTaskRow = ({
  task,
  done,
  subtasks,
  doneStatusIds,
  shopping,
  checkable,
  onToggle,
}: {
  task: SharedTaskResponse;
  done: boolean;
  subtasks: SharedTaskResponse[];
  doneStatusIds: string[];
  shopping: boolean;
  checkable: boolean;
  onToggle: (task: SharedTaskResponse) => void;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const amount = quantityLabel(task.quantity, task.unit);
  const hasDetails = !!task.notes || task.checklist.length > 0 || subtasks.length > 0;

  return (
    <>
      <div
        style={{ ...shared.listRow, cursor: hasDetails ? 'pointer' : 'default' }}
        onClick={() => hasDetails && setOpen(!open)}
      >
        <Checkbox checked={done} disabled={!checkable} onChange={() => onToggle(task)} />
        {amount ? <span style={styles.amount}>{amount}</span> : null}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            wordBreak: 'break-word',
            color: done ? theme.colors.dark05 : theme.colors.white,
            textDecoration: done ? 'line-through' : undefined,
          }}
        >
          {task.title}
        </span>
        {shopping ? null : <span style={shared.key}>{task.key}</span>}
        {task.dueDate ? <span style={{ ...shared.muted, fontSize: 12 }}>{dueLabel(task.dueDate)}</span> : null}
        {hasDetails ? open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} /> : null}
      </div>
      {open ? (
        <div style={styles.details}>
          {task.notes ? <span style={{ ...shared.muted, whiteSpace: 'pre-wrap' }}>{task.notes}</span> : null}
          {task.checklist.map((item, i) => (
            <span key={i} style={{ ...shared.row, ...shared.muted, flexWrap: 'nowrap' }}>
              <Checkbox checked={item.done} disabled size={16} />
              {item.content}
            </span>
          ))}
          {subtasks.map((sub) => (
            <span key={sub.id} style={{ ...shared.row, flexWrap: 'nowrap', fontSize: 14 }}>
              <Checkbox
                checked={doneStatusIds.includes(sub.statusId)}
                disabled={!checkable}
                size={18}
                onChange={() => onToggle(sub)}
              />
              {sub.title}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  scroll: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 },
  page: {
    gap: t.spacing.l,
    width: '100%',
    maxWidth: 720,
    margin: '0 auto',
    padding: `${t.spacing.xl}px ${t.spacing.m}px`,
    boxSizing: 'border-box',
  },
  header: { gap: t.spacing.s },
  title: { fontSize: 24, fontWeight: 700, color: t.colors.white, lineHeight: 1.25 },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: t.colors.white + t.colorOpacity(0.08) },
  barFill: { height: '100%', backgroundColor: t.colors.lightGreen, transition: 'width 0.3s ease' },
  group: { gap: t.spacing.s },
  groupHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: t.colors.dark05,
    width: 'fit-content',
  },
  groupTitle: { fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: t.colors.white },
  amount: { fontSize: 15, fontWeight: 700, color: t.colors.blue04, whiteSpace: 'nowrap' },
  details: {
    gap: t.spacing.s,
    padding: `${t.spacing.s}px ${t.spacing.m}px ${t.spacing.sm}px 44px`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.2),
  },
  center: {
    position: 'fixed',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    textAlign: 'center',
  },
}));
