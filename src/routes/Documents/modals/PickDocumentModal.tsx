import { useEffect, useState } from 'react';
import { DocumentResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { useProjectStyles } from '~/routes/Projects/components/shared';
import { DocumentGrid } from '~/routes/Documents/components/DocumentGrid';
import { UploadTarget } from '~/routes/Documents/hooks/useDocumentUpload';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type PickDocumentModalProps = {
  target: UploadTarget;
  /** Already there; not offered again. */
  excludeIds?: string[];
  onPicked?: () => void;
} & Partial<InternalModalProps>;

/** Your library, to pin a file you already have. A click pins it. */
export const PickDocumentModal = (p: PickDocumentModalProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { documentsApi } = useApi();
  const [documents, setDocuments] = useState<DocumentResponse[]>();
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!documentsApi) return;
    const timer = window.setTimeout(() => {
      documentsApi
        .documentLibraryControllerList({ q: q.trim() || undefined })
        .then(({ data }) => setDocuments(data))
        .catch(() => setDocuments([]));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [documentsApi, q]);

  const exclude = new Set(p.excludeIds ?? []);
  const offered = (documents ?? []).filter((d) => !exclude.has(d.id));

  return (
    <div style={styles.container}>
      <input
        autoFocus
        style={shared.textInput}
        value={q}
        placeholder='Search your documents'
        onChange={(e) => setQ(e.target.value)}
      />
      {documents ? (
        <DocumentGrid
          documents={offered}
          empty={q ? 'Nothing matches.' : 'Your library is empty, or everything in it is already here.'}
          onOpen={async (doc) => {
            if (!documentsApi) return;
            try {
              await documentsApi.documentLibraryControllerLink({ id: doc.id, createDocumentLinkDto: p.target });
              p.onPicked?.();
              p.handleClose?.();
            } catch (e) {
              toast(getApiErrorMessage(e, 'Could not pin it.'), 'error');
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
