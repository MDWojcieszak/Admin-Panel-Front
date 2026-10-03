type IlluminationRingProps = {
  /** Lit share of the moon, 0–1. */
  illumination: number;
  size?: number;
  title?: string;
};

const LIT = '#ECE8D6';
const TRACK = 'rgba(236, 232, 214, 0.18)';

/**
 * How much of the moon is lit, as a ring that fills clockwise from the top,
 * with the percentage beside it — easier to compare day to day than the shape.
 */
export const IlluminationRing = ({ illumination, size = 14, title }: IlluminationRingProps) => {
  const stroke = 2.5;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const percent = Math.round(illumination * 100);

  return (
    <span title={title} style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={c} cy={c} r={r} fill='none' stroke={TRACK} strokeWidth={stroke} />
        <circle
          cx={c}
          cy={c}
          r={r}
          fill='none'
          stroke={LIT}
          strokeWidth={stroke}
          strokeLinecap={percent > 0 && percent < 100 ? 'round' : 'butt'}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - illumination)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 600, color: LIT, opacity: 0.85, minWidth: 26, textAlign: 'right' }}>
        {percent}%
      </span>
    </span>
  );
};
