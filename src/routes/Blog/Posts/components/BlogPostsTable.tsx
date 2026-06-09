import { Dispatch, ReactNode, SetStateAction, useMemo } from 'react';
import { ColumnDef, PaginationState, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MdArchive, MdEdit, MdInsights, MdPublish, MdRestore, MdSchedule, MdUnpublished } from 'react-icons/md';
import { BlogPostStatus, PostResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Table } from '~/components/Table';
import { useTheme } from '~/utils/theme';
import { accessTierTone, postStatusTone } from '~/routes/Blog/utils/status';

export type PostActionHandlers = {
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onSchedule: (id: string) => void;
  onInsights: (id: string, slug: string) => void;
};

type BlogPostsTableProps = {
  posts?: PostResponse[];
  total: number;
  pagination: PaginationState;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  canWrite: boolean;
  canPublish: boolean;
  canAnalytics: boolean;
  actions: PostActionHandlers;
};

const IconButton = ({ title, color, onClick, children }: { title: string; color: string; onClick: () => void; children: ReactNode }) => (
  <motion.button
    title={title}
    onClick={onClick}
    whileHover={{ backgroundColor: color + '22' }}
    whileTap={{ scale: 0.92 }}
    style={{
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      border: 0,
      background: 'transparent',
      color,
      cursor: 'pointer',
    }}
  >
    {children}
  </motion.button>
);

const PostActions = ({
  post,
  canWrite,
  canPublish,
  canAnalytics,
  actions,
}: {
  post: PostResponse;
  canWrite: boolean;
  canPublish: boolean;
  canAnalytics: boolean;
  actions: PostActionHandlers;
}) => {
  const theme = useTheme();
  const { status, id } = post;
  return (
    <div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
      {canAnalytics ? (
        <IconButton title='Insights' color={theme.colors.blue} onClick={() => actions.onInsights(id, post.slug)}>
          <MdInsights size={18} />
        </IconButton>
      ) : null}
      {canWrite ? (
        <IconButton title='Edit' color={theme.colors.blue04} onClick={() => actions.onEdit(id)}>
          <MdEdit size={18} />
        </IconButton>
      ) : null}
      {canPublish && (status === BlogPostStatus.Draft || status === BlogPostStatus.Scheduled) ? (
        <IconButton title='Publish now' color={theme.colors.lightGreen} onClick={() => actions.onPublish(id)}>
          <MdPublish size={18} />
        </IconButton>
      ) : null}
      {canPublish && status === BlogPostStatus.Draft ? (
        <IconButton title='Schedule' color={theme.colors.blue} onClick={() => actions.onSchedule(id)}>
          <MdSchedule size={18} />
        </IconButton>
      ) : null}
      {canPublish && (status === BlogPostStatus.Published || status === BlogPostStatus.Scheduled) ? (
        <IconButton title='Unpublish' color={theme.colors.yellow} onClick={() => actions.onUnpublish(id)}>
          <MdUnpublished size={18} />
        </IconButton>
      ) : null}
      {canPublish && status !== BlogPostStatus.Archived ? (
        <IconButton title='Archive' color={theme.colors.red} onClick={() => actions.onArchive(id)}>
          <MdArchive size={18} />
        </IconButton>
      ) : null}
      {canPublish && status === BlogPostStatus.Archived ? (
        <IconButton title='Restore' color={theme.colors.lightGreen} onClick={() => actions.onRestore(id)}>
          <MdRestore size={18} />
        </IconButton>
      ) : null}
    </div>
  );
};

export const BlogPostsTable = (p: BlogPostsTableProps) => {
  const theme = useTheme();
  const defaultData = useMemo<PostResponse[]>(() => [], []);

  const columns = useMemo<ColumnDef<PostResponse>[]>(
    () => [
      {
        header: 'Slug',
        accessorKey: 'slug',
        cell: (info) => <span style={{ fontWeight: 600 }}>{info.getValue<string>()}</span>,
        minSize: 240,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => {
          const post = info.row.original;
          return (
            <div style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
              <Badge label={post.status} tone={postStatusTone(post.status)} />
              {post.hasUnpublishedChanges ? (
                <span style={{ fontSize: 11, color: theme.colors.yellow }}>• unpublished</span>
              ) : null}
            </div>
          );
        },
        maxSize: 220,
      },
      {
        header: 'Tier',
        accessorKey: 'accessTier',
        cell: (info) => <Badge label={info.row.original.accessTier} tone={accessTierTone(info.row.original.accessTier)} />,
        maxSize: 130,
      },
      {
        header: 'Authors',
        id: 'authors',
        cell: (info) => info.row.original.authors.length,
        maxSize: 90,
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: (info) => format(new Date(info.getValue<string>()), 'd MMM y · HH:mm'),
        maxSize: 170,
      },
      {
        header: '',
        id: 'actions',
        cell: (info) => (
          <PostActions
            post={info.row.original}
            canWrite={p.canWrite}
            canPublish={p.canPublish}
            canAnalytics={p.canAnalytics}
            actions={p.actions}
          />
        ),
        maxSize: 240,
      },
    ],
    [theme, p.canWrite, p.canPublish, p.canAnalytics, p.actions],
  );

  const table = useReactTable({
    data: p.posts || defaultData,
    pageCount: p.total ? Math.ceil(p.total / p.pagination.pageSize) : 1,
    columns,
    state: { pagination: p.pagination },
    manualPagination: true,
    onPaginationChange: p.setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  return <Table table={table} emptyState={{ title: 'No posts yet', description: 'Create your first blog post to get started.' }} />;
};
