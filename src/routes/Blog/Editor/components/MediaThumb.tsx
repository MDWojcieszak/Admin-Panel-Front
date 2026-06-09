import { CSSProperties, useEffect, useState } from 'react';
import { ImageService } from '~/apiOld/Image';

type MediaThumbProps = {
  imageId: string;
  style?: CSSProperties;
};

/** Loads an image's low-res variant as an object URL for thumbnails. */
export const MediaThumb = ({ imageId, style }: MediaThumbProps) => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;
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

  return (
    <div style={{ overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', ...style }}>
      {url ? <img src={url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
    </div>
  );
};
