import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { GearKitsPanel } from '~/routes/Gear/components/GearKitsPanel';
import { mkUseStyles } from '~/utils/theme';

/**
 * Kits in a dialog rather than a third tab: they are templates you set up once
 * and then expand onto sessions, so they do not need to sit beside the inventory.
 */
export const GearKitsModal = (p: Partial<InternalModalProps>) => {
  const styles = useStyles();

  return (
    <div style={styles.container}>
      <GearKitsPanel />
      <div style={styles.actions}>
        <Button label='Close' variant='secondary' onClick={() => p.handleClose?.()} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 'min(620px, 92vw)' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
