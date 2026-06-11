import { CSSProperties, useEffect, useState } from 'react';
import { ImageService } from '~/apiOld/Image';

type MediaThumbProps = {
  imageId: string;
  /** 'low' for small grids/thumbnails, 'cover' for larger in-document display. */
  res?: 'low' | 'cover';
  style?: CSSProperties;
};

/** Loads an image variant as an object URL. */
export const MediaThumb = ({ imageId, res = 'low', style }: MediaThumbProps) => {
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

  return (
    <div style={{ overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', ...style }}>
      {url ? <img src={url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
    </div>
  );
};
