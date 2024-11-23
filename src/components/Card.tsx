import { CSSProperties, ReactNode } from 'react';
import { mkUseStyles } from '~/utils/theme';

type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export const Card = (p: CardProps) => {
  const styles = useStyles();
  return <div style={{ ...styles.container, ...p.style }}>{p.children}</div>;
};

const useStyles = mkUseStyles((t) => ({
  container: {
    // backgroundColor: t.colors.blue02,
    margin: t.spacing.m,
    borderRadius: '12px',
    padding: t.spacing.m,
  },
}));
