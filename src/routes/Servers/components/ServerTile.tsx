import { useNavigate } from 'react-router-dom';
import { ServerDetailsResponseDto } from '~/api/api';
import { DiskType } from '~/apiOld/Server';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { Clocks } from '~/routes/Servers/components/Clocks';
import { DiskTile } from '~/routes/Servers/components/DiskTile';
import { ServerStatus } from '~/routes/Servers/components/ServerStatus';
import { mkUseStyles } from '~/utils/theme';

type ServerTileProps = {
  server?: ServerDetailsResponseDto;
};
export const ServerTile = ({ server }: ServerTileProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  const renderDisks = (disk: DiskType) => {
    return <DiskTile diskInfo={disk} key={disk.id} />;
  };
  if (!server) return <Loader />;

  const isOnline = server.properties.isOnline;
  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <div>
          <p style={styles.title}>{server.name}</p>
          <p style={styles.subTitle}>{server.ipAddress}</p>
        </div>
        <div style={styles.status}>
          <ServerStatus isOnline={isOnline} status={server.properties.status} />
        </div>
      </div>
      <div style={styles.diskContainer}>{server.properties.diskInfo?.map(renderDisks)}</div>
      <Clocks
        isOnline={server.properties.isOnline}
        cpuInfo={server.properties.cpuInfo}
        memoryInfo={server.properties.memoryInfo}
      />
      <Button label='Manage' onClick={() => navigate(server.id)} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: t.spacing.m,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
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
    alignItems: 'flex-end',
  },
  diskContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: t.spacing.m,
  },
}));
