import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiImage } from 'react-icons/fi';
import { getAccessToken } from '~/utils/accessToken';
import { mkUseStyles, useTheme } from '~/utils/theme';

const API = import.meta.env.VITE_API_URL;

type ImmichThumbProps = {
  /** Asset id — builds the proxy URL. Ignored when `path` is given. */
  assetId?: string;
  /** Ready proxy path (e.g. an album cover's `thumbnailUrl`), used as-is against the API base. */
  path?: string;
  fileName?: string;
  /** Immich thumbnail size — `thumbnail` is the smallest/cheapest. */
  size?: 'thumbnail' | 'preview' | 'fullsize' | 'original';
};

/**
 * Renders an Immich asset thumbnail. The browser can't send our Bearer on a plain
 * `<img src>`, so we fetch the proxy with the auth header and swap in a blob URL.
 * Lazy-loaded (IntersectionObserver) with a shimmering placeholder until it arrives.
 */
export const ImmichThumb = ({ assetId, path, fileName, size = 'thumbnail' }: ImmichThumbProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string>();
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string>();
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '250px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const url = path ? `${API}${path}` : assetId ? `${API}/immich/asset/${assetId}/thumbnail?size=${size}` : undefined;
    // Reset for the new source so a previous error/image doesn't stick when props change.
    setErrored(false);
    setSrc(undefined);
    if (!url) {
      setErrored(true);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        if (!active) return;
        // Swap blobs: revoke the previous one only once the new one is ready.
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(blob);
        setSrc(objectUrlRef.current);
      } catch {
        if (active) setErrored(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [visible, assetId, path, size]);

  // Release the blob when the tile unmounts.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  return (
    <div ref={ref} style={styles.tile} title={fileName}>
      {src ? (
        <img src={src} alt={fileName ?? ''} style={styles.img} loading='lazy' />
      ) : errored ? (
        <div style={styles.errored}>
          <FiImage size={18} color={theme.colors.dark05} />
        </div>
      ) : (
        <motion.div
          style={styles.placeholder}
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  tile: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: t.colors.gray01 + t.colorOpacity(0.7),
  },
  errored: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
