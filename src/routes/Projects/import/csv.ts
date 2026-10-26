/**
 * Reading spreadsheet text: our own exports, Excel and Sheets CSV, and rows
 * copied straight out of a spreadsheet (tab-separated). Shared by every import.
 */

/** Lower case without diacritics, so "Ilość" and "ilosc" are the same word. */
export const fold = (text: string) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

/** The separator a text uses: whichever of tab, semicolon and comma splits its first line most. */
export const detectSeparator = (firstLine: string) => {
  const counts = ['\t', ';', ','].map((sep) => ({ sep, n: firstLine.split(sep).length }));
  return counts.sort((a, b) => b.n - a.n)[0].sep;
};

/** RFC 4180-ish: quoted cells may hold the separator, doubled quotes and line breaks. */
/**
 * What a chat answers, made plain: the ``` fences around a code block go, and a
 * Markdown table (| a | b |, with its |---| rule) becomes tab-separated rows.
 */
const fromChat = (text: string) => {
  const all = text.split(/\r?\n/);
  // With a code block, only what is inside it: chats add a sentence before and after.
  const open = all.findIndex((line) => /^\s*```/.test(line));
  const close = open === -1 ? -1 : all.findIndex((line, i) => i > open && /^\s*```/.test(line));
  const lines = open === -1 ? all : all.slice(open + 1, close === -1 ? undefined : close);
  const table = lines.filter((l) => l.trim()).every((l) => l.trim().startsWith('|'));
  if (!table) return lines.join('\n');
  return lines
    .filter((l) => l.trim() && !/^\s*\|?[\s:|-]+\|?\s*$/.test(l))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim())
        .join('\t'),
    )
    .join('\n');
};

export const parseRows = (raw: string): string[][] => {
  // A UTF-8 byte order mark (our exports start with one) is not part of the first cell.
  const text = fromChat(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) ?? '';
  const sep = detectSeparator(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ''));
};

/**
 * "12,50 zł", "1 299.00", "€3" → a number; "" → null; anything else → NaN.
 * The last separator is the decimal one, the others group thousands.
 */
export const toNumber = (text: string): number | null => {
  if (!text.trim()) return null;
  const cleaned = text.replace(/[^\d,.-]/g, '');
  if (!/\d/.test(cleaned)) return NaN;
  const lastSep = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  const normalised =
    lastSep === -1
      ? cleaned
      : cleaned.slice(0, lastSep).replace(/[,.]/g, '') + '.' + cleaned.slice(lastSep + 1).replace(/[,.]/g, '');
  const value = Number(normalised);
  return Number.isFinite(value) ? value : NaN;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-03", "3.11.2026", "03/11/2026" → "2026-11-03"; "" → null; anything else → undefined. */
export const toDay = (text: string): string | null | undefined => {
  const t = text.trim();
  if (!t) return null;
  let y: number, m: number, d: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(t);
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (dmy) [d, m, y] = [Number(dmy[1]), Number(dmy[2]), Number(dmy[3])];
  else return undefined;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return undefined;
  return `${y}-${pad(m)}-${pad(d)}`;
};

/**
 * Text from a CSV file. Excel on a Polish Windows saves CSV in Windows-1250;
 * read as UTF-8 its letters turn into replacement characters, and then the
 * file is read again in that encoding.
 */
export const readText = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  return utf8.includes(String.fromCharCode(0xfffd)) ? new TextDecoder('windows-1250').decode(buffer) : utf8;
};

/** A cell for a CSV we write: quoted when it holds the separator, a quote or a line break. */
export const csvCell = (value: string) => (/[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Hands text to the browser as a file download; nothing leaves the panel. */
export const downloadText = (text: string, fileName: string, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
