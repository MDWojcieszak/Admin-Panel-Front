import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { UserDataResponse, UserService } from '~/api/User';

export const useUsersData = () => {
  const [data, setData] = useState<UserDataResponse>();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const fetchData = async () => {
    try {
      const data = await UserService.getList({
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
