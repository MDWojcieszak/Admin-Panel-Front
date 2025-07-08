import { useContext } from 'react';
import { ApiContext } from '~/contexts/Api/ApiContext';

export const useApi = () => {
  const ctx = useContext(ApiContext);

  if (!ctx) throw Error('Use this hook in ApiProvider scope');

  return ctx;
};
