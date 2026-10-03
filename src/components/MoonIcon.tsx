type MoonIconProps = {
  /** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
  phase: number;
  size?: number;
  title?: string;
};

const LIT = '#ECE8D6';
const DARK = '#2B303A';

/**
 * The moon as it looks: a dark disc with the lit part drawn over it — a half
 * disc on the lit side plus an ellipse for the terminator, its width set by
 * cos(2π·phase). Waxing is lit on the right, waning on the left.
 */
export const MoonIcon = ({ phase, size = 16, title }: MoonIconProps) => {
  const r = size / 2 - 0.5;
  const c = size / 2;
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const waxing = phase < 0.5;

  // Lit half: right side when waxing (clockwise top→bottom), left when waning.
  const halfSweep = waxing ? 1 : 0;
  // Terminator back up from the bottom: it bulges into the lit half for a
  // crescent and into the dark half for a gibbous moon.
  const termSweep = waxing ? (k > 0 ? 0 : 1) : k < 0 ? 0 : 1;

  const d = [
    `M ${c} ${c - r}`,
    `A ${r} ${r} 0 0 ${halfSweep} ${c} ${c + r}`,
    `A ${rx} ${r} 0 0 ${termSweep} ${c} ${c - r}`,
    'Z',
  ].join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role='img' aria-label={title}>
      {title ? <title>{title}</title> : null}
      <circle cx={c} cy={c} r={r} fill={DARK} stroke='rgba(236, 232, 214, 0.25)' strokeWidth={0.75} />
      <path d={d} fill={LIT} />
    </svg>
  );
};
