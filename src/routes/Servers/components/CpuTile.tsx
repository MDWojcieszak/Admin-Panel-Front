import { CpuType } from '~/api/Server';
import { mkUseStyles } from '~/utils/theme';
import { CircularProgress } from '~/components/CircularProgress';
import { BsCpu } from 'react-icons/bs';
import { FaMemory } from 'react-icons/fa';

type CpuTileProps = {
  cpuInfo: CpuType;
};

export const CpuTile = ({ cpuInfo }: CpuTileProps) => {
  const styles = useStyles();
  return (
    <div style={styles.container}>
      {/* <div>{cpuInfo.currentLoadUser}</div> */}
      <div style={styles.progressContainer}>
        <CircularProgress
          progress={cpuInfo.currentLoadUser * 100}
          icon={<BsCpu style={{ marginTop: -10 }} size={50} />}
        />
        <div style={styles.label}>{(cpuInfo.currentLoadUser * 100).toFixed(2)}</div>
      </div>
      <div>{cpuInfo.cores}</div>
      <div>{cpuInfo.physicalCores}</div>
      <div style={styles.progressContainer}>
        <CircularProgress
          progress={cpuInfo.currentLoadUser * 100}
          icon={<FaMemory style={{ marginTop: -10 }} size={50} />}
        />
        <div style={styles.label}>{(cpuInfo.currentLoadUser * 100).toFixed(2)}</div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    marginBottom: t.spacing.s,
    flexDirection: 'row',
  },
  progressContainer: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    textAlign: 'center',
    left: 0,
    right: 0,
    top: '70%',
  },
}));
