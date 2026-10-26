import { BomPartKind, BomStatus, CreateBomItemDto } from '~/api/api';
import { BOM_KIND_KEYWORDS, BOM_KINDS } from '~/routes/Projects/bomKinds';
import { fold, toNumber } from '~/routes/Projects/import/csv';
import { CellResult, ImportSchema } from '~/routes/Projects/import/schema';
import { BOM_STATUS_LABEL, formatMoney } from '~/routes/Projects/utils';

const KINDS = Object.entries(BOM_KINDS) as [BomPartKind, (typeof BOM_KINDS)[BomPartKind]][];

/** A kind from its label ("Screw"), its value (SCREW), a part of a label or a Polish word ("śrubka"). */
const kindOf = (text: string): BomPartKind | undefined => {
  const t = fold(text);
  if (!t) return undefined;
  return (
    KINDS.find(([value, kind]) => fold(kind.label) === t || value.toLowerCase() === t)?.[0] ??
    KINDS.find(([value]) =>
      fold(BOM_KIND_KEYWORDS[value] ?? '')
        .split(/\s+/)
        .includes(t),
    )?.[0] ??
    KINDS.find(([, kind]) =>
      fold(kind.label)
        .split(/\s*\/\s*/)
        .includes(t),
    )?.[0] ??
    // "Pasek zębaty": a word of it that names a kind on its own.
    KINDS.find(([value]) => {
      const words = fold(BOM_KIND_KEYWORDS[value] ?? '').split(/\s+/);
      return t.split(/\s+/).some((w) => w.length >= 4 && words.includes(w));
    })?.[0]
  );
};

/** Other words for each status; shown in the instructions, compared without Polish letters. */
const STATUS_WORDS: Record<BomStatus, string[]> = {
  NEEDED: ['to buy', 'potrzebne', 'do kupienia', 'kupić'],
  ORDERED: ['zamówione', 'zamówiony', 'w drodze'],
  HAVE: ['got', 'in stock', 'mam', 'jest', 'na stanie'],
  USED: ['użyte', 'zużyte', 'zamontowane'],
};

const STATUS_HINT: Record<BomStatus, string> = {
  NEEDED: 'still to buy',
  ORDERED: 'bought, on its way',
  HAVE: 'at hand',
  USED: 'built in',
};

const statusOf = (text: string): BomStatus | undefined => {
  const t = fold(text);
  return (Object.keys(STATUS_WORDS) as BomStatus[]).find(
    (status) =>
      status.toLowerCase() === t ||
      fold(BOM_STATUS_LABEL[status]) === t ||
      STATUS_WORDS[status].some((w) => fold(w) === t),
  );
};

/** The Polish words a kind also matches, shown as one phrase as they are written in bomKinds. */
const kindWords = (kind: BomPartKind) => (BOM_KIND_KEYWORDS[kind] ? [BOM_KIND_KEYWORDS[kind]!] : []);

/** A currency written beside a price ("zł", "€") when the currency column is empty. */
const currencyIn = (text: string): string | null => {
  const t = text.toLowerCase();
  if (/zł|zl\b|pln/.test(t)) return 'PLN';
  if (/€|eur/.test(t)) return 'EUR';
  if (/\$|usd/.test(t)) return 'USD';
  if (/£|gbp/.test(t)) return 'GBP';
  return null;
};

const ok = (display: string): CellResult => ({ display });
const warn = (display: string, message: string): CellResult => ({ display, issue: { level: 'warning', message } });
const err = (display: string, message: string): CellResult => ({ display, issue: { level: 'error', message } });

/**
 * The parts list of a build. `fallbackCurrency` is the one the list already
 * uses, for prices that come without one.
 */
export const bomSchema = (fallbackCurrency: string | null): ImportSchema<CreateBomItemDto> => ({
  id: 'bom',
  noun: { one: 'part', many: 'parts' },
  positional: ['name', 'quantity', 'unit', 'unitPrice'],
  derived: ['group', 'grupa', 'cost', 'koszt', 'gear', 'sprzet', 'total'],
  promptIntro:
    'List the parts I need for the build described below, as a bill of materials I can paste into my project planner.',
  promptRules: [
    'one row per distinct part; put the count in Quantity rather than repeating rows',
    'numbers without units or currency signs in Quantity and Unit price; a dot or a comma for decimals',
  ],
  columns: [
    {
      key: 'name',
      label: 'Part',
      aliases: ['name', 'item', 'description', 'czesc', 'nazwa', 'element', 'opis'],
      required: true,
      type: 'text',
      description: 'what to buy or make, specific enough to order (size, thread, model)',
      example: ['M5x12 socket head screw', 'NEMA 17 stepper motor', 'GT2 timing belt 6 mm'],
      width: 220,
    },
    {
      key: 'kind',
      label: 'Kind',
      aliases: ['type', 'category', 'rodzaj', 'typ', 'kategoria'],
      type: 'choice',
      description: 'the kind of part; the list is grouped by it',
      empty: 'Other (a value not on the list is imported as Other too, with a warning)',
      values: KINDS.map(([value, kind]) => ({ value: kind.label, group: kind.group, aliases: kindWords(value) })),
      example: ['Screw', 'Stepper motor', 'Belt'],
      width: 150,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      aliases: ['qty', 'amount', 'count', 'ilosc', 'liczba', 'szt'],
      type: 'number',
      description: 'how many; more than 0',
      empty: '1',
      example: ['20', '2', '1,5'],
      width: 80,
    },
    {
      key: 'unit',
      label: 'Unit',
      aliases: ['units', 'jednostka', 'jm', 'j.m.'],
      type: 'text',
      description: 'the unit of the quantity: pcs, m, g, set…',
      empty: 'pieces',
      example: ['pcs', 'pcs', 'm'],
      width: 70,
    },
    {
      key: 'status',
      label: 'Status',
      aliases: ['state', 'stan'],
      type: 'choice',
      description: 'where the part is',
      empty: 'Needed',
      values: Object.values(BomStatus).map((s) => ({
        value: BOM_STATUS_LABEL[s],
        hint: STATUS_HINT[s],
        aliases: STATUS_WORDS[s],
      })),
      example: ['Needed', 'Ordered', 'Needed'],
      width: 90,
    },
    {
      key: 'unitPrice',
      label: 'Unit price',
      aliases: ['price', 'price / unit', 'price per unit', 'cena', 'cena jedn.', 'cena jednostkowa'],
      type: 'money',
      description: 'the price of one unit (not of the whole quantity)',
      empty: 'price unknown',
      example: ['0,35', '59', '15'],
      width: 100,
    },
    {
      key: 'currency',
      label: 'Currency',
      aliases: ['waluta'],
      type: 'text',
      description: 'a three-letter currency code: PLN, EUR, USD, GBP…',
      empty: `${fallbackCurrency ?? 'none'} when there is a price (or the one written beside it, like "zł" or "€")`,
      example: ['PLN', 'PLN', 'PLN'],
      width: 80,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      aliases: ['shop', 'vendor', 'store', 'dostawca', 'sklep'],
      type: 'text',
      description: 'where to buy it',
      example: ['', 'Botland', ''],
      width: 110,
    },
    {
      key: 'url',
      label: 'Link',
      aliases: ['url', 'source', 'zrodlo', 'adres'],
      type: 'link',
      description: 'the product page; anything not starting with http(s) is left out, with a warning',
      example: ['', 'https://botland.com.pl', ''],
      width: 140,
    },
    {
      key: 'note',
      label: 'Note',
      aliases: ['notes', 'comment', 'uwagi', 'notatka', 'komentarz'],
      type: 'text',
      description: 'anything else worth knowing',
      example: ['stainless', '1.8° step, 0.4 Nm', 'for the RA axis'],
      width: 150,
    },
  ],
  parseRow: (raw) => {
    const name = (raw.name ?? '').trim();
    const filled = Object.values(raw).some((v) => v.trim());
    // Our own export ends with totals; a blank line is nothing.
    if (!filled || /^(total|razem|suma)\b/i.test(name)) return null;

    const cells: Record<string, CellResult> = {};
    let blocked = false;
    const block = (key: string, display: string, message: string) => {
      cells[key] = err(display, message);
      blocked = true;
    };

    if (name) cells.name = ok(name);
    else block('name', '', 'No part name');

    const kindText = raw.kind ?? '';
    const kind = kindOf(kindText);
    cells.kind = kind
      ? ok(BOM_KINDS[kind].label)
      : kindText.trim()
        ? warn('Other', `"${kindText}" is not a kind — imported as Other`)
        : ok('Other');

    const quantity = toNumber(raw.quantity ?? '');
    if (quantity === null) cells.quantity = ok('1');
    else if (Number.isNaN(quantity) || quantity <= 0) block('quantity', raw.quantity, 'Not a positive number');
    else cells.quantity = ok(String(quantity));

    cells.unit = ok((raw.unit ?? '').trim());

    const statusText = raw.status ?? '';
    const status = statusText.trim() ? statusOf(statusText) : BomStatus.Needed;
    cells.status = status
      ? ok(BOM_STATUS_LABEL[status])
      : warn(BOM_STATUS_LABEL.NEEDED, `"${statusText}" is not a status — imported as Needed`);

    const priceText = raw.unitPrice ?? '';
    const price = toNumber(priceText);
    const currencyText = (raw.currency ?? '').trim().toUpperCase();
    let currency: string | null = null;
    if (price !== null && !Number.isNaN(price)) {
      if (/^[A-Z]{3}$/.test(currencyText)) currency = currencyText;
      else currency = currencyIn(priceText) ?? fallbackCurrency;
      cells.currency =
        currencyText && !/^[A-Z]{3}$/.test(currencyText)
          ? warn(currency ?? '', `"${raw.currency}" is not a currency code${currency ? ` — using ${currency}` : ''}`)
          : ok(currency ?? '');
    } else cells.currency = ok(currencyText);
    if (price === null) cells.unitPrice = ok('');
    else if (Number.isNaN(price) || price < 0) block('unitPrice', priceText, 'Not a price');
    else cells.unitPrice = ok(formatMoney(price, currency));

    cells.supplier = ok((raw.supplier ?? '').trim());

    const url = (raw.url ?? '').trim();
    const safeUrl = /^https?:\/\/\S+$/i.test(url);
    cells.url = !url || safeUrl ? ok(url) : warn('', `"${url}" is not an http(s) link — left out`);

    cells.note = ok((raw.note ?? '').trim());

    if (blocked) return { cells };
    return {
      cells,
      value: {
        name,
        kind: kind ?? BomPartKind.Other,
        quantity: quantity ?? 1,
        unit: cells.unit.display || null,
        status: status ?? BomStatus.Needed,
        unitPrice: price,
        currency: price === null ? null : currency,
        supplier: cells.supplier.display || null,
        url: safeUrl ? url : null,
        note: cells.note.display || null,
      },
    };
  },
});
