import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdAdd, MdCheckCircle, MdDelete } from 'react-icons/md';
import {
  CategoryKind,
  HomeBlockType,
  PatchHomeBlockDto,
  UpsertHomeBlockTranslationDto,
} from '~/api/api';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useBlogCategories } from '~/routes/Blog/hooks/useBlogCategories';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { useHomeLayouts } from '~/routes/Blog/Home/hooks/useHomeLayouts';
import { HomeBlockCard } from '~/routes/Blog/Home/components/HomeBlockCard';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const BlogHome = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogHomeApi } = useApi();
  const can = useCan();
  const canManage = can('blog.home.manage');

  const { locales, defaultLocale } = useBlogLocales();
  const [locale, setLocale] = useState('');
  useEffect(() => {
    if (!locale && defaultLocale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  const { layouts, selectedId, setSelectedId, layout, refreshList, refreshLayout } = useHomeLayouts();
  const { categories } = useBlogCategories(CategoryKind.Post, locale || 'en');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => setName(layout?.name ?? ''), [layout?.id, layout?.name]);

  const createLayout = async () => {
    if (!blogHomeApi) return;
    try {
      const { data } = await blogHomeApi.homeControllerCreate({ createHomeLayoutDto: { name: 'Untitled layout' } });
      await refreshList();
      setSelectedId(data.id);
    } catch (e) {
      console.error('Error creating layout:', e);
    }
  };

  const renameLayout = async () => {
    if (!blogHomeApi || !selectedId || name === layout?.name) return;
    try {
      await blogHomeApi.homeControllerPatch({ layoutId: selectedId, patchHomeLayoutDto: { name } });
      refreshList();
    } catch (e) {
      console.error('Error renaming layout:', e);
    }
  };

  const activate = async () => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerActivate({ layoutId: selectedId });
      refreshList();
      refreshLayout();
    } catch (e) {
      console.error('Error activating layout:', e);
    }
  };

  const deleteLayout = async () => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerDelete({ layoutId: selectedId });
      setSelectedId(undefined);
      refreshList();
    } catch (e) {
      console.error('Error deleting layout:', e);
    }
  };

  const addBlock = async (type: HomeBlockType) => {
    if (!blogHomeApi || !selectedId || !layout) return;
    setPaletteOpen(false);
    const order = layout.blocks.length ? Math.max(...layout.blocks.map((b) => b.order)) + 1 : 0;
    try {
      await blogHomeApi.homeControllerCreateBlock({ layoutId: selectedId, createHomeBlockDto: { type, order } });
      refreshLayout();
    } catch (e) {
      console.error('Error adding block:', e);
    }
  };

  const patchBlock = async (blockId: string, patch: PatchHomeBlockDto) => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerPatchBlock({ layoutId: selectedId, blockId, patchHomeBlockDto: patch });
    } catch (e) {
      console.error('Error patching block:', e);
    }
  };

  const translateBlock = async (blockId: string, patch: UpsertHomeBlockTranslationDto) => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerUpsertBlockTranslation({
        layoutId: selectedId,
        blockId,
        locale,
        upsertHomeBlockTranslationDto: patch,
      });
    } catch (e) {
      console.error('Error saving block text:', e);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerDeleteBlock({ layoutId: selectedId, blockId });
      refreshLayout();
    } catch (e) {
      console.error('Error deleting block:', e);
    }
  };

  const moveBlock = async (blockId: string, dir: -1 | 1) => {
    if (!blogHomeApi || !selectedId || !layout) return;
    const ordered = [...layout.blocks].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((b) => b.id === blockId);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
    try {
      await blogHomeApi.homeControllerReorderBlocks({
        layoutId: selectedId,
        reorderHomeBlocksDto: { blocks: ordered.map((b, i) => ({ blockId: b.id, order: i })) },
      });
      refreshLayout();
    } catch (e) {
      console.error('Error reordering blocks:', e);
    }
  };

  const setPosts = async (blockId: string, posts: { postId: string; order: number }[]) => {
    if (!blogHomeApi || !selectedId) return;
    try {
      await blogHomeApi.homeControllerSetBlockPosts({
        layoutId: selectedId,
        blockId,
        setHomeBlockPostsDto: { posts },
      });
    } catch (e) {
      console.error('Error setting block posts:', e);
    }
  };

  const orderedBlocks = layout ? [...layout.blocks].sort((a, b) => a.order - b.order) : [];

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Home page</h2>
        <div style={styles.toolbarRight}>
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
          {canManage ? <Button label='New layout' icon={<FaPlus />} onClick={createLayout} /> : null}
        </div>
      </div>

      <div style={styles.layoutTabs}>
        {layouts.map((l) => (
          <button
            key={l.id}
            style={{ ...styles.layoutTab, ...(l.id === selectedId ? styles.layoutTabActive : null) }}
            onClick={() => setSelectedId(l.id)}
          >
            {l.isActive ? <MdCheckCircle size={14} color={theme.colors.lightGreen} /> : null}
            {l.name} · {l.blockCount}
          </button>
        ))}
      </div>

      {!layout ? (
        <EmptyState title='No layout selected' description='Create a home layout and add blocks to build the landing page.' />
      ) : (
        <div style={styles.editorWrap}>
          <div style={styles.layoutHeader}>
            <input style={styles.nameInput} value={name} onChange={(e) => setName(e.target.value)} onBlur={renameLayout} />
            <div style={styles.layoutActions}>
              {!layout.isActive ? <Button label='Activate' variant='secondary' onClick={activate} /> : null}
              <button style={styles.deleteBtn} title='Delete layout' onClick={deleteLayout}>
                <MdDelete size={18} color={theme.colors.red} />
              </button>
            </div>
          </div>

          <div style={styles.blocksWrap}>
            <Scrollbar style={styles.scroll}>
              <div style={styles.blocks}>
                {orderedBlocks.map((b, i) => (
                  <HomeBlockCard
                    key={b.id}
                    block={b}
                    locale={locale}
                    categories={categories}
                    isFirst={i === 0}
                    isLast={i === orderedBlocks.length - 1}
                    onPatch={patchBlock}
                    onTranslate={translateBlock}
                    onMove={moveBlock}
                    onDelete={deleteBlock}
                    onSetPosts={setPosts}
                  />
                ))}

                <div style={styles.addArea}>
                  <button style={styles.addButton} onClick={() => setPaletteOpen((o) => !o)}>
                    <MdAdd size={18} /> Add block
                  </button>
                  {paletteOpen ? (
                    <div style={styles.palette}>
                      {Object.values(HomeBlockType).map((type) => (
                        <button key={type} style={styles.paletteItem} onClick={() => addBlock(type)}>
                          {type}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Scrollbar>
          </div>
        </div>
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { height: '100%', minHeight: 0, gap: t.spacing.m },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: { fontSize: 22, fontWeight: 700 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m },
  localeSwitch: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: t.borderRadius.default, backgroundColor: t.colors.gray05 + t.colorOpacity(0.6) },
  localeBtn: { minWidth: 40, height: 30, border: 0, cursor: 'pointer', borderRadius: t.borderRadius.small, fontSize: 13, fontWeight: 700 },
  layoutTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s },
  layoutTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    height: 34,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 13,
    display: 'flex',
  },
  layoutTabActive: { color: t.colors.white, backgroundColor: t.colors.blue + t.colorOpacity(0.2), border: `1px solid ${t.colors.blue + t.colorOpacity(0.4)}` },
  editorWrap: { flex: 1, minHeight: 0, gap: t.spacing.m },
  layoutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  nameInput: {
    flex: 1,
    minWidth: 0,
    height: 40,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 16,
    fontWeight: 700,
  },
  layoutActions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s },
  deleteBtn: { width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: t.borderRadius.default, border: 0, background: 'transparent', cursor: 'pointer' },
  blocksWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  blocks: { gap: t.spacing.m, paddingRight: t.spacing.m },
  addArea: { gap: t.spacing.s, alignItems: 'flex-start' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.xs,
    height: 40,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px dashed ${t.colors.white + t.colorOpacity(0.2)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    display: 'flex',
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.s },
  paletteItem: {
    height: 34,
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.5),
    color: t.colors.white,
    cursor: 'pointer',
    fontSize: 13,
  },
}));
