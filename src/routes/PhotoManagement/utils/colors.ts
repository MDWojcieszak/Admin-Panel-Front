import { PhotoEntryStatus } from '~/api/api';
import { colors } from '~/utils/theme/colors';

export const getPhotoEntryStatusColors = (status: PhotoEntryStatus) => {
  switch (status) {
    case PhotoEntryStatus.Planned:
      return {
        background: 'rgba(146, 164, 177, 0.07)',
        activeBackground: 'rgba(146, 164, 177, 0.14)',
        border: 'rgba(146, 164, 177, 0.22)',
        accent: colors.dark05,
      };

    case PhotoEntryStatus.Active:
      return {
        background: 'rgba(247, 94, 121, 0.08)',
        activeBackground: 'rgba(247, 94, 121, 0.16)',
        border: 'rgba(247, 94, 121, 0.28)',
        accent: colors.red,
      };

    case PhotoEntryStatus.Selected:
      return {
        background: 'rgba(249, 248, 113, 0.07)',
        activeBackground: 'rgba(249, 248, 113, 0.15)',
        border: 'rgba(249, 248, 113, 0.22)',
        accent: colors.yellow,
      };

    case PhotoEntryStatus.Editing:
      return {
        background: 'rgba(0, 157, 248, 0.07)',
        activeBackground: 'rgba(0, 157, 248, 0.15)',
        border: 'rgba(0, 157, 248, 0.24)',
        accent: colors.blue,
      };

    case PhotoEntryStatus.Completed:
      return {
        background: 'rgba(53, 158, 122, 0.08)',
        activeBackground: 'rgba(53, 158, 122, 0.16)',
        border: 'rgba(53, 158, 122, 0.28)',
        accent: colors.mainGreen,
      };

    default:
      return {
        background: 'rgba(255, 255, 255, 0.03)',
        activeBackground: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: colors.white,
      };
  }
};
