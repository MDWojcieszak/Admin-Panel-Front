import { DiskType } from '~/api/Server';
import { ProgressBar } from '~/components/ProgressBar';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { BsDeviceHddFill } from 'react-icons/bs';
import { HiDotsVertical } from 'react-icons/hi';

type DiskTileProps = {
  diskInfo: DiskType;
};

const gigabytes = (bytes: number) => bytes / Math.pow(1024, 3);

export const DiskTile = ({ diskInfo }: DiskTileProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const usage = (diskInfo.used / (diskInfo.used + diskInfo.available)) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <BsDeviceHddFill size={50} fill={'white'} />
        <p> {diskInfo.type}</p>
      </div>
      <div style={styles.contentContainer}>
        <div>
          <div style={styles.row}>
            <div style={{ flex: 1 }}>{diskInfo.name || 'Local disk' + ' (' + diskInfo.fs + ')'}</div>
            <HiDotsVertical />
          </div>
        </div>
        <div
          style={{
            fontWeight: 600,
            color: theme.colors.dark05,
            opacity: 0.7,
            fontSize: 14,
            marginTop: -10,
          }}
        >
          {diskInfo.mediaType || 'unknown'}
        </div>
        <div style={styles.row}>
          <div style={styles.percent}>{usage.toFixed(2) + '%'}</div>

          <div style={styles.usedContainer}>
            {gigabytes(diskInfo.available).toFixed(2) +
              ' / ' +
              gigabytes(diskInfo.available + diskInfo.used).toFixed(2) +
              ' GB'}
          </div>
        </div>
        <ProgressBar progress={usage} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    marginTop: t.spacing.s,
    marginBottom: t.spacing.s,
    flexDirection: 'row',
  },
  iconContainer: {
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: t.spacing.xxs,
    marginRight: t.spacing.m,
    gap: t.spacing.xxs,
  },
  contentContainer: {
    gap: t.spacing.xxs,
    flex: 1,
    justifyContent: 'space-between',
  },
  usedContainer: {
    fontSize: 14,
    color: t.colors.blue04,
  },
  percent: {
    fontWeight: 600,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));
