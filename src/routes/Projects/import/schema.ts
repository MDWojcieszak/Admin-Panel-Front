import { csvCell, fold, parseRows } from '~/routes/Projects/import/csv';

/**
 * An import is described once — its columns, what each accepts, how a row is
 * read — and the same description drives the format instructions, the prompt
 * for a chat, the template file, the header matching and the preview.
 */

export type IssueLevel = 'error' | 'warning';

export type Issue = { level: IssueLevel; message: string };

/** One cell as the preview shows it: the value as it will be saved, and what is wrong with it. */
export type CellResult = { display: string; issue?: Issue };

/** What a column holds — the instructions and the prompt state it for every column. */
export type ColumnType = 'text' | 'number' | 'money' | 'date' | 'choice' | 'person' | 'link' | 'list';

export const COLUMN_TYPE_LABEL: Record<ColumnType, string> = {
  text: 'Text',
  number: 'Number',
  money: 'Amount',
  date: 'Date',
  choice: 'One of a list',
  person: 'Person',
  link: 'Link',
  list: 'List',
};

/** How a value of the type is written, for the instructions and the prompt. */
export const COLUMN_TYPE_FORMAT: Record<ColumnType, string> = {
  text: 'any text',
  number: 'a number, a dot or a comma for decimals (2, 1.5, 1,5)',
  money: 'a number, a dot or a comma for decimals, no currency sign (59, 0,35, 1299.00)',
  date: 'YYYY-MM-DD (also accepted: DD.MM.YYYY, DD/MM/YYYY)',
  choice: 'exactly one of the values listed, written as shown; the synonyms listed are accepted too',
  person: 'the e-mail (or the name) of someone in the project',
  link: 'a full address starting with http:// or https://',
  list: 'items separated by a vertical bar | ',
};

/** One value of a closed list. */
export type ChoiceValue = {
  /** Written as shown; matched without regard to case or Polish letters. */
  value: string;
  /** A heading the value is listed under (a kind's group, a status's category). */
  group?: string;
  /** Other words that mean the same value. */
  aliases?: string[];
  /** What the value means, when its name does not say it. */
  hint?: string;
};

export type ImportColumn = {
  key: string;
  /** The header to use, as the instructions and the template show it. */
  label: string;
  /** Other headers that mean this column, in any language; compared folded. */
  aliases: string[];
  required?: boolean;
  type: ColumnType;
  /** What goes in it, in a sentence. */
  description: string;
  /** What an empty cell means, e.g. "1", "Needed", "nobody". */
  empty?: string;
  /** The values it takes, for a choice or a person column. */
  values?: ChoiceValue[];
  /** One value per example row of the template. */
  example: string[];
  /** Width of the column in the preview, px. */
  width?: number;
};

export type ParsedRow<T> = {
  /** The row's position in the pasted text, from 1 (the header not counted). */
  line: number;
  /** What will be created; absent when an error keeps the row out. */
  value?: T;
  cells: Record<string, CellResult>;
  /** The worst issue in the row. */
  level?: IssueLevel;
};

export type ImportSchema<T> = {
  id: string;
  noun: { one: string; many: string };
  columns: ImportColumn[];
  /** Column order assumed when the text has no header row. */
  positional: string[];
  /** Headers of our own exports that are worked out rather than entered: not reported as unknown. */
  derived?: string[];
  /**
   * Reads one row. Returns null for a row to leave out silently (a totals row);
   * otherwise the value — or no value when an error keeps it out — and every cell.
   */
  parseRow: (cells: Record<string, string>) => { value?: T; cells: Record<string, CellResult> } | null;
  /** Checks across rows (a parent named further down); may add issues to rows. */
  checkRows?: (rows: ParsedRow<T>[]) => void;
  /** The opening of the prompt for a chat: what to produce. */
  promptIntro: string;
  /** Extra rules for the prompt, beyond the column list. */
  promptRules?: string[];
};

export type ParsedImport<T> = {
  rows: ParsedRow<T>[];
  /** Keys of the columns present, in schema order. */
  columns: string[];
  /** Header cells that matched no column. */
  ignored: string[];
  /** Rows left out silently (totals). */
  skipped: number;
  hasHeader: boolean;
};

const worst = (cells: Record<string, CellResult>): IssueLevel | undefined => {
  const levels = Object.values(cells).map((c) => c.issue?.level);
  return levels.includes('error') ? 'error' : levels.includes('warning') ? 'warning' : undefined;
};

export const addIssue = <T>(row: ParsedRow<T>, key: string, issue: Issue, display?: string) => {
  row.cells[key] = { display: display ?? row.cells[key]?.display ?? '', issue };
  if (issue.level === 'error') row.value = undefined;
  row.level = worst(row.cells);
};

export const parseImport = <T>(schema: ImportSchema<T>, text: string): ParsedImport<T> => {
  const rows = parseRows(text);
  if (!rows.length) return { rows: [], columns: [], ignored: [], skipped: 0, hasHeader: false };

  const keyOf = (header: string) => {
    const h = fold(header);
    return schema.columns.find((c) => fold(c.label) === h || c.aliases.includes(h))?.key;
  };

  // A header row is one where a cell names a required column; otherwise the positional order.
  const headerKeys: (string | undefined)[] = rows[0].map(keyOf);
  const required = schema.columns.filter((c) => c.required).map((c) => c.key);
  const hasHeader = required.every((key) => headerKeys.includes(key));
  const ignored = hasHeader
    ? rows[0].filter((cell, i) => cell && !headerKeys[i] && !(schema.derived ?? []).includes(fold(cell)))
    : [];
  const order = hasHeader ? headerKeys : schema.positional;
  const body = hasHeader ? rows.slice(1) : rows;

  let skipped = 0;
  const parsed: ParsedRow<T>[] = [];
  body.forEach((row, index) => {
    const cells: Record<string, string> = {};
    order.forEach((key, i) => {
      if (key && cells[key] === undefined) cells[key] = (row[i] ?? '').replace(/^'(?=[=+\-@])/, '');
    });
    const result = schema.parseRow(cells);
    if (!result) {
      skipped++;
      return;
    }
    parsed.push({ line: index + 1, value: result.value, cells: result.cells, level: worst(result.cells) });
  });
  schema.checkRows?.(parsed);

  const present = new Set(order.filter(Boolean) as string[]);
  return {
    rows: parsed,
    columns: schema.columns.map((c) => c.key).filter((key) => present.has(key)),
    ignored,
    skipped,
    hasHeader,
  };
};

const exampleRows = (schema: ImportSchema<unknown>) => Math.max(...schema.columns.map((c) => c.example.length));

/** The template: a header and the example rows, semicolon-separated, readable by Excel. */
export const templateCsv = (schema: ImportSchema<unknown>) => {
  const lines = [schema.columns.map((c) => c.label)];
  for (let i = 0; i < exampleRows(schema); i++) lines.push(schema.columns.map((c) => c.example[i] ?? ''));
  return String.fromCharCode(0xfeff) + lines.map((l) => l.map(csvCell).join(';')).join('\r\n') + '\r\n';
};

/** The same, as plain text to paste or show. */
export const exampleCsv = (schema: ImportSchema<unknown>) => templateCsv(schema).slice(1).replace(/\r\n/g, '\n').trim();

/**
 * A prompt to give a chat (ChatGPT, Claude…) so that what it answers pastes
 * straight in: the columns, what each takes and the closed lists, word for word.
 */
/** A closed list for a prompt: grouped when it has groups, every value with its synonyms. */
/** A value's synonyms without the ones that only repeat the value itself. */
export const otherNames = (v: ChoiceValue) => (v.aliases ?? []).filter((a) => fold(a) !== fold(v.value));

const valuesForPrompt = (values: ChoiceValue[]) => {
  const line = (v: ChoiceValue) => {
    const also = otherNames(v);
    return `${v.value}${v.hint ? ` (${v.hint})` : ''}${also.length ? ` [also: ${also.join(', ')}]` : ''}`;
  };
  const groups = [...new Set(values.map((v) => v.group).filter(Boolean))] as string[];
  if (!groups.length) return values.map((v) => `    - ${line(v)}`);
  return groups.flatMap((group) => [
    `    ${group}:`,
    ...values.filter((v) => v.group === group).map((v) => `      - ${line(v)}`),
  ]);
};

export const promptFor = (schema: ImportSchema<unknown>) => {
  const columns = schema.columns.flatMap((c) => [
    `- ${c.label}${c.required ? ' (required)' : ''} — ${COLUMN_TYPE_LABEL[c.type].toLowerCase()}: ${c.description}.`,
    `  Format: ${COLUMN_TYPE_FORMAT[c.type]}.${c.empty ? ` Empty means: ${c.empty}.` : ''}`,
    ...(c.values?.length ? ['  Allowed values:', ...valuesForPrompt(c.values)] : []),
  ]);
  return [
    schema.promptIntro,
    '',
    'Answer with CSV only, in a code block, nothing before or after it:',
    '- the separator is a semicolon (;), the first row is the header, one ' + schema.noun.one + ' per row;',
    '- put a cell in double quotes if it contains a semicolon;',
    '- leave a cell empty when the value is unknown; never invent prices or links.',
    ...(schema.promptRules ?? []).map((rule) => `- ${rule}`),
    '',
    `Columns, in this order (header: ${schema.columns.map((c) => c.label).join(';')}):`,
    ...columns,
    '',
    'Example:',
    exampleCsv(schema),
  ].join('\n');
};
