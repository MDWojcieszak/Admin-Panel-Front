import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { FiChevronRight, FiMapPin } from 'react-icons/fi';
import { FaServer } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { ServerResponseDto, ServerStatus as ServerStatusEnum } from '~/api/api';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { ServerStatus } from '~/routes/Servers/components/ServerStatus';
import { WakeProgress } from '~/routes/Servers/components/WakeProgress';
import { ServersQuery } from '~/routes/Servers/hooks/useServers';
import { mkUseStyles, useTheme } from '~/utils/theme';

/** Every server as a tile: name, state, where it is and when it was last heard from. */
export const ServersList = ({ query }: { query: ServersQuery }) => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { servers } = query;

  if (!servers) return <Loader />;
  if (!servers.length) {
    return (
      <EmptyState
        icon={<FaServer size={22} color={theme.colors.blue04} />}
        title='No servers yet'
        description='Servers appear here once their agent connects to the backend.'
      />
    );
  }

  return (
    <div style={styles.grid}>
      {servers.map((server) => (
        <ServerTile key={server.id} server={server} onOpen={() => navigate(server.id)} />
      ))}
    </div>
  );
};

const ServerTile = ({ server, onOpen }: { server: ServerResponseDto; onOpen: () => void }) => {
  const styles = useStyles();
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  const properties = server.properties;
  const online = Boolean(properties?.isOnline);
  const waking = properties?.status === ServerStatusEnum.WakeInProgress;
  const accent = online ? theme.colors.lightGreen : waking ? theme.colors.yellow : theme.colors.dark04;

  const heard = online
    ? properties?.statusChangedAt
      ? `Online for ${formatDistanceToNow(new Date(properties.statusChangedAt))}`
      : 'Online now'
    : properties?.lastSeenAt
      ? `Last seen ${formatDistanceToNow(new Date(properties.lastSeenAt), { addSuffix: true })}`
      : 'Never seen';

  return (
    <button
      type='button'
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...styles.tile, ...(hover ? styles.tileHover : null), borderLeftColor: accent }}
    >
      <div style={styles.top}>
        <span style={{ ...styles.icon, color: accent, backgroundColor: accent + theme.colorOpacity(0.14) }}>
          <FaServer size={16} />
        </span>
        <span style={styles.name}>{server.name || <span style={{ color: theme.colors.yellow }}>Unnamed</span>}</span>
        <ServerStatus status={properties?.status ?? undefined} isOnline={properties?.isOnline ?? undefined} />
      </div>

      {waking ? <WakeProgress since={properties?.statusChangedAt} compact /> : null}

      <div style={styles.facts}>
        <span style={styles.fact}>
          <span style={styles.factLabel}>IP</span>
          <span style={styles.mono}>{server.ipAddress}</span>
        </span>
        {server.macAddress ? (
          <span style={styles.fact}>
            <span style={styles.factLabel}>MAC</span>
            <span style={styles.mono}>{server.macAddress}</span>
          </span>
        ) : null}
        {server.location ? (
          <span style={styles.fact}>
            <FiMapPin size={12} style={{ flexShrink: 0 }} />
            <span>{server.location}</span>
          </span>
        ) : null}
      </div>

      <div style={styles.footer}>
        <span>{heard}</span>
        <FiChevronRight
          size={16}
          color={hover ? theme.colors.white : theme.colors.dark05}
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        />
      </div>
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: t.spacing.m },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    gap: t.spacing.sm,
    padding: t.spacing.m,
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    border: 'none',
    borderLeft: '3px solid transparent',
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    transition: 'background-color 0.12s ease',
    minWidth: 0,
  },
  tileHover: { backgroundColor: t.colors.gray02 + t.colorOpacity(0.8) },
  top: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm, minWidth: 0 },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: t.borderRadius.default,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 700,
    color: t.colors.white,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  facts: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', columnGap: t.spacing.m, rowGap: 4 },
  fact: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, fontSize: 13, color: t.colors.dark05 },
  factLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: t.colors.dark05 },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12, color: t.colors.white },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    marginTop: 'auto',
    paddingTop: t.spacing.s,
    fontSize: 12,
    color: t.colors.dark05,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
