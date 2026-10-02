import { PhotoEntryStatus } from '~/api/api';
import { KanbanColumnId } from '~/routes/PhotoManagement/utils/kanban';
import { colors } from '~/utils/theme/colors';

export type PhotoEntryPalette = {
  background: string;
  activeBackground: string;
  border: string;
  accent: string;
};

const PALETTES = {
  slate: {
    background: 'rgba(146, 164, 177, 0.07)',
    activeBackground: 'rgba(146, 164, 177, 0.14)',
    border: 'rgba(146, 164, 177, 0.22)',
    accent: colors.dark05,
  },
  pale: {
    background: 'rgba(183, 211, 232, 0.07)',
    activeBackground: 'rgba(183, 211, 232, 0.14)',
    border: 'rgba(183, 211, 232, 0.22)',
    accent: colors.blue04,
  },
  amber: {
    background: 'rgba(249, 248, 113, 0.07)',
    activeBackground: 'rgba(249, 248, 113, 0.15)',
    border: 'rgba(249, 248, 113, 0.22)',
    accent: colors.yellow,
  },
  azure: {
    background: 'rgba(0, 157, 248, 0.07)',
    activeBackground: 'rgba(0, 157, 248, 0.15)',
    border: 'rgba(0, 157, 248, 0.24)',
    accent: colors.blue,
  },
  green: {
    background: 'rgba(53, 158, 122, 0.08)',
    activeBackground: 'rgba(53, 158, 122, 0.16)',
    border: 'rgba(53, 158, 122, 0.28)',
    accent: colors.mainGreen,
  },
  rose: {
    background: 'rgba(247, 94, 121, 0.08)',
    activeBackground: 'rgba(247, 94, 121, 0.16)',
    border: 'rgba(247, 94, 121, 0.28)',
    accent: colors.red,
  },
} satisfies Record<string, PhotoEntryPalette>;

/** Board lanes are keyed by column, because two of them share the `SHOT` status. */
const COLUMN_PALETTES: Record<KanbanColumnId, PhotoEntryPalette> = {
  PLANNED: PALETTES.slate,
  AFTER_SHOOT: PALETTES.pale,
  SELECTING: PALETTES.amber,
  EDITING: PALETTES.azure,
  FINISHED: PALETTES.green,
};

export const getKanbanColumnColors = (column: KanbanColumnId): PhotoEntryPalette => COLUMN_PALETTES[column];

/** Still keyed by status for the dashboard's by-status breakdown. */
export const getPhotoEntryStatusColors = (status: PhotoEntryStatus): PhotoEntryPalette => {
  switch (status) {
    case PhotoEntryStatus.Planned:
      return PALETTES.slate;
    case PhotoEntryStatus.Shot:
      return PALETTES.green;
    case PhotoEntryStatus.Cancelled:
      return PALETTES.rose;
    default:
      return {
        background: 'rgba(255, 255, 255, 0.03)',
        activeBackground: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: colors.white,
      };
  }
};
