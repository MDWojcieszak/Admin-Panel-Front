import { CSSProperties, DragEvent, ReactNode, useRef, useState } from 'react';
import { FiSearch, FiUpload, FiX } from 'react-icons/fi';
import { DocumentResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { useDocumentUpload, UploadTarget } from '~/routes/Documents/hooks/useDocumentUpload';
import { apiUrl, formatSize, KIND_LABEL, KindIcon } from '~/routes/Documents/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type DocumentGridProps = {
  documents: DocumentResponse[];
  onOpen: (document: DocumentResponse) => void;
  /** Where uploads land; without it the grid only shows. */
  upload?: { target?: UploadTarget; onUploaded: (documents: DocumentResponse[]) => void };
  /** Beside the upload button, e.g. "From library". */
  actions?: ReactNode;
  empty: string;
  /** Small tiles, for the task panel. */
  compact?: boolean;
};

/** Documents as tiles; drop files anywhere on it to upload them. */
export const DocumentGrid = (p: DocumentGridProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { upload, progress } = useDocumentUpload(p.upload?.target);

  const send = async (files: FileList | null) => {
    if (!p.upload || !files?.length) return;
    const documents = await upload(Array.from(files));
    if (documents.length) p.upload.onUploaded(documents);
  };

  const dropProps = p.upload
    ? {
        onDragOver: (e: DragEvent) => {
          if (!e.dataTransfer.types.includes('Files')) return;
          e.preventDefault();
          setDragging(true);
        },
        onDragLeave: (e: DragEvent<HTMLDivElement>) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          setDragging(false);
          send(e.dataTransfer.files);
        },
      }
    : {};

  return (
    <div style={{ ...styles.wrap, ...(dragging ? styles.dragging : {}) }} {...dropProps}>
      {p.upload || p.actions ? (
        <div style={shared.row}>
          {p.upload ? (
            <>
              <input
                ref={input}
                type='file'
                multiple
                hidden
                onChange={(e) => {
                  send(e.target.files);
                  e.target.value = '';
                }}
              />
              <Button
                label={progress ? `Uploading ${progress.percent}%` : 'Upload'}
                variant='secondary'
                icon={<FiUpload size={14} />}
                loading={false}
                disabled={!!progress}
                onClick={() => input.current?.click()}
              />
            </>
          ) : null}
          {p.actions}
          {progress ? <span style={{ ...shared.muted, ...shared.ellipsis }}>{progress.name}</span> : null}
          {/* Nothing to drag from on a phone. */}
          {p.upload && !progress && !isMobile ? <span style={shared.muted}>or drop files here</span> : null}
        </div>
      ) : null}

      {p.documents.length === 0 ? (
        <div style={shared.emptyRow}>{p.empty}</div>
      ) : (
        <div style={p.compact ? styles.compactGrid : styles.grid}>
          {p.documents.map((doc) => (
            <button key={doc.id} type='button' style={styles.tile} onClick={() => p.onOpen(doc)} title={doc.title}>
              <div style={{ ...styles.thumb, ...(p.compact ? styles.thumbCompact : {}) }}>
                {doc.thumbUrl ? (
                  <img src={apiUrl(doc.thumbUrl)} alt='' style={styles.img} loading='lazy' />
                ) : (
                  <>
                    <span style={{ ...styles.kind, ...(p.compact ? styles.kindCompact : {}) }}>
                      <KindIcon kind={doc.kind} size={p.compact ? 20 : 26} color={theme.colors.blue04} />
                    </span>
                    {doc.extension ? <span style={styles.ext}>{doc.extension}</span> : null}
                  </>
                )}
              </div>
              <div style={styles.caption}>
                <span style={{ ...shared.ellipsis, fontSize: 13, fontWeight: 600, color: theme.colors.white }}>
                  {doc.title}
                </span>
                {p.compact ? null : (
                  <span style={{ ...shared.muted, ...shared.ellipsis, fontSize: 12 }}>
                    {KIND_LABEL[doc.kind]} · {formatSize(doc.sizeBytes)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** The library's search box, filled like the panel's toolbar search. */
export const DocumentSearch = ({
  value,
  onChange,
  placeholder,
  autoFocus,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  style?: CSSProperties;
}) => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  return (
    <label style={{ ...styles.searchBox, ...style }}>
      <FiSearch size={16} style={{ flexShrink: 0 }} />
      <input
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        // 16px keeps iOS from zooming the page in when the field takes focus.
        style={isMobile ? { ...styles.searchInput, fontSize: 16 } : styles.searchInput}
      />
      {value ? (
        <button type='button' aria-label='Clear search' style={styles.clearSearch} onClick={() => onChange('')}>
          <FiX size={14} />
        </button>
      ) : null}
    </label>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    gap: t.spacing.m,
    borderRadius: t.borderRadius.large,
    border: '2px dashed transparent',
    transition: 'border-color 0.12s ease, background-color 0.12s ease',
  },
  dragging: {
    borderColor: t.colors.blue + t.colorOpacity(0.6),
    backgroundColor: t.colors.blue + t.colorOpacity(0.05),
  },
  // Two tiles a row even on a phone: the minimum gives way to half the width.
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(min(180px, calc(50% - ${t.spacing.m / 2}px)), 1fr))`,
    gap: t.spacing.m,
  },
  compactGrid: {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(min(110px, calc(50% - ${t.spacing.s / 2}px)), 1fr))`,
    gap: t.spacing.s,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  thumb: {
    position: 'relative',
    aspectRatio: '4 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    overflow: 'hidden',
  },
  thumbCompact: { aspectRatio: '1 / 1' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  // A file without a picture: its kind in a tinted circle, the extension as a badge.
  kind: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: t.colors.blue03 + t.colorOpacity(0.22),
  },
  kindCompact: { width: 40, height: 40 },
  ext: {
    position: 'absolute',
    top: t.spacing.s,
    right: t.spacing.s,
    maxWidth: `calc(100% - ${t.spacing.s * 2}px)`,
    padding: '2px 6px',
    borderRadius: t.borderRadius.small,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: t.colors.blue04,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.85),
  },
  caption: { gap: 2, padding: `${t.spacing.s}px ${t.spacing.sm}px`, minWidth: 0 },
  searchBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 0,
    height: 44,
    padding: `0 ${t.spacing.m}px`,
    boxSizing: 'border-box',
    borderRadius: t.borderRadius.default,
    color: t.colors.dark05,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    cursor: 'text',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
    padding: 0,
  },
  clearSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 32,
    height: 32,
    marginRight: -t.spacing.s,
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.default,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
  },
}));
