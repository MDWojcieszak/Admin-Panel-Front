import { useEffect, useState } from 'react';
import { DocumentKind, DocumentResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { DocumentGrid, DocumentSearch } from '~/routes/Documents/components/DocumentGrid';
import { UploadTarget } from '~/routes/Documents/hooks/useDocumentUpload';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type PickDocumentModalProps = {
  /** Where a picked file is pinned. Not needed when `onPick` takes the file instead. */
  target?: UploadTarget;
  /** Already there; not offered again. */
  excludeIds?: string[];
  onPicked?: () => void;
  /** Takes the picked file instead of pinning it (a part's photo from the library). */
  onPick?: (document: DocumentResponse) => Promise<void> | void;
  /** Only files of this kind are offered. */
  kind?: DocumentKind;
} & Partial<InternalModalProps>;

/** Your library, to pin a file you already have. A click pins it. */
export const PickDocumentModal = (p: PickDocumentModalProps) => {
  const styles = useStyles();
  const toast = useToast();
  const { documentsApi } = useApi();
  const [documents, setDocuments] = useState<DocumentResponse[]>();
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!documentsApi) return;
    const timer = window.setTimeout(() => {
      documentsApi
        .documentLibraryControllerList({ q: q.trim() || undefined, kind: p.kind })
        .then(({ data }) => setDocuments(data))
        .catch(() => setDocuments([]));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [documentsApi, q, p.kind]);

  const exclude = new Set(p.excludeIds ?? []);
  const offered = (documents ?? []).filter((d) => !exclude.has(d.id));

  return (
    <div style={styles.container}>
      <DocumentSearch autoFocus value={q} onChange={setQ} placeholder='Search your documents' />
      {documents ? (
        <DocumentGrid
          documents={offered}
          empty={q ? 'Nothing matches.' : 'Your library is empty, or everything in it is already here.'}
          onOpen={async (doc) => {
            if (!documentsApi) return;
            try {
              if (p.onPick) await p.onPick(doc);
              else if (p.target) {
                await documentsApi.documentLibraryControllerLink({ id: doc.id, createDocumentLinkDto: p.target });
              }
              p.onPicked?.();
              p.handleClose?.();
            } catch (e) {
              toast(getApiErrorMessage(e, p.onPick ? 'Could not use that file.' : 'Could not pin it.'), 'error');
            }
          }}
        />
      ) : (
        <Loader />
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(760px, 90vw)', maxHeight: '70vh', overflowY: 'auto' },
}));
