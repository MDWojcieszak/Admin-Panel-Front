import { useState } from 'react';
import { format } from 'date-fns';
import { FiEdit2, FiMessageSquare, FiPaperclip, FiPlus, FiTrash2 } from 'react-icons/fi';
import { JournalEntryResponse, ProjectDetailResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { DateField, TextField } from '~/components/ControlledFields';
import { Loader } from '~/components/Loader';
import { MarkdownEditor } from '~/components/MarkdownEditor';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useIsMobile } from '~/hooks/useBreakpoint';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { Comments, RichText } from '~/routes/Projects/components/Comments';
import { ProjectDocuments } from '~/routes/Projects/components/ProjectDocuments';
import { Avatar, useProjectStyles } from '~/routes/Projects/components/shared';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { canEdit, fromDateInput, toDateInput, userName } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type Draft = { title: string; body: string; date: string };
const today = () => toDateInput(new Date().toISOString());

/**
 * The build's documentation (D6): what was done and when, with photos and
 * files on each entry, and comments under it. Newest first.
 */
export const Journal = ({ project }: { project: ProjectDetailResponse }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { buildsApi } = useApi();
  const editable = canEdit(project.role);
  const [composing, setComposing] = useState<{ id?: string; originalDate?: string; draft: Draft }>();
  const [saving, setSaving] = useState(false);

  const query = useAsync<JournalEntryResponse[]>(async () => {
    if (!buildsApi) return undefined;
    const { data } = await buildsApi.buildControllerListJournal({ id: project.id });
    return data;
  }, [buildsApi, project.id]);

  useProjectEvents(
    (event) => (event.kind === 'journal' || event.kind === 'document' || event.kind === 'comment') && query.reload(),
    project.id,
  );

  const deleteModal = useModal('journal-delete', ConfirmModal, { title: 'Delete entry' });

  const save = async () => {
    if (!buildsApi || !composing || !composing.draft.body.trim()) return;
    const { id, draft, originalDate } = composing;
    // A new entry for today keeps the moment of writing; a chosen day is noon
    // of it. An edit sends the day only when it moved.
    const moved = id ? draft.date !== originalDate : draft.date !== today();
    const happenedAt = draft.date && moved ? fromDateInput(draft.date)! : undefined;
    setSaving(true);
    try {
      if (id) {
        await buildsApi.buildControllerUpdateJournalEntry({
          entryId: id,
          updateJournalEntryDto: { title: draft.title.trim() || null, body: draft.body, happenedAt },
        });
      } else {
        await buildsApi.buildControllerAddJournalEntry({
          id: project.id,
          createJournalEntryDto: { title: draft.title.trim() || null, body: draft.body, happenedAt },
        });
      }
      setComposing(undefined);
      query.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not save the entry.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (query.loading && !query.data) return <Loader />;
  const entries = query.data ?? [];

  const composer = composing ? (
    <div style={styles.composer}>
      <div style={shared.fieldGrid}>
        <TextField
          label='Title'
          autoFocus
          value={composing.draft.title}
          placeholder='Cut the base plate'
          onChange={(title) => setComposing({ ...composing, draft: { ...composing.draft, title } })}
        />
        <DateField
          label='Day'
          value={composing.draft.date}
          onChange={(date) => setComposing({ ...composing, draft: { ...composing.draft, date } })}
        />
      </div>
      <MarkdownEditor
        value={composing.draft.body}
        height={220}
        placeholder='What was done, measurements, what went wrong…'
        onChange={(body) => setComposing({ ...composing, draft: { ...composing.draft, body } })}
      />
      <span style={shared.muted}>Photos and files go on the entry once it is saved.</span>
      <div style={shared.row}>
        <Button
          label={composing.id ? 'Save entry' : 'Add entry'}
          loading={saving}
          disabled={!composing.draft.body.trim()}
          onClick={save}
        />
        <Button label='Cancel' variant='secondary' onClick={() => setComposing(undefined)} />
      </div>
    </div>
  ) : null;

  return (
    <div style={styles.container}>
      {editable && !composing ? (
        <div style={shared.row}>
          <Button
            label='New entry'
            icon={<FiPlus size={14} />}
            onClick={() => setComposing({ draft: { title: '', body: '', date: today() } })}
          />
        </div>
      ) : null}
      {composing && !composing.id ? composer : null}
      {entries.length === 0 && !composing ? (
        <div style={shared.emptyRow}>
          No entries yet. Write down each step as you go: it becomes the build&rsquo;s documentation.
        </div>
      ) : null}
      {entries.map((entry) =>
        composing?.id === entry.id ? (
          <div key={entry.id}>{composer}</div>
        ) : (
          <Entry
            key={entry.id}
            entry={entry}
            project={project}
            onEdit={() =>
              setComposing({
                id: entry.id,
                originalDate: toDateInput(entry.happenedAt),
                draft: { title: entry.title ?? '', body: entry.body, date: toDateInput(entry.happenedAt) },
              })
            }
            onDelete={() =>
              deleteModal.show({
                message: `Delete ${entry.title || 'this entry'}?`,
                description: 'Its comments go with it; pinned files stay in their owners’ libraries.',
                confirmLabel: 'Delete',
                danger: true,
                onConfirm: async () => {
                  if (!buildsApi) return;
                  try {
                    await buildsApi.buildControllerRemoveJournalEntry({ entryId: entry.id });
                    query.reload();
                  } catch (e) {
                    toast(getApiErrorMessage(e, 'Could not delete the entry.'), 'error');
                  }
                },
              })
            }
          />
        ),
      )}
    </div>
  );
};

const Entry = ({
  entry,
  project,
  onEdit,
  onDelete,
}: {
  entry: JournalEntryResponse;
  project: ProjectDetailResponse;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const editable = canEdit(project.role);
  const [showFiles, setShowFiles] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const filesOpen = showFiles || entry.documentCount > 0;

  return (
    <div style={{ ...styles.entry, ...(isMobile ? styles.entryMobile : null) }}>
      <div style={{ ...styles.date, ...(isMobile ? styles.dateMobile : null) }}>
        <span style={styles.day}>{format(new Date(entry.happenedAt), 'd')}</span>
        <span style={shared.muted}>{format(new Date(entry.happenedAt), 'MMM yyyy')}</span>
      </div>
      <div style={styles.body}>
        <div style={{ ...shared.row, justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          <span style={{ ...shared.row, gap: theme.spacing.s }}>
            {entry.title ? <span style={styles.title}>{entry.title}</span> : null}
            <Avatar user={entry.author} size={20} />
            <span style={{ ...shared.muted, fontSize: 12 }}>{userName(entry.author)}</span>
          </span>
          {entry.canEdit ? (
            <span style={{ ...shared.row, gap: 0, flexWrap: 'nowrap' }}>
              <button type='button' title='Edit' style={{ ...shared.iconButton, ...styles.touch }} onClick={onEdit}>
                <FiEdit2 size={14} />
              </button>
              <button type='button' title='Delete' style={{ ...shared.iconButton, ...styles.touch }} onClick={onDelete}>
                <FiTrash2 size={14} />
              </button>
            </span>
          ) : null}
        </div>
        <RichText source={entry.body} />
        {filesOpen ? (
          <ProjectDocuments compact target={{ journalEntryId: entry.id }} projectId={project.id} editable={editable} />
        ) : null}
        <div style={shared.row}>
          {!filesOpen && editable ? (
            <button type='button' style={styles.link} onClick={() => setShowFiles(true)}>
              <FiPaperclip size={13} /> Add photos or files
            </button>
          ) : null}
          <button type='button' style={styles.link} onClick={() => setShowComments(!showComments)}>
            <FiMessageSquare size={13} />
            {entry.commentCount ? `${entry.commentCount} comment${entry.commentCount === 1 ? '' : 's'}` : 'Comment'}
          </button>
        </div>
        {showComments ? <Comments target={{ journalEntryId: entry.id }} projectId={project.id} /> : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.l, maxWidth: 900 },
  composer: {
    gap: t.spacing.sm,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  entry: {
    flexDirection: 'row',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  entryMobile: { gap: t.spacing.sm, padding: t.spacing.sm },
  date: { width: 64, flexShrink: 0, alignItems: 'center', gap: 0 },
  dateMobile: { width: 44 },
  day: { fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: t.colors.white },
  body: { flex: 1, minWidth: 0, gap: t.spacing.sm },
  title: { fontSize: 16, fontWeight: 700, color: t.colors.white, wordBreak: 'break-word' },
  // shared.iconButton, a finger's width.
  touch: { width: 32, height: 32 },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    minHeight: 32,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: t.colors.blue04,
  },
}));
