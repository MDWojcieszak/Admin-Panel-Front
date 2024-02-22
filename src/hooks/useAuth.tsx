import { useContext } from 'react';

import { AuthContext } from '~/contexts/User/AuthContext';

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) throw Error('Use this hook in UserContextProvider scope');

  return { ...ctx };
};
