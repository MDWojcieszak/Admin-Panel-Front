import { useState } from 'react';
import { FiEdit2, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { GearSystemResponse } from '~/api/api';
import { Badge } from '~/components/Badge';
import { Button } from '~/components/Button';
import { Switch } from '~/components/Switch';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { imgUrl } from '~/routes/Galleries/utils';
import { getApiErrorMessage } from '~/utils/apiError';
import { gearItemLabel } from '~/utils/gearCategory';
import { mkUseStyles, useTheme } from '~/utils/theme';

type GearSystemDetailsModalProps = {
  system?: GearSystemResponse;
  onEdit?: (system: GearSystemResponse) => void;
  onDelete?: (system: GearSystemResponse) => void;
  onAddItem?: (system: GearSystemResponse) => void;
  onChanged?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

/** A system's details, and the one place its visibility, edit and delete live. */
export const GearSystemDetailsModal = (p: GearSystemDetailsModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { gearApi } = useApi();
  const toast = useToast();

  const system = p.system;

  // Local, because re-showing a visible modal does not refresh its props.
  const [visible, setVisible] = useState(system?.visible ?? true);
  const [saving, setSaving] = useState(false);

  if (!system) return null;

  const cover = imgUrl(system.coverUrl);

  const toggleVisible = async (next: boolean) => {
    if (!gearApi || saving) return;
    setVisible(next);
    setSaving(true);
    try {
      await gearApi.gearControllerUpdateSystem({ id: system.id, updateGearSystemDto: { visible: next } });
      await p.onChanged?.();
    } catch (e) {
      setVisible(!next);
      toast(getApiErrorMessage(e, 'Could not update visibility.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      {cover ? (
        // The detail is where the photo is shown large, from the full cover.
        <div style={{ ...styles.hero, opacity: 1 }}>
          <img src={cover} alt='' style={styles.heroImg} />
        </div>
      ) : null}

      <div style={styles.top}>
        {cover ? null : (
          <div style={styles.cover}>
            <FiImage size={28} color={theme.colors.dark05} />
          </div>
        )}

        <div style={styles.titleBlock}>
          <span style={styles.name}>{system.name}</span>
          <div style={styles.chips}>
            {system.label ? <Badge label={system.label} tone='blue' /> : null}
            <Badge label={`${system.items.length} item(s)`} tone='neutral' />
          </div>
          {system.description ? <span style={styles.description}>{system.description}</span> : null}
        </div>
      </div>

      {system.items.length ? (
        <span style={styles.items}>{system.items.map((item) => gearItemLabel(item)).join(' · ')}</span>
      ) : (
        <span style={styles.hint}>No items in this system yet.</span>
      )}

      <div style={styles.visibleRow}>
        <Switch checked={visible} onChange={toggleVisible} label='Visible on the public site' disabled={saving} />
        <span style={styles.hint}>Hiding a system hides its items from the public page too.</span>
      </div>

      <div style={styles.actions}>
        <Button label='Delete' variant='danger' icon={<FiTrash2 size={14} />} onClick={() => p.onDelete?.(system)} />
        <div style={styles.actionsRight}>
          <Button label='Close' variant='secondary' onClick={() => p.handleClose?.()} />
          <Button
            label='Add item'
            variant='secondary'
            icon={<FiPlus size={14} />}
            onClick={() => p.onAddItem?.(system)}
          />
          <Button label='Edit' icon={<FiEdit2 size={14} />} onClick={() => p.onEdit?.(system)} />
        </div>
      </div>
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
  hero: {
    width: '100%',
    height: 320,
    borderRadius: t.borderRadius.large,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  heroImg: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  titleBlock: { gap: 4, minWidth: 0, flex: 1 },
  name: { fontSize: 20, fontWeight: 700, wordBreak: 'break-word' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.xs, flexWrap: 'wrap' },
  description: { fontSize: 13, color: t.colors.blue04, marginTop: t.spacing.xs, whiteSpace: 'pre-wrap' },
  items: { fontSize: 13, color: t.colors.dark05, wordBreak: 'break-word' },
  visibleRow: { gap: t.spacing.xs },
  hint: { fontSize: 12, color: t.colors.dark05 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
    marginTop: t.spacing.xs,
    flexWrap: 'wrap',
  },
  actionsRight: { flexDirection: 'row', gap: t.spacing.s, flexWrap: 'wrap' },
}));
