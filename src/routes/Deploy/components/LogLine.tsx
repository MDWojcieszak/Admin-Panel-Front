import { CSSProperties, ReactNode } from 'react';
import { Theme, useTheme } from '~/utils/theme';

type Colors = Theme['colors'];

/**
 * SGR colour codes. Lines usually carry the ESC byte; some arrive with it
 * already stripped, leaving a bare `[32m`, so the ESC is optional here.
 */
// eslint-disable-next-line no-control-regex -- the ESC byte is the point
const ANSI = /\x1b?\[([0-9;]*)m/g;
// eslint-disable-next-line no-control-regex
const HAS_ANSI = /\x1b?\[[0-9;]*m/;

/** A compose log line may start with its service: `app-1  | …` (or `│`). */
const SERVICE_PREFIX = /^([\w.-]+)\s+[|│]\s?/;
/** nginx error log: `2024/11/27 20:03:36 [notice] 1#1: …` */
const NGINX_ERROR = /^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (\d+#\d+): (.*)$/;
/** Common / combined access log: `IP - user [date] "GET /x HTTP/1.1" 200 453 "ref" "agent"` */
const ACCESS = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "(\w+) (\S+) ([^"]+)" (\d{3}) (\S+)(?: "([^"]*)" "([^"]*)")?(.*)$/;
/** Leading ISO timestamp: `2024-11-27T20:03:36.123Z …` */
const ISO_TIME = /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+/;
/** `/docker-entrypoint.sh: …` or `10-listen-on-ipv6-by-default.sh: info: …` */
const SCRIPT_PREFIX = /^(\/?[\w./-]+\.(?:sh|envsh)):\s/;
const LEVEL_WORD = /\b(emerg|alert|crit|critical|fatal|panic|error|err|warn|warning|notice|info|debug|trace)\b:?/i;
/** Pieces worth picking out of any other line (HAProxy, Traefik, …). */
const TOKENS =
  /(\[\d{2}\/\w{3}\/\d{4}:[^\]]+\])|("(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT) \S+ HTTP\/[\d.]+")|(^(?:::ffff:)?\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?)|((?<=\s)[1-5]\d{2}(?=\s))/g;

const ERROR_LEVELS = ['emerg', 'alert', 'crit', 'critical', 'fatal', 'panic', 'error', 'err'];
const PALETTE = ['blue04', 'purple02', 'lightGreen', 'yellow', 'lightBlue', 'mainGreen'] as const;

export const stripAnsi = (line: string) => line.replace(ANSI, '');

/** Same service, same colour across the whole log. */
const serviceColor = (colors: Colors, name: string) =>
  colors[PALETTE[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length]];

const levelColor = (colors: Colors, level: string): string => {
  const l = level.toLowerCase();
  if (ERROR_LEVELS.includes(l)) return colors.red;
  if (l === 'warn' || l === 'warning') return colors.yellow;
  if (l === 'notice') return colors.blue04;
  if (l === 'info') return colors.lightBlue;
  return colors.dark05;
};

const statusColor = (colors: Colors, status: number) =>
  status >= 500 ? colors.red : status >= 400 ? colors.yellow : status >= 300 ? colors.blue04 : colors.lightGreen;

/** The severity a line reads as, for tinting its whole row. */
export const lineSeverity = (raw: string): 'error' | 'warn' | undefined => {
  const line = stripAnsi(raw).replace(SERVICE_PREFIX, '');
  const nginx = line.match(NGINX_ERROR);
  const level = (nginx ? nginx[2] : line.match(LEVEL_WORD)?.[1])?.toLowerCase();
  if (level && ERROR_LEVELS.includes(level)) return 'error';
  if (level === 'warn' || level === 'warning') return 'warn';
  const access = line.match(ACCESS);
  if (access && Number(access[8]) >= 500) return 'error';
  return undefined;
};

// ---------------------------------------------------------------- ANSI

/** The 16 base colours (normal and bright) in the theme's own shades. */
const ansiBase = (colors: Colors): string[] => {
  const base = [
    colors.dark05,
    colors.red,
    colors.lightGreen,
    colors.yellow,
    colors.blue04,
    colors.purple02,
    colors.lightBlue,
    colors.white,
  ];
  return [...base, ...base];
};

/** xterm 256-colour index → CSS colour; the first 16 follow the theme. */
const ansi256 = (colors: Colors, n: number) => {
  if (n < 16) return ansiBase(colors)[n];
  if (n >= 232) {
    const v = 8 + (n - 232) * 10;
    return `rgb(${v},${v},${v})`;
  }
  const i = n - 16;
  const level = (x: number) => (x === 0 ? 0 : 55 + x * 40);
  return `rgb(${level(Math.floor(i / 36))},${level(Math.floor(i / 6) % 6)},${level(i % 6)})`;
};

const renderAnsi = (text: string, colors: Colors, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let style: CSSProperties = {};
  let last = 0;
  let key = 0;
  const push = (chunk: string) => {
    if (chunk)
      nodes.push(
        <span key={`${keyPrefix}${key++}`} style={style}>
          {chunk}
        </span>,
      );
  };
  for (const match of text.matchAll(ANSI)) {
    push(text.slice(last, match.index));
    last = (match.index ?? 0) + match[0].length;
    const codes = (match[1] || '0').split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const c = codes[i];
      if (c === 0) style = {};
      else if (c === 1) style = { ...style, fontWeight: 700 };
      else if (c === 2) style = { ...style, opacity: 0.7 };
      else if (c === 3) style = { ...style, fontStyle: 'italic' };
      else if (c === 4) style = { ...style, textDecoration: 'underline' };
      else if (c === 22) style = { ...style, fontWeight: undefined, opacity: undefined };
      else if (c === 39) style = { ...style, color: undefined };
      else if (c >= 30 && c <= 37) style = { ...style, color: ansiBase(colors)[c - 30] };
      else if (c >= 90 && c <= 97) style = { ...style, color: ansiBase(colors)[c - 90 + 8] };
      else if (c === 38 && codes[i + 1] === 5) {
        style = { ...style, color: ansi256(colors, codes[i + 2] ?? 7) };
        i += 2;
      } else if (c === 38 && codes[i + 1] === 2) {
        style = { ...style, color: `rgb(${codes[i + 2] ?? 0},${codes[i + 3] ?? 0},${codes[i + 4] ?? 0})` };
        i += 4;
      }
      // Backgrounds (40–47, 48;…) are left out: on this terminal they only hurt legibility.
      else if (c === 48) i += codes[i + 1] === 5 ? 2 : codes[i + 1] === 2 ? 4 : 0;
    }
  }
  push(text.slice(last));
  return nodes;
};

// ---------------------------------------------------------------- heuristics

/** Dates, HTTP requests, client addresses and status codes in any other line. */
const decorate = (text: string, colors: Colors): ReactNode[] => {
  const nodes: ReactNode[] = [];
  const dim = { color: colors.dark05 };
  let last = 0;
  let statusDone = false;
  for (const match of text.matchAll(TOKENS)) {
    const [whole, date, request, address, status] = match;
    const at = match.index ?? 0;
    if (status && statusDone) continue;
    if (at > last) nodes.push(text.slice(last, at));
    if (date || address)
      nodes.push(
        <span key={at} style={dim}>
          {whole}
        </span>,
      );
    else if (request) {
      const [method, path, protocol] = request.slice(1, -1).split(' ');
      nodes.push(
        <span key={at}>
          <span style={dim}>&quot;</span>
          <span style={{ color: colors.blue04, fontWeight: 700 }}>{method}</span>{' '}
          <span style={{ color: colors.white }}>{path}</span> <span style={dim}>{protocol}&quot;</span>
        </span>,
      );
    } else if (status) {
      statusDone = true;
      nodes.push(
        <span key={at} style={{ color: statusColor(colors, Number(status)), fontWeight: 700 }}>
          {status}
        </span>,
      );
    }
    last = at + whole.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

/**
 * One container log line. Colours the program printed itself (ANSI) win;
 * otherwise nginx error and access lines get their parts picked out, and
 * anything else its timestamp, level, dates, requests and status codes.
 */
export const LogLine = ({ line }: { line: string }) => {
  const { colors } = useTheme();
  const dim = { color: colors.dark05 };
  const parts: ReactNode[] = [];
  let rest = line;

  const service = rest.match(SERVICE_PREFIX);
  if (service) {
    parts.push(
      <span key='svc' style={{ color: serviceColor(colors, service[1]), fontWeight: 600 }}>
        {service[1]}
      </span>,
      <span key='bar' style={dim}>
        {' │ '}
      </span>,
    );
    rest = rest.slice(service[0].length);
  }

  if (HAS_ANSI.test(rest)) {
    parts.push(...renderAnsi(rest, colors, 'a'));
    return <>{parts}</>;
  }

  const nginx = rest.match(NGINX_ERROR);
  if (nginx) {
    const [, time, level, pid, message] = nginx;
    parts.push(
      <span key='t' style={dim}>
        {time}{' '}
      </span>,
      <span key='l' style={{ color: levelColor(colors, level), fontWeight: 600 }}>
        {level.toUpperCase().padEnd(6)}
      </span>,
      <span key='p' style={dim}>
        {' '}
        {pid}{' '}
      </span>,
      <span key='m'>{message}</span>,
    );
    return <>{parts}</>;
  }

  const access = rest.match(ACCESS);
  if (access) {
    const [, ip, , user, date, method, path, protocol, status, size, referer, agent, tail] = access;
    parts.push(
      <span key='ip' style={dim}>
        {ip.padEnd(15)}{' '}
      </span>,
      <span key='d' style={dim}>
        {date.replace(/ [+-]\d{4}$/, '')}{' '}
      </span>,
      <span key='s' style={{ color: statusColor(colors, Number(status)), fontWeight: 700 }}>
        {status}
      </span>,
      <span key='me' style={{ color: colors.blue04, fontWeight: 700 }}>
        {' '}
        {method.padEnd(6)}
      </span>,
      <span key='pa' style={{ color: colors.white }}>
        {path}
      </span>,
      <span key='sz' style={dim}>
        {' '}
        {size === '-' ? '' : `${size} B`}
        {user !== '-' ? ` · ${user}` : ''}
        {referer && referer !== '-' ? ` · ${referer}` : ''}
        {agent && agent !== '-' ? ` · ${agent}` : ''}
        {tail}
        {protocol !== 'HTTP/1.1' ? ` · ${protocol}` : ''}
      </span>,
    );
    return <>{parts}</>;
  }

  const iso = rest.match(ISO_TIME);
  if (iso) {
    parts.push(
      <span key='iso' style={dim}>
        {iso[1]}{' '}
      </span>,
    );
    rest = rest.slice(iso[0].length);
  }

  const script = rest.match(SCRIPT_PREFIX);
  if (script) {
    parts.push(
      <span key='sc' style={dim}>
        {script[1]}:{' '}
      </span>,
    );
    rest = rest.slice(script[0].length);
  }

  const level = rest.match(LEVEL_WORD);
  if (level && level.index !== undefined && level.index < 24) {
    parts.push(
      <span key='pre'>{decorate(rest.slice(0, level.index), colors)}</span>,
      <span key='lv' style={{ color: levelColor(colors, level[1]), fontWeight: 600 }}>
        {level[0]}
      </span>,
      <span key='post'>{decorate(rest.slice(level.index + level[0].length), colors)}</span>,
    );
  } else {
    parts.push(<span key='rest'>{decorate(rest, colors)}</span>);
  }
  return <>{parts}</>;
};
