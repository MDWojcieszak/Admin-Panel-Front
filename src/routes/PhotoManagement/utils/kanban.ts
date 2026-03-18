import { PhotoEntryResponse, PhotoEntryStatus } from '~/api/api';

export const canMoveToStatus = (from: PhotoEntryStatus, to: PhotoEntryStatus) => {
  if (from === to) return false;

  return true;
};

export const hasRequiredDatesForActive = (entry: PhotoEntryResponse) => {
  return Boolean(entry.startDate && entry.endDate);
};

export const resolvePhotoEntryStatusDrop = (entry: PhotoEntryResponse, target: PhotoEntryStatus) => {
  if (!canMoveToStatus(entry.status, target)) {
    return { type: 'forbidden' as const };
  }

  return { type: 'allowed' as const };
};
