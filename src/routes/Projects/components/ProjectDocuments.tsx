import { FiFolder } from 'react-icons/fi';
import { DocumentResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { DocumentGrid } from '~/routes/Documents/components/DocumentGrid';
import { DocumentPanel } from '~/routes/Documents/modals/DocumentPanel';
import { PickDocumentModal } from '~/routes/Documents/modals/PickDocumentModal';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';

type Target = { projectId: string; taskId?: undefined } | { taskId: string; projectId?: undefined };

/**
 * Documents pinned to a project (with those on its tasks) or to one task.
 * Editors upload straight into it or pin from their library.
 */
export const ProjectDocuments = ({
  target,
  projectId,
  editable,
  compact,
}: {
  target: Target;
  /** For live updates: the project the target belongs to. */
  projectId: string;
  editable: boolean;
  compact?: boolean;
}) => {
  const { documentsApi } = useApi();
  const scope = target.taskId ? `task-${target.taskId}` : `project-${target.projectId}`;

  const query = useAsync<DocumentResponse[]>(async () => {
    if (!documentsApi) return undefined;
    const { data } = await documentsApi.documentControllerList(target);
    return data;
  }, [documentsApi, target.projectId, target.taskId]);

  useProjectEvents((event) => event.kind === 'document' && query.reload(), projectId);

  const panel = useModal(`document-panel-${scope}`, DocumentPanel, { title: 'Document', type: 'side' });
  const picker = useModal(`document-pick-${scope}`, PickDocumentModal, { title: 'Pin from your library' });

  if (query.loading && !query.data) return <Loader />;
  const documents = query.data ?? [];

  return (
    <DocumentGrid
      compact={compact}
      documents={documents}
      empty={editable ? 'Nothing pinned yet. Upload drawings, datasheets, receipts, models.' : 'Nothing pinned here.'}
      upload={editable ? { target, onUploaded: () => query.reload() } : undefined}
      actions={
        editable ? (
          <Button
            label='From library'
            variant='secondary'
            icon={<FiFolder size={14} />}
            onClick={() =>
              picker.show({ target, excludeIds: documents.map((d) => d.id), onPicked: () => query.reload() })
            }
          />
        ) : undefined
      }
      onOpen={(doc) => panel.show({ documentId: doc.id, onChanged: () => query.reload() })}
    />
  );
};
