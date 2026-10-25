import { useState } from 'react';
import { DocumentKind, DocumentResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { PageHeader } from '~/components/PageHeader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useModal } from '~/hooks/useModal';
import { DocumentGrid, DocumentSearch } from '~/routes/Documents/components/DocumentGrid';
import { DocumentPanel } from '~/routes/Documents/modals/DocumentPanel';
import { KIND_LABEL } from '~/routes/Documents/utils';
import { ProjectsPage } from '~/routes/Projects/components/shared';
import { mkUseStyles } from '~/utils/theme';

const ALL = 'all';

const KIND_TABS = [
  { label: 'All', value: ALL },
  ...[DocumentKind.Image, DocumentKind.Pdf, DocumentKind.Model3D, DocumentKind.Cad, DocumentKind.Other].map((kind) => ({
    label: kind === DocumentKind.Other ? 'Other' : KIND_LABEL[kind],
    value: kind,
  })),
];

/**
 * Your documents: drawings, datasheets, models, receipts. Any file goes in;
 * pin it to projects and tasks from its panel.
 */
export const Documents = () => {
  const styles = useStyles();
  const isMobile = useIsMobile();
  const { documentsApi } = useApi();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<string>(ALL);

  const query = useAsync<DocumentResponse[]>(async () => {
    if (!documentsApi) return undefined;
    const { data } = await documentsApi.documentLibraryControllerList({
      q: q.trim() || undefined,
      // Archives and text files sit under Other with everything unrecognised.
      kind: kind === ALL || kind === DocumentKind.Other ? undefined : (kind as DocumentKind),
    });
    return kind === DocumentKind.Other
      ? data.filter((d) => ([DocumentKind.Other, DocumentKind.Archive, DocumentKind.Text] as string[]).includes(d.kind))
      : data;
  }, [documentsApi, q, kind]);

  const panel = useModal('document-panel', DocumentPanel, { title: 'Document', type: 'side' });
  const documents = query.data ?? [];

  return (
    <ProjectsPage
      header={
        <>
          <PageHeader title='Documents' meta={documents.length ? `${documents.length} files` : undefined} />
          <div style={styles.toolbar}>
            <DocumentSearch
              value={q}
              onChange={setQ}
              placeholder='Search titles, descriptions, file names'
              style={isMobile ? styles.searchMobile : styles.search}
            />
            <SegmentedTabs items={KIND_TABS} selected={kind} handleSelect={setKind} layoutId='documents-kind' />
          </div>
        </>
      }
    >
      {query.loading && !query.data ? (
        <Loader />
      ) : (
        <DocumentGrid
          documents={documents}
          empty={
            q || kind !== ALL
              ? 'Nothing matches.'
              : 'No documents yet. Upload drawings, datasheets, PDFs, 3D models — any file.'
          }
          upload={{ onUploaded: () => query.reload() }}
          onOpen={(doc) => panel.show({ documentId: doc.id, onChanged: () => query.reload() })}
        />
      )}
    </ProjectsPage>
  );
};

const useStyles = mkUseStyles((t) => ({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m, flexWrap: 'wrap' },
  search: { flex: '1 1 260px', maxWidth: 420 },
  searchMobile: { flex: '1 1 100%' },
}));
