import { ReactNode, useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiCheck, FiChevronDown, FiGitBranch, FiGitCommit, FiSearch, FiTag } from 'react-icons/fi';
import { GitRefsResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** What a release builds from: nothing (the branch head), a tag, a commit, or typed by hand. */
export type GitRefChoice =
  | { kind: 'latest' }
  | { kind: 'tag'; name: string; shortSha: string }
  | { kind: 'commit'; sha: string; shortSha: string; message: string }
  | { kind: 'custom'; ref: string };

/** The ref a release is created with; undefined builds the branch head. */
export const refOf = (choice: GitRefChoice): string | undefined =>
  choice.kind === 'tag'
    ? choice.name
    : choice.kind === 'commit'
      ? choice.sha
      : choice.kind === 'custom'
        ? choice.ref.trim() || undefined
        : undefined;

const ago = (iso?: string | null) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : '');

type GitRefPickerProps = {
  applicationId: string;
  value: GitRefChoice;
  onChange: (choice: GitRefChoice) => void;
};

/**
 * Picks what a git release builds from — the newest commit on the tracked
 * branch by default, or a tag or recent commit from the repository. When the
 * repository cannot be listed (private without a token, GitHub down) a typed
 * commit or tag still works.
 */
export const GitRefPicker = ({ applicationId, value, onChange }: GitRefPickerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { deployApi } = useApi();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [refs, setRefs] = useState<GitRefsResponse>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [custom, setCustom] = useState(value.kind === 'custom' ? value.ref : '');
  const wrapRef = useRef<HTMLDivElement>(null);

  // The branch and head for the closed field, without waiting for a click.
  useEffect(() => {
    if (!deployApi) return;
    deployApi
      .deployControllerListGitRefs({ id: applicationId, take: 30 })
      .then(({ data }) => {
        setRefs(data);
        setError(undefined);
      })
      .catch((e) => setError(getApiErrorMessage(e, 'The repository could not be listed.')));
  }, [deployApi, applicationId]);

  // Searching asks the backend; it filters its cached listing.
  useEffect(() => {
    if (!deployApi || !open || error) return;
    const term = search.trim();
    if (!term) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await deployApi.deployControllerListGitRefs({ id: applicationId, search: term, take: 100 });
        if (active) setRefs(data);
      } catch (e) {
        if (active) setError(getApiErrorMessage(e, 'The repository could not be listed.'));
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deployApi, applicationId, open, search, error]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (choice: GitRefChoice) => {
    onChange(choice);
    setOpen(false);
  };

  const branch = refs?.branch ?? 'the branch';
  const label =
    value.kind === 'latest'
      ? `Latest on ${branch}`
      : value.kind === 'tag'
        ? value.name
        : value.kind === 'commit'
          ? `${value.shortSha} · ${value.message}`
          : value.ref || 'Commit or tag';
  const icon =
    value.kind === 'tag' ? (
      <FiTag size={15} />
    ) : value.kind === 'commit' ? (
      <FiGitCommit size={15} />
    ) : (
      <FiGitBranch size={15} />
    );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <button type='button' style={styles.field} onClick={() => setOpen((v) => !v)}>
        <span style={styles.fieldLabel}>Build from</span>
        <span style={styles.fieldValue}>
          <span style={{ color: theme.colors.blue04, display: 'flex' }}>{icon}</span>
          <span style={styles.ellipsis}>{label}</span>
          {value.kind === 'latest' && refs?.head ? (
            <span style={styles.fieldHint}>
              {refs.head.shortSha} · {ago(refs.head.committedAt)}
            </span>
          ) : null}
        </span>
        <FiChevronDown size={18} color={theme.colors.blue} style={styles.chevron} />
      </button>

      {open ? (
        <div style={styles.menu}>
          {error ? (
            <div style={styles.errorBox}>
              <span>{error}</span>
              <span style={styles.muted}>Type a commit or tag instead.</span>
            </div>
          ) : (
            <label style={styles.search}>
              <FiSearch size={14} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search tags and commits…'
                style={styles.searchInput}
              />
              {loading ? <Loader /> : null}
            </label>
          )}

          <Scrollbar maxHeight={340} horizontal={false}>
            <div style={styles.options}>
              {!error ? (
                <Option
                  icon={<FiGitBranch size={14} />}
                  title={`Latest on ${branch}`}
                  meta={
                    refs?.head
                      ? `${refs.head.shortSha} · ${refs.head.message} · ${ago(refs.head.committedAt)}`
                      : undefined
                  }
                  selected={value.kind === 'latest'}
                  onClick={() => pick({ kind: 'latest' })}
                />
              ) : null}

              {refs?.tags.length ? <span style={styles.group}>Tags</span> : null}
              {refs?.tags.map((tag) => (
                <Option
                  key={tag.name}
                  icon={<FiTag size={14} />}
                  title={tag.name}
                  meta={tag.shortSha}
                  selected={value.kind === 'tag' && value.name === tag.name}
                  onClick={() => pick({ kind: 'tag', name: tag.name, shortSha: tag.shortSha })}
                />
              ))}

              {refs?.commits.length ? <span style={styles.group}>Recent commits on {branch}</span> : null}
              {refs?.commits.map((commit) => (
                <Option
                  key={commit.sha}
                  icon={<FiGitCommit size={14} />}
                  title={commit.message}
                  mono={commit.shortSha}
                  meta={[commit.author, ago(commit.committedAt)].filter(Boolean).join(' · ')}
                  selected={value.kind === 'commit' && value.sha === commit.sha}
                  onClick={() =>
                    pick({ kind: 'commit', sha: commit.sha, shortSha: commit.shortSha, message: commit.message })
                  }
                />
              ))}

              {refs && search.trim() && !refs.tags.length && !refs.commits.length ? (
                <span style={styles.empty}>Nothing matches.</span>
              ) : null}
            </div>
          </Scrollbar>

          <div style={styles.customRow}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && custom.trim()) pick({ kind: 'custom', ref: custom.trim() });
              }}
              placeholder='Other commit, tag or branch…'
              style={styles.customInput}
            />
            <button
              type='button'
              disabled={!custom.trim()}
              style={{ ...styles.customButton, opacity: custom.trim() ? 1 : 0.4 }}
              onClick={() => pick({ kind: 'custom', ref: custom.trim() })}
            >
              Use
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Option = ({
  icon,
  title,
  mono,
  meta,
  selected,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  mono?: string;
  meta?: string;
  selected: boolean;
  onClick: () => void;
}) => {
  const styles = useStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      type='button'
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.option,
        backgroundColor: selected
          ? theme.colors.blue + theme.colorOpacity(0.16)
          : hover
            ? theme.colors.white + theme.colorOpacity(0.06)
            : 'transparent',
      }}
    >
      <span style={{ color: theme.colors.blue04, display: 'flex', flexShrink: 0 }}>{icon}</span>
      <span style={styles.optionText}>
        <span style={styles.optionTitleRow}>
          {mono ? <span style={styles.mono}>{mono}</span> : null}
          <span style={{ ...styles.optionTitle, ...styles.ellipsis }}>{title}</span>
        </span>
        {meta ? <span style={{ ...styles.muted, ...styles.ellipsis }}>{meta}</span> : null}
      </span>
      {selected ? <FiCheck size={14} color={theme.colors.blue04} style={{ flexShrink: 0 }} /> : null}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: { position: 'relative', width: '100%' },
  field: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    width: '100%',
    height: 60,
    padding: `0 48px 0 ${t.spacing.m}px`,
    justifyContent: 'center',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  fieldLabel: { fontSize: 12, color: t.colors.blue04 },
  fieldValue: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    minWidth: 0,
    maxWidth: '100%',
  },
  fieldHint: { fontSize: 12, color: t.colors.dark05, flexShrink: 0 },
  chevron: { position: 'absolute', right: t.spacing.m, top: '50%', transform: 'translateY(-50%)' },
  ellipsis: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  // In the flow, not floating: inside a scrolling page a floating list was cut off at the bottom.
  menu: {
    marginTop: t.spacing.s,
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
  },
  search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    height: 38,
    padding: `0 ${t.spacing.sm}px`,
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  options: { gap: 2, paddingRight: 12 },
  group: {
    padding: '8px 10px 2px',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    color: t.colors.white,
    transition: 'background-color 0.12s ease',
  },
  optionText: { display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 },
  optionTitleRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  optionTitle: { fontSize: 14, fontWeight: 600 },
  mono: {
    flexShrink: 0,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    color: t.colors.blue04,
  },
  muted: { fontSize: 12, color: t.colors.dark05 },
  empty: { padding: '8px 10px', fontSize: 13, color: t.colors.dark05 },
  errorBox: {
    gap: 2,
    padding: '8px 10px',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.1),
  },
  customRow: {
    flexDirection: 'row',
    gap: t.spacing.s,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  customInput: {
    flex: 1,
    minWidth: 0,
    height: 36,
    padding: `0 ${t.spacing.sm}px`,
    border: 'none',
    outline: 'none',
    borderRadius: t.borderRadius.default,
    color: t.colors.white,
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  customButton: {
    height: 36,
    padding: '0 14px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: t.colors.white,
    backgroundColor: t.colors.blue,
  },
}));
