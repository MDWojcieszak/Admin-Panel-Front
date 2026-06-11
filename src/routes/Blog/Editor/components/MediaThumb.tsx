import { CSSProperties, useEffect, useState } from 'react';
import { ImageService } from '~/apiOld/Image';

type MediaThumbProps = {
  imageId: string;
  /** 'low' for small grids/thumbnails, 'cover' for larger in-document display. */
  res?: 'low' | 'cover';
  /** 'cover' fills the container (cropping); 'natural' keeps the image's own aspect ratio. */
  fit?: 'cover' | 'natural';
  /** Focal point 0..1 (x: left→right, y: top→bottom) — which part stays visible when cropping. */
  focalX?: number;
  focalY?: number;
  style?: CSSProperties;
};

/** Loads an image variant as an object URL. */
export const MediaThumb = ({ imageId, res = 'low', fit = 'cover', focalX, focalY, style }: MediaThumbProps) => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
    const load = res === 'cover' ? ImageService.getCover({ id: imageId }) : ImageService.getLowRes({ id: imageId });
    load
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
  }, [imageId, res]);

  const imgStyle: CSSProperties =
    fit === 'natural'
      ? { width: '100%', height: 'auto', display: 'block' }
      : {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: focalX != null && focalY != null ? `${focalX * 100}% ${focalY * 100}%` : 'center',
          display: 'block',
        };

  return (
    <div style={{ overflow: 'hidden', ...style }}>{url ? <img src={url} alt='' style={imgStyle} /> : null}</div>
  );
};
