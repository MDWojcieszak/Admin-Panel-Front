import { GalleryImageRole, GalleryStatus, ImageExifResponse } from '~/api/api';
import { BadgeTone } from '~/components/Badge';

/** "35mm · f/2 · 1/250 · ISO 200" — exposureTime is already a display string. */
export const exifTechSpecs = (exif?: ImageExifResponse | null): string => {
  if (!exif) return '';
  return [
    exif.focalLength ? `${exif.focalLength}mm` : null,
    exif.fNumber ? `f/${exif.fNumber}` : null,
    exif.exposureTime || null,
    exif.iso ? `ISO ${exif.iso}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
};

/** Image streams (`/image/cover?id=`, `/image/low-res?id=`) are public — build an absolute URL. */
export const imgUrl = (relative?: string | null): string | undefined =>
  relative ? `${import.meta.env.VITE_API_URL}${relative}` : undefined;

export const STATUS_TONE: Record<GalleryStatus, BadgeTone> = {
  DRAFT: 'neutral',
  PUBLISHED: 'green',
  HIDDEN: 'yellow',
  ARCHIVED: 'red',
};

export const STATUS_LABEL: Record<GalleryStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  HIDDEN: 'Hidden',
  ARCHIVED: 'Archived',
};

export const ROLE_LABEL: Record<GalleryImageRole, string> = {
  HERO: 'Hero',
  LARGE: 'Large',
  NORMAL: 'Normal',
  HIDDEN: 'Hidden',
};
