import { BomPartKind, BomStatus, CreateBomItemDto } from '~/api/api';
import { BOM_KIND_KEYWORDS, BOM_KINDS } from '~/routes/Projects/bomKinds';
import { BOM_STATUS_LABEL } from '~/routes/Projects/utils';

/**
 * Reads a parts list from CSV or from rows pasted out of a spreadsheet — our
 * own export, Excel or Sheets — into parts ready to add. Columns are found by
 * their header, in English or Polish; with no header row the columns are read
 * as name, quantity, unit, unit price.
 */

export type ImportedPart = {
  dto: CreateBomItemDto;
  /** The kind text that matched no kind; the part is imported as Other. */
  unknownKind?: string;
};

export type BomImport = {
  parts: ImportedPart[];
  /** Rows that had no part name (blank lines, totals). */
  skipped: number;
  /** Header cells that matched no field, so their values were left out. */
  ignoredColumns: string[];
};

type Field = 'name' | 'kind' | 'quantity' | 'unit' | 'status' | 'unitPrice' | 'currency' | 'supplier' | 'url' | 'note';

/** Lower case without diacritics, so "Ilość" and "ilosc" are the same header. */
const fold = (text: string) =>
  text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

const HEADERS: Record<Field, string[]> = {
  name: ['part', 'name', 'item', 'description', 'czesc', 'nazwa', 'element', 'opis'],
  kind: ['kind', 'type', 'category', 'rodzaj', 'typ', 'kategoria'],
  quantity: ['quantity', 'qty', 'amount', 'count', 'ilosc', 'liczba', 'szt'],
  unit: ['unit', 'units', 'jednostka', 'jm', 'j.m.'],
  status: ['status', 'state', 'stan'],
  unitPrice: ['unit price', 'price', 'price / unit', 'price per unit', 'cena', 'cena jedn.', 'cena jednostkowa'],
  currency: ['currency', 'waluta'],
  supplier: ['supplier', 'shop', 'vendor', 'store', 'dostawca', 'sklep'],
  url: ['link', 'url', 'source', 'zrodlo', 'adres'],
  note: ['note', 'notes', 'comment', 'uwagi', 'notatka', 'komentarz'],
};

/** Columns of our export that are worked out rather than entered. */
const DERIVED = ['group', 'grupa', 'cost', 'koszt', 'gear', 'sprzet', 'total'];

const fieldOf = (header: string): Field | undefined => {
  const h = fold(header);
  return (Object.keys(HEADERS) as Field[]).find((field) => HEADERS[field].includes(h));
};

/** The separator a file uses: whichever of tab, semicolon and comma splits its first line most. */
const detectSeparator = (firstLine: string) => {
  const counts = ['\t', ';', ','].map((sep) => ({ sep, n: firstLine.split(sep).length }));
  return counts.sort((a, b) => b.n - a.n)[0].sep;
};

/** RFC 4180-ish: quoted cells may hold the separator, quotes ("") and line breaks. */
const parseRows = (text: string, sep: string): string[][] => {
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
  return rows.map((r) => r.map((c) => c.trim()));
};

/** "12,50 zł", "1 299.00", "€3" → a number; anything else → null. */
const toNumber = (text: string): number | null => {
  const cleaned = text.replace(/[^\d,.-]/g, '');
  if (!cleaned) return null;
  // The last separator is the decimal one; the others group thousands.
  const lastSep = Math.max(cleaned.lastIndexOf(','), cleaned.lastIndexOf('.'));
  const normalised =
    lastSep === -1
      ? cleaned
      : cleaned.slice(0, lastSep).replace(/[,.]/g, '') + '.' + cleaned.slice(lastSep + 1).replace(/[,.]/g, '');
  const value = Number(normalised);
  return Number.isFinite(value) ? value : null;
};

/** A currency written next to a price ("zł", "€", "PLN") when there is no currency column. */
const currencyIn = (text: string): string | null => {
  const t = text.toLowerCase();
  if (/zł|zl\b|pln/.test(t)) return 'PLN';
  if (/€|eur/.test(t)) return 'EUR';
  if (/\$|usd/.test(t)) return 'USD';
  if (/£|gbp/.test(t)) return 'GBP';
  return null;
};

const KIND_ENTRIES = Object.entries(BOM_KINDS) as [BomPartKind, (typeof BOM_KINDS)[BomPartKind]][];

/** A kind from its label ("Screw"), its value (SCREW) or a Polish word for it ("śrubka"). */
const kindOf = (text: string): BomPartKind | undefined => {
  const t = fold(text);
  if (!t) return undefined;
  const exact = KIND_ENTRIES.find(([value, kind]) => fold(kind.label) === t || value.toLowerCase() === t);
  if (exact) return exact[0];
  const byWord = KIND_ENTRIES.find(([value]) =>
    fold(BOM_KIND_KEYWORDS[value] ?? '')
      .split(/\s+/)
      .includes(t),
  );
  if (byWord) return byWord[0];
  // "Screw / bolt" style labels: any of their parts.
  const partial = KIND_ENTRIES.find(([, kind]) =>
    fold(kind.label)
      .split(/\s*\/\s*/)
      .includes(t),
  );
  return partial?.[0];
};

const STATUS_WORDS: Record<BomStatus, string[]> = {
  NEEDED: ['needed', 'to buy', 'potrzebne', 'do kupienia', 'kupic'],
  ORDERED: ['ordered', 'zamowione', 'zamowiony'],
  HAVE: ['have', 'got', 'mam', 'jest', 'na stanie'],
  USED: ['used', 'uzyte', 'zuzyte'],
};

const statusOf = (text: string): BomStatus | undefined => {
  const t = fold(text);
  if (!t) return undefined;
  return (Object.keys(STATUS_WORDS) as BomStatus[]).find(
    (status) => status.toLowerCase() === t || fold(BOM_STATUS_LABEL[status]) === t || STATUS_WORDS[status].includes(t),
  );
};

/** The cell under a field, or '' when the file has no such column. */
const pick = (row: string[], columns: Partial<Record<Field, number>>, field: Field) => {
  const index = columns[field];
  return index === undefined ? '' : row[index] ?? '';
};

export const parseBomImport = (raw: string, fallbackCurrency: string | null): BomImport => {
  // A UTF-8 byte order mark (our own export starts with one) is not part of the header.
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) ?? '';
  const rows = parseRows(text, detectSeparator(firstLine)).filter((r) => r.some((c) => c !== ''));
  if (!rows.length) return { parts: [], skipped: 0, ignoredColumns: [] };

  // A header row is one where a cell names a field; otherwise the default columns.
  const headerColumns: Partial<Record<Field, number>> = {};
  const ignoredColumns: string[] = [];
  rows[0].forEach((cell, index) => {
    const field = fieldOf(cell);
    if (field && headerColumns[field] === undefined) headerColumns[field] = index;
    else if (cell && !DERIVED.includes(fold(cell))) ignoredColumns.push(cell);
  });
  const hasHeader = headerColumns.name !== undefined;
  const columns: Partial<Record<Field, number>> = hasHeader
    ? headerColumns
    : { name: 0, quantity: 1, unit: 2, unitPrice: 3 };
  const body = hasHeader ? rows.slice(1) : rows;

  let skipped = 0;
  const parts: ImportedPart[] = [];
  body.forEach((row) => {
    const name = pick(row, columns, 'name').replace(/^'/, '');
    // Blank names, and the totals our own export adds at the bottom.
    if (!name || /^(total|razem|suma)\b/i.test(name)) {
      skipped++;
      return;
    }
    const kindText = pick(row, columns, 'kind');
    const kind = kindOf(kindText);
    const priceText = pick(row, columns, 'unitPrice');
    const unitPrice = toNumber(priceText);
    const currencyText = pick(row, columns, 'currency').toUpperCase();
    const currency = /^[A-Z]{3}$/.test(currencyText)
      ? currencyText
      : unitPrice !== null
        ? currencyIn(priceText) ?? fallbackCurrency
        : null;
    const url = pick(row, columns, 'url');
    parts.push({
      dto: {
        name,
        kind: kind ?? BomPartKind.Other,
        quantity: toNumber(pick(row, columns, 'quantity')) ?? 1,
        unit: pick(row, columns, 'unit') || null,
        status: statusOf(pick(row, columns, 'status')),
        unitPrice,
        currency,
        supplier: pick(row, columns, 'supplier') || null,
        url: /^https?:\/\//i.test(url) ? url : null,
        note: pick(row, columns, 'note') || null,
      },
      unknownKind: kindText && !kind ? kindText : undefined,
    });
  });
  return { parts, skipped, ignoredColumns: hasHeader ? ignoredColumns : [] };
};
