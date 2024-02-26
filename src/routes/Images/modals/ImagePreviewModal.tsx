import { useEffect, useState } from 'react';
import { ImageService } from '~/api/Image';
import { mkUseStyles } from '~/utils/theme';

type ImagePreviewModalProps = {
  id?: string;
};

export const ImagePreviewModal = ({ id }: ImagePreviewModalProps) => {
  const [imageData, setImageData] = useState<string>();
  const styles = useStyles();
  useEffect(() => {
    if (!id) return;
    ImageService.getCover({ id }).then(async (r) => {
      console.log(r);
      const imageURL = URL.createObjectURL(r as any);
      setImageData(imageURL);
    });
  }, [id]);

  return (
    <div style={styles.container}>
      <img style={styles.image} src={imageData} alt='Alt Text!' />
    </div>
  );
};
const useStyles = mkUseStyles((t) => ({
  container: {
    height: '60vh',
    borderRadius: t.borderRadius.default,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    objectFit: 'cover',
  },
}));
