import { ReactNode, useState } from 'react';
import { FiAlertTriangle, FiEdit2, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { GearItemAdminResponse, GearItemResponse, GearMediaSource, GearOwnership } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { imgUrl } from '~/routes/Galleries/utils';
import { GearCategoryChip } from '~/routes/Gear/components/GearCategoryChip';
import { getApiErrorMessage } from '~/utils/apiError';
import { formatAmount } from '~/utils/formatAmount';
import { OWNERSHIP_LABELS, gearCategoryColor, gearCategoryIcon } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type GearItemDetailsModalProps = {
  item?: GearItemResponse;
  /** Planning fields from the flat admin list; absent until that list has loaded. */
  detail?: GearItemAdminResponse;
  systemName?: string;
  onEdit?: (item: GearItemResponse) => void;
  onDelete?: (item: GearItemResponse) => void;
  onChanged?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const formatDate = (value?: string | null): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

/**
 * Everything about one item, and the only place it can be changed from. The
 * tile used to carry a visibility switch, edit and delete all at once, which
 * made a browsing surface into a control panel — and made a stray click
 * destructive. Here those actions sit behind a deliberate open.
 */
export const GearItemDetailsModal = (p: GearItemDetailsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const item = p.item;
  const detail = p.detail;

  // Local, because re-showing a visible modal does not refresh its props.
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [saving, setSaving] = useState(false);

  if (!item) return null;

  const Icon = gearCategoryIcon(item.category);
  const owned = item.ownership === GearOwnership.Owned;
  const cover = imgUrl(item.coverUrl);

  const toggleVisible = async (next: boolean) => {
    if (!gearApi || saving) return;
    setVisible(next);
    setSaving(true);
    try {
      await gearApi.gearControllerUpdate({ id: item.id, updateGearDto: { visible: next } });
      await p.onChanged?.();
    } catch (e) {
      setVisible(!next);
      toast(getApiErrorMessage(e, 'Could not update visibility.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const neededLabel =
    item.ownership === GearOwnership.Wishlist
      ? 'Buy by'
      : item.ownership === GearOwnership.Owned
        ? 'Next used'
        : 'Still planned for';

  return (
    <div style={styles.container}>
      <div style={styles.top}>
        <div style={{ ...styles.cover, opacity: owned ? 1 : 0.6 }}>
          {cover ? (
            <img src={cover} alt='' style={styles.coverImg} />
          ) : (
            <Icon size={40} color={theme.colors[gearCategoryColor(item.category)]} />
          )}
        </div>

        <div style={styles.titleBlock}>
          <span style={styles.brand}>{item.brand}</span>
          <span style={styles.model}>{item.model}</span>
          <div style={styles.chips}>
            <GearCategoryChip category={item.category} />
            <Badge
              label={OWNERSHIP_LABELS[item.ownership]}
              tone={owned ? 'green' : item.ownership === GearOwnership.Wishlist ? 'yellow' : 'neutral'}
            />
            {detail?.priority === 0 ? <Badge label='Must have' tone='red' /> : null}
          </div>
          {item.description ? <span style={styles.description}>{item.description}</span> : null}
        </div>
      </div>

      <div style={styles.facts}>
        <Fact label='System' value={p.systemName ?? 'None (standalone)'} />
        <Fact
          label='Material'
          value={
            item.mediaSource === GearMediaSource.None
              ? 'Holds nothing to secure'
              : `Has to be secured · ${item.mediaSource}`
          }
        />
        {detail?.estimatedPrice != null ? <Fact label='Estimated price' value={formatAmount(detail.estimatedPrice)} /> : null}
        {formatDate(detail?.acquiredAt) ? <Fact label='Acquired' value={formatDate(detail?.acquiredAt)} /> : null}
        {formatDate(detail?.retiredAt) ? <Fact label='Retired' value={formatDate(detail?.retiredAt)} /> : null}
        {formatDate(detail?.neededBy) ? (
          <Fact
            label={neededLabel}
            value={`${formatDate(detail?.neededBy)}${detail?.neededFor ? ` · ${detail.neededFor.name}` : ''}`}
          />
        ) : null}
        {detail?.purchaseUrl ? (
          <Fact
            label='Shop'
            value={
              <a href={detail.purchaseUrl} target='_blank' rel='noreferrer' style={styles.link}>
                <FiExternalLink size={12} /> Open link
              </a>
            }
          />
        ) : null}
      </div>

      {detail?.missedFor.length ? (
        <div style={styles.warning}>
          <FiAlertTriangle size={14} />
          <span>{detail.missedFor.map((entry) => entry.name).join(', ')} went ahead without it — still needed?</span>
        </div>
      ) : null}

      <div style={styles.visibleRow}>
        <Switch checked={visible} onChange={toggleVisible} label='Visible on the public site' disabled={saving} />
        {owned ? null : <span style={styles.hint}>Only owned gear is ever shown publicly, whatever this says.</span>}
      </div>

      <div style={styles.actions}>
        <Button label='Delete' variant='danger' icon={<FiTrash2 size={14} />} onClick={() => p.onDelete?.(item)} />
        <div style={styles.actionsRight}>
          <Button label='Close' variant='secondary' onClick={() => p.handleClose?.()} />
          <Button label='Edit' icon={<FiEdit2 size={14} />} onClick={() => p.onEdit?.(item)} />
        </div>
      </div>
    </div>
  );
};

const Fact = ({ label, value }: { label: string; value: ReactNode }) => {
  const styles = useStyles();
  return (
    <div style={styles.fact}>
      <span style={styles.factLabel}>{label}</span>
      <span style={styles.factValue}>{value}</span>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.m, width: 'min(520px, 92vw)' },
  top: { flexDirection: 'row', gap: t.spacing.m, alignItems: 'flex-start' },
  cover: {
    width: 132,
    minWidth: 132,
    aspectRatio: '4 / 3',
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  coverImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  titleBlock: { gap: 4, minWidth: 0, flex: 1 },
  brand: { fontSize: 13, color: t.colors.dark05 },
  model: { fontSize: 20, fontWeight: 700, wordBreak: 'break-word' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, flexWrap: 'wrap', marginTop: 2 },
  description: { fontSize: 13, color: t.colors.blue04, marginTop: t.spacing.xs, whiteSpace: 'pre-wrap' },
  facts: {
    gap: 1,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
  },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: t.spacing.m,
    padding: `${t.spacing.s}px ${t.spacing.sm}px`,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
  },
  factLabel: { fontSize: 12, color: t.colors.dark05 },
  factValue: { fontSize: 13, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' },
  link: { display: 'inline-flex', alignItems: 'center', gap: 4, color: t.colors.blue },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    fontSize: 13,
    color: t.colors.yellow,
    backgroundColor: t.colors.yellow + t.colorOpacity(0.12),
    border: `1px solid ${t.colors.yellow + t.colorOpacity(0.28)}`,
  },
  visibleRow: { gap: t.spacing.xs },
  hint: { fontSize: 12, color: t.colors.dark05 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    marginTop: t.spacing.xs,
  },
  actionsRight: { flexDirection: 'row', gap: t.spacing.s },
}));
