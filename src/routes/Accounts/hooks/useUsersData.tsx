import { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { UserResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';

export const useUsersData = () => {
  const { userApi } = useApi();
  const [users, setUsers] = useState<UserResponseDto[]>();
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const fetchData = useCallback(async () => {
    if (!userApi) return;
    try {
      const { data } = await userApi.userControllerGetList({
        take: pagination.pageSize,
        skip: pagination.pageIndex * pagination.pageSize,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (e) {
      console.error('Error loading users:', e);
    }
  }, [userApi, pagination]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { users, total, pagination, setPagination, refresh: fetchData };
};
