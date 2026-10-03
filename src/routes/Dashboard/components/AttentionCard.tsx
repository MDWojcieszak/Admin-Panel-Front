import { ReactNode, useState } from 'react';
import { FiAlertTriangle, FiCheck, FiCheckSquare, FiHelpCircle, FiShoppingCart } from 'react-icons/fi';
import { MdSdCard } from 'react-icons/md';
import { AttentionResponse, PhotoEntryDetailsResponse, PhotoEntryStatus } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { useApi } from '~/hooks/useApi';
import { useAsync } from '~/hooks/useAsync';
import { useModal } from '~/hooks/useModal';
import { useCan } from '~/hooks/usePermissions';
import { useToast } from '~/hooks/useToast';
import { STAGE_LABELS } from '~/routes/PhotoManagement/components/EntryCommentsPanel';
import { PhotoEntryDetailsModal } from '~/routes/PhotoManagement/modals/PhotoEntryDetailsModal';
import { getApiErrorMessage } from '~/utils/apiError';
import { formatAmount } from '~/utils/formatAmount';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

const formatDate = (value?: string | null) => {
  if (!value) return 'No date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
};

/**
 * Everything in the photo library that is waiting on you, from one request:
 * plans whose dates passed, material not uploaded in time, shoots with no gear
 * list, purchases due within a month and open to-dos. Each item leads to its
 * session; plans can be answered right here.
 */
export const AttentionCard = () => {
  const styles = useStyles();
  const theme = useTheme();
  const toast = useToast();
  const { photoEntryApi } = useApi();
  const can = useCan();
  const canRead = can('photoEntry.read');
  const [answering, setAnswering] = useState<string>();

  const query = useAsync<AttentionResponse>(async () => {
    if (!photoEntryApi || !canRead) return undefined;
    const { data } = await photoEntryApi.photoEntryPlanningControllerGet();
    return data;
  }, [photoEntryApi, canRead]);

  const detailsModal = useModal(
    'dashboard-entry-details',
    PhotoEntryDetailsModal,
    { title: 'Session', type: 'side' },
    {
      handleClose: async () => {
        await query.reload();
        detailsModal.hide();
      },
    },
  );

  const openEntry = async (entryId: string) => {
    if (!photoEntryApi) return;
    const { data } = await photoEntryApi.photoEntryControllerGetById({ id: entryId });
    detailsModal.show({
      entry: data as PhotoEntryDetailsResponse,
      onSaved: async () => {
        await query.reload();
      },
    });
  };

  const answerPlan = async (entryId: string, status: PhotoEntryStatus) => {
    if (!photoEntryApi) return;
    setAnswering(`${entryId}:${status}`);
    try {
      await photoEntryApi.photoEntryControllerPatchStatus({ id: entryId, patchPhotoEntryStatusDto: { status } });
      await query.reload();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not update the session.'), 'error');
    } finally {
      setAnswering(undefined);
    }
  };

  const data = query.data;
  if (!canRead || !data) return null;

  const total = Object.values(data.counts).reduce((sum, n) => sum + n, 0);
  if (!total) return null;

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>
        <FiAlertTriangle size={16} /> Needs attention
        <span style={styles.count}>{total}</span>
      </div>

      <div style={styles.grid}>
        {data.pastPlanned.length ? (
          <Section icon={<FiHelpCircle size={14} />} title='Did it happen?' count={data.counts.pastPlanned}>
            {data.pastPlanned.map((entry) => (
              <div key={entry.photoEntryId} style={styles.row}>
                <button type='button' style={styles.linkText} onClick={() => openEntry(entry.photoEntryId)}>
                  {entry.name}
                </button>
                <span style={styles.muted}>
                  {entry.daysOver} day{entry.daysOver === 1 ? '' : 's'} over
                </span>
                <div style={styles.rowActions}>
                  <Button
                    label='Cancelled'
                    variant='secondary'
                    loading={answering === `${entry.photoEntryId}:${PhotoEntryStatus.Cancelled}`}
                    onClick={() => answerPlan(entry.photoEntryId, PhotoEntryStatus.Cancelled)}
                  />
                  <Button
                    label='It happened'
                    icon={<FiCheck size={14} />}
                    loading={answering === `${entry.photoEntryId}:${PhotoEntryStatus.Shot}`}
                    onClick={() => answerPlan(entry.photoEntryId, PhotoEntryStatus.Shot)}
                  />
                </div>
              </div>
            ))}
          </Section>
        ) : null}

        {data.unsecuredOverdue.length ? (
          <Section icon={<MdSdCard size={14} />} title='Upload overdue' count={data.counts.unsecuredOverdue} tone='red'>
            {data.unsecuredOverdue.map((entry) => (
              <div key={entry.photoEntryId} style={styles.block}>
                <button type='button' style={styles.linkText} onClick={() => openEntry(entry.photoEntryId)}>
                  {entry.name}
                </button>
                {entry.items.map((item) => (
                  <span key={item.gear.id} style={styles.subRow}>
                    <span style={{ color: item.overdue ? theme.colors.red : theme.colors.white }}>
                      {gearItemLabel(item.gear)}
                    </span>
                    <span style={styles.muted}>
                      {item.secureAction} · {item.daysPending}d of {item.reminderDays}d
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </Section>
        ) : null}

        {data.openTodos.length ? (
          <Section icon={<FiCheckSquare size={14} />} title='Open to-dos' count={data.counts.openTodos}>
            {data.openTodos.map((todo) => (
              <button
                key={todo.commentId}
                type='button'
                style={styles.todo}
                onClick={() => openEntry(todo.photoEntryId)}
              >
                <span style={styles.todoBody}>{todo.body}</span>
                <span style={styles.muted}>
                  {todo.entryName} · {STAGE_LABELS[todo.stage] ?? todo.stage}
                </span>
              </button>
            ))}
          </Section>
        ) : null}

        {data.wishlistDueSoon.length ? (
          <Section icon={<FiShoppingCart size={14} />} title='To buy soon' count={data.counts.wishlistDueSoon}>
            {data.wishlistDueSoon.map((item) => (
              <div key={item.id} style={styles.row}>
                <span style={styles.itemName}>{gearItemLabel(item)}</span>
                <span style={styles.muted}>
                  by {formatDate(item.neededBy)}
                  {item.neededFor ? ` · ${item.neededFor.name}` : ''}
                </span>
                {item.estimatedPrice != null ? <Badge label={formatAmount(item.estimatedPrice)} tone='yellow' /> : null}
                {item.purchaseUrl ? (
                  <a href={item.purchaseUrl} target='_blank' rel='noreferrer' style={styles.shop}>
                    Shop
                  </a>
                ) : null}
              </div>
            ))}
          </Section>
        ) : null}

        {data.undeclared.length ? (
          <Section icon={<FiHelpCircle size={14} />} title='Gear never declared' count={data.counts.undeclared}>
            {/* Not an alarm: after the migration every old session lands here. */}
            <span style={styles.muted}>These shoots have no gear list yet — add one when you get to it.</span>
            <div style={styles.chips}>
              {data.undeclared.map((entry) => (
                <button
                  key={entry.photoEntryId}
                  type='button'
                  style={styles.chip}
                  onClick={() => openEntry(entry.photoEntryId)}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  );
};

const Section = ({
  icon,
  title,
  count,
  tone,
  children,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  tone?: 'red';
  children: ReactNode;
}) => {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div style={styles.section}>
      <div style={{ ...styles.sectionTitle, color: tone === 'red' ? theme.colors.red : theme.colors.white }}>
        {icon} {title}
        <span style={styles.count}>{count}</span>
      </div>
      {children}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  card: {
    gap: t.spacing.m,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, fontWeight: 700, fontSize: 15 },
  count: {
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: t.colors.dark05,
    backgroundColor: t.colors.white + t.colorOpacity(0.06),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: t.spacing.m,
    alignItems: 'start',
  },
  section: {
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, fontSize: 13, fontWeight: 700 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.s, flexWrap: 'wrap' },
  rowActions: { flexDirection: 'row', gap: t.spacing.xs, marginLeft: 'auto' },
  block: { gap: 2 },
  subRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: t.spacing.s,
    paddingLeft: t.spacing.s,
    fontSize: 13,
    flexWrap: 'wrap',
  },
  linkText: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
    color: t.colors.white,
  },
  itemName: { fontSize: 13, fontWeight: 600 },
  muted: { fontSize: 12, color: t.colors.dark05 },
  todo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    padding: '6px 8px',
    border: 'none',
    borderRadius: t.borderRadius.default,
    textAlign: 'left',
    cursor: 'pointer',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.3),
  },
  todoBody: { fontSize: 13, color: t.colors.white },
  shop: { fontSize: 12, color: t.colors.blue04 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.xs },
  chip: {
    padding: `${t.spacing.xs}px ${t.spacing.s}px`,
    border: 'none',
    borderRadius: t.borderRadius.default,
    fontSize: 12,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
}));
