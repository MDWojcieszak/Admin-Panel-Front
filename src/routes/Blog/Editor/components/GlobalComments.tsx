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

const initials = (c: EditorialCommentResponse) => {
  const f = c.author.firstName?.[0] ?? c.author.email?.[0] ?? '?';
  const l = c.author.lastName?.[0] ?? '';
  return (f + l).toUpperCase();
};

/** Post-level editorial notes, shown as a Notion-style comments section under the summary. */
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
      <span style={styles.heading}>Post notes</span>
      <span style={styles.hint}>Internal — never shown to readers.</span>

      {comments.map((c) => (
        <div key={c.id} className='gc-comment'>
          <div style={styles.avatar}>{initials(c)}</div>
          <div style={styles.bubble}>
            <div style={styles.head}>
              <span style={styles.author}>{authorName(c)}</span>
              <span style={styles.time}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
            </div>
            {editing?.id === c.id ? (
              <div style={styles.composerInner}>
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
              <>
                <span style={styles.body}>{c.body}</span>
                {auth.userData?.id === c.authorId ? (
                  <div className='gc-actions' style={styles.actions}>
                    <button style={styles.linkBtn} onClick={() => setEditing({ id: c.id, body: c.body })}>
                      Edit
                    </button>
                    <button style={styles.linkBtn} onClick={() => remove(c.id)}>
                      Delete
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      ))}

      <div style={styles.row}>
        <div style={styles.avatarMe}>{(auth.userData?.email?.[0] ?? '+').toUpperCase()}</div>
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
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  wrap: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  heading: { fontSize: 13, fontWeight: 700, color: t.colors.blue04 },
  hint: { fontSize: 11, color: t.colors.dark05, marginTop: -6 },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 8,
    paddingTop: t.spacing.s,
    marginTop: t.spacing.xs,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  avatar: {
    width: 26,
    height: 26,
    minWidth: 26,
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.gray02,
    marginTop: 2,
  },
  avatarMe: {
    width: 26,
    height: 26,
    minWidth: 26,
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.5),
    marginTop: 2,
  },
  bubble: { flex: 1, minWidth: 0, gap: 2 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: t.spacing.s },
  author: { fontSize: 13, fontWeight: 700 },
  time: { fontSize: 11, color: t.colors.dark05 },
  body: { fontSize: 13, whiteSpace: 'pre-wrap' },
  actions: { flexDirection: 'row', gap: t.spacing.m, marginTop: 2 },
  linkBtn: { border: 0, background: 'transparent', color: t.colors.dark05, cursor: 'pointer', fontSize: 11, padding: 0 },
  linkBtnPrimary: { border: 0, background: 'transparent', color: t.colors.blue04, cursor: 'pointer', fontSize: 11, padding: 0, fontWeight: 700 },
  composer: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.s },
  composerInner: { gap: t.spacing.xs },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.m },
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
