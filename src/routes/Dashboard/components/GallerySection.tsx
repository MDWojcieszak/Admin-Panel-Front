import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { BsImages } from 'react-icons/bs';
import { MdCheckCircle, MdImageNotSupported } from 'react-icons/md';
import { DashboardGalleryResponseDto } from '~/api/api';
import { ImageService } from '~/apiOld/Image';
import { StatCard } from '~/components/StatCard';
import { mkUseStyles, useTheme } from '~/utils/theme';

const GalleryThumb = ({ imageId }: { imageId: string }) => {
  const styles = useStyles();
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let objectUrl: string | undefined;
    let active = true;
    ImageService.getLowRes({ id: imageId })
      .then((r) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(r as Blob);
        setUrl(objectUrl);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);
  return <div style={styles.thumb}>{url ? <img src={url} alt='' style={styles.thumbImg} /> : null}</div>;
};

const BarRow = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => {
  const styles = useStyles();
  return (
    <div style={styles.barRow}>
      <span style={styles.barLabel}>{label}</span>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${(count / Math.max(1, max)) * 100}%`, backgroundColor: color }} />
      </div>
      <span style={styles.barCount}>{count}</span>
    </div>
  );
};

export const GallerySection = ({ gallery }: { gallery: DashboardGalleryResponseDto }) => {
  const styles = useStyles();
  const theme = useTheme();

  const cataloguedPct = gallery.totals.images
    ? Math.round((gallery.totals.catalogued / gallery.totals.images) * 100)
    : 0;

  const authorMax = Math.max(1, ...gallery.byAuthor.map((a) => a.count));
  const locMax = Math.max(1, ...gallery.byLocalization.map((l) => l.count));
  const completeness = [
    { label: 'No author', count: gallery.completeness.withoutAuthor },
    { label: 'No title', count: gallery.completeness.withoutTitle },
    { label: 'No description', count: gallery.completeness.withoutDescription },
  ];
  const completenessMax = Math.max(1, ...completeness.map((c) => c.count));

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <BsImages size={15} color={theme.colors.blue04} />
        <span>Personal Gallery</span>
      </div>

      <div style={styles.stats}>
        <StatCard icon={<BsImages size={18} />} label='Images' value={String(gallery.totals.images)} accent='blue' />
        <StatCard
          icon={<MdCheckCircle size={20} />}
          label='Catalogued'
          value={String(gallery.totals.catalogued)}
          sub={`${cataloguedPct}% described`}
          progress={cataloguedPct}
          accent='lightGreen'
        />
        <StatCard
          icon={<MdImageNotSupported size={20} />}
          label='Missing metadata'
          value={String(gallery.totals.missingMetadata)}
          accent='yellow'
        />
      </div>

      <div style={styles.columns}>
        <div style={styles.col}>
          <span style={styles.colTitle}>Top authors</span>
          {gallery.byAuthor.length ? (
            gallery.byAuthor.map((a) => (
              <BarRow key={a.authorId} label={a.name} count={a.count} max={authorMax} color={theme.colors.purple02} />
            ))
          ) : (
            <span style={styles.muted}>No data.</span>
          )}
        </div>
        <div style={styles.col}>
          <span style={styles.colTitle}>Top localizations</span>
          {gallery.byLocalization.length ? (
            gallery.byLocalization.map((l) => (
              <BarRow key={l.key} label={l.key} count={l.count} max={locMax} color={theme.colors.blue} />
            ))
          ) : (
            <span style={styles.muted}>No data.</span>
          )}
        </div>
        <div style={styles.col}>
          <span style={styles.colTitle}>Completeness gaps</span>
          {completeness.map((c) => (
            <BarRow key={c.label} label={c.label} count={c.count} max={completenessMax} color={theme.colors.yellow} />
          ))}
        </div>
      </div>

      <div style={styles.recentBlock}>
        <span style={styles.colTitle}>Recently added</span>
        <div style={styles.recent}>
          {gallery.recent.length ? (
            gallery.recent.map((r) => (
              <div key={r.imageId} style={styles.recentItem}>
                <GalleryThumb imageId={r.imageId} />
                <div style={styles.recentInfo}>
                  <span style={styles.recentTitle}>{r.title || 'Untitled'}</span>
                  <span style={styles.recentMeta}>
                    {[r.localization, r.author].filter(Boolean).join(' · ')}
                  </span>
                  <span style={styles.recentDate}>{format(new Date(r.dateTaken), 'd MMM y')}</span>
                </div>
              </div>
            ))
          ) : (
            <span style={styles.muted}>No recent images.</span>
          )}
        </div>
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.l,
    backgroundColor: t.colors.gray03 + t.colorOpacity(0.7),
    padding: t.spacing.m,
    borderRadius: t.borderRadius.large,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
    fontWeight: 700,
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.l,
  },
  col: {
    flex: 1,
    minWidth: 240,
    gap: t.spacing.s,
  },
  colTitle: {
    fontWeight: 700,
    color: t.colors.blue04,
    marginBottom: t.spacing.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
  },
  barLabel: {
    width: 110,
    minWidth: 110,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    minWidth: 2,
    borderRadius: 4,
  },
  barCount: {
    width: 36,
    textAlign: 'right',
    fontWeight: 700,
    fontSize: 13,
  },
  recentBlock: {
    gap: t.spacing.s,
  },
  recent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing.m,
    marginTop: t.spacing.xs,
  },
  recentItem: {
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
    width: 240,
    padding: t.spacing.s,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray04 + t.colorOpacity(0.5),
  },
  recentInfo: {
    gap: 2,
    minWidth: 0,
    flex: 1,
  },
  recentTitle: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentMeta: {
    fontSize: 12,
    color: t.colors.blue04,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentDate: {
    fontSize: 11,
    color: t.colors.dark05,
  },
  thumb: {
    width: 56,
    height: 56,
    minWidth: 56,
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray05,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  muted: {
    color: t.colors.dark05,
    fontSize: 13,
  },
}));
