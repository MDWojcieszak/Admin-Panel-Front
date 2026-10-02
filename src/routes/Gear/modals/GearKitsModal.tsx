import { InternalModalProps } from '~/contexts/ModalManager/types';
import { GearKitsPanel } from '~/routes/Gear/components/GearKitsPanel';

/**
 * Kits in a dialog rather than a third tab: they are templates you set up once
 * and then expand onto sessions, so they do not need to sit beside the inventory.
 */
export const GearKitsModal = (p: Partial<InternalModalProps>) => (
  // Wide enough for the picker to show four photo tiles across.
  <div style={{ width: 'min(680px, 92vw)' }}>
    <GearKitsPanel onClose={() => p.handleClose?.()} />
  </div>
);
