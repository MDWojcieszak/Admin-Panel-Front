import { FaPlus } from 'react-icons/fa6';
import { MdDelete, MdEdit, MdPublic } from 'react-icons/md';
import { Button } from '~/components/Button';
import { ConfirmModal } from '~/components/ConfirmModal';
import { EmptyState } from '~/components/EmptyState';
import { Loader } from '~/components/Loader';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useToast } from '~/hooks/useToast';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { countryName, useBlogCountries } from '~/routes/Blog/hooks/useBlogCountries';
import { CountryEditorModal } from '~/routes/Blog/Countries/modals/CountryEditorModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

export const BlogCountries = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCountriesApi } = useApi();
  const canManage = useCan()('blog.place.manage');
  const toast = useToast();
  const { defaultLocale } = useBlogLocales();
  const locale = defaultLocale || 'en';
  const { countries, loading, refresh } = useBlogCountries();

  const editor = useModal(
    'blog-country-editor',
    CountryEditorModal,
    { title: 'Country' },
    {
      handleClose: async () => {
        editor.hide();
        refresh();
      },
    },
  );
  const deleteModal = useModal('blog-country-delete', ConfirmModal, { title: 'Delete country' });

  const doDelete = async (id: string) => {
    if (!blogCountriesApi || !canManage) return;
    try {
      await blogCountriesApi.countryControllerDelete({ id });
      toast('Country deleted', 'success');
      refresh();
    } catch (e) {
      console.error('Error deleting country:', e);
      toast('Could not delete the country.', 'error');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Countries</h2>
        {canManage ? (
          <Button label='New country' icon={<FaPlus />} onClick={() => editor.show({ country: undefined, canManage })} />
        ) : null}
      </div>

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {loading && countries.length === 0 ? (
            <div style={styles.centered}>
              <Loader />
            </div>
          ) : countries.length === 0 ? (
            <EmptyState title='No countries yet' description='Create a country, then tag posts and places with it.' />
          ) : (
            <div style={styles.list}>
              {countries.map((c) => (
                <div key={c.id} style={styles.row}>
                  <MdPublic size={20} color={theme.colors.blue04} />
                  <div style={styles.info}>
                    <span style={styles.label}>{countryName(c, locale)}</span>
                    <span style={styles.slug}>{c.slug}</span>
                  </div>
                  <span style={styles.counts}>
                    {c.postCount} posts · {c.poiCount} places · {c.collectionCount} rankings
                  </span>
                  {canManage ? (
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} title='Edit' onClick={() => editor.show({ country: c, canManage })}>
                        <MdEdit size={18} color={theme.colors.blue04} />
                      </button>
                      <button
                        style={styles.iconBtn}
                        title='Delete'
                        onClick={() =>
                          deleteModal.show({
                            message: `Delete “${countryName(c, locale)}”?`,
                            description: 'Posts and places tagged with it keep their content but lose the country tag.',
                            confirmLabel: 'Delete',
                            danger: true,
                            onConfirm: () => doDelete(c.id),
                          })
                        }
                      >
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
  listWrap: { flex: 1, minHeight: 0, position: 'relative' },
  scroll: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  centered: { alignItems: 'center', paddingTop: 60 },
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
  label: { fontWeight: 600 },
  slug: { fontSize: 12, color: t.colors.dark05, fontFamily: 'monospace' },
  counts: { fontSize: 12, color: t.colors.dark05 },
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
