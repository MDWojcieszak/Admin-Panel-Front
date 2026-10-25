import { ReactNode } from 'react';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Option = {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type OptionCardsProps = {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  /** Narrowest a card gets before the grid drops a column. */
  minWidth?: number;
};

/**
 * One choice out of a few, each explained in a line — a project's type, a
 * plan. Cards rather than a select, because the explanation is the point.
 */
export const OptionCards = ({ options, selected, onSelect, minWidth = 200 }: OptionCardsProps) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div
      role='radiogroup'
      style={{ ...styles.grid, gridTemplateColumns: `repeat(auto-fit, minmax(min(${minWidth}px, 100%), 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => onSelect(option.value)}
            style={{ ...styles.card, ...(active ? styles.cardActive : null) }}
          >
            {option.icon ? (
              <span
                style={{
                  ...styles.icon,
                  color: active ? theme.colors.white : theme.colors.blue04,
                  backgroundColor: active ? theme.colors.blue : theme.colors.gray02 + theme.colorOpacity(0.8),
                }}
              >
                {option.icon}
              </span>
            ) : null}
            <span style={styles.text}>
              <span style={styles.label}>{option.label}</span>
              {option.description ? <span style={styles.description}>{option.description}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  grid: { display: 'grid', gap: t.spacing.s },
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.spacing.sm,
    padding: t.spacing.sm,
    textAlign: 'left',
    cursor: 'pointer',
    color: t.colors.white,
    font: 'inherit',
    borderRadius: t.borderRadius.large,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.45),
    transition: 'background-color 0.12s ease, border-color 0.12s ease',
  },
  cardActive: {
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: t.borderRadius.default,
    transition: 'background-color 0.12s ease, color 0.12s ease',
  },
  text: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  label: { fontSize: 15, fontWeight: 700 },
  description: { fontSize: 12, lineHeight: 1.4, color: t.colors.dark05 },
}));
