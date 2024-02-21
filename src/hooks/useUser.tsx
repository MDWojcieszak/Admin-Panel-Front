import { useContext } from 'react';

import { UserContext } from '~/contexts/User/UserContext';

export const useUser = () => {
  const ctx = useContext(UserContext);

  if (!ctx) throw Error('Use this hook in UserContextProvider scope');

  return { ...ctx };
};
