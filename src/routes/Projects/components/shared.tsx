import { CSSProperties, ReactNode } from 'react';
import { FiCheck } from 'react-icons/fi';
import { ProjectUserResponse } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { initials, userName } from '~/routes/Projects/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** A Projects page: the header stays put, the body scrolls (or, for the board, lays out itself). */
export const ProjectsPage = ({
  header,
  children,
  scroll = true,
}: {
  header: ReactNode;
  children: ReactNode;
  scroll?: boolean;
}) => {
  const styles = useStyles();
  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>{header}</div>
      <div style={styles.pageBody}>
        {scroll ? (
          <Scrollbar style={styles.pageScroll} horizontal={false}>
            <div style={styles.pageContent}>{children}</div>
          </Scrollbar>
        ) : (
          <div style={styles.pageFill}>{children}</div>
        )}
      </div>
    </div>
  );
};

/** A round tick box; `disabled` still shows the state, it just can't be changed. */
export const Checkbox = ({
  checked,
  onChange,
  disabled,
  size = 20,
  title,
}: {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  size?: number;
  title?: string;
}) => {
  const theme = useTheme();
  const color = theme.colors.lightGreen;
  return (
    <button
      type='button'
      title={title ?? (checked ? 'Mark as not done' : 'Mark as done')}
      aria-pressed={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.();
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        borderRadius: '50%',
        cursor: disabled ? 'default' : 'pointer',
        border: `2px solid ${checked ? color : theme.colors.dark04}`,
        backgroundColor: checked ? color : 'transparent',
        color: theme.colors.gray04,
        opacity: disabled && !checked ? 0.5 : 1,
        transition: 'background-color 0.12s ease, border-color 0.12s ease',
      }}
    >
      {checked ? <FiCheck size={size - 8} strokeWidth={3} /> : null}
    </button>
  );
};

export const Avatar = ({ user, size = 24 }: { user: ProjectUserResponse; size?: number }) => {
  const theme = useTheme();
  return (
    <span
      title={userName(user)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        fontSize: Math.round(size * 0.42),
        fontWeight: 700,
        color: theme.colors.white,
        backgroundColor: theme.colors.blue03,
      }}
    >
      {initials(user)}
    </span>
  );
};

export const StatusDot = ({ color, size = 8 }: { color?: string | null; size?: number }) => {
  const theme = useTheme();
  return (
    <span
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color || theme.colors.dark05,
      }}
    />
  );
};

/** A native select in the panel's input style, for inline edits outside a form. */
export const PlainSelect = ({
  value,
  options,
  onChange,
  disabled,
  style,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  style?: CSSProperties;
}) => {
  const shared = useProjectStyles();
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...shared.textInput, ...shared.select, ...style }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

/** A labelled field for plain inputs. */
export const Field = ({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) => {
  const shared = useProjectStyles();
  return (
    <label style={{ ...shared.field, ...style }}>
      <span style={shared.fieldLabel}>{label}</span>
      {children}
    </label>
  );
};

export const useProjectStyles = mkUseStyles((t) => ({
  muted: { fontSize: 13, color: t.colors.dark05 },
  row: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12 },
  emptyRow: {
    padding: `${t.spacing.m}px ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
    gap: t.spacing.sm,
  },
  field: { display: 'flex', flexDirection: 'column', gap: t.spacing.xs, minWidth: 0 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  textInput: {
    width: '100%',
    height: 38,
    padding: `0 ${t.spacing.sm}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    fontSize: 14,
    outline: 'none',
    colorScheme: 'dark',
  },
  select: { cursor: 'pointer', appearance: 'auto' },
  textArea: {
    width: '100%',
    padding: t.spacing.sm,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    fontFamily: 'inherit',
    fontSize: 14,
    lineHeight: 1.5,
    outline: 'none',
    resize: 'vertical',
  },
  panel: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  panelTitle: { fontWeight: 700, fontSize: 15, color: t.colors.white },
  list: { gap: 1, borderRadius: t.borderRadius.default, overflow: 'hidden' },
  listRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    minHeight: 44,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 30,
    height: 30,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
  },
  key: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
  },
  error: {
    padding: '10px 12px',
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.red,
    backgroundColor: t.colors.red + t.colorOpacity(0.1),
  },
}));

const useStyles = mkUseStyles((t) => ({
  page: { width: '100%', height: '100%', minHeight: 0, gap: t.spacing.m },
  pageHeader: { gap: t.spacing.m, flexShrink: 0 },
  pageBody: { flex: 1, minHeight: 0, position: 'relative' },
  pageScroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pageContent: { gap: t.spacing.l, paddingRight: 16, paddingBottom: t.spacing.m },
  pageFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' },
}));
