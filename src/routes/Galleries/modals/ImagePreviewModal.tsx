import { useState } from 'react';
import { FiInfo, FiMapPin } from 'react-icons/fi';
import { ImageExifResponse } from '~/api/api';
import { ImageService, ImageType } from '~/apiOld/Image';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useAsync } from '~/hooks/useAsync';
import { exifTechSpecs, imgUrl } from '~/routes/Galleries/utils';
import { mkUseStyles, useTheme } from '~/utils/theme';

type ImagePreviewModalProps = {
  imageId: string;
  coverUrl: string;
  /** Open with the info panel already expanded (when launched from the info icon). */
  initialInfo?: boolean;
  localization?: string | null;
  exif?: ImageExifResponse | null;
} & Partial<InternalModalProps>;

export const ImagePreviewModal = (p: ImagePreviewModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const [showInfo, setShowInfo] = useState(!!p.initialInfo);

  const metaQuery = useAsync<ImageType | undefined>(
    () => ImageService.get({ id: p.imageId }).catch(() => undefined),
    [p.imageId],
  );
  const meta = metaQuery.data;
  const url = imgUrl(p.coverUrl);
  const exif = p.exif ?? undefined;
  const localization = p.localization ?? meta?.localization ?? undefined;
  const takenAt = exif?.takenAt ?? meta?.dateTaken;
  const dateStr = takenAt ? new Date(takenAt).toLocaleDateString() : undefined;
  const specs = exifTechSpecs(exif);
  const camera = [exif?.cameraMake, exif?.cameraModel].filter(Boolean).join(' ');

  return (
    <div style={styles.container}>
      <div style={styles.imageWrap}>
        {url ? <img src={url} alt={meta?.title ?? ''} style={styles.img} draggable={false} /> : null}

        {localization ? (
          <div style={styles.locLabel}>
            <FiMapPin size={12} /> {localization}
          </div>
        ) : null}

        <div style={{ ...styles.infoBtn, ...(showInfo ? styles.infoBtnActive : {}) }} onClick={() => setShowInfo((v) => !v)} title='Details'>
          <FiInfo size={16} />
        </div>

        {showInfo ? (
          <div style={styles.infoPanel}>
            {meta?.title ? <div style={styles.infoTitle}>{meta.title}</div> : null}
            {localization ? (
              <div style={styles.infoRow}>
                <span style={styles.infoKey}>Location</span>
                <span style={styles.infoVal}>{localization}</span>
              </div>
            ) : null}
            {dateStr ? (
              <div style={styles.infoRow}>
                <span style={styles.infoKey}>Date</span>
                <span style={styles.infoVal}>{dateStr}</span>
              </div>
            ) : null}
            {meta?.description ? <div style={styles.infoDesc}>{meta.description}</div> : null}

            {camera || exif?.lens || specs ? (
              <div style={styles.exifBlock}>
                {camera ? <div style={styles.exifCamera}>{camera}</div> : null}
                {exif?.lens ? <div style={styles.exifLens}>{exif.lens}</div> : null}
                {specs ? <div style={styles.exifSpecs}>{specs}</div> : null}
              </div>
            ) : (
              <span style={styles.muted}>No EXIF data.</span>
            )}
          </div>
        ) : null}
      </div>

      <span style={styles.hint}>
        <FiInfo size={12} color={theme.colors.dark05} /> tap the info icon for details
      </span>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 'min(1000px, 92vw)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  img: {
    width: '100%',
    maxHeight: '78vh',
    objectFit: 'contain',
    display: 'block',
  },
  locLabel: {
    position: 'absolute',
    left: t.spacing.s,
    bottom: t.spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
    padding: '4px 9px',
    borderRadius: 999,
  },
  infoBtn: {
    position: 'absolute',
    bottom: t.spacing.s,
    right: t.spacing.s,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    cursor: 'pointer',
    color: t.colors.white,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.55),
  },
  infoBtnActive: {
    backgroundColor: t.colors.blue,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 54,
    right: t.spacing.s,
    width: 300,
    maxWidth: '80%',
    gap: t.spacing.xs,
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.9),
    border: `1px solid ${t.colors.gray01}`,
    userSelect: 'text',
    WebkitUserSelect: 'text',
  },
  infoTitle: {
    fontWeight: 700,
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  infoKey: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'right',
  },
  infoDesc: {
    fontSize: 13,
    color: t.colors.blue04,
    marginTop: t.spacing.xxs,
  },
  muted: {
    fontSize: 13,
    color: t.colors.dark05,
  },
  exifBlock: {
    gap: 2,
    marginTop: t.spacing.xs,
    paddingTop: t.spacing.xs,
    borderTop: `1px solid ${t.colors.gray01}`,
  },
  exifCamera: {
    fontSize: 13,
    fontWeight: 600,
  },
  exifLens: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  exifSpecs: {
    fontSize: 12,
    color: t.colors.dark05,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: t.colors.dark05,
  },
}));
