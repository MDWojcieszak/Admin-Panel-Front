import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { formatDistanceToNow } from 'date-fns';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { ProjectCommentResponse, CommentsApiProjectCommentControllerListRequest } from '~/api/api';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useToast } from '~/hooks/useToast';
import { Avatar, useProjectStyles } from '~/routes/Projects/components/shared';
import { useProjectEvents } from '~/routes/Projects/hooks/useProjectEvents';
import { userName } from '~/routes/Projects/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

export type CommentTarget = CommentsApiProjectCommentControllerListRequest;

/**
 * Markdown from other people: rendered without raw HTML (the preview's
 * default), and with the library's URL filter, so a comment cannot run script.
 */
export const RichText = ({ source }: { source: string }) => {
  const styles = useStyles();
  return <MDEditor.Markdown source={source} style={styles.markdown} />;
};

/**
 * The discussion on one thing in a project (D10). Anyone who sees the project
 * may comment; the author edits, the author or the owner deletes.
 */
export const Comments = ({ target, projectId }: { target: CommentTarget; projectId: string }) => {
  const styles = useStyles();
  const shared = useProjectStyles();
  const toast = useToast();
  const { commentsApi } = useApi();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState<{ id: string; body: string }>();

  const query = useAsync<ProjectCommentResponse[]>(async () => {
    if (!commentsApi) return undefined;
    const { data } = await commentsApi.projectCommentControllerList(target);
    return data;
  }, [commentsApi, target.projectId, target.taskId, target.bomItemId, target.journalEntryId]);

  useProjectEvents((event) => event.kind === 'comment' && query.reload(), projectId);

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      await query.reload();
      return true;
    } catch (e) {
      toast(getApiErrorMessage(e, failure), 'error');
      return false;
    }
  };

  const send = async () => {
    if (!commentsApi || !draft.trim()) return;
    setSending(true);
    const ok = await run(
      () => commentsApi.projectCommentControllerCreate({ createProjectCommentDto: { ...target, body: draft.trim() } }),
      'Could not post the comment.',
    );
    setSending(false);
    if (ok) setDraft('');
  };

  const comments = query.data ?? [];

  return (
    <div style={styles.container}>
      {comments.map((comment) => (
        <div key={comment.id} style={styles.comment}>
          <Avatar user={comment.author} size={28} />
          <div style={styles.main}>
            <div style={{ ...shared.row, justifyContent: 'space-between', flexWrap: 'nowrap' }}>
              <span style={{ ...shared.row, gap: 6, minWidth: 0 }}>
                <span style={styles.author}>{userName(comment.author)}</span>
                <span style={{ ...shared.muted, fontSize: 12 }}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.editedAt ? ' · edited' : ''}
                </span>
              </span>
              <span style={{ ...shared.row, gap: 0, flexWrap: 'nowrap' }}>
                {comment.canEdit ? (
                  <button
                    type='button'
                    title='Edit'
                    style={{ ...shared.iconButton, ...styles.iconButton }}
                    onClick={() => setEditing({ id: comment.id, body: comment.body })}
                  >
                    <FiEdit2 size={13} />
                  </button>
                ) : null}
                {comment.canDelete ? (
                  <button
                    type='button'
                    title='Delete'
                    style={{ ...shared.iconButton, ...styles.iconButton }}
                    onClick={() =>
                      commentsApi &&
                      run(() => commentsApi.projectCommentControllerRemove({ id: comment.id }), 'Could not delete it.')
                    }
                  >
                    <FiTrash2 size={13} />
                  </button>
                ) : null}
              </span>
            </div>
            {editing?.id === comment.id ? (
              <div style={styles.editor}>
                <textarea
                  autoFocus
                  style={shared.textArea}
                  rows={3}
                  value={editing.body}
                  onChange={(e) => setEditing({ id: comment.id, body: e.target.value })}
                />
                <div style={shared.row}>
                  <Button
                    label='Save'
                    disabled={!editing.body.trim()}
                    onClick={async () => {
                      if (!commentsApi) return;
                      const ok = await run(
                        () =>
                          commentsApi.projectCommentControllerUpdate({
                            id: comment.id,
                            updateProjectCommentDto: { body: editing.body.trim() },
                          }),
                        'Could not save it.',
                      );
                      if (ok) setEditing(undefined);
                    }}
                  />
                  <Button label='Cancel' variant='secondary' onClick={() => setEditing(undefined)} />
                </div>
              </div>
            ) : (
              <RichText source={comment.body} />
            )}
          </div>
        </div>
      ))}
      <div style={styles.editor}>
        <textarea
          style={shared.textArea}
          rows={2}
          value={draft}
          placeholder='Write a comment… (Ctrl+Enter sends)'
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && send()}
        />
        {draft.trim() ? (
          <div style={shared.row}>
            <Button label='Comment' onClick={send} loading={sending} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m },
  comment: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing.sm },
  main: { flex: 1, minWidth: 0, gap: 2 },
  author: { fontSize: 13, fontWeight: 700, color: t.colors.white },
  editor: { gap: t.spacing.s },
  // A touch target a finger can hit.
  iconButton: { width: 32, height: 32 },
  markdown: { background: 'transparent', fontSize: 14, color: t.colors.white },
}));
