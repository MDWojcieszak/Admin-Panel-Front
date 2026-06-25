import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FaDatabase } from 'react-icons/fa6';
import { MdDeviceHub, MdOutlineMail, MdQueue } from 'react-icons/md';
import { Theme } from '~/utils/theme';

/** Shared status vocabulary + visual atoms, reused by the full page and the dashboard card. */

export type Descriptor = { label: string; color: keyof Theme['colors'] };

// Aggregate: ok = green, degraded = a non-critical service is down (e.g. mail),
// down = a critical dependency (the database) is unreachable.
export const AGGREGATE: Record<string, Descriptor> = {
  ok: { label: 'All systems operational', color: 'lightGreen' },
  degraded: { label: 'Degraded', color: 'yellow' },
  down: { label: 'Outage', color: 'red' },
};

export const AGGREGATE_SUB: Record<string, string> = {
  ok: 'Every subsystem responded and verified.',
  degraded: 'A non-critical service is unavailable.',
  down: 'A critical service is down.',
};

// Per-subsystem: up = connected & verified, down = couldn't connect (see detail),
// unconfigured = no ENV, so it wasn't checked.
export const CHECK: Record<string, Descriptor> = {
  up: { label: 'Up', color: 'lightGreen' },
  down: { label: 'Down', color: 'red' },
  unconfigured: { label: 'Unconfigured', color: 'dark05' },
};

export const UNKNOWN: Descriptor = { label: 'Unknown', color: 'dark05' };

const SUBSYSTEM: Record<string, { label: string; icon: ReactNode }> = {
  database: { label: 'Database', icon: <FaDatabase size={20} /> },
  mail: { label: 'Mail / SMTP', icon: <MdOutlineMail size={22} /> },
  rabbitmq: { label: 'RabbitMQ', icon: <MdQueue size={22} /> },
};

export const subsystemMeta = (name: string) =>
  SUBSYSTEM[name] || { label: name, icon: <MdDeviceHub size={20} /> };

// Real connectivity latency → a "ping quality" rating + how many signal bars to light.
export const latencyQuality = (ms: number): Descriptor & { level: number } => {
  if (ms < 100) return { label: 'Fast', color: 'lightGreen', level: 4 };
  if (ms < 300) return { label: 'Good', color: 'lightGreen', level: 3 };
  if (ms < 800) return { label: 'Moderate', color: 'yellow', level: 2 };
  return { label: 'Slow', color: 'red', level: 1 };
};

/**
 * Live "radar ping" — a hollow ring expanding out from behind the dot while up.
 * The ring starts smaller than the dot (so each loop's restart is hidden behind the
 * solid dot) and only fades in as it grows past it — no flash at the centre.
 */
export const PingDot = ({ color, pulse, size = 11 }: { color: string; pulse: boolean; size?: number }) => (
  <div style={{ position: 'relative', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {pulse ? (
      <motion.div
        style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `1.5px solid ${color}` }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.45, 0], scale: [0.7, 2.6, 2.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
      />
    ) : null}
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />
  </div>
);

/** Signal-strength bars (like a ping/reception meter) — `level` of 4 lit in `color`. */
export const SignalBars = ({ level, color, dim }: { level: number; color: string; dim: string }) => {
  const heights = [7, 11, 15, 19];
  return (
    <div style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 19 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ width: 4, height: h, borderRadius: 2, backgroundColor: i < level ? color : dim }} />
      ))}
    </div>
  );
};
