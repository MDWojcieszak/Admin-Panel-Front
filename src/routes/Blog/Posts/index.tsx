import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa6';
import { MdSearch } from 'react-icons/md';
import { BlogPostStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { SegmentedTabs } from '~/components/SegmentedTabs';
import { useApi } from '~/hooks/useApi';
import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { BlogPostsTable, PostActionHandlers } from '~/routes/Blog/Posts/components/BlogPostsTable';
import { useBlogPosts } from '~/routes/Blog/Posts/hooks/useBlogPosts';
import { CreatePostModal } from '~/routes/Blog/Posts/modals/CreatePostModal';
import { PostInsightsModal } from '~/routes/Blog/Posts/modals/PostInsightsModal';
import { SchedulePostModal } from '~/routes/Blog/Posts/modals/SchedulePostModal';
import { mkUseStyles, useTheme } from '~/utils/theme';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Draft', value: BlogPostStatus.Draft },
  { label: 'Published', value: BlogPostStatus.Published },
  { label: 'Scheduled', value: BlogPostStatus.Scheduled },
  { label: 'Archived', value: BlogPostStatus.Archived },
];

export const BlogPosts = () => {
  const styles = useStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const { blogVersioningApi } = useApi();
  const can = useCan();
  const canWrite = can('blog.write');
  const canPublish = can('blog.publish');
  const canAnalytics = can('blog.analytics');

  const { posts, total, pagination, setPagination, status, setStatus, search, setSearch, refresh } = useBlogPosts();

  const createModal = useModal(
    'blog-create-post',
    CreatePostModal,
    { title: 'New post' },
    { handleClose: async () => createModal.hide() },
  );
  const scheduleModal = useModal(
    'blog-schedule-post',
    SchedulePostModal,
    { title: 'Schedule publication' },
    {
      handleClose: async () => {
        scheduleModal.hide();
        refresh();
      },
    },
  );
  const insightsModal = useModal(
    'blog-post-insights',
    PostInsightsModal,
    { title: 'Post insights' },
    { handleClose: async () => insightsModal.hide() },
  );

  const runLifecycle = useCallback(
    async (fn: () => Promise<unknown>) => {
      try {
        await fn();
        refresh();
      } catch (e) {
        console.error('Blog lifecycle action failed:', e);
      }
    },
    [refresh],
  );

  const actions = useMemo<PostActionHandlers>(
    () => ({
      onEdit: (id) => navigate('/blog/posts/' + id + '/edit'),
      onPublish: (id) => blogVersioningApi && runLifecycle(() => blogVersioningApi.versionControllerPublish({ id })),
      onUnpublish: (id) => blogVersioningApi && runLifecycle(() => blogVersioningApi.versionControllerUnpublish({ id })),
      onArchive: (id) => blogVersioningApi && runLifecycle(() => blogVersioningApi.versionControllerArchive({ id })),
      onRestore: (id) => blogVersioningApi && runLifecycle(() => blogVersioningApi.versionControllerRestore({ id })),
      onSchedule: (id) => scheduleModal.show({ postId: id }),
      onInsights: (id, slug) => insightsModal.show({ postId: id, slug }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [blogVersioningApi, runLifecycle, navigate],
  );

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Posts</h2>
        <div style={styles.toolbarRight}>
          <div style={styles.search}>
            <MdSearch size={18} color={theme.colors.dark05} />
            <input
              style={styles.searchInput}
              placeholder='Search slug or path…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          </div>
          {canWrite ? (
            <Button
              label='New post'
              icon={<FaPlus />}
              onClick={() => createModal.show({ onCreated: (id: string) => navigate('/blog/posts/' + id + '/edit') })}
            />
          ) : null}
        </div>
      </div>

      <SegmentedTabs
        layoutId='blog-status'
        items={STATUS_TABS}
        selected={status ?? ''}
        handleSelect={(value) => {
          setStatus((value || undefined) as BlogPostStatus | undefined);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      />

      <BlogPostsTable
        posts={posts}
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        canWrite={canWrite}
        canPublish={canPublish}
        canAnalytics={canAnalytics}
        actions={actions}
      />
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
}));
