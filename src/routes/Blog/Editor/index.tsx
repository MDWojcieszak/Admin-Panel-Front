import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle, MdCloudUpload, MdPermMedia, MdTune } from 'react-icons/md';
import { BlogSectionType } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { useBlogDraft } from '~/routes/Blog/Editor/hooks/useBlogDraft';
import { BlockEditor } from '~/routes/Blog/Editor/components/BlockEditor';
import { MediaPanel } from '~/routes/Blog/Editor/components/MediaPanel';
import { PostSettingsPanel } from '~/routes/Blog/Editor/components/PostSettingsPanel';
import { postStatusTone } from '~/routes/Blog/utils/status';
import { mkUseStyles, useTheme } from '~/utils/theme';

type SaveState = 'idle' | 'saving' | 'saved';

export const BlogPostEditor = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { blogPostsApi, blogVersioningApi, blogSectionsApi } = useApi();
  const can = useCan();
  const canPublish = can('blog.publish');

  const [mediaOpen, setMediaOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coverPickMode, setCoverPickMode] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>();

  const { locales, defaultLocale } = useBlogLocales();
  const [locale, setLocale] = useState('');
  useEffect(() => {
    if (!locale && defaultLocale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  const { draft, loading, refresh } = useBlogDraft(id, locale || undefined);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setTitle(draft?.title ?? '');
    setSubtitle(draft?.subtitle ?? '');
    setExcerpt(draft?.excerpt ?? '');
  }, [draft?.versionId, draft?.locale, draft?.title, draft?.subtitle, draft?.excerpt]);

  const saveTranslation = async (patch: { title?: string; subtitle?: string; excerpt?: string }) => {
    if (!blogPostsApi || !id || !locale) return;
    setSaveState('saving');
    try {
      await blogPostsApi.postControllerUpsertTranslation({
        id,
        locale,
        upsertPostTranslationDto: patch,
      });
      setSaveState('saved');
    } catch (e) {
      console.error('Error saving translation:', e);
      setSaveState('idle');
    }
  };

  const handlePublish = async () => {
    if (!blogVersioningApi || !id) return;
    setPublishing(true);
    try {
      await blogVersioningApi.versionControllerPublish({ id });
      await refresh();
    } catch (e) {
      console.error('Error publishing post:', e);
    } finally {
      setPublishing(false);
    }
  };

  const activeSection = draft?.sections.find((s) => s.id === activeSectionId);
  const activeLabel = activeSection?.type;

  const attachImage = async (imageId: string) => {
    // Cover-pick mode: the next image click sets the post cover, not a section image.
    if (coverPickMode) {
      setCoverPickMode(false);
      setMediaOpen(false);
      if (blogPostsApi && id) {
        try {
          await blogPostsApi.postControllerPatch({ id, patchPostDto: { coverImageId: imageId } });
          await refresh();
        } catch (e) {
          console.error('Error setting cover image:', e);
        }
      }
      return;
    }
    if (!blogSectionsApi || !activeSection) return;
    const single = activeSection.type === BlogSectionType.Image || activeSection.type === BlogSectionType.MediaText;
    try {
      if (single) {
        // Single-image blocks hold exactly one image — replace any existing.
        for (const link of activeSection.images) {
          await blogSectionsApi.sectionControllerDeleteImage({ imageId: link.id });
        }
      }
      await blogSectionsApi.sectionControllerAddImage({
        id: activeSection.id,
        addSectionImageDto: { imageId },
      });
      await refresh();
    } catch (e) {
      console.error('Error attaching image:', e);
    }
  };

  const removeImage = async (sectionImageId: string) => {
    if (!blogSectionsApi) return;
    try {
      await blogSectionsApi.sectionControllerDeleteImage({ imageId: sectionImageId });
      await refresh();
    } catch (e) {
      console.error('Error removing image:', e);
    }
  };

  const addPoi = async (sectionId: string, poiId: string) => {
    if (!blogSectionsApi) return;
    const section = draft?.sections.find((s) => s.id === sectionId);
    try {
      // PLACE blocks hold a single POI — replace any existing.
      if (section?.type === BlogSectionType.Place) {
        for (const link of section.pois) await blogSectionsApi.sectionControllerDeletePoi({ poiLinkId: link.id });
      }
      await blogSectionsApi.sectionControllerAddPoi({ id: sectionId, addSectionPoiDto: { poiId } });
      await refresh();
    } catch (e) {
      console.error('Error adding place:', e);
    }
  };

  const removePoi = async (poiLinkId: string) => {
    if (!blogSectionsApi) return;
    try {
      await blogSectionsApi.sectionControllerDeletePoi({ poiLinkId });
      await refresh();
    } catch (e) {
      console.error('Error removing place:', e);
    }
  };

  return (
    <div style={styles.screen}>
      <div style={styles.topbar}>
        <div style={styles.topLeft}>
          <button style={styles.iconBtn} title='Back to posts' onClick={() => navigate('/blog')}>
            <MdArrowBack size={20} />
          </button>
          {draft ? (
            <div style={styles.headInfo}>
              <span style={styles.slug}>{draft.slug}</span>
              <div style={styles.headMeta}>
                <Badge label={draft.status} tone={postStatusTone(draft.status)} />
                {draft.hasUnpublishedChanges ? <span style={styles.unpub}>• unpublished changes</span> : null}
              </div>
            </div>
          ) : null}
        </div>

        <div style={styles.localeSwitch}>
          {locales.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                style={{
                  ...styles.localeBtn,
                  color: active ? theme.colors.white : theme.colors.dark05,
                  backgroundColor: active ? theme.colors.blue + theme.colorOpacity(0.25) : 'transparent',
                }}
                onClick={() => setLocale(l.code)}
              >
                {l.code.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div style={styles.topRight}>
          <span style={styles.saveState}>
            {saveState === 'saving' ? (
              <>
                <MdCloudUpload size={15} color={theme.colors.blue04} /> Saving…
              </>
            ) : saveState === 'saved' ? (
              <>
                <MdCheckCircle size={15} color={theme.colors.lightGreen} /> Saved
              </>
            ) : null}
          </span>
          <button
            style={{ ...styles.iconBtn, color: settingsOpen ? theme.colors.blue : theme.colors.white }}
            title='Post settings'
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <MdTune size={18} />
          </button>
          {canPublish ? <Button label='Publish' onClick={handlePublish} loading={publishing} /> : null}
        </div>
      </div>

      <div style={styles.body}>
        <MediaPanel
          open={mediaOpen}
          activeLabel={coverPickMode ? 'cover image' : activeLabel}
          onClose={() => {
            setMediaOpen(false);
            setCoverPickMode(false);
          }}
          onPick={attachImage}
        />
        {!mediaOpen ? (
          <button style={styles.mediaToggle} title='Media' onClick={() => setMediaOpen(true)}>
            <MdPermMedia size={20} />
          </button>
        ) : null}
        {draft ? (
          <PostSettingsPanel
            open={settingsOpen}
            postId={draft.postId}
            locale={locale}
            draft={draft}
            onClose={() => setSettingsOpen(false)}
            onChanged={refresh}
            onRequestCover={() => {
              setCoverPickMode(true);
              setSettingsOpen(false);
              setMediaOpen(true);
            }}
          />
        ) : null}
        <Scrollbar style={styles.scroll}>
          <div style={styles.doc}>
            {loading && !draft ? (
              <div style={styles.centered}>
                <Loader />
              </div>
            ) : !draft ? (
              <div style={styles.centered}>Could not load the draft.</div>
            ) : (
              <>
                {draft.untranslated ? (
                  <span style={styles.untranslated}>Showing default language — not translated to {locale.toUpperCase()} yet.</span>
                ) : null}
                <textarea
                  style={styles.titleInput}
                  placeholder='Untitled post'
                  rows={1}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => title !== (draft.title ?? '') && saveTranslation({ title })}
                />
                <input
                  style={styles.subtitleInput}
                  placeholder='Subtitle (optional)'
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  onBlur={() => subtitle !== (draft.subtitle ?? '') && saveTranslation({ subtitle })}
                />
                <textarea
                  style={styles.excerptInput}
                  placeholder='Excerpt — short summary shown on cards (optional)'
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  onBlur={() => excerpt !== (draft.excerpt ?? '') && saveTranslation({ excerpt })}
                />

                <div style={styles.divider} />

                <BlockEditor
                  postId={draft.postId}
                  locale={locale}
                  sections={draft.sections}
                  activeSectionId={activeSectionId}
                  onActivate={setActiveSectionId}
                  onRemoveImage={removeImage}
                  onAddPoi={addPoi}
                  onRemovePoi={removePoi}
                  onChanged={refresh}
                />
              </>
            )}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  screen: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    backgroundColor: t.colors.gray05,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    height: 60,
    minHeight: 60,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    borderBottom: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    flex: 1,
    minWidth: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
  },
  headInfo: {
    gap: 2,
    minWidth: 0,
  },
  slug: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  unpub: {
    fontSize: 11,
    color: t.colors.yellow,
  },
  localeSwitch: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  localeBtn: {
    minWidth: 44,
    height: 30,
    border: 0,
    cursor: 'pointer',
    borderRadius: t.borderRadius.small,
    fontSize: 13,
    fontWeight: 700,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    flex: 1,
    minWidth: 0,
  },
  saveState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    fontSize: 13,
    color: t.colors.dark05,
    whiteSpace: 'nowrap',
  },
  body: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  mediaToggle: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 4,
    width: 34,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 0,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray04,
    borderTopRightRadius: t.borderRadius.default,
    borderBottomRightRadius: t.borderRadius.default,
    borderRight: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    borderBottom: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
  },
  scroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  doc: {
    width: '100%',
    maxWidth: 820,
    margin: '0 auto',
    paddingLeft: t.spacing.l,
    paddingRight: t.spacing.l,
    paddingTop: t.spacing.xl,
    paddingBottom: 120,
    gap: t.spacing.s,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    color: t.colors.dark05,
  },
  untranslated: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.12),
    padding: `4px ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    marginBottom: t.spacing.s,
  },
  titleInput: {
    border: 0,
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 38,
    fontWeight: 800,
    lineHeight: 1.15,
    fontFamily: 'inherit',
  },
  subtitleInput: {
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: t.colors.blue04,
    fontSize: 20,
    fontFamily: 'inherit',
  },
  excerptInput: {
    border: 0,
    outline: 'none',
    resize: 'vertical',
    background: 'transparent',
    color: t.colors.dark05,
    fontSize: 15,
    fontFamily: 'inherit',
    marginTop: t.spacing.s,
  },
  divider: {
    height: 1,
    backgroundColor: t.colors.white + t.colorOpacity(0.06),
    marginTop: t.spacing.l,
    marginBottom: t.spacing.l,
  },
}));
