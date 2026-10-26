import { useMemo, useRef, useState } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheck,
  FiClipboard,
  FiCopy,
  FiDownload,
  FiFileText,
  FiInfo,
  FiUpload,
} from 'react-icons/fi';
import { Button } from '~/components/Button';
import { TextAreaField } from '~/components/ControlledFields';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useToast } from '~/hooks/useToast';
import { ColumnReference } from '~/routes/Projects/import/ColumnReference';
import { downloadText, readText } from '~/routes/Projects/import/csv';
import {
  ImportSchema,
  IssueLevel,
  exampleCsv,
  parseImport,
  promptFor,
  templateCsv,
} from '~/routes/Projects/import/schema';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Source = 'paste' | 'file' | 'format';

type ImportModalProps<T> = {
  schema: ImportSchema<T>;
  /**
   * Creates one row. Called in order, one at a time; the first failure stops
   * the run. Returns nothing; a value it needs later (a parent's id) it keeps.
   */
  importRow: (value: T, index: number) => Promise<void>;
  /** Runs once after the import, whether it all went in or not: reload what shows the rows. */
  onDone?: () => void;
  /** Base of the template's file name, e.g. "Astro mount parts". */
  fileName?: string;
} & Partial<InternalModalProps>;

const PREVIEW_ROWS = 200;

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Rows from a spreadsheet or a chat, into the project. The Format tab says
 * what the data has to look like (and gives a chat a prompt that produces
 * exactly that); the preview shows every row as it will be saved, marks what
 * is wrong in each cell, and only rows without errors are imported.
 */
export const ImportModal = <T,>(p: ImportModalProps<T>) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<Source>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number }>();

  const parsed = useMemo(() => parseImport(p.schema, text), [p.schema, text]);
  const ready = parsed.rows.filter((r) => r.value);
  const errors = parsed.rows.filter((r) => r.level === 'error').length;
  const warnings = parsed.rows.filter((r) => r.level === 'warning').length;
  const columns = p.schema.columns.filter((c) => parsed.columns.includes(c.key));
  const missingRequired = p.schema.columns.filter((c) => c.required && !parsed.columns.includes(c.key));
  const noun = (n: number) => `${n} ${n === 1 ? p.schema.noun.one : p.schema.noun.many}`;

  const run = async () => {
    const total = ready.length;
    let done = 0;
    setProgress({ done, total });
    try {
      for (const row of ready) {
        await p.importRow(row.value as T, done);
        done++;
        setProgress({ done, total });
      }
      toast(`Imported ${noun(total)}.`, 'success');
      p.onDone?.();
      p.handleClose?.();
    } catch (e) {
      toast(
        `${getApiErrorMessage(e, `Stopped at row ${ready[done].line}`)}${
          done ? ` — ${noun(done)} were imported.` : ''
        }`,
        'error',
      );
      p.onDone?.();
    } finally {
      setProgress(undefined);
    }
  };

  const levelColor = (level?: IssueLevel) =>
    level === 'error' ? theme.colors.red : level === 'warning' ? theme.colors.yellow : theme.colors.lightGreen;
  const LevelIcon = ({ level }: { level?: IssueLevel }) =>
    level === 'error' ? (
      <FiAlertCircle size={14} color={levelColor(level)} />
    ) : level === 'warning' ? (
      <FiAlertTriangle size={14} color={levelColor(level)} />
    ) : (
      <FiCheck size={14} color={levelColor(level)} />
    );

  const format = (
    <div style={styles.format}>
      <span style={shared.muted}>
        One {p.schema.noun.one} per row, the header in the first row. Columns are matched by their header (in English or
        Polish), in any order; extra columns are ignored. Semicolons, commas or tabs all work as separators, so rows
        copied straight from Excel or Sheets paste as they are.
      </span>
      <div style={styles.formatActions}>
        <Button
          label='Copy a prompt for a chat'
          icon={<FiCopy size={14} />}
          onClick={async () => {
            const copied = await copy(promptFor(p.schema as ImportSchema<unknown>));
            toast(
              copied
                ? 'Prompt copied. Paste it into ChatGPT or Claude with a description of the project, then paste its answer here.'
                : 'Could not copy the prompt here — the page needs https for the clipboard.',
              copied ? 'success' : 'error',
            );
          }}
        />
        <Button
          label='Download a template'
          variant='secondary'
          icon={<FiDownload size={14} />}
          onClick={() =>
            downloadText(
              templateCsv(p.schema as ImportSchema<unknown>),
              `${p.fileName ?? p.schema.noun.many} template.csv`,
            )
          }
        />
      </div>
      <ColumnReference columns={p.schema.columns} />
      <span style={shared.fieldLabel}>Example</span>
      <pre style={styles.example}>{exampleCsv(p.schema as ImportSchema<unknown>)}</pre>
    </div>
  );

  const preview = (
    <>
      <div style={styles.summary}>
        <span style={styles.count}>
          <FiCheck size={14} color={theme.colors.lightGreen} /> {noun(ready.length)} to import
        </span>
        {warnings ? (
          <span style={{ ...styles.chip, color: theme.colors.yellow }}>
            <FiAlertTriangle size={13} /> {warnings} with warnings, imported as shown
          </span>
        ) : null}
        {errors ? (
          <span style={{ ...styles.chip, color: theme.colors.red }}>
            <FiAlertCircle size={13} /> {errors} with errors, left out
          </span>
        ) : null}
        {parsed.skipped ? <span style={shared.muted}>{parsed.skipped} totals rows skipped</span> : null}
        {!parsed.hasHeader && parsed.rows.length ? (
          <span style={shared.muted}>
            No header row — read as{' '}
            {p.schema.positional.map((k) => p.schema.columns.find((c) => c.key === k)?.label).join(', ')}
          </span>
        ) : null}
        {parsed.ignored.length ? <span style={shared.muted}>Not imported: {parsed.ignored.join(', ')}</span> : null}
      </div>

      {missingRequired.length && parsed.rows.length ? (
        <span style={shared.error}>
          No {missingRequired.map((c) => `"${c.label}"`).join(', ')} column — check the header against the Format tab.
        </span>
      ) : null}

      {isMobile ? (
        <div style={styles.cards}>
          {parsed.rows.slice(0, PREVIEW_ROWS).map((row) => (
            <div key={row.line} style={{ ...styles.card, borderLeftColor: levelColor(row.level) }}>
              {columns.map((column) => {
                const cell = row.cells[column.key];
                if (!cell?.display && !cell?.issue) return null;
                return (
                  <div key={column.key} style={styles.cardField}>
                    <span style={styles.cardLabel}>{column.label}</span>
                    <span style={column.required ? styles.cardValueStrong : styles.cardValue}>
                      {cell.display || '—'}
                    </span>
                    {cell.issue ? (
                      <span style={{ ...styles.issue, color: levelColor(cell.issue.level) }}>{cell.issue.message}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <div style={styles.table}>
            <div style={styles.headRow}>
              <span style={{ ...styles.headCell, width: 44, flexShrink: 0 }}>#</span>
              {columns.map((column) => (
                <span key={column.key} style={{ ...styles.headCell, flex: `1 0 ${column.width ?? 120}px` }}>
                  {column.label}
                </span>
              ))}
            </div>
            {parsed.rows.slice(0, PREVIEW_ROWS).map((row) => (
              <div key={row.line} style={{ ...styles.row, opacity: row.level === 'error' ? 0.75 : 1 }}>
                <span style={{ ...styles.lineCell, width: 44, flexShrink: 0 }} title={`Row ${row.line}`}>
                  <LevelIcon level={row.level} />
                  {row.line}
                </span>
                {columns.map((column) => {
                  const cell = row.cells[column.key];
                  const issue = cell?.issue;
                  return (
                    <span
                      key={column.key}
                      title={issue?.message}
                      style={{
                        ...styles.cell,
                        flex: `1 0 ${column.width ?? 120}px`,
                        ...(issue ? { backgroundColor: levelColor(issue.level) + theme.colorOpacity(0.12) } : null),
                      }}
                    >
                      <span style={column.required ? styles.valueStrong : styles.value}>{cell?.display || ''}</span>
                      {issue ? (
                        <span style={{ ...styles.issue, color: levelColor(issue.level) }}>{issue.message}</span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      {parsed.rows.length > PREVIEW_ROWS ? (
        <span style={shared.muted}>…and {parsed.rows.length - PREVIEW_ROWS} more rows, imported as well</span>
      ) : null}
    </>
  );

  return (
    <div style={styles.container}>
      <SegmentedTabs
        items={[
          { label: 'Paste', value: 'paste', icon: <FiClipboard size={14} /> },
          { label: 'CSV file', value: 'file', icon: <FiFileText size={14} /> },
          { label: 'Format', value: 'format', icon: <FiInfo size={14} /> },
        ]}
        selected={source}
        handleSelect={(value) => setSource(value as Source)}
        layoutId={`import-source-${p.schema.id}`}
      />

      {source === 'format' ? (
        format
      ) : (
        <>
          {source === 'paste' ? (
            <TextAreaField
              label='Rows from a spreadsheet or a chat'
              rows={6}
              value={text}
              placeholder={exampleCsv(p.schema as ImportSchema<unknown>)}
              description='Not sure what goes in? The Format tab has the columns and a prompt for a chat.'
              onChange={setText}
            />
          ) : (
            <div style={styles.fileRow}>
              <input
                ref={fileInput}
                type='file'
                accept='.csv,.tsv,.txt,text/csv,text/plain'
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setFileName(file.name);
                  setText(await readText(file));
                }}
              />
              <Button
                label={fileName ? 'Choose another file' : 'Choose a CSV file'}
                variant='secondary'
                icon={<FiUpload size={14} />}
                onClick={() => fileInput.current?.click()}
              />
              <span style={shared.muted}>{fileName || 'Excel, Sheets or our own export.'}</span>
            </div>
          )}
          {text.trim() ? preview : null}
        </>
      )}

      {source !== 'format' ? (
        <Button
          label={progress ? `Importing ${progress.done} / ${progress.total}…` : `Import ${noun(ready.length)}`}
          icon={<FiUpload size={14} />}
          loading={Boolean(progress)}
          disabled={!ready.length || Boolean(progress)}
          onClick={run}
        />
      ) : null}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(960px, 92vw)' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  format: { gap: t.spacing.sm },
  formatActions: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s },
  example: {
    margin: 0,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    color: t.colors.white,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.5,
    overflowX: 'auto',
    whiteSpace: 'pre',
    userSelect: 'text',
  },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing.sm, fontSize: 13 },
  count: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 15,
    fontWeight: 700,
    color: t.colors.white,
  },
  chip: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, fontWeight: 600 },
  tableWrap: {
    maxHeight: 'min(420px, 45vh)',
    overflow: 'auto',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  table: { minWidth: 'max-content', width: '100%' },
  headRow: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    flexDirection: 'row',
    backgroundColor: t.colors.gray04,
  },
  headCell: {
    padding: `${t.spacing.s}px ${t.spacing.s}px`,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: t.colors.dark05,
    boxSizing: 'border-box',
  },
  row: { flexDirection: 'row', borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.05)}` },
  lineCell: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    padding: `${t.spacing.s}px ${t.spacing.s}px`,
    fontSize: 12,
    color: t.colors.dark05,
    boxSizing: 'border-box',
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: `${t.spacing.s}px ${t.spacing.s}px`,
    minWidth: 0,
    boxSizing: 'border-box',
  },
  value: { fontSize: 13, color: t.colors.white, wordBreak: 'break-word' },
  valueStrong: { fontSize: 13, fontWeight: 600, color: t.colors.white, wordBreak: 'break-word' },
  issue: { fontSize: 11, lineHeight: 1.35 },
  cards: { gap: t.spacing.s, maxHeight: '45vh', overflowY: 'auto' },
  card: {
    gap: t.spacing.s,
    padding: t.spacing.sm,
    borderRadius: t.borderRadius.default,
    borderLeft: '3px solid transparent',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
    flexShrink: 0,
  },
  cardField: { gap: 1 },
  cardLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: t.colors.dark05 },
  cardValue: { fontSize: 14, color: t.colors.white, wordBreak: 'break-word' },
  cardValueStrong: { fontSize: 15, fontWeight: 700, color: t.colors.white, wordBreak: 'break-word' },
}));
