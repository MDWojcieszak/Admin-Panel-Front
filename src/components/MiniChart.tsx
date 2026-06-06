import { mkUseStyles } from '~/utils/theme';

type Series = { values: number[]; color: string; fill?: boolean };

type MiniLineChartProps = {
  series: Series[];
  height?: number;
};

const VIEW_W = 100;
const VIEW_H = 100;

/** Lightweight full-width SVG line/area chart (no dependencies). */
export const MiniLineChart = ({ series, height = 56 }: MiniLineChartProps) => {
  const max = Math.max(1, ...series.flatMap((s) => s.values));

  const toPath = (values: number[]) => {
    const n = values.length;
    if (n === 0) return { line: '', area: '' };
    const pts = values.map((v, i) => {
      const x = n > 1 ? (i / (n - 1)) * VIEW_W : 0;
      const y = VIEW_H - (v / max) * VIEW_H;
      return [x, y] as const;
    });
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;
    return { line, area };
  };

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio='none' width='100%' height={height}>
      {series.map((s, i) => {
        const { line, area } = toPath(s.values);
        return (
          <g key={i}>
            {s.fill ? <path d={area} fill={s.color} fillOpacity={0.16} /> : null}
            <path d={line} fill='none' stroke={s.color} strokeWidth={2} vectorEffect='non-scaling-stroke' />
          </g>
        );
      })}
    </svg>
  );
};

type MiniBarsProps = {
  values: number[];
  color: string;
  height?: number;
};

export const MiniBars = ({ values, color, height = 56 }: MiniBarsProps) => {
  const styles = useStyles();
  const max = Math.max(1, ...values);
  return (
    <div style={{ ...styles.bars, height }}>
      {values.map((v, i) => (
        <div key={i} style={styles.barCol}>
          <div style={{ ...styles.bar, height: `${(v / max) * 100}%`, backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 1,
    borderRadius: 2,
  },
}));
