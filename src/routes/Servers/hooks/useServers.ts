import { PaginationState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { ServerListResponseDto } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import useWebSocket from '~/hooks/useWebSocket';

export const useServers = () => {
  const [servers, setServers] = useState<ServerListResponseDto['servers']>();
  const [count, setCount] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const [loading, setLoading] = useState(false);
  const { serverApi } = useApi();

  const handleGet = async () => {
    try {
      if (!serverApi) throw new Error('Server api not avaliable');
      serverApi
        .serverControllerGetAll({ take: pagination.pageSize, skip: pagination.pageIndex * pagination.pageSize })
        .then((s) => {
          console.log(s);
          setServers(s.data.servers);
          setCount(s.data.total);
        });
    } catch (e) {
      setLoading(false);
    }
  };

  useWebSocket('server.update', handleGet);

  useEffect(() => {
    handleGet();
  }, [pagination]);

  return {
    servers,
    loading,
    pagination,
    count,
    setPagination,
  };
};
