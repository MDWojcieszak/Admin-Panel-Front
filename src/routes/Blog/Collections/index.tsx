import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdCollectionsBookmark, MdDelete, MdEdit, MdSearch } from 'react-icons/md';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { useCollections } from '~/routes/Blog/Collections/hooks/useCollections';
import { CollectionEditorModal } from '~/routes/Blog/Collections/modals/CollectionEditorModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const BlogCollections = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCollectionsApi } = useApi();
  const can = useCan();
  const canManage = can('blog.place.manage');

  const { defaultLocale } = useBlogLocales();
  const [locale, setLocale] = useState('');
  useEffect(() => {
    if (!locale && defaultLocale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  const { collections, search, setSearch, refresh } = useCollections();

  const editor = useModal(
    'blog-collection-editor',
    CollectionEditorModal,
    { title: 'Collection' },
    {
      handleClose: async () => {
        editor.hide();
        refresh();
      },
    },
  );

  const handleDelete = async (id: string) => {
    if (!blogCollectionsApi || !canManage) return;
    try {
      await blogCollectionsApi.collectionControllerDelete({ id });
      refresh();
    } catch (e) {
      console.error('Error deleting collection:', e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Collections</h2>
        <div style={styles.toolbarRight}>
          <div style={styles.search}>
            <MdSearch size={18} color={theme.colors.dark05} />
            <input style={styles.searchInput} placeholder='Search…' value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {canManage ? (
            <Button label='New collection' icon={<FaPlus />} onClick={() => editor.show({ locale, canManage, collection: undefined })} />
          ) : null}
        </div>
      </div>

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {!collections ? null : collections.length === 0 ? (
            <EmptyState
              icon={<MdCollectionsBookmark size={26} color={theme.colors.blue04} />}
              title='No collections yet'
              description='Group your top places into ranked collections.'
            />
          ) : (
            <div style={styles.list}>
              {collections.map((col) => (
                <div key={col.id} style={styles.row}>
                  <div style={styles.info}>
                    <span style={styles.name}>{col.title || col.slug}</span>
                    <span style={styles.meta}>
                      {[col.country, col.region].filter(Boolean).join(' · ') || 'No scope'} · {col.itemCount} place(s)
                    </span>
                  </div>
                  <Badge label={col.isPublic ? 'public' : 'private'} tone={col.isPublic ? 'green' : 'neutral'} />
                  {canManage ? (
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} title='Edit' onClick={() => editor.show({ collection: col, locale, canManage })}>
                        <MdEdit size={18} color={theme.colors.blue04} />
                      </button>
                      <button style={styles.iconBtn} title='Delete' onClick={() => handleDelete(col.id)}>
                        <MdDelete size={18} color={theme.colors.red} />
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Scrollbar>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { height: '100%', minHeight: 0, gap: t.spacing.m },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.m },
  title: { fontSize: 22, fontWeight: 700 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.m },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    paddingLeft: t.spacing.m,
    paddingRight: t.spacing.m,
    height: 40,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.6),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  searchInput: { width: 180, height: '100%', border: 0, outline: 'none', background: 'transparent', color: t.colors.white, fontSize: 14 },
  listWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  list: { gap: t.spacing.s, paddingRight: t.spacing.m },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  info: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontWeight: 600 },
  meta: { fontSize: 12, color: t.colors.dark05 },
  actions: { flexDirection: 'row', gap: 2 },
  iconBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.small,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
}));
