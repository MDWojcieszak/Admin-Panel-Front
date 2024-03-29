import { useNavigate } from 'react-router-dom';
import { DiskType, ServerType } from '~/api/Server';
import { Button } from '~/components/Button';
import { CpuTile } from '~/routes/Servers/components/CpuTile';
import { DiskTile } from '~/routes/Servers/components/DiskTile';
import { mkUseStyles } from '~/utils/theme';

type ServerTileProps = {
  server: ServerType;
};
export const ServerTile = ({ server }: ServerTileProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const renderDisks = (disk: DiskType) => {
    return <DiskTile diskInfo={disk} />;
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <div>
          <p style={styles.title}>{server.name}</p>
          <p style={styles.subTitle}>{server.ipAddress}</p>
        </div>
        <p style={styles.status}>{server.properties.status}</p>
      </div>
      <div style={styles.diskContainer}>{server.properties.diskInfo.map(renderDisks)}</div>
      <CpuTile cpuInfo={server.properties.cpuInfo} />
      <Button label='Manage' onClick={() => navigate(server.id)} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
    gap: t.spacing.m,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    borderRadius: t.borderRadius.default,
  },
  title: {
    fontWeight: 700,
  },
  subTitle: {
    color: t.colors.blue04,
    fontSize: 14,
  },
  status: {
    flex: 1,
    textAlign: 'right',
    color: t.colors.lightGreen,
    marginRight: t.spacing.m,
  },
  diskContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: t.spacing.m,
  },
}));
