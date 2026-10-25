import { BomResponse } from '~/api/api';
import { BOM_KINDS } from '~/routes/Projects/bomKinds';
import { BOM_STATUS_LABEL } from '~/routes/Projects/utils';

/**
 * A cell as CSV wants it: quoted when it holds the separator, a quote or a
 * line break. Text starting with = + - @ is prefixed so a spreadsheet never
 * runs it as a formula (CSV injection).
 */
const cell = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Numbers with a decimal comma, as a Polish spreadsheet reads them. */
const number = (value: number | null) => (value === null ? '' : String(value).replace('.', ','));

/**
 * The parts list as CSV for Excel or Sheets: semicolon-separated, decimal
 * commas, a UTF-8 byte order mark so Polish letters survive opening it.
 */
export const bomToCsv = ({ items, summary }: BomResponse) => {
  const header = [
    'Group',
    'Kind',
    'Part',
    'Quantity',
    'Unit',
    'Status',
    'Unit price',
    'Cost',
    'Currency',
    'Supplier',
    'Link',
    'Gear',
    'Note',
  ];
  const rows = items.map((item) => [
    BOM_KINDS[item.kind].group,
    BOM_KINDS[item.kind].label,
    item.name,
    number(item.quantity),
    item.unit,
    BOM_STATUS_LABEL[item.status],
    number(item.unitPrice),
    number(item.cost),
    item.currency,
    item.supplier,
    item.url,
    item.gearItem ? `${item.gearItem.brand} ${item.gearItem.model}` : '',
    item.note,
  ]);
  const totals = summary.costs.map((cost) => [
    '',
    '',
    `Total${cost.currency ? ` ${cost.currency}` : ''}`,
    '',
    '',
    `to buy ${number(cost.toBuy)}`,
    '',
    number(cost.total),
    cost.currency,
  ]);
  const lines = [header, ...rows, ...(totals.length ? [[], ...totals] : [])];
  return '\uFEFF' + lines.map((line) => line.map(cell).join(';')).join('\r\n') + '\r\n';
};

/** "Astro mount BOM 2026-10-26.csv": safe for any file system. */
export const bomFileName = (projectTitle: string) => {
  const base =
    projectTitle
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Project';
  return `${base} BOM ${new Date().toISOString().slice(0, 10)}.csv`;
};

/** Hands the CSV to the browser as a download; nothing leaves the panel. */
export const downloadBomCsv = (bom: BomResponse, projectTitle: string) => {
  const blob = new Blob([bomToCsv(bom)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = bomFileName(projectTitle);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
