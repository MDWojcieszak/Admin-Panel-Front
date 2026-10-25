import { FiCheck, FiSlash } from 'react-icons/fi';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ColorSwatchesProps = {
  /** A hex colour, or '' / null for none. */
  value?: string | null;
  onChange: (value: string) => void;
  /** Offers "no colour" first; its value is ''. */
  allowNone?: boolean;
  disabled?: boolean;
  size?: number;
};

/**
 * A colour picked from the panel's own accents rather than the browser's
 * colour dialog, so whatever is picked sits well with the rest of the UI.
 * A colour set earlier that is not in the palette stays shown and selected.
 */
export const ColorSwatches = ({ value, onChange, allowNone, disabled, size = 28 }: ColorSwatchesProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const c = theme.colors;
  const palette = [c.dark05, c.blue03, c.blue, c.lightBlue, c.mainGreen, c.lightGreen, c.yellow, c.red, c.purple02];
  const current = (value ?? '').toLowerCase();
  const colors = current && !palette.some((p) => p.toLowerCase() === current) ? [...palette, value!] : palette;

  const swatch = (color: string) => {
    const selected = color.toLowerCase() === current;
    return (
      <button
        key={color}
        type='button'
        title={color}
        aria-label={`Colour ${color}`}
        aria-pressed={selected}
        disabled={disabled}
        onClick={() => onChange(color)}
        style={{
          ...styles.swatch,
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: selected ? `0 0 0 2px ${c.gray05}, 0 0 0 4px ${color}` : undefined,
        }}
      >
        {selected ? <FiCheck size={size * 0.5} color={c.gray05} strokeWidth={3} /> : null}
      </button>
    );
  };

  return (
    <div style={{ ...styles.row, opacity: disabled ? 0.6 : 1 }}>
      {allowNone ? (
        <button
          type='button'
          title='No colour'
          aria-label='No colour'
          aria-pressed={!current}
          disabled={disabled}
          onClick={() => onChange('')}
          style={{
            ...styles.swatch,
            ...styles.none,
            width: size,
            height: size,
            boxShadow: !current ? `0 0 0 2px ${c.gray05}, 0 0 0 4px ${c.dark05}` : undefined,
          }}
        >
          <FiSlash size={size * 0.5} />
        </button>
      ) : null}
      {colors.map(swatch)}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing.s },
  swatch: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'box-shadow 0.12s ease',
  },
  none: {
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    border: `1px dashed ${t.colors.dark04}`,
    boxSizing: 'border-box',
  },
}));
