import { DragEvent, ReactNode, useRef, useState } from 'react';
import { FiUpload } from 'react-icons/fi';
import { DocumentResponse } from '~/api/api';
import { Button } from '~/components/Button';
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
          {p.upload && !progress ? <span style={shared.muted}>or drop files here</span> : null}
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
                  <span style={styles.kind}>
                    <KindIcon kind={doc.kind} size={p.compact ? 22 : 30} color={theme.colors.blue04} />
                    {doc.extension ? <span style={styles.ext}>{doc.extension}</span> : null}
                  </span>
                )}
              </div>
              <div style={styles.caption}>
                <span style={{ ...shared.ellipsis, fontSize: 13, fontWeight: 600, color: theme.colors.white }}>
                  {doc.title}
                </span>
                {p.compact ? null : (
                  <span style={{ ...shared.muted, fontSize: 12 }}>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))',
    gap: t.spacing.m,
  },
  compactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(110px, 100%), 1fr))',
    gap: t.spacing.s,
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  thumb: {
    aspectRatio: '4 / 3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
    overflow: 'hidden',
  },
  thumbCompact: { aspectRatio: '1 / 1' },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  kind: { alignItems: 'center', gap: t.spacing.xs },
  ext: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 11,
    textTransform: 'uppercase',
    color: t.colors.dark05,
  },
  caption: { gap: 2, padding: `${t.spacing.s}px ${t.spacing.sm}px`, minWidth: 0 },
}));
