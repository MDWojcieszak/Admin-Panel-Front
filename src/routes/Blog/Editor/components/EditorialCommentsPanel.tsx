import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MdClose, MdSend } from 'react-icons/md';
import { EditorialCommentResponse } from '~/api/api';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const COMMENTS_PANEL_WIDTH = 340;

type EditorialCommentsPanelProps = {
  open: boolean;
  postId: string;
  onClose: () => void;
};

const authorName = (c: EditorialCommentResponse) =>
  [c.author.firstName, c.author.lastName].filter(Boolean).join(' ') || c.author.email;

export const EditorialCommentsPanel = ({ open, postId, onClose }: EditorialCommentsPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCommentsApi } = useApi();
  const auth = useAuth();
  const [comments, setComments] = useState<EditorialCommentResponse[]>();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!blogCommentsApi) return;
    try {
      const { data } = await blogCommentsApi.commentControllerList({ postId, sectionId: '' });
      setComments(data.comments);
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  }, [blogCommentsApi, postId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const submit = async () => {
    if (!blogCommentsApi || !draft.trim()) return;
    setSending(true);
    try {
      await blogCommentsApi.commentControllerCreate({ postId, createCommentDto: { body: draft.trim() } });
      setDraft('');
      await load();
    } catch (e) {
      console.error('Error posting comment:', e);
    } finally {
      setSending(false);
    }
  };

  const remove = async (commentId: string) => {
    if (!blogCommentsApi) return;
    try {
      await blogCommentsApi.commentControllerDelete({ postId, commentId });
      setComments((prev) => prev?.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error('Error deleting comment:', e);
    }
  };

  return (
    <motion.div
      style={styles.panel}
      initial={false}
      animate={{ x: open ? 0 : COMMENTS_PANEL_WIDTH + 8, opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div style={styles.header}>
        <span style={styles.title}>Editorial notes</span>
        <button style={styles.iconBtn} title='Close' onClick={onClose}>
          <MdClose size={18} />
        </button>
      </div>
      <span style={styles.hint}>Internal notes — never shown to readers.</span>

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {!comments ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : comments.length === 0 ? (
            <span style={styles.empty}>No notes yet.</span>
          ) : (
            <div style={styles.list}>
              {comments.map((c) => (
                <div key={c.id} style={styles.comment}>
                  <div style={styles.commentHead}>
                    <span style={styles.author}>{authorName(c)}</span>
                    <span style={styles.time}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                  <span style={styles.body}>{c.body}</span>
                  {auth.userData?.id === c.authorId ? (
                    <button style={styles.delete} onClick={() => remove(c.id)}>
                      delete
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Scrollbar>
      </div>

      <div style={styles.composer}>
        <textarea
          style={styles.input}
          rows={2}
          placeholder='Add a note…'
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button style={styles.send} onClick={submit} disabled={sending || !draft.trim()}>
          <MdSend size={16} color={theme.colors.white} />
        </button>
      </div>
    </motion.div>
  );
};

const useStyles = mkUseStyles((t) => ({
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: COMMENTS_PANEL_WIDTH,
    zIndex: 6,
    backgroundColor: t.colors.gray04,
    borderLeft: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing.m,
    paddingBottom: t.spacing.xs,
  },
  title: {
    fontWeight: 700,
    fontSize: 16,
  },
  iconBtn: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  hint: {
    fontSize: 12,
    color: t.colors.dark05,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
  },
  listWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    marginTop: t.spacing.s,
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  centered: {
    alignItems: 'center',
    paddingTop: 40,
  },
  empty: {
    fontSize: 13,
    color: t.colors.dark05,
    padding: t.spacing.m,
  },
  list: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    paddingTop: 0,
  },
  comment: {
    gap: 4,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  author: {
    fontSize: 13,
    fontWeight: 700,
  },
  time: {
    fontSize: 11,
    color: t.colors.dark05,
  },
  body: {
    fontSize: 13,
    whiteSpace: 'pre-wrap',
  },
  delete: {
    alignSelf: 'flex-start',
    border: 0,
    background: 'transparent',
    color: t.colors.red,
    cursor: 'pointer',
    fontSize: 11,
    padding: 0,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  input: {
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 13,
    resize: 'none',
    fontFamily: 'inherit',
  },
  send: {
    width: 38,
    height: 38,
    minWidth: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: 0,
    cursor: 'pointer',
    backgroundColor: t.colors.blue,
  },
}));
