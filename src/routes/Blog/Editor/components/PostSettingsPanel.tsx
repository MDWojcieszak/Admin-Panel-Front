import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { MdClose, MdImage } from 'react-icons/md';
import { BlogAccessTier, BlogAuthorRole, CategoryKind, PostDraftResponse, UserResponseDto } from '~/api/api';
import { Scrollbar } from '~/components/Scrollbar';
import { Select } from '~/components/Select';
import { TextArea } from '~/components/TextArea';
import { useApi } from '~/hooks/useApi';
import { categoryLabel, useBlogCategories } from '~/routes/Blog/hooks/useBlogCategories';
import { countryName, useBlogCountries } from '~/routes/Blog/hooks/useBlogCountries';
import { MediaThumb } from '~/routes/Blog/Editor/components/MediaThumb';
import { IMAGE_DND_TYPE } from '~/routes/Blog/Editor/document/schema';
import { mkUseStyles } from '~/utils/theme';
import '~/routes/Blog/Editor/components/post-settings.css';

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
type SettingsForm = { accessTier: string; countryId: string; seoKeywords: string; addAuthor: string };

const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');

const TIER_OPTIONS = Object.values(BlogAccessTier).map((v) => ({ value: v, label: titleCase(v) }));

export const PostSettingsPanel = (p: PostSettingsPanelProps) => {
  const styles = useStyles();
  const { blogPostsApi, userApi } = useApi();
  const { categories } = useBlogCategories(CategoryKind.Post, p.locale);
  const { countries } = useBlogCountries();
  const countryOptions = [
    { value: '', label: 'No country' },
    ...countries.map((c) => ({ value: c.id, label: countryName(c, p.locale) })),
  ];

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);

  const seoToString = (kw?: string[] | null) => (kw ?? []).join(', ');
  const { control, reset, setValue } = useForm<SettingsForm>({
    defaultValues: {
      accessTier: p.draft.accessTier,
      countryId: '',
      seoKeywords: seoToString(p.draft.seoKeywords),
      addAuthor: '',
    },
  });

  const seoKeywords = useWatch({ control, name: 'seoKeywords' });

  // Re-seed when the draft changes. The draft carries the country as a slug; resolve it to the FK once
  // the countries list is loaded (re-runs when `countries` arrives).
  useEffect(() => {
    reset({
      accessTier: p.draft.accessTier,
      countryId: countries.find((c) => c.slug === p.draft.country)?.id ?? '',
      seoKeywords: seoToString(p.draft.seoKeywords),
      addAuthor: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.draft.versionId, p.draft.accessTier, p.draft.country, p.draft.seoKeywords, countries]);

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
      .userControllerGetList({ take: 20, skip: 0 })
      .then((r) => setUsers(r.data.users))
      .catch((e) => console.error('Error loading users:', e));
  }, [userApi, p.open]);

  const patchPost = useCallback(
    async (patch: { accessTier?: BlogAccessTier; countryId?: string | null; coverImageId?: string | null }) => {
      if (!blogPostsApi) return;
      try {
        await blogPostsApi.postControllerPatch({ id: p.postId, patchPostDto: patch });
        p.onChanged();
      } catch (e) {
        console.error('Error patching post:', e);
      }
    },
    [blogPostsApi, p],
  );

  const saveSeo = useCallback(
    async (value: string) => {
      if (!blogPostsApi) return;
      const list = value.split(',').map((k) => k.trim()).filter(Boolean);
      try {
        await blogPostsApi.postControllerUpsertTranslation({
          id: p.postId,
          locale: p.locale,
          upsertPostTranslationDto: { seoKeywords: list },
        });
      } catch (e) {
        console.error('Error saving SEO keywords:', e);
      }
    },
    [blogPostsApi, p.postId, p.locale],
  );

  // Debounced autosave for SEO keywords (TextArea persists on value change).
  useEffect(() => {
    if (seoKeywords === seoToString(p.draft.seoKeywords)) return;
    const h = setTimeout(() => saveSeo(seoKeywords), 700);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seoKeywords]);

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

  // Prefer a real name; fall back to email (then id) so the row stays readable while users load.
  const userLabel = (u?: UserResponseDto) => {
    const name = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
    return name || u?.email || '';
  };
  const userName = (userId: string) => userLabel(users.find((u) => u.id === userId)) || userId;
  const hasAuthor = authors.some((a) => a.role === BlogAuthorRole.Author);

  const addAuthorOptions = [
    { value: '', label: '+ Add author…' },
    ...users.filter((u) => !authors.some((a) => a.userId === u.id)).map((u) => ({ value: u.id, label: userLabel(u) })),
  ];

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
            <Select
              label='Access tier'
              name='accessTier'
              control={control}
              options={TIER_OPTIONS}
              style={styles.noMargin}
              onValueChange={(v) => patchPost({ accessTier: v as BlogAccessTier })}
            />

            {/* Cover image — drag an image from the media library here, or click to open it. */}
            <div
              style={styles.field}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes(IMAGE_DND_TYPE)) e.preventDefault();
              }}
              onDrop={(e) => {
                const id = e.dataTransfer.getData(IMAGE_DND_TYPE);
                if (id) {
                  e.preventDefault();
                  patchPost({ coverImageId: id });
                }
              }}
            >
              <span style={styles.label}>Cover image</span>
              {p.draft.coverImageId ? (
                <div style={styles.coverWrap}>
                  <MediaThumb imageId={p.draft.coverImageId} res='cover' style={styles.cover} />
                  <div style={styles.coverActions}>
                    <button style={styles.smallBtn} onMouseDown={(e) => e.preventDefault()} onClick={p.onRequestCover}>
                      Replace
                    </button>
                    <button
                      style={styles.smallBtn}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => patchPost({ coverImageId: null })}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button style={styles.coverPick} onMouseDown={(e) => e.preventDefault()} onClick={p.onRequestCover}>
                  <MdImage size={18} /> Pick or drag from library
                </button>
              )}
            </div>

            {/* Country (tags the post to a country entity) */}
            <Select
              label='Country'
              name='countryId'
              control={control}
              options={countryOptions}
              style={styles.noMargin}
              onValueChange={(v) => patchPost({ countryId: v || null })}
            />

            {/* SEO keywords */}
            <TextArea
              label={`SEO keywords (${p.locale.toUpperCase()})`}
              name='seoKeywords'
              description='Comma-separated'
              control={control}
              style={styles.noMargin}
            />

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
                        className={`blog-chip${on ? ' is-active' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
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
                    <div style={styles.authorTop}>
                      <span style={styles.authorEmail}>{userName(a.userId)}</span>
                      <button style={styles.removeAuthor} onClick={() => saveAuthors(authors.filter((x) => x.userId !== a.userId))}>
                        <MdClose size={14} />
                      </button>
                    </div>
                    <div style={styles.roleToggle}>
                      {Object.values(BlogAuthorRole).map((r) => (
                        <button
                          key={r}
                          className={`blog-chip sm${a.role === r ? ' is-active' : ''}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => saveAuthors(authors.map((x) => (x.userId === a.userId ? { ...x, role: r } : x)))}
                        >
                          {titleCase(r)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Select
                label='Add author'
                name='addAuthor'
                control={control}
                options={addAuthorOptions}
                style={styles.noMargin}
                onValueChange={(v) => {
                  if (v) addAuthor(v);
                  setValue('addAuthor', '');
                }}
              />
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
    backgroundColor: t.colors.gray045,
    borderLeft: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: t.spacing.m,
    borderBottom: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
  title: { fontWeight: 700, fontSize: 16 },
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
  scrollWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { gap: t.spacing.m, padding: t.spacing.m },
  field: { gap: t.spacing.xs, flex: 1, minWidth: 0 },
  flex1: { flex: 1, minWidth: 0 },
  // Form components ship their own marginBottom; drop it so the panel's single `content` gap rules spacing.
  noMargin: { marginBottom: 0 },
  flex1Field: { flex: 1, minWidth: 0, marginBottom: 0 },
  row2: { flexDirection: 'row', gap: t.spacing.m },
  label: { fontSize: 12, fontWeight: 600, color: t.colors.blue04 },
  coverWrap: { gap: t.spacing.s },
  cover: { width: '100%', height: 140, borderRadius: t.borderRadius.default, overflow: 'hidden' },
  coverActions: { flexDirection: 'row', gap: t.spacing.s },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
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
  authorList: { gap: t.spacing.s, marginTop: t.spacing.xs, marginBottom: t.spacing.m },
  authorRow: {
    gap: t.spacing.s,
    padding: `${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray03,
  },
  authorTop: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  authorEmail: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleToggle: { flexDirection: 'row', gap: 2 },
  roleChip: {
    height: 28,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.small,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 12,
  },
  roleChipOn: {
    color: t.colors.white,
    backgroundColor: t.colors.blue + t.colorOpacity(0.25),
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.4)}`,
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
  warn: { fontSize: 12, color: t.colors.yellow },
  muted: { fontSize: 13, color: t.colors.dark05 },
}));
