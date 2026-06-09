import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { MdChevronLeft, MdChevronRight, MdDelete, MdEdit, MdPlace, MdSearch, MdStar } from 'react-icons/md';
import { PoiStatus } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { EmptyState } from '~/components/EmptyState';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { Scrollbar } from '~/components/Scrollbar';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { usePoiList } from '~/routes/Blog/Places/hooks/usePoiList';
import { PoiEditorModal } from '~/routes/Blog/Places/modals/PoiEditorModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: PoiStatus.Active },
  { label: 'Temp. closed', value: PoiStatus.TemporarilyClosed },
  { label: 'Closed', value: PoiStatus.PermanentlyClosed },
];

const statusTone = (s: PoiStatus) =>
  s === PoiStatus.Active ? 'green' : s === PoiStatus.TemporarilyClosed ? 'yellow' : 'red';

export const BlogPlaces = () => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogPoiApi } = useApi();
  const can = useCan();
  const canManage = can('blog.place.manage');

  const { defaultLocale } = useBlogLocales();
  const [locale, setLocale] = useState('');
  useEffect(() => {
    if (!locale && defaultLocale) setLocale(defaultLocale);
  }, [defaultLocale, locale]);

  const { pois, total, pagination, setPagination, status, setStatus, search, setSearch, refresh } = usePoiList();

  const editor = useModal(
    'blog-poi-editor',
    PoiEditorModal,
    { title: 'Place' },
    {
      handleClose: async () => {
        editor.hide();
        refresh();
      },
    },
  );

  const handleDelete = async (id: string) => {
    if (!blogPoiApi || !canManage) return;
    try {
      await blogPoiApi.poiControllerDelete({ id });
      refresh();
    } catch (e) {
      console.error('Error deleting POI:', e);
    }
  };

  const pageCount = total ? Math.ceil(total / pagination.pageSize) : 1;

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Places</h2>
        <div style={styles.toolbarRight}>
          <div style={styles.search}>
            <MdSearch size={18} color={theme.colors.dark05} />
            <input
              style={styles.searchInput}
              placeholder='Search places…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            />
          </div>
          {canManage ? (
            <Button label='New place' icon={<FaPlus />} onClick={() => editor.show({ locale, canManage, poi: undefined })} />
          ) : null}
        </div>
      </div>

      <SegmentedTabs
        layoutId='blog-poi-status'
        items={STATUS_TABS}
        selected={status ?? ''}
        handleSelect={(v) => {
          setStatus((v || undefined) as PoiStatus | undefined);
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }}
      />

      <div style={styles.listWrap}>
        <Scrollbar style={styles.scroll}>
          {!pois ? null : pois.length === 0 ? (
            <EmptyState icon={<MdPlace size={26} color={theme.colors.blue04} />} title='No places yet' description='Add a point of interest to reference it from posts.' />
          ) : (
            <div style={styles.list}>
              {pois.map((poi) => (
                <div key={poi.id} style={styles.row}>
                  <div style={styles.info}>
                    <span style={styles.name}>{poi.name}</span>
                    <span style={styles.meta}>
                      {[poi.city, poi.region, poi.country].filter(Boolean).join(', ') || 'No location set'}
                    </span>
                  </div>
                  {poi.creatorRating ? (
                    <span style={styles.rating}>
                      <MdStar size={14} color={theme.colors.yellow} /> {poi.creatorRating}
                    </span>
                  ) : null}
                  <Badge label={poi.status} tone={statusTone(poi.status)} />
                  {canManage ? (
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} title='Edit' onClick={() => editor.show({ poi, locale, canManage })}>
                        <MdEdit size={18} color={theme.colors.blue04} />
                      </button>
                      <button style={styles.iconBtn} title='Delete' onClick={() => handleDelete(poi.id)}>
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

      {pageCount > 1 ? (
        <div style={styles.pager}>
          <button
            style={styles.pagerBtn}
            disabled={pagination.pageIndex === 0}
            onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
          >
            <MdChevronLeft size={18} />
          </button>
          <span style={styles.pagerInfo}>
            {pagination.pageIndex + 1} / {pageCount}
          </span>
          <button
            style={styles.pagerBtn}
            disabled={pagination.pageIndex + 1 >= pageCount}
            onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
          >
            <MdChevronRight size={18} />
          </button>
        </div>
      ) : null}
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
  searchInput: {
    width: 200,
    height: '100%',
    border: 0,
    outline: 'none',
    background: 'transparent',
    color: t.colors.white,
    fontSize: 14,
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
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontWeight: 600,
  },
  meta: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    fontSize: 13,
    fontWeight: 700,
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
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
  },
  pagerBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.borderRadius.default,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.08)}`,
    background: 'transparent',
    color: t.colors.white,
    cursor: 'pointer',
  },
  pagerInfo: {
    fontSize: 13,
    color: t.colors.dark05,
  },
}));
