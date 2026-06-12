import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MdSend } from 'react-icons/md';
import { EditorialCommentResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { mkUseStyles, useTheme } from '~/utils/theme';
import '~/routes/Blog/Editor/components/GlobalComments.css';

type GlobalCommentsProps = {
  postId: string;
};

const authorName = (c: EditorialCommentResponse) =>
  [c.author.firstName, c.author.lastName].filter(Boolean).join(' ') || c.author.email;

/** Post-level editorial notes, shown as a clean comments section under the summary. */
export const GlobalComments = ({ postId }: GlobalCommentsProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCommentsApi } = useApi();
  const auth = useAuth();
  const [comments, setComments] = useState<EditorialCommentResponse[]>([]);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);

  const load = useCallback(async () => {
    if (!blogCommentsApi) return;
    try {
      const { data } = await blogCommentsApi.commentControllerList({ postId, global: true });
      setComments(data.comments);
    } catch (e) {
      console.error('Error loading post notes:', e);
    }
  }, [blogCommentsApi, postId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!blogCommentsApi || !draft.trim()) return;
    try {
      await blogCommentsApi.commentControllerCreate({ postId, createCommentDto: { body: draft.trim() } });
      setDraft('');
      await load();
    } catch (e) {
      console.error('Error posting note:', e);
    }
  };

  const saveEdit = async () => {
    if (!blogCommentsApi || !editing || !editing.body.trim()) return;
    try {
      await blogCommentsApi.commentControllerPatch({ postId, commentId: editing.id, patchCommentDto: { body: editing.body.trim() } });
      setEditing(null);
      await load();
    } catch (e) {
      console.error('Error editing note:', e);
    }
  };

  const remove = async (commentId: string) => {
    if (!blogCommentsApi) return;
    try {
      await blogCommentsApi.commentControllerDelete({ postId, commentId });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error('Error deleting note:', e);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.heading}>Post notes</span>
        <span style={styles.hint}>Internal — never shown to readers</span>
      </div>

      {comments.length ? (
        <div style={styles.list}>
          {comments.map((c) => (
            <div key={c.id} className='gc-comment'>
              <div style={styles.head}>
                <span style={styles.author}>{authorName(c)}</span>
                <span style={styles.time}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                {auth.userData?.id === c.authorId && editing?.id !== c.id ? (
                  <div className='gc-actions' style={styles.actions}>
                    <button style={styles.linkBtn} onClick={() => setEditing({ id: c.id, body: c.body })}>
                      Edit
                    </button>
                    <button style={styles.linkBtn} onClick={() => remove(c.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
              {editing?.id === c.id ? (
                <div style={styles.editBox}>
                  <textarea
                    autoFocus
                    style={styles.input}
                    rows={2}
                    value={editing.body}
                    onChange={(e) => setEditing({ id: c.id, body: e.target.value })}
                  />
                  <div style={styles.editActions}>
                    <button style={styles.linkBtn} onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                    <button style={styles.linkBtnPrimary} onClick={saveEdit}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <span style={styles.body}>{c.body}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div style={styles.composer}>
        <textarea
          style={styles.input}
          rows={1}
          placeholder='Add a post note…'
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <button style={styles.send} onClick={submit} disabled={!draft.trim()}>
          <MdSend size={14} color={theme.colors.white} />
        </button>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.4),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  header: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s },
  heading: { fontSize: 13, fontWeight: 700, color: t.colors.blue04 },
  hint: { fontSize: 11, color: t.colors.dark05 },
  list: { gap: 2 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s },
  author: { fontSize: 13, fontWeight: 700 },
  time: { fontSize: 11, color: t.colors.dark05 },
  actions: { flexDirection: 'row', gap: t.spacing.m, marginLeft: 'auto' },
  body: { fontSize: 13, whiteSpace: 'pre-wrap', color: t.colors.white + t.colorOpacity(0.9) },
  linkBtn: { border: 0, background: 'transparent', color: t.colors.dark05, cursor: 'pointer', fontSize: 11, padding: 0 },
  linkBtnPrimary: { border: 0, background: 'transparent', color: t.colors.blue04, cursor: 'pointer', fontSize: 11, padding: 0, fontWeight: 700 },
  editBox: { gap: t.spacing.xs, marginTop: t.spacing.xs },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    marginTop: t.spacing.xs,
    paddingTop: t.spacing.s,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  input: {
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 13,
    resize: 'none',
    fontFamily: 'inherit',
  },
  send: {
    width: 30,
    height: 30,
    minWidth: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    cursor: 'pointer',
    backgroundColor: t.colors.blue,
  },
}));
