import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheckSquare, FiEdit2, FiMessageSquare, FiRotateCcw, FiStar, FiTrash2 } from 'react-icons/fi';
import { IconType } from 'react-icons';
import {
  CommentStage,
  PhotoEntryCommentKind,
  PhotoEntryCommentListResponse,
  PhotoEntryCommentResponse,
} from '~/api/api';
import { Badge, BadgeTone } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles, useTheme } from '~/utils/theme';

type EntryCommentsPanelProps = {
  entryId: string;
  /** The card shows commentSummary, so the parent needs to know it moved. */
  onChanged?: () => void | Promise<void>;
};

const STAGE_LABELS: Record<CommentStage, string> = {
  [CommentStage.Planning]: 'Planning',
  [CommentStage.AfterShoot]: 'After shoot',
  [CommentStage.Selecting]: 'Selecting',
  [CommentStage.Editing]: 'Editing',
  [CommentStage.Finished]: 'Finished',
  [CommentStage.Cancelled]: 'Cancelled',
};

const KIND_META: Record<PhotoEntryCommentKind, { label: string; icon: IconType; tone: BadgeTone }> = {
  [PhotoEntryCommentKind.Note]: { label: 'Note', icon: FiMessageSquare, tone: 'neutral' },
  [PhotoEntryCommentKind.Todo]: { label: 'To do', icon: FiCheckSquare, tone: 'blue' },
  [PhotoEntryCommentKind.Highlight]: { label: 'Highlight', icon: FiStar, tone: 'yellow' },
  [PhotoEntryCommentKind.Problem]: { label: 'Problem', icon: FiAlertTriangle, tone: 'red' },
};

const KINDS = Object.values(PhotoEntryCommentKind);

export const EntryCommentsPanel = ({ entryId, onChanged }: EntryCommentsPanelProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { photoEntryApi } = useApi();
  const toast = useToast();

  const [data, setData] = useState<PhotoEntryCommentListResponse>();
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<PhotoEntryCommentKind>(PhotoEntryCommentKind.Note);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [onlyOpenTodos, setOnlyOpenTodos] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [editBody, setEditBody] = useState('');

  const load = useCallback(async () => {
    if (!photoEntryApi) return;
    setLoading(true);
    try {
      const { data: list } = await photoEntryApi.photoEntryCommentControllerList({
        id: entryId,
        unresolved: onlyOpenTodos || undefined,
      });
      setData(list);
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not load the comments.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [photoEntryApi, entryId, onlyOpenTodos, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    await load();
    await onChanged?.();
  };

  const act = async (id: string, action: () => Promise<unknown>, fallback: string) => {
    setBusyId(id);
    try {
      await action();
      await refresh();
    } catch (e) {
      toast(getApiErrorMessage(e, fallback), 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const addComment = async () => {
    if (!photoEntryApi || !body.trim()) return;
    setSaving(true);
    try {
      await photoEntryApi.photoEntryCommentControllerCreate({
        id: entryId,
        createPhotoEntryCommentDto: { body: body.trim(), kind },
      });
      setBody('');
      await refresh();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not add the comment.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveBody = (commentId: string, nextBody: string) => {
    if (!photoEntryApi) return;
    return act(
      commentId,
      async () => {
        await photoEntryApi.photoEntryCommentControllerPatch({
          commentId,
          patchPhotoEntryCommentDto: { body: nextBody },
        });
        setEditingId(undefined);
      },
      'Could not save the comment.',
    );
  };

  const resolveComment = (commentId: string) => {
    if (!photoEntryApi) return;
    return act(
      commentId,
      () => photoEntryApi.photoEntryCommentControllerResolve({ commentId }),
      'Could not tick this off.',
    );
  };

  const reopenComment = (commentId: string) => {
    if (!photoEntryApi) return;
    return act(
      commentId,
      () => photoEntryApi.photoEntryCommentControllerReopen({ commentId }),
      'Could not reopen this.',
    );
  };

  const removeComment = (commentId: string) => {
    if (!photoEntryApi) return;
    return act(
      commentId,
      () => photoEntryApi.photoEntryCommentControllerRemove({ commentId }),
      'Could not delete the comment.',
    );
  };

  const totalComments = useMemo(
    () => data?.groups.reduce((sum, group) => sum + group.comments.length, 0) ?? 0,
    [data],
  );

  if (loading && !data) return <Loader />;

  return (
    <div style={styles.container}>
      <div style={styles.composer}>
        <div style={styles.kindRow}>
          {KINDS.map((item) => {
            const meta = KIND_META[item];
            const Icon = meta.icon;
            const active = kind === item;
            return (
              <button
                key={item}
                type='button'
                onClick={() => setKind(item)}
                style={{ ...styles.kindChip, ...(active ? styles.kindChipOn : {}) }}
              >
                <Icon size={13} />
                {meta.label}
              </button>
            );
          })}
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='Write a note about this session…'
          style={styles.textarea}
        />

        <div style={styles.composerFooter}>
          {/* The stage is stamped by the backend from the entry's current state — it
              is neither sent nor editable, so saying where it will land avoids surprise. */}
          <span style={styles.hint}>
            Will be pinned to: {data ? STAGE_LABELS[data.currentStage] : '—'}
          </span>
          <Button label='Add' onClick={addComment} loading={saving} disabled={!body.trim()} />
        </div>
      </div>

      <div style={styles.filterRow}>
        <button
          type='button'
          onClick={() => setOnlyOpenTodos((prev) => !prev)}
          style={{ ...styles.kindChip, ...(onlyOpenTodos ? styles.kindChipOn : {}) }}
        >
          <FiCheckSquare size={13} />
          Open to-dos only
        </button>
        <span style={styles.hint}>{totalComments} shown</span>
      </div>

      {totalComments === 0 ? (
        <EmptyState
          title={onlyOpenTodos ? 'Nothing open' : 'No comments yet'}
          description={
            onlyOpenTodos ? 'Every to-do on this session is ticked off.' : 'Notes, to-dos and problems show up here.'
          }
        />
      ) : (
        <div style={styles.groups}>
          {data?.groups.map((group) => (
            <div key={group.stage} style={styles.group}>
              <div style={styles.groupHeader}>
                <span style={styles.groupTitle}>{STAGE_LABELS[group.stage] ?? group.stage}</span>
                <span style={styles.hint}>{group.comments.length}</span>
              </div>

              {group.comments.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  busy={busyId === comment.id}
                  editing={editingId === comment.id}
                  editBody={editBody}
                  theme={theme}
                  onEditBodyChange={setEditBody}
                  onStartEdit={() => {
                    setEditingId(comment.id);
                    setEditBody(comment.body);
                  }}
                  onCancelEdit={() => setEditingId(undefined)}
                  onSaveEdit={() => saveBody(comment.id, editBody.trim())}
                  onResolve={() => resolveComment(comment.id)}
                  onReopen={() => reopenComment(comment.id)}
                  onRemove={() => removeComment(comment.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

type CommentRowProps = {
  comment: PhotoEntryCommentResponse;
  busy: boolean;
  editing: boolean;
  editBody: string;
  theme: ReturnType<typeof useTheme>;
  onEditBodyChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onResolve: () => void;
  onReopen: () => void;
  onRemove: () => void;
};

const CommentRow = ({
  comment,
  busy,
  editing,
  editBody,
  theme,
  onEditBodyChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onResolve,
  onReopen,
  onRemove,
}: CommentRowProps) => {
  const styles = useStyles();
  const meta = KIND_META[comment.kind];
  const Icon = meta.icon;
  const resolved = Boolean(comment.resolvedAt);
  // Only a to-do carries the notion of being done; changing the kind away from
  // TODO clears the tick, so the control follows the kind rather than the row.
  const isTodo = comment.kind === PhotoEntryCommentKind.Todo;

  return (
    <div style={{ ...styles.comment, opacity: busy ? 0.6 : 1 }}>
      <div style={styles.commentHead}>
        <Badge label={meta.label} tone={meta.tone} icon={<Icon size={11} />} />
        {resolved ? <Badge label='Done' tone='green' /> : null}
        <span style={styles.hint}>{new Date(comment.createdAt).toLocaleString()}</span>

        <div style={styles.commentActions}>
          {isTodo ? (
            <IconBtn
              title={resolved ? 'Reopen' : 'Tick off'}
              onClick={resolved ? onReopen : onResolve}
              icon={resolved ? <FiRotateCcw size={13} /> : <FiCheckSquare size={13} />}
            />
          ) : null}
          <IconBtn title='Edit' onClick={onStartEdit} icon={<FiEdit2 size={13} />} />
          <IconBtn
            title='Delete'
            onClick={onRemove}
            icon={<FiTrash2 size={13} color={theme.colors.red} />}
          />
        </div>
      </div>

      {editing ? (
        <div style={styles.editBox}>
          <textarea value={editBody} onChange={(e) => onEditBodyChange(e.target.value)} style={styles.textarea} />
          <div style={styles.editActions}>
            <Button label='Cancel' variant='secondary' onClick={onCancelEdit} />
            <Button label='Save' onClick={onSaveEdit} disabled={!editBody.trim()} />
          </div>
        </div>
      ) : (
        <span style={{ ...styles.commentBody, textDecoration: resolved ? 'line-through' : 'none' }}>
          {comment.body}
        </span>
      )}
    </div>
  );
};

const IconBtn = ({ title, icon, onClick }: { title: string; icon: React.ReactNode; onClick: () => void }) => {
  const styles = useStyles();
  return (
    <button type='button' title={title} aria-label={title} onClick={onClick} style={styles.iconBtn}>
      {icon}
    </button>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.m,
    minWidth: 0,
  },
  composer: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  kindRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  kindChip: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    color: t.colors.dark05,
    backgroundColor: 'transparent',
    border: `1px solid ${t.colors.dark04 + t.colorOpacity(0.5)}`,
  },
  kindChipOn: {
    color: t.colors.white,
    borderColor: t.colors.blue,
    backgroundColor: t.colors.blue + t.colorOpacity(0.16),
  },
  textarea: {
    width: '100%',
    minHeight: 70,
    resize: 'vertical',
    boxSizing: 'border-box',
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.blue02 + t.colorOpacity(0.5)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    color: t.colors.white,
    outline: 'none',
    fontSize: 13,
    fontFamily: 'inherit',
  },
  composerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.s,
  },
  hint: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  groups: {
    gap: t.spacing.m,
  },
  group: {
    gap: t.spacing.s,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: t.colors.blue04,
  },
  comment: {
    gap: t.spacing.xs,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  commentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    flexWrap: 'wrap',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: t.borderRadius.default,
    cursor: 'pointer',
    color: t.colors.dark05,
    background: 'transparent',
    border: 'none',
  },
  commentBody: {
    fontSize: 13,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  editBox: {
    gap: t.spacing.s,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.s,
  },
}));
