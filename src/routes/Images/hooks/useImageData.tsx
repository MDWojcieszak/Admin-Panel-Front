import { useEffect, useState } from 'react';
import { ImageService, ImageType } from '~/api/Image';

export const useImageData = (id: string) => {
  const [data, setData] = useState<ImageType>();

  const fetchData = async () => {
    try {
      const data = await ImageService.get({
        id,
      });
      setData(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...data,
  };
};
