import { useMemo, useRef, useState } from 'react';
import { FiClipboard, FiFileText, FiUpload } from 'react-icons/fi';
import { Button } from '~/components/Button';
import { TextAreaField } from '~/components/ControlledFields';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useToast } from '~/hooks/useToast';
import { parseBomImport } from '~/routes/Projects/bomImport';
import { BOM_KINDS } from '~/routes/Projects/bomKinds';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { BOM_STATUS_LABEL, formatMoney } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type BomImportModalProps = {
  projectId: string;
  /** For prices that come without a currency: the one the parts list uses. */
  defaultCurrency?: string | null;
  /** Called once the import has run, whether all of it went in or not. */
  onDone?: () => void;
} & Partial<InternalModalProps>;

const PREVIEW_ROWS = 50;

/**
 * Text from a CSV file. Excel on a Polish Windows saves CSV in Windows-1250;
 * read as UTF-8 its letters turn into replacement characters, and then the
 * file is read again in that encoding.
 */
const readText = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const utf8 = new TextDecoder('utf-8').decode(buffer);
  return utf8.includes(String.fromCharCode(0xfffd)) ? new TextDecoder('windows-1250').decode(buffer) : utf8;
};

/**
 * Parts in bulk: rows pasted from a spreadsheet or a CSV file (our own export
 * included). Shows what it read before anything is added, then adds the parts
 * one by one — there is no bulk endpoint — and stops at the first failure.
 */
export const BomImportModal = (p: BomImportModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const toast = useToast();
  const { buildsApi } = useApi();
  const fileInput = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number }>();

  const parsed = useMemo(() => parseBomImport(text, p.defaultCurrency ?? null), [text, p.defaultCurrency]);
  const unknownKinds = parsed.parts.filter((part) => part.unknownKind).length;
  const running = Boolean(progress);

  const run = async () => {
    if (!buildsApi || !parsed.parts.length) return;
    const total = parsed.parts.length;
    let done = 0;
    setProgress({ done, total });
    try {
      for (const part of parsed.parts) {
        await buildsApi.buildControllerAddBomItem({ id: p.projectId, createBomItemDto: part.dto });
        done++;
        setProgress({ done, total });
      }
      toast(`Imported ${total} part${total === 1 ? '' : 's'}.`, 'success');
      p.onDone?.();
      p.handleClose?.();
    } catch (e) {
      toast(
        getApiErrorMessage(e, `Stopped at "${parsed.parts[done].dto.name}"`) +
          (done ? ` — ${done} of ${total} were imported.` : ''),
        'error',
      );
      p.onDone?.();
    } finally {
      setProgress(undefined);
    }
  };

  return (
    <div style={styles.container}>
      <SegmentedTabs
        items={[
          { label: 'Paste rows', value: 'paste', icon: <FiClipboard size={14} /> },
          { label: 'CSV file', value: 'file', icon: <FiFileText size={14} /> },
        ]}
        selected={source}
        handleSelect={(value) => setSource(value as 'paste' | 'file')}
        layoutId='bom-import-source'
      />

      {source === 'paste' ? (
        <TextAreaField
          label='Rows from a spreadsheet'
          rows={7}
          value={text}
          placeholder={
            'Copy the rows in Excel or Sheets, header included, and paste them here.\nPart\tQty\tUnit\tPrice'
          }
          description='A header row lets the columns be matched by name (Part, Qty, Unit, Price, Supplier…).'
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
          <span style={shared.muted}>
            {fileName || 'Our own export opens back in as it is; Excel and Sheets CSV too.'}
          </span>
        </div>
      )}

      {text.trim() ? (
        <>
          <div style={styles.summary}>
            <span style={styles.count}>
              {parsed.parts.length} part{parsed.parts.length === 1 ? '' : 's'}
            </span>
            {unknownKinds ? (
              <span style={{ color: theme.colors.yellow }}>
                · {unknownKinds} with a kind it did not recognise, imported as Other
              </span>
            ) : null}
            {parsed.skipped ? <span style={shared.muted}>· {parsed.skipped} rows without a name skipped</span> : null}
            {parsed.ignoredColumns.length ? (
              <span style={shared.muted}>· not imported: {parsed.ignoredColumns.join(', ')}</span>
            ) : null}
          </div>

          {parsed.parts.length ? (
            <div style={styles.preview}>
              {parsed.parts.slice(0, PREVIEW_ROWS).map(({ dto, unknownKind }, index) => (
                <div key={index} style={styles.row}>
                  <span style={isMobile ? { ...styles.name, flexBasis: '100%' } : styles.name}>{dto.name}</span>
                  <span
                    style={{
                      ...styles.kind,
                      ...(isMobile ? styles.inline : null),
                      color: unknownKind ? theme.colors.yellow : theme.colors.dark05,
                    }}
                  >
                    {unknownKind ? `${unknownKind} → Other` : BOM_KINDS[dto.kind!].label}
                  </span>
                  <span style={isMobile ? { ...styles.qty, ...styles.inline } : styles.qty}>
                    {dto.quantity} {dto.unit ?? ''}
                  </span>
                  <span style={isMobile ? { ...styles.price, ...styles.inline } : styles.price}>
                    {dto.unitPrice !== null && dto.unitPrice !== undefined
                      ? formatMoney(dto.unitPrice, dto.currency ?? null)
                      : '—'}
                  </span>
                  {dto.status ? <span style={shared.muted}>{BOM_STATUS_LABEL[dto.status]}</span> : null}
                </div>
              ))}
              {parsed.parts.length > PREVIEW_ROWS ? (
                <span style={shared.muted}>…and {parsed.parts.length - PREVIEW_ROWS} more</span>
              ) : null}
            </div>
          ) : (
            <span style={shared.emptyRow}>No parts found — is there a column with the part names?</span>
          )}
        </>
      ) : null}

      <Button
        label={
          progress
            ? `Importing ${progress.done} / ${progress.total}…`
            : `Import ${parsed.parts.length || ''} part${parsed.parts.length === 1 ? '' : 's'}`.replace('  ', ' ')
        }
        icon={<FiUpload size={14} />}
        loading={running}
        disabled={!parsed.parts.length || running}
        onClick={run}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(760px, 90vw)' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6, fontSize: 13 },
  count: { fontSize: 15, fontWeight: 700, color: t.colors.white },
  preview: {
    gap: 1,
    maxHeight: 'min(320px, 40vh)',
    overflowY: 'auto',
    borderRadius: t.borderRadius.default,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: t.spacing.sm,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    fontSize: 13,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.35),
    flexShrink: 0,
  },
  name: { flex: '1 1 200px', minWidth: 0, fontWeight: 600, color: t.colors.white, wordBreak: 'break-word' },
  kind: { flex: '0 1 160px', minWidth: 0 },
  qty: { width: 70, textAlign: 'right', color: t.colors.dark05 },
  price: { width: 96, textAlign: 'right', color: t.colors.white },
  // Phone: name on its own line, the rest after it as plain text.
  inline: { flex: '0 1 auto', width: 'auto', textAlign: 'left' },
}));
