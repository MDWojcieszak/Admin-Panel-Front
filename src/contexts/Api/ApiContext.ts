import { createContext } from 'react';
import { AstroObjectApi, AuthApi, FileApi, ImageApi, PhotoEntryApi, ServerApi, SessionApi, UserApi } from '~/api/api';

type ApiContextType = {
  authApi: AuthApi | false;
  userApi: UserApi | false;
  imageApi: ImageApi | false;
  sessionApi: SessionApi | false;
  fileApi: FileApi | false;
  serverApi: ServerApi | false;
  photoEntryApi: PhotoEntryApi | false;
  astroObjectApi: AstroObjectApi | false;
};

export const ApiContext = createContext<ApiContextType | null>(null);
