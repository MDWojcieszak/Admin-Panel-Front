import { PageHeader } from '~/components/PageHeader';
import { Scrollbar } from '~/components/Scrollbar';
import { ServersList } from '~/routes/Servers/components/ServersList';
import { useServers } from '~/routes/Servers/hooks/useServers';
import { mkUseStyles } from '~/utils/theme';

export const Servers = () => {
  const styles = useStyles();
  const query = useServers();
  const servers = query.servers ?? [];
  const online = servers.filter((s) => s.properties?.isOnline).length;

  return (
    <div style={styles.container}>
      <PageHeader
        title='Servers'
        meta={
          servers.length ? `${servers.length} server${servers.length === 1 ? '' : 's'} · ${online} online` : undefined
        }
      />
      <div style={styles.body}>
        <Scrollbar style={styles.scroll} horizontal={false}>
          <div style={styles.content}>
            <ServersList query={query} />
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { height: '100%', minHeight: 0, gap: t.spacing.m },
  body: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { paddingRight: t.spacing.m, paddingBottom: t.spacing.m },
}));
