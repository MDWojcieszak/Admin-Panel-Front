import { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdDelete, MdEdit } from 'react-icons/md';
import { CategoryKind } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { categoryLabel, useBlogCategories } from '~/routes/Blog/hooks/useBlogCategories';
import { CategoryEditorModal } from '~/routes/Blog/Categories/modals/CategoryEditorModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

const KIND_TABS = [
  { label: 'Post', value: CategoryKind.Post },
  { label: 'Attraction', value: CategoryKind.Attraction },
];

export const BlogCategories = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCategoriesApi } = useApi();
  const can = useCan();
  const canManage = can('blog.category.manage');

  const { defaultLocale } = useBlogLocales();
  const locale = defaultLocale || 'en';

  const [kind, setKind] = useState<CategoryKind>(CategoryKind.Post);
  const { categories, loading, refresh } = useBlogCategories(kind, locale || 'en');

  const editor = useModal(
    'blog-category-editor',
    CategoryEditorModal,
    { title: 'Category' },
    {
      handleClose: async () => {
        editor.hide();
        refresh();
      },
    },
  );

  const handleDelete = async (id: string) => {
    if (!blogCategoriesApi || !canManage) return;
    try {
      await blogCategoriesApi.categoryControllerDelete({ id });
      refresh();
    } catch (e) {
      console.error('Error deleting category:', e);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Categories</h2>
        <div style={styles.toolbarRight}>
          {canManage ? (
            <Button
              label='New category'
              icon={<FaPlus />}
              onClick={() => editor.show({ kind, canManage, category: undefined })}
            />
          ) : null}
        </div>
      </div>

      <SegmentedTabs
        layoutId='blog-category-kind'
        items={KIND_TABS}
        selected={kind}
        handleSelect={(v) => setKind(v as CategoryKind)}
      />

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {loading && categories.length === 0 ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : categories.length === 0 ? (
            <EmptyState title='No categories yet' description='Create a category to organise posts and places.' />
          ) : (
            <div style={styles.list}>
              {categories.map((c) => (
                <div key={c.id} style={styles.row}>
                  <span style={{ ...styles.swatch, backgroundColor: c.color || theme.colors.gray02 }} />
                  <div style={styles.info}>
                    <span style={styles.label}>{categoryLabel(c, locale)}</span>
                    <span style={styles.key}>{c.key}</span>
                  </div>
                  {c.isSystem ? <Badge label='system' tone='neutral' /> : null}
                  {canManage ? (
                    <div style={styles.actions}>
                      <button
                        style={styles.iconBtn}
                        title='Edit'
                        onClick={() => editor.show({ category: c, canManage, kind: undefined })}
                      >
                        <MdEdit size={18} color={theme.colors.blue04} />
                      </button>
                      {!c.isSystem ? (
                        <button style={styles.iconBtn} title='Delete' onClick={() => handleDelete(c.id)}>
                          <MdDelete size={18} color={theme.colors.red} />
                        </button>
                      ) : null}
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
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  listWrap: {
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
  centered: {
    alignItems: 'center',
    paddingTop: 60,
  },
  list: {
    gap: t.spacing.s,
    paddingRight: t.spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
    border: `1px solid ${t.colors.white + t.colorOpacity(0.05)}`,
  },
  swatch: {
    width: 22,
    height: 22,
    minWidth: 22,
    borderRadius: '50%',
    border: `1px solid ${t.colors.white + t.colorOpacity(0.15)}`,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontWeight: 600,
  },
  key: {
    fontSize: 12,
    color: t.colors.dark05,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 2,
  },
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
