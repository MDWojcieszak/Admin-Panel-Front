import { useEffect, useState } from 'react';
import { MdArrowDownward, MdArrowUpward, MdClose, MdDelete } from 'react-icons/md';
import {
  CategoryResponse,
  HomeBlockResponse,
  HomeBlockType,
  PatchHomeBlockDto,
  UpsertHomeBlockTranslationDto,
} from '~/api/api';
import { categoryLabel } from '~/routes/Blog/hooks/useBlogCategories';
import { PostPicker } from '~/routes/Blog/Home/components/PostPicker';
import { mkUseStyles, useTheme } from '~/utils/theme';

type HomeBlockCardProps = {
  block: HomeBlockResponse;
  locale: string;
  categories: CategoryResponse[];
  isFirst: boolean;
  isLast: boolean;
  onPatch: (blockId: string, patch: PatchHomeBlockDto) => void;
  onTranslate: (blockId: string, patch: UpsertHomeBlockTranslationDto) => void;
  onMove: (blockId: string, dir: -1 | 1) => void;
  onDelete: (blockId: string) => void;
  onSetPosts: (blockId: string, posts: { postId: string; order: number }[]) => void;
};

const HAS_TITLE: HomeBlockType[] = [
  HomeBlockType.Hero,
  HomeBlockType.FeaturedPosts,
  HomeBlockType.CategoryRow,
  HomeBlockType.PostGrid,
  HomeBlockType.Text,
  HomeBlockType.Map,
];
const HAS_BODY: HomeBlockType[] = [HomeBlockType.Hero, HomeBlockType.Text];
const HAS_LIMIT: HomeBlockType[] = [HomeBlockType.FeaturedPosts, HomeBlockType.PostGrid];
const HAS_POSTS: HomeBlockType[] = [HomeBlockType.Hero, HomeBlockType.FeaturedPosts];

export const HomeBlockCard = (p: HomeBlockCardProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { block, locale } = p;

  const tr = block.translations.find((t) => t.locale === locale);
  const [title, setTitle] = useState(tr?.title ?? '');
  const [body, setBody] = useState(tr?.body ?? '');
  const [limit, setLimit] = useState(block.limit != null ? String(block.limit) : '');
  const [categoryId, setCategoryId] = useState(block.categoryId ?? '');
  const [posts, setPosts] = useState(block.posts);

  useEffect(() => {
    const t2 = block.translations.find((t) => t.locale === locale);
    setTitle(t2?.title ?? '');
    setBody(t2?.body ?? '');
    setLimit(block.limit != null ? String(block.limit) : '');
    setCategoryId(block.categoryId ?? '');
    setPosts(block.posts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, locale]);

  const commitPosts = (next: typeof posts) => {
    setPosts(next);
    p.onSetPosts(block.id, next.map((x, i) => ({ postId: x.postId, order: i })));
  };

  return (
    <div style={styles.card}>
      <div style={styles.toolbar}>
        <span style={styles.type}>{block.type}</span>
        <div style={styles.actions}>
          <button style={styles.iconBtn} disabled={p.isFirst} onClick={() => p.onMove(block.id, -1)}>
            <MdArrowUpward size={16} color={p.isFirst ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} disabled={p.isLast} onClick={() => p.onMove(block.id, 1)}>
            <MdArrowDownward size={16} color={p.isLast ? theme.colors.dark04 : theme.colors.white} />
          </button>
          <button style={styles.iconBtn} onClick={() => p.onDelete(block.id)}>
            <MdDelete size={16} color={theme.colors.red} />
          </button>
        </div>
      </div>

      <div style={styles.fields}>
        {HAS_TITLE.includes(block.type) ? (
          <input
            style={styles.input}
            placeholder={`Title (${locale.toUpperCase()})`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== (tr?.title ?? '') && p.onTranslate(block.id, { title: title || null })}
          />
        ) : null}

        {HAS_BODY.includes(block.type) ? (
          <textarea
            style={styles.textarea}
            rows={2}
            placeholder={`Body (${locale.toUpperCase()})`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={() => body !== (tr?.body ?? '') && p.onTranslate(block.id, { body: body || null })}
          />
        ) : null}

        {block.type === HomeBlockType.CategoryRow ? (
          <div style={styles.row}>
            <span style={styles.label}>Category</span>
            <select
              style={styles.select}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                p.onPatch(block.id, { categoryId: e.target.value || null });
              }}
            >
              <option value=''>—</option>
              {p.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c, locale)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {HAS_LIMIT.includes(block.type) ? (
          <div style={styles.row}>
            <span style={styles.label}>Limit</span>
            <input
              style={styles.smallInput}
              type='number'
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              onBlur={() => p.onPatch(block.id, { limit: limit ? Number(limit) : null })}
            />
          </div>
        ) : null}

        {HAS_POSTS.includes(block.type) ? (
          <div style={styles.postsSection}>
            <span style={styles.label}>Featured posts</span>
            {posts.length ? (
              <div style={styles.postList}>
                {posts.map((bp, i) => (
                  <div key={bp.id} style={styles.postRow}>
                    <span style={styles.postSlug}>{bp.post?.title || bp.post?.slug || bp.postId}</span>
                    <button
                      style={styles.iconBtn}
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...posts];
                        [next[i], next[i - 1]] = [next[i - 1], next[i]];
                        commitPosts(next);
                      }}
                    >
                      <MdArrowUpward size={14} color={i === 0 ? theme.colors.dark04 : theme.colors.white} />
                    </button>
                    <button style={styles.iconBtn} onClick={() => commitPosts(posts.filter((x) => x.id !== bp.id))}>
                      <MdClose size={14} color={theme.colors.red} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <PostPicker
              excludeIds={posts.map((x) => x.postId)}
              onPick={(postId) =>
                commitPosts([...posts, { id: postId, postId, order: posts.length, post: null }])
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.s,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  type: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
  },
  actions: {
    flexDirection: 'row',
    gap: 2,
  },
  fields: {
    gap: t.spacing.s,
  },
  input: {
    height: 40,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 15,
    fontWeight: 600,
  },
  textarea: {
    boxSizing: 'border-box',
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  label: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  select: {
    height: 36,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 14,
  },
  smallInput: {
    width: 80,
    height: 34,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  postsSection: {
    gap: t.spacing.xs,
  },
  postList: {
    gap: t.spacing.xs,
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.xs,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.4),
  },
  postSlug: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
}));
