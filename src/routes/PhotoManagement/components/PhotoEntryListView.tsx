import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { PhotoEntryResponse } from '~/api/api';
import { Table } from '~/components/Table';
import {
  EntryChip,
  EntryStatePill,
  formatDateRange,
  getCounters,
  getEntryStateMeta,
  getMediaChip,
  getPhotoEntryTypeMeta,
  parseDate,
} from '~/routes/PhotoManagement/utils/entryDisplay';
import { buildNameQualifiers } from '~/routes/PhotoManagement/utils/entryNames';
import { compareEntriesByDate } from '~/routes/PhotoManagement/utils/kanban';
import { mkUseStyles } from '~/utils/theme';

type PhotoEntryListViewProps = {
  entries: PhotoEntryResponse[];
  onRowClick: (entry: PhotoEntryResponse) => void;
};

const dayCount = (entry: PhotoEntryResponse): number | null => {
  const start = parseDate(entry.startDate);
  const end = parseDate(entry.endDate);
  if (!start || !end) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
};

/**
 * Every session on one compact line, newest first. The state column carries the
 * planned/shot split (hollow vs filled pill) and the row's left edge repeats it,
 * so the two read apart even when scanning down the names.
 */
export const PhotoEntryListView = ({ entries, onRowClick }: PhotoEntryListViewProps) => {
  const styles = useStyles();

  const sorted = useMemo(() => [...entries].sort(compareEntriesByDate), [entries]);
  const qualifiers = useMemo(() => buildNameQualifiers(entries), [entries]);

  const columns = useMemo<ColumnDef<PhotoEntryResponse>[]>(
    () => [
      {
        id: 'name',
        header: 'Session',
        size: 34,
        cell: ({ row }) => {
          const entry = row.original;
          const state = getEntryStateMeta(entry);
          const type = getPhotoEntryTypeMeta(entry.type);
          const TypeIcon = type.icon;
          const qualifier = qualifiers.get(entry.id);
          return (
            <div style={{ ...styles.nameCell, opacity: state.cancelled ? 0.55 : 1 }}>
              <span
                style={{
                  ...styles.edge,
                  borderLeftStyle: state.planned ? 'dashed' : 'solid',
                  borderLeftColor: state.planned ? state.border : state.accent,
                }}
              />
              <span title={type.label} style={{ ...styles.typeIcon, color: type.color }}>
                <TypeIcon size={14} />
              </span>
              <span
                style={{ ...styles.name, textDecoration: state.cancelled ? 'line-through' : 'none' }}
                title={entry.name}
              >
                {entry.name}
                {qualifier ? <span style={styles.muted}> · {qualifier}</span> : null}
              </span>
            </div>
          );
        },
      },
      {
        id: 'dates',
        header: 'Dates',
        size: 18,
        cell: ({ row }) => {
          const entry = row.original;
          const range = formatDateRange(parseDate(entry.startDate), parseDate(entry.endDate));
          const days = dayCount(entry);
          return range ? (
            <span style={styles.nowrap}>
              {range}
              {days && days > 1 ? <span style={styles.muted}> · {days} days</span> : null}
            </span>
          ) : (
            <span style={styles.muted}>No dates</span>
          );
        },
      },
      {
        id: 'state',
        header: 'State',
        size: 14,
        cell: ({ row }) => <EntryStatePill entry={row.original} />,
      },
      {
        id: 'upload',
        header: 'Material',
        size: 16,
        cell: ({ row }) => {
          const chip = getMediaChip(row.original);
          return chip ? <EntryChip chip={{ ...chip, pulse: false }} /> : <span style={styles.muted}>—</span>;
        },
      },
      {
        id: 'counters',
        header: 'Progress & notes',
        size: 20,
        cell: ({ row }) => {
          const counters = getCounters(row.original);
          if (!counters.length) return <span style={styles.muted}>—</span>;
          return (
            <div style={styles.counters}>
              {counters.map((counter) => {
                const Icon = counter.icon;
                return (
                  <span key={counter.key} title={counter.title} style={{ ...styles.counter, color: counter.color }}>
                    <Icon size={13} />
                    {counter.label}
                  </span>
                );
              })}
            </div>
          );
        },
      },
    ],
    [qualifiers, styles],
  );

  const table = useReactTable({ data: sorted, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div style={styles.container}>
      <Table
        table={table}
        hidePagination
        onRowClick={onRowClick}
        emptyState={{ title: 'No sessions', description: 'Nothing matches the current filters.' }}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    flex: 1,
    minHeight: 0,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.7),
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    minWidth: 0,
    height: 36,
  },
  edge: {
    alignSelf: 'stretch',
    borderLeftWidth: 3,
    flexShrink: 0,
  },
  typeIcon: { display: 'flex', flexShrink: 0 },
  name: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  muted: { color: t.colors.dark05, fontWeight: 400 },
  nowrap: { whiteSpace: 'nowrap', fontSize: 13 },
  counters: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
}));
