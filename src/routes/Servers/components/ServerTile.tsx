import { DiskType, ServerType } from '~/api/Server';
import { CpuTile } from '~/routes/Servers/components/CpuTile';
import { DiskTile } from '~/routes/Servers/components/DiskTile';
import { mkUseStyles } from '~/utils/theme';

type ServerTileProps = {
  server: ServerType;
};
export const ServerTile = ({ server }: ServerTileProps) => {
  const styles = useStyles();

  const renderDisks = (disk: DiskType) => {
    return <DiskTile diskInfo={disk} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.titleContainer}>
        <p style={styles.title}>{server.name}</p>
        <p style={styles.subTitle}>{server.ipAddress}</p>
        <p style={styles.status}>{server.properties.status}</p>
      </div>
      <div style={styles.row}>{server.properties.diskInfo.map(renderDisks)}</div>
      <CpuTile cpuInfo={server.properties.cpuInfo} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    padding: t.spacing.m,
  },
  title: {
    fontWeight: 700,
  },
  subTitle: {
    marginLeft: t.spacing.s,
    color: t.colors.blue04,
  },
  status: {
    flex: 1,
    textAlign: 'right',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: t.spacing.m,
  },
}));
