import { mkUseStyles } from '~/utils/theme';
export const Calendar = () => {
  const styles = useStyles();

  return <div style={styles.container}></div>;
};

const useStyles = mkUseStyles(() => ({
  container: {},

  button: {},
}));
