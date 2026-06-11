import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MdClose, MdDelete, MdEdit, MdSend } from 'react-icons/md';
import { EditorialCommentResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useAuth } from '~/hooks/useAuth';
import { BlogEditor } from '~/routes/Blog/Editor/document/schema';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const COMMENTS_LAYER_WIDTH = 320;

type CommentsLayerProps = {
  open: boolean;
  postId: string;
  editor: BlogEditor;
  /** A section the user asked to comment on (from the block menu / hover button), or null. */
  composeFor: string | null;
  onClearCompose: () => void;
};

const authorName = (c: EditorialCommentResponse) =>
  [c.author.firstName, c.author.lastName].filter(Boolean).join(' ') || c.author.email;

const estimateHeight = (count: number, composing: boolean) => 54 + count * 64 + (composing ? 96 : 0);

export const CommentsLayer = ({ open, postId, editor, composeFor, onClearCompose }: CommentsLayerProps) => {
  const styles = useStyles();
  const { blogCommentsApi } = useApi();
  const auth = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<EditorialCommentResponse[]>([]);
  const [targetY, setTargetY] = useState<Record<string, number>>({});
  const [globalDraft, setGlobalDraft] = useState('');
  const [sectionDraft, setSectionDraft] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);

  const load = useCallback(async () => {
    if (!blogCommentsApi) return;
    try {
      const { data } = await blogCommentsApi.commentControllerList({ postId });
      setComments(data.comments);
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  }, [blogCommentsApi, postId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Group comments: global (no sectionId) vs per-section.
  const { global, bySection } = useMemo(() => {
    const g: EditorialCommentResponse[] = [];
    const s: Record<string, EditorialCommentResponse[]> = {};
    for (const c of comments) {
      if (c.sectionId) (s[c.sectionId] ??= []).push(c);
      else g.push(c);
    }
    return { global: g, bySection: s };
  }, [comments]);

  // Measure each commented section's vertical position from its block in the document DOM.
  const measure = useCallback(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const contTop = cont.getBoundingClientRect().top;
    const map: Record<string, number> = {};
    for (const b of editor.document) {
      const sid = (b.props as { sectionId?: string }).sectionId;
      if (!sid || !bySection[sid]) continue;
      const el = document.querySelector(`[data-id="${b.id}"]`);
      if (el) map[sid] = el.getBoundingClientRect().top - contTop;
    }
    setTargetY(map);
  }, [editor, bySection]);

  useEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => requestAnimationFrame(measure);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, measure, comments, composeFor]);

  // Greedy top-down stacking so section cards never overlap; aligned to their target Y where possible.
  const placed = useMemo(() => {
    const ids = Object.keys(bySection);
    const locatable = ids.filter((id) => targetY[id] != null).sort((a, b) => targetY[a] - targetY[b]);
    const unlocatable = ids.filter((id) => targetY[id] == null);
    const out: { sectionId: string; top: number }[] = [];
    let cursor = 0;
    for (const id of locatable) {
      const top = Math.max(targetY[id], cursor);
      out.push({ sectionId: id, top });
      cursor = top + estimateHeight(bySection[id].length, composeFor === id) + 12;
    }
    for (const id of unlocatable) {
      out.push({ sectionId: id, top: cursor });
      cursor += estimateHeight(bySection[id].length, composeFor === id) + 12;
    }
    return out;
  }, [bySection, targetY, composeFor]);

  const post = async (sectionId: string | null, body: string) => {
    if (!blogCommentsApi || !body.trim()) return;
    try {
      await blogCommentsApi.commentControllerCreate({
        postId,
        createCommentDto: sectionId ? { sectionId, body: body.trim() } : { body: body.trim() },
      });
      await load();
    } catch (e) {
      console.error('Error posting comment:', e);
    }
  };

  const saveEdit = async () => {
    if (!blogCommentsApi || !editing || !editing.body.trim()) return;
    try {
      await blogCommentsApi.commentControllerPatch({
        postId,
        commentId: editing.id,
        patchCommentDto: { body: editing.body.trim() },
      });
      setEditing(null);
      await load();
    } catch (e) {
      console.error('Error editing comment:', e);
    }
  };

  const remove = async (commentId: string) => {
    if (!blogCommentsApi) return;
    try {
      await blogCommentsApi.commentControllerDelete({ postId, commentId });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      console.error('Error deleting comment:', e);
    }
  };

  const renderComment = (c: EditorialCommentResponse) => (
    <div key={c.id} style={styles.comment}>
      <div style={styles.commentHead}>
        <span style={styles.author}>{authorName(c)}</span>
        <span style={styles.time}>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
      </div>
      {c.quote ? <span style={styles.quote}>“{c.quote}”</span> : null}
      {editing?.id === c.id ? (
        <Composer
          value={editing.body}
          onChange={(v) => setEditing({ id: c.id, body: v })}
          onSubmit={saveEdit}
          onCancel={() => setEditing(null)}
          autoFocus
        />
      ) : (
        <>
          <span style={styles.body}>{c.body}</span>
          {auth.userData?.id === c.authorId ? (
            <div style={styles.actions}>
              <button style={styles.actionBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => setEditing({ id: c.id, body: c.body })}>
                <MdEdit size={13} /> Edit
              </button>
              <button style={styles.actionBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => remove(c.id)}>
                <MdDelete size={13} /> Delete
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <motion.div
      ref={containerRef}
      style={styles.layer}
      initial={false}
      animate={{ x: open ? 0 : COMMENTS_LAYER_WIDTH + 12, opacity: open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      {/* Global thread, pinned at the top. */}
      <div style={styles.globalCard}>
        <span style={styles.globalTitle}>Post notes</span>
        {global.length ? global.map(renderComment) : <span style={styles.empty}>No post-level notes yet.</span>}
        <Composer value={globalDraft} onChange={setGlobalDraft} onSubmit={async () => { await post(null, globalDraft); setGlobalDraft(''); }} placeholder='Add a post note…' />
      </div>

      {/* Section cards positioned next to their block. */}
      {placed.map(({ sectionId, top }) => (
        <div key={sectionId} style={{ ...styles.sectionCard, top }}>
          {bySection[sectionId].map(renderComment)}
          {composeFor === sectionId ? (
            <Composer
              value={sectionDraft[sectionId] ?? ''}
              onChange={(v) => setSectionDraft((p) => ({ ...p, [sectionId]: v }))}
              onSubmit={async () => {
                await post(sectionId, sectionDraft[sectionId] ?? '');
                setSectionDraft((p) => ({ ...p, [sectionId]: '' }));
                onClearCompose();
              }}
              onCancel={onClearCompose}
              placeholder='Comment on this section…'
              autoFocus
            />
          ) : null}
        </div>
      ))}

      {/* A fresh section the user is composing on but has no comments yet. */}
      {composeFor && !bySection[composeFor] ? (
        <div style={{ ...styles.sectionCard, top: Math.max(targetY[composeFor] ?? 0, 0) }}>
          <Composer
            value={sectionDraft[composeFor] ?? ''}
            onChange={(v) => setSectionDraft((p) => ({ ...p, [composeFor]: v }))}
            onSubmit={async () => {
              await post(composeFor, sectionDraft[composeFor] ?? '');
              setSectionDraft((p) => ({ ...p, [composeFor]: '' }));
              onClearCompose();
            }}
            onCancel={onClearCompose}
            placeholder='Comment on this section…'
            autoFocus
          />
        </div>
      ) : null}
    </motion.div>
  );
};

type ComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

const Composer = ({ value, onChange, onSubmit, onCancel, placeholder, autoFocus }: ComposerProps) => {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <div style={styles.composer}>
      <textarea
        autoFocus={autoFocus}
        style={styles.composerInput}
        rows={2}
        placeholder={placeholder ?? 'Add a note…'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div style={styles.composerActions}>
        {onCancel ? (
          <button style={styles.cancelBtn} onMouseDown={(e) => e.preventDefault()} onClick={onCancel}>
            <MdClose size={15} />
          </button>
        ) : null}
        <button style={styles.sendBtn} onMouseDown={(e) => e.preventDefault()} onClick={onSubmit} disabled={!value.trim()}>
          <MdSend size={14} color={theme.colors.white} />
        </button>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  layer: {
    position: 'fixed',
    right: 16,
    top: 60,
    bottom: 0,
    width: COMMENTS_LAYER_WIDTH,
    zIndex: 6,
    pointerEvents: 'none',
  },
  globalCard: {
    position: 'absolute',
    top: t.spacing.s,
    left: t.spacing.s,
    right: t.spacing.s,
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    pointerEvents: 'auto',
  },
  globalTitle: { fontSize: 12, fontWeight: 700, color: t.colors.blue04, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: {
    position: 'absolute',
    left: t.spacing.s,
    right: t.spacing.s,
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    pointerEvents: 'auto',
  },
  comment: { gap: 3, paddingBottom: t.spacing.xs },
  commentHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: t.spacing.s },
  author: { fontSize: 12, fontWeight: 700 },
  time: { fontSize: 10, color: t.colors.dark05 },
  quote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: t.colors.dark05,
    borderLeft: `2px solid ${t.colors.blue04 + t.colorOpacity(0.5)}`,
    paddingLeft: t.spacing.xs,
  },
  body: { fontSize: 13, whiteSpace: 'pre-wrap' },
  empty: { fontSize: 12, color: t.colors.dark05 },
  actions: { flexDirection: 'row', gap: t.spacing.s, marginTop: 2 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    border: 0,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 11,
    padding: 0,
    display: 'flex',
  },
  composer: { gap: t.spacing.xs, marginTop: t.spacing.xs },
  composerInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 13,
    resize: 'none',
    fontFamily: 'inherit',
  },
  composerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing.xs },
  cancelBtn: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
  },
  sendBtn: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    cursor: 'pointer',
    backgroundColor: t.colors.blue,
  },
}));
