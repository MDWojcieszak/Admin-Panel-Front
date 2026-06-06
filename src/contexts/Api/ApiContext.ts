import { createContext } from 'react';
import {
  ACLApi,
  AstroObjectApi,
  AuthApi,
  DashboardApi,
  DefaultApi,
  FileApi,
  ImageApi,
  PhotoEntryApi,
  ServerApi,
  SessionApi,
  UserApi,
} from '~/api/api';

type ApiContextType = {
  authApi: AuthApi | false;
  userApi: UserApi | false;
  imageApi: ImageApi | false;
  sessionApi: SessionApi | false;
  fileApi: FileApi | false;
  serverApi: ServerApi | false;
  photoEntryApi: PhotoEntryApi | false;
  astroObjectApi: AstroObjectApi | false;
  aclApi: ACLApi | false;
  defaultApi: DefaultApi | false;
  dashboardApi: DashboardApi | false;
};

export const ApiContext = createContext<ApiContextType | null>(null);
