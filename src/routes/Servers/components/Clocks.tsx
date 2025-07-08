import { CpuType, MemoryType } from '~/apiOld/Server';
import { mkUseStyles } from '~/utils/theme';
import { CircularProgress } from '~/components/CircularProgress';
import { BsCpu } from 'react-icons/bs';
import { FaMemory } from 'react-icons/fa';
import { motion } from 'framer-motion';
type ClocksProps = {
  cpuInfo: CpuType;
  memoryInfo: MemoryType;
  isOnline?: boolean;
};
const gigabytes = (bytes: number) => bytes / Math.pow(1024, 3);

export const Clocks = ({ cpuInfo, memoryInfo, isOnline }: ClocksProps) => {
  const styles = useStyles();

  const renderData = (data: string) => {
    return isOnline ? data : '-';
  };

  const renderNumber = (data: number) => {
    return isOnline ? data : 0;
  };

  return (
    <div style={styles.container}>
      <div style={styles.subContainer}>
        <div style={styles.title}>CPU load</div>
        <div style={styles.progressContainer}>
          <CircularProgress
            progress={renderNumber(cpuInfo.currentLoad)}
            icon={<BsCpu style={{ marginTop: -10 }} size={50} />}
            disabled={!isOnline}
          />
          <motion.div style={styles.label} animate={{ opacity: isOnline ? 1 : 0.2 }}>
            {renderData(cpuInfo.currentLoad.toFixed(2)) + ' %'}
          </motion.div>
        </div>

        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          System
          <div style={styles.value}>{renderData(cpuInfo.currentLoadSystem.toFixed(2)) + ' %'}</div>
        </motion.div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          User
          <div style={styles.value}>{renderData(cpuInfo.currentLoadUser.toFixed(2)) + ' %'}</div>
        </motion.div>
      </div>

      <div style={styles.subContainer}>
        <div style={styles.title}>Memory Load</div>

        <div style={styles.progressContainer}>
          <CircularProgress
            progress={renderNumber(((memoryInfo.total - memoryInfo.free) / memoryInfo.total) * 100)}
            icon={<FaMemory style={{ marginTop: -10 }} size={50} />}
            disabled={!isOnline}
          />
          <motion.div style={styles.label} animate={{ opacity: isOnline ? 1 : 0.2 }}>
            {renderData((((memoryInfo.total - memoryInfo.free) / memoryInfo.total) * 100).toFixed(2)) + ' %'}
          </motion.div>
        </div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          Used
          <div style={styles.value}>{renderData(gigabytes(memoryInfo.total - memoryInfo.free).toFixed(2)) + ' GB'}</div>
        </motion.div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          Total
          <div style={styles.value}>{renderData(gigabytes(memoryInfo.total).toFixed(2)) + ' GB'}</div>
        </motion.div>
      </div>
      <div style={styles.subContainer}>
        <div style={styles.title}>CPU Info</div>
        <div style={styles.row}>
          <span style={{ fontWeight: 600 }}>Cores:</span>
          <span style={styles.value}>{cpuInfo.cores}</span>
        </div>
        <div style={styles.row}>
          <span style={{ fontWeight: 600 }}>Physical Cores:</span>
          <span style={styles.value}>{cpuInfo.physicalCores}</span>
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    borderRadius: t.borderRadius.default,
    marginBottom: t.spacing.s,
    flexDirection: 'row',
  },
  subContainer: {
    minWidth: 200,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    felx: 1,
    justifyContent: 'space-between',
  },
  value: {
    color: t.colors.blue04,
    fontWeight: 800,
    fontSize: 14,
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: t.spacing.l,
    color: t.colors.blue04,
  },
}));
