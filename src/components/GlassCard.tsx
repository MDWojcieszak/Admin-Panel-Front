import { CSSProperties, ReactNode } from 'react';
import { mkUseStyles } from '~/utils/theme';

type GlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export const GlassCard = (p: GlassCardProps) => {
  const styles = useStyles();
  return <div style={{ ...styles.container, ...p.style }}>{p.children}</div>;
};

const useStyles = mkUseStyles((t) => ({
  container: {
    position: 'relative',
    backdropFilter: 'blur(23px) saturate(161%)',
    webkitBackdropFilter: 'blur(23px) saturate(161%)',
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
    borderRadius: '12px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: t.colors.blue02 + t.colorOpacity(0.2),
  },
}));
