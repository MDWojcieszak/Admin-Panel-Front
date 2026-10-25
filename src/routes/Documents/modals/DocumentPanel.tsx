import { lazy, Suspense, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiDownload, FiExternalLink, FiTrash2, FiX } from 'react-icons/fi';
import { DocumentKind, DocumentResponse, ProjectRole, ProjectSummaryResponse, TaskResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { TextAreaField, TextField } from '~/components/ControlledFields';
import { Loader } from '~/components/Loader';
import { useSidePanelReady } from '~/components/Modal';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { PanelScroll } from '~/routes/Projects/components/PanelScroll';
import { PlainSelect, useProjectStyles } from '~/routes/Projects/components/shared';
import { projectPath, userName } from '~/routes/Projects/utils';
import { apiUrl, formatSize, KIND_LABEL, KindIcon } from '~/routes/Documents/utils';

/** Formats three.js can read; the viewer itself loads only when one is opened. */
const VIEWABLE_3D = new Set(['stl', 'obj', '3mf', 'glb', 'ply']);
const ModelViewer = lazy(() => import('~/routes/Documents/components/ModelViewer'));
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';
import { navigateTo } from '~/navigation/navigator';

type DocumentPanelProps = {
  documentId: string;
  /** Renamed, pinned, unpinned or deleted: the list behind it reloads. */
  onChanged?: () => void;
} & Partial<InternalModalProps>;

/** One document: its preview, what it is, where it is pinned. */
export const DocumentPanel = (p: DocumentPanelProps) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const ready = useSidePanelReady();
  const toast = useToast();
  const { documentsApi, projectsApi } = useApi();
  const [doc, setDoc] = useState<DocumentResponse>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
  const [pinProject, setPinProject] = useState('');
  const [pinTask, setPinTask] = useState('');
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  const show = (data: DocumentResponse) => {
    setDoc(data);
    setTitle(data.title);
    setDescription(data.description ?? '');
  };

  useEffect(() => {
    if (!ready || !documentsApi) return;
    documentsApi
      .documentLibraryControllerGet({ id: p.documentId })
      .then(({ data }) => show(data))
      .catch((e) => {
        toast(getApiErrorMessage(e, 'Could not open the document.'), 'error');
        p.handleClose?.();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, documentsApi, p.documentId]);

  useEffect(() => {
    if (!doc?.isMine || !projectsApi) return;
    projectsApi
      .projectControllerList()
      .then(({ data }) => setProjects(data.filter((pr) => pr.role !== ProjectRole.Viewer)))
      .catch(() => setProjects([]));
  }, [doc?.isMine, projectsApi]);

  useEffect(() => {
    setPinTask('');
    if (!pinProject || !projectsApi) return setTasks([]);
    projectsApi
      .projectControllerListTasks({ id: pinProject })
      .then(({ data }) => setTasks(data))
      .catch(() => setTasks([]));
  }, [pinProject, projectsApi]);

  const deleteModal = useModal('document-delete', ConfirmModal, { title: 'Delete document' });

  if (!doc) return <Loader />;

  const run = async (action: () => Promise<DocumentResponse | null | void>, failure: string) => {
    try {
      const next = await action();
      if (next) show(next);
      p.onChanged?.();
      return next;
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
    }
  };

  const save = (dto: { title?: string; description?: string | null }) =>
    run(async () => {
      if (!documentsApi) return;
      return (await documentsApi.documentLibraryControllerUpdate({ id: doc.id, updateDocumentDto: dto })).data;
    }, 'Could not save the document.');

  const pinnedProjects = new Set(doc.links.filter((l) => !l.task).map((l) => l.project.id));
  const pinnedTasks = new Set(doc.links.map((l) => l.task?.id).filter(Boolean));

  return (
    <PanelScroll>
      <div style={styles.container}>
        <div style={styles.preview}>
          {doc.kind === DocumentKind.Image && doc.previewUrl ? (
            <a href={apiUrl(doc.fileUrl)} target='_blank' rel='noreferrer' style={styles.previewLink}>
              <img src={apiUrl(doc.previewUrl)} alt={doc.title} style={styles.previewImage} />
            </a>
          ) : doc.kind === DocumentKind.Pdf ? (
            <iframe title={doc.title} src={apiUrl(doc.fileUrl)} style={styles.pdf} />
          ) : doc.extension && VIEWABLE_3D.has(doc.extension) ? (
            <Suspense fallback={<Loader />}>
              <ModelViewer url={apiUrl(doc.fileUrl)} extension={doc.extension} />
            </Suspense>
          ) : (
            <div style={styles.icon}>
              <span style={styles.kind}>
                <KindIcon kind={doc.kind} size={34} color={theme.colors.blue04} />
              </span>
              <span style={shared.muted}>
                {KIND_LABEL[doc.kind]}
                {doc.extension ? ` · .${doc.extension}` : ''}
              </span>
            </div>
          )}
        </div>

        <div style={shared.row}>
          {doc.inline ? (
            <Button
              label='Open'
              variant='secondary'
              icon={<FiExternalLink size={14} />}
              onClick={() => window.open(apiUrl(doc.fileUrl), '_blank', 'noreferrer')}
            />
          ) : null}
          <Button
            label='Download'
            icon={<FiDownload size={14} />}
            onClick={() => window.open(apiUrl(doc.downloadUrl), '_blank', 'noreferrer')}
          />
        </div>

        {doc.isMine ? (
          <>
            <div style={styles.fields}>
              <TextField
                label='Title'
                value={title}
                onChange={setTitle}
                onCommit={(value) => value.trim() && value.trim() !== doc.title && save({ title: value.trim() })}
              />
              <TextAreaField
                label='Description'
                rows={3}
                value={description}
                placeholder='What it is: a drawing, a datasheet, rev. B…'
                onChange={setDescription}
                onCommit={(value) => value !== (doc.description ?? '') && save({ description: value || null })}
              />
            </div>
          </>
        ) : (
          <div style={styles.section}>
            <span style={styles.title}>{doc.title}</span>
            {doc.description ? (
              <span style={{ ...shared.muted, whiteSpace: 'pre-wrap' }}>{doc.description}</span>
            ) : null}
          </div>
        )}

        <div style={styles.facts}>
          <Fact label='File' value={doc.originalName} />
          <Fact label='Size' value={formatSize(doc.sizeBytes)} />
          <Fact label='Kind' value={KIND_LABEL[doc.kind]} />
          {doc.width && doc.height ? <Fact label='Pixels' value={`${doc.width} × ${doc.height}`} /> : null}
          <Fact label='Uploaded' value={`${format(new Date(doc.createdAt), 'd MMM yyyy')} by ${userName(doc.owner)}`} />
        </div>

        <div style={styles.section}>
          <span style={shared.fieldLabel}>Pinned in</span>
          {doc.links.length ? (
            <div style={shared.list}>
              {doc.links.map((link) => (
                <div key={link.id} style={shared.listRow}>
                  <button
                    type='button'
                    style={styles.place}
                    onClick={() => {
                      p.handleClose?.();
                      const base = projectPath(link.project.id);
                      navigateTo(
                        link.task
                          ? `${base}?task=${link.task.id}`
                          : link.bomItem
                            ? `${base}?view=parts`
                            : link.journalEntry
                              ? `${base}?view=journal`
                              : `${base}?view=docs`,
                      );
                    }}
                  >
                    <span style={shared.key}>{link.task ? link.task.key : link.project.key}</span>
                    <span style={shared.ellipsis}>
                      {link.task
                        ? link.task.title
                        : link.bomItem
                          ? `Part: ${link.bomItem.name}`
                          : link.journalEntry
                            ? `Journal: ${
                                link.journalEntry.title || format(new Date(link.journalEntry.happenedAt), 'd MMM yyyy')
                              }`
                            : link.project.title}
                    </span>
                  </button>
                  <button
                    type='button'
                    title='Unpin'
                    aria-label='Unpin'
                    style={styles.iconButton}
                    onClick={async () => {
                      if (!documentsApi) return;
                      try {
                        const { data } = await documentsApi.documentLibraryControllerUnlink({
                          id: doc.id,
                          linkId: link.id,
                        });
                        p.onChanged?.();
                        // The pin was the only way to see it: nothing left to show.
                        if (!data) p.handleClose?.();
                        else show(data);
                      } catch (e) {
                        toast(getApiErrorMessage(e, 'Could not unpin it.'), 'error');
                      }
                    }}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span style={shared.muted}>Only in your library.</span>
          )}
          {doc.isMine && projects.length ? (
            <div style={shared.row}>
              <PlainSelect
                value={pinProject}
                style={styles.pinSelect}
                options={[
                  { value: '', label: 'Pin to a project…' },
                  ...projects.map((pr) => ({ value: pr.id, label: pr.isInbox ? 'Inbox' : pr.title })),
                ]}
                onChange={setPinProject}
              />
              {pinProject && tasks.length ? (
                <PlainSelect
                  value={pinTask}
                  style={styles.pinSelect}
                  options={[
                    { value: '', label: 'The project itself' },
                    ...tasks
                      .filter((t) => !pinnedTasks.has(t.id))
                      .map((t) => ({ value: t.id, label: `${t.key} ${t.title}` })),
                  ]}
                  onChange={setPinTask}
                />
              ) : null}
              <Button
                label='Pin'
                disabled={!pinProject || (!pinTask && pinnedProjects.has(pinProject))}
                onClick={async () => {
                  const next = await run(async () => {
                    if (!documentsApi) return;
                    const { data } = await documentsApi.documentLibraryControllerLink({
                      id: doc.id,
                      createDocumentLinkDto: pinTask ? { taskId: pinTask } : { projectId: pinProject },
                    });
                    return data;
                  }, 'Could not pin it.');
                  if (next) {
                    setPinProject('');
                    setPinTask('');
                  }
                }}
              />
            </div>
          ) : null}
        </div>

        {doc.isMine ? (
          <div style={styles.footer}>
            <Button
              label='Delete'
              variant='danger'
              icon={<FiTrash2 size={14} />}
              onClick={() =>
                deleteModal.show({
                  message: `Delete ${doc.title}?`,
                  description: doc.links.length
                    ? `It is unpinned from ${doc.links.length} place${
                        doc.links.length === 1 ? '' : 's'
                      } as well, for everyone.`
                    : 'The file is removed from the server.',
                  confirmLabel: 'Delete',
                  danger: true,
                  onConfirm: async () => {
                    if (!documentsApi) return;
                    try {
                      await documentsApi.documentLibraryControllerRemove({ id: doc.id });
                      p.onChanged?.();
                      p.handleClose?.();
                    } catch (e) {
                      toast(getApiErrorMessage(e, 'Could not delete the document.'), 'error');
                    }
                  },
                })
              }
            />
          </div>
        ) : null}
      </div>
    </PanelScroll>
  );
};

const Fact = ({ label, value }: { label: string; value: string }) => {
  const shared = useProjectStyles();
  return (
    <div style={{ gap: 2, minWidth: 0 }}>
      <span style={shared.fieldLabel}>{label}</span>
      <span style={{ fontSize: 14, wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, paddingBottom: t.spacing.l },
  preview: {
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.8),
  },
  previewLink: { display: 'block', lineHeight: 0 },
  previewImage: { width: '100%', maxHeight: '55vh', objectFit: 'contain', display: 'block' },
  pdf: { width: '100%', height: '60vh', border: 'none', backgroundColor: t.colors.white },
  icon: { alignItems: 'center', justifyContent: 'center', gap: t.spacing.sm, padding: `${t.spacing.xl}px 0` },
  kind: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    borderRadius: '50%',
    backgroundColor: t.colors.blue03 + t.colorOpacity(0.22),
  },
  fields: { gap: t.spacing.m },
  section: { gap: t.spacing.s },
  // Wraps under the project select when the panel is narrow (a phone).
  pinSelect: { flex: '1 1 180px', minWidth: 0 },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: 32,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
  },
  title: { fontSize: 18, fontWeight: 700, color: t.colors.white },
  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
    gap: t.spacing.sm,
  },
  place: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: t.colors.white,
    fontSize: 14,
    textAlign: 'left',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
