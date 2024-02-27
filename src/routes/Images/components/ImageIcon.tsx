import { useEffect, useState } from 'react';
import { ImageService } from '~/api/Image';
import { mkUseStyles } from '~/utils/theme';
import { motion } from 'framer-motion';
type ImageIcoinProps = {
  id: string;
  handleOpenPreview: F1<string>;
};
export const ImageIcon = ({ id, handleOpenPreview }: ImageIcoinProps) => {
  const [imageData, setImageData] = useState<any>();
  const styles = useStyles();
  useEffect(() => {
    ImageService.getLowRes({ id }).then(async (r) => {
      console.log(r);
      const imageURL = URL.createObjectURL(r as any);
      setImageData(imageURL);
    });
  }, []);

  return (
    <div style={{ ...styles.container }} onClick={() => handleOpenPreview(id)}>
      {imageData && (
        <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.image} src={imageData} alt='' />
      )}
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 0,
    border: 0,
    height: 40,
    marginLeft: 10,
    width: 53,
    padding: 0,
    borderRadius: t.borderRadius.small,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));
