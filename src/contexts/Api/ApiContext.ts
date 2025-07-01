import { createContext } from 'react';
import { AuthApi, FileApi, ImageApi, ServerApi, SessionApi, UserApi } from '~/api/api';

type ApiContextType = {
  authApi: AuthApi | false;
  userApi: UserApi | false;
  imageApi: ImageApi | false;
  sessionApi: SessionApi | false;
  fileApi: FileApi | false;
  serverApi: ServerApi | false;
};

export const ApiContext = createContext<ApiContextType | null>(null);
