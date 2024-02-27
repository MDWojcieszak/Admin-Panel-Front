import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { ImageDataResponse, ImageService } from '~/api/Image';

export const useImagesData = () => {
  const [data, setData] = useState<ImageDataResponse>();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const fetchData = async () => {
    try {
      const data = await ImageService.getList({
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
      });
      setData(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  return {
    data,
    pagination,
    setPagination,
    refresh: fetchData,
  };
};
