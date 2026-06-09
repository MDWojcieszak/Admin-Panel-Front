import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdImage } from 'react-icons/md';
import {
  BlogAccessTier,
  BlogAuthorRole,
  CategoryKind,
  PostDraftResponse,
  UserResponseDto,
} from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { categoryLabel, useBlogCategories } from '~/routes/Blog/hooks/useBlogCategories';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { mkUseStyles } from '~/utils/theme';

export const SETTINGS_PANEL_WIDTH = 340;

type PostSettingsPanelProps = {
  open: boolean;
  postId: string;
  locale: string;
  draft: PostDraftResponse;
  onClose: () => void;
  onChanged: () => void;
  onRequestCover: () => void;
};

type AuthorRow = { userId: string; role: BlogAuthorRole };

export const PostSettingsPanel = (p: PostSettingsPanelProps) => {
  const styles = useStyles();
  const { blogPostsApi, userApi } = useApi();
  const { categories } = useBlogCategories(CategoryKind.Post, p.locale);

  const [accessTier, setAccessTier] = useState<BlogAccessTier>(p.draft.accessTier);
  const [country, setCountry] = useState(p.draft.country ?? '');
  const [region, setRegion] = useState(p.draft.region ?? '');
  const [seoKeywords, setSeoKeywords] = useState((p.draft.seoKeywords ?? []).join(', '));
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);

  useEffect(() => {
    setAccessTier(p.draft.accessTier);
    setCountry(p.draft.country ?? '');
    setRegion(p.draft.region ?? '');
    setSeoKeywords((p.draft.seoKeywords ?? []).join(', '));
  }, [p.draft.versionId, p.draft.accessTier, p.draft.country, p.draft.region, p.draft.seoKeywords]);

  const loadRelations = useCallback(async () => {
    if (!blogPostsApi) return;
    try {
      const [cats, post] = await Promise.all([
        blogPostsApi.postControllerGetDraftCategories({ id: p.postId }),
        blogPostsApi.postControllerGetById({ id: p.postId }),
      ]);
      setSelectedCats(cats.data.categories.map((c) => c.id));
      setAuthors(post.data.authors.map((a) => ({ userId: a.userId, role: a.role })));
    } catch (e) {
      console.error('Error loading post relations:', e);
    }
  }, [blogPostsApi, p.postId, p.locale]);

  useEffect(() => {
    if (p.open) loadRelations();
  }, [p.open, loadRelations]);

  useEffect(() => {
    if (!userApi || !p.open) return;
    userApi
      .userControllerGetList({ take: 100, skip: 0 })
      .then((r) => setUsers(r.data.users))
      .catch((e) => console.error('Error loading users:', e));
  }, [userApi, p.open]);

  const patchPost = async (patch: {
    accessTier?: BlogAccessTier;
    country?: string | null;
    region?: string | null;
    coverImageId?: string | null;
  }) => {
    if (!blogPostsApi) return;
    try {
      await blogPostsApi.postControllerPatch({ id: p.postId, patchPostDto: patch });
      p.onChanged();
    } catch (e) {
      console.error('Error patching post:', e);
    }
  };

  const saveSeo = async () => {
    if (!blogPostsApi) return;
    const list = seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
    try {
      await blogPostsApi.postControllerUpsertTranslation({
        id: p.postId,
        locale: p.locale,
        upsertPostTranslationDto: { seoKeywords: list },
      });
    } catch (e) {
      console.error('Error saving SEO keywords:', e);
    }
  };

  const toggleCategory = async (id: string) => {
    if (!blogPostsApi) return;
    const next = selectedCats.includes(id) ? selectedCats.filter((c) => c !== id) : [...selectedCats, id];
    setSelectedCats(next);
    try {
      await blogPostsApi.postControllerSetCategories({ id: p.postId, setPostCategoriesDto: { categoryIds: next } });
    } catch (e) {
      console.error('Error setting categories:', e);
    }
  };

  const saveAuthors = async (next: AuthorRow[]) => {
    if (!blogPostsApi) return;
    setAuthors(next);
    try {
      await blogPostsApi.postControllerSetAuthors({
        id: p.postId,
        setPostAuthorsDto: { authors: next.map((a, i) => ({ userId: a.userId, role: a.role, order: i })) },
      });
    } catch (e) {
      console.error('Error setting authors:', e);
    }
  };

  const addAuthor = (userId: string) => {
    if (!userId || authors.some((a) => a.userId === userId)) return;
    const role = authors.some((a) => a.role === BlogAuthorRole.Author) ? BlogAuthorRole.CoAuthor : BlogAuthorRole.Author;
    saveAuthors([...authors, { userId, role }]);
  };

  const userEmail = (userId: string) => users.find((u) => u.id === userId)?.email ?? userId;
  const hasAuthor = authors.some((a) => a.role === BlogAuthorRole.Author);

  return (
    <motion.div
      style={styles.panel}
      initial={false}
      animate={{ x: p.open ? 0 : SETTINGS_PANEL_WIDTH + 8, opacity: p.open ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <div style={styles.header}>
        <span style={styles.title}>Post settings</span>
        <button style={styles.iconBtn} title='Close' onClick={p.onClose}>
          <MdClose size={18} />
        </button>
      </div>

      <div style={styles.scrollWrap}>
        <Scrollbar style={styles.scroll}>
          <div style={styles.content}>
            {/* Access tier */}
            <div style={styles.field}>
              <span style={styles.label}>Access tier</span>
              <select
                style={styles.select}
                value={accessTier}
                onChange={(e) => {
                  setAccessTier(e.target.value as BlogAccessTier);
                  patchPost({ accessTier: e.target.value as BlogAccessTier });
                }}
              >
                {Object.values(BlogAccessTier).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover image */}
            <div style={styles.field}>
              <span style={styles.label}>Cover image</span>
              {p.draft.coverImageId ? (
                <div style={styles.coverWrap}>
                  <MediaThumb imageId={p.draft.coverImageId} style={styles.cover} />
                  <div style={styles.coverActions}>
                    <button style={styles.smallBtn} onClick={p.onRequestCover}>
                      Replace
                    </button>
                    <button style={styles.smallBtn} onClick={() => patchPost({ coverImageId: null })}>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button style={styles.coverPick} onClick={p.onRequestCover}>
                  <MdImage size={18} /> Pick from Media
                </button>
              )}
            </div>

            {/* Region */}
            <div style={styles.row2}>
              <div style={styles.field}>
                <span style={styles.label}>Country</span>
                <input
                  style={styles.input}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  onBlur={() => country !== (p.draft.country ?? '') && patchPost({ country: country || null })}
                />
              </div>
              <div style={styles.field}>
                <span style={styles.label}>Region</span>
                <input
                  style={styles.input}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  onBlur={() => region !== (p.draft.region ?? '') && patchPost({ region: region || null })}
                />
              </div>
            </div>

            {/* SEO keywords */}
            <div style={styles.field}>
              <span style={styles.label}>SEO keywords ({p.locale.toUpperCase()})</span>
              <input
                style={styles.input}
                placeholder='comma, separated, keywords'
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                onBlur={saveSeo}
              />
            </div>

            {/* Categories */}
            <div style={styles.field}>
              <span style={styles.label}>Categories</span>
              <div style={styles.chips}>
                {categories.length ? (
                  categories.map((c) => {
                    const on = selectedCats.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                        onClick={() => toggleCategory(c.id)}
                      >
                        {categoryLabel(c, p.locale)}
                      </button>
                    );
                  })
                ) : (
                  <span style={styles.muted}>No POST categories yet.</span>
                )}
              </div>
            </div>

            {/* Authors */}
            <div style={styles.field}>
              <span style={styles.label}>Authors</span>
              {!hasAuthor ? <span style={styles.warn}>At least one AUTHOR is required to publish.</span> : null}
              <div style={styles.authorList}>
                {authors.map((a) => (
                  <div key={a.userId} style={styles.authorRow}>
                    <span style={styles.authorEmail}>{userEmail(a.userId)}</span>
                    <select
                      style={styles.roleSelect}
                      value={a.role}
                      onChange={(e) =>
                        saveAuthors(authors.map((x) => (x.userId === a.userId ? { ...x, role: e.target.value as BlogAuthorRole } : x)))
                      }
                    >
                      {Object.values(BlogAuthorRole).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <button
                      style={styles.removeAuthor}
                      onClick={() => saveAuthors(authors.filter((x) => x.userId !== a.userId))}
                    >
                      <MdClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <select style={styles.select} value='' onChange={(e) => addAuthor(e.target.value)}>
                <option value=''>+ Add author…</option>
                {users
                  .filter((u) => !authors.some((a) => a.userId === u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </Scrollbar>
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
    width: SETTINGS_PANEL_WIDTH,
    zIndex: 5,
    gap: t.spacing.s,
    backgroundColor: t.colors.gray04,
    borderLeft: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing.m,
    borderBottom: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
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
  scrollWrap: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    gap: t.spacing.l,
    padding: t.spacing.m,
  },
  field: {
    gap: t.spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  row2: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.blue04,
  },
  select: {
    height: 38,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 14,
  },
  input: {
    height: 38,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
  },
  coverWrap: {
    gap: t.spacing.s,
  },
  cover: {
    width: '100%',
    height: 140,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
  },
  coverActions: {
    flexDirection: 'row',
    gap: t.spacing.s,
  },
  coverPick: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.s,
    height: 80,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
  },
  smallBtn: {
    height: 30,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.xs,
  },
  chip: {
    height: 30,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 13,
  },
  chipOn: {
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.4)}`,
  },
  authorList: {
    gap: t.spacing.xs,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  authorEmail: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleSelect: {
    height: 30,
    borderRadius: t.borderRadius.small,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 12,
  },
  removeAuthor: {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    color: t.colors.red,
    cursor: 'pointer',
  },
  warn: {
    fontSize: 12,
    color: t.colors.yellow,
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
