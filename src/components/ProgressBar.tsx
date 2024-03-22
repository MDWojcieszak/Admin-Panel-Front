import { mkUseStyles } from '~/utils/theme';

type ProgressBarProps = {
  progress: number;
};

const HEIGHT = 10;

export const ProgressBar = (p: ProgressBarProps) => {
  const styles = useStyles();
  return (
    <div style={styles.container}>
      <div style={{ ...styles.progress, width: `${p.progress}%` }}></div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: HEIGHT,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray01,
  },
  progress: {
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.lightGreen,
    height: HEIGHT,
  },
}));
