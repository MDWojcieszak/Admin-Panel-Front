import { FiArchive, FiBox, FiFile, FiFileText, FiImage, FiPenTool } from 'react-icons/fi';
import { MdOutlinePictureAsPdf } from 'react-icons/md';
import { DocumentKind } from '~/api/api';

/** Document URLs come from the API as paths, already signed. */
export const apiUrl = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;

export const KIND_LABEL: Record<DocumentKind, string> = {
  IMAGE: 'Image',
  PDF: 'PDF',
  MODEL_3D: '3D model',
  CAD: 'CAD',
  ARCHIVE: 'Archive',
  TEXT: 'Text',
  OTHER: 'File',
};

export const KindIcon = ({ kind, size = 22, color }: { kind: DocumentKind; size?: number; color?: string }) => {
  const props = { size, color };
  switch (kind) {
    case DocumentKind.Image:
      return <FiImage {...props} />;
    case DocumentKind.Pdf:
      return <MdOutlinePictureAsPdf {...props} />;
    case DocumentKind.Model3D:
      return <FiBox {...props} />;
    case DocumentKind.Cad:
      return <FiPenTool {...props} />;
    case DocumentKind.Archive:
      return <FiArchive {...props} />;
    case DocumentKind.Text:
      return <FiFileText {...props} />;
    default:
      return <FiFile {...props} />;
  }
};

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
};
