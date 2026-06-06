import { CpuDto, MemoryDto } from '~/api/api';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { CircularProgress } from '~/components/CircularProgress';
import { BsCpu } from 'react-icons/bs';
import { FaMemory } from 'react-icons/fa';
import { motion } from 'framer-motion';
type ClocksProps = {
  cpuInfo: CpuDto;
  memoryInfo: MemoryDto;
  isOnline?: boolean;
};
const gigabytes = (bytes: number) => bytes / Math.pow(1024, 3);

export const Clocks = ({ cpuInfo, memoryInfo, isOnline }: ClocksProps) => {
  const styles = useStyles();
  const theme = useTheme();

  const cpuColor = theme.colors.blue;
  const memColor = theme.colors.purple02;

  const cpuLoad = cpuInfo.currentLoad ?? 0;
  const memLoad = memoryInfo.total ? ((memoryInfo.total - memoryInfo.free) / memoryInfo.total) * 100 : 0;

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
            progress={renderNumber(cpuLoad)}
            color={cpuColor}
            icon={<BsCpu size={22} />}
            value={isOnline ? `${cpuLoad.toFixed(0)}%` : '—'}
            disabled={!isOnline}
          />
        </div>

        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          <div style={styles.legendLabel}>
            <div style={{ ...styles.dot, backgroundColor: theme.colors.blue04 }} />
            System
          </div>
          <div style={styles.value}>{renderData(cpuInfo.currentLoadSystem.toFixed(1)) + ' %'}</div>
        </motion.div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          <div style={styles.legendLabel}>
            <div style={{ ...styles.dot, backgroundColor: cpuColor }} />
            User
          </div>
          <div style={styles.value}>{renderData(cpuInfo.currentLoadUser.toFixed(1)) + ' %'}</div>
        </motion.div>
      </div>

      <div style={styles.subContainer}>
        <div style={styles.title}>Memory load</div>

        <div style={styles.progressContainer}>
          <CircularProgress
            progress={renderNumber(memLoad)}
            color={memColor}
            icon={<FaMemory size={22} />}
            value={isOnline ? `${memLoad.toFixed(0)}%` : '—'}
            disabled={!isOnline}
          />
        </div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          <div style={styles.legendLabel}>
            <div style={{ ...styles.dot, backgroundColor: memColor }} />
            Used
          </div>
          <div style={styles.value}>{renderData(gigabytes(memoryInfo.total - memoryInfo.free).toFixed(1)) + ' GB'}</div>
        </motion.div>
        <motion.div style={styles.row} animate={{ opacity: isOnline ? 1 : 0.2 }}>
          <div style={styles.legendLabel}>
            <div style={{ ...styles.dot, backgroundColor: theme.colors.gray01 }} />
            Total
          </div>
          <div style={styles.value}>{renderData(gigabytes(memoryInfo.total).toFixed(1)) + ' GB'}</div>
        </motion.div>
      </div>
      <div style={styles.subContainer}>
        <div style={styles.title}>CPU</div>
        <div style={styles.coreStats}>
          <div style={styles.coreStat}>
            <span style={styles.coreNumber}>{cpuInfo.physicalCores ?? '—'}</span>
            <span style={styles.coreLabel}>Cores</span>
          </div>
          <div style={styles.coreDivider} />
          <div style={styles.coreStat}>
            <span style={styles.coreNumber}>{cpuInfo.cores ?? '—'}</span>
            <span style={styles.coreLabel}>Threads</span>
          </div>
        </div>
        {cpuInfo.cores ? (
          <div style={styles.coreGrid}>
            {Array.from({ length: cpuInfo.cores }).map((_, index) => (
              <div
                key={index}
                style={index < (cpuInfo.physicalCores ?? 0) ? styles.coreDotPhysical : styles.coreDotLogical}
              />
            ))}
          </div>
        ) : null}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={styles.coreDotPhysical} />
            Physical
          </div>
          <div style={styles.legendItem}>
            <div style={styles.coreDotLogical} />
            Logical
          </div>
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
    padding: t.spacing.l,
    borderRadius: t.borderRadius.large,
  },
  coreStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.l,
    marginBottom: t.spacing.m,
  },
  coreStat: {
    alignItems: 'center',
    gap: 2,
  },
  coreNumber: {
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1,
    color: t.colors.white,
  },
  coreLabel: {
    fontSize: 12,
    color: t.colors.dark05,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coreDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: t.colors.gray01,
  },
  coreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    maxWidth: 200,
    marginBottom: t.spacing.m,
  },
  coreDotPhysical: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: t.colors.blue,
  },
  coreDotLogical: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: t.colors.blue02,
  },
  legend: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontSize: 12,
    color: t.colors.dark05,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: t.spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.spacing.xs,
  },
  legendLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 3,
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
