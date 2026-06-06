import { CSSProperties, ReactNode } from 'react';
import { useTheme, Theme } from '~/utils/theme';

export type BadgeTone = 'neutral' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';

const TONE_COLOR: Record<BadgeTone, keyof Theme['colors']> = {
  neutral: 'dark05',
  blue: 'blue',
  green: 'lightGreen',
  yellow: 'yellow',
  red: 'red',
  purple: 'purple02',
};

type BadgeProps = {
  label: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  style?: CSSProperties;
};

export const Badge = ({ label, tone = 'neutral', icon, style }: BadgeProps) => {
  const theme = useTheme();
  const color = theme.colors[TONE_COLOR[tone]];
  return (
    <span
      style={{
        display: 'inline-flex',
        width: 'fit-content',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        color,
        backgroundColor: color + theme.colorOpacity(0.14),
        border: `1px solid ${color + theme.colorOpacity(0.3)}`,
        ...style,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

/** Map a user role to a badge tone. */
export const roleTone = (role?: string): BadgeTone => {
  switch (role) {
    case 'OWNER':
      return 'purple';
    case 'ADMIN':
      return 'red';
    case 'MODERATOR':
      return 'yellow';
    default:
      return 'blue';
  }
};
