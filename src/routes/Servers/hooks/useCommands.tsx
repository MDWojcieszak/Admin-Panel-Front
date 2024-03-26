import { useEffect, useState } from 'react';
import { CommandType, ServerCommandsService } from '~/api/ServerCommands';

export const useCommands = (idCategory: string) => {
  const [commands, setCommands] = useState<CommandType[]>();
  const [loading, setLoading] = useState(false);
  const handleGet = async () => {
    if (!idCategory) return;
    try {
      const response = await ServerCommandsService.getAll(idCategory);
      setCommands(response);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleGet();
  }, [idCategory]);

  return {
    commands,
    loading,
  };
};
