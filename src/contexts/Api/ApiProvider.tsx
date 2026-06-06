import { ReactNode, useContext, useMemo } from 'react';
import {
  ACLApi,
  AstroObjectApi,
  AuthApi,
  DefaultApi,
  FileApi,
  ImageApi,
  PhotoEntryApi,
  ServerApi,
  SessionApi,
  UserApi,
} from '~/api/api';
import { Configuration } from 'src/api/configuration';
import { ApiContext } from '~/contexts/Api/ApiContext';
import { AuthContext } from '~/contexts/User/AuthContext';

type ApiProviderProps = {
  children: ReactNode;
};
export const ApiProvider = ({ children }: ApiProviderProps) => {
  const { accessToken } = useContext(AuthContext);
  const config = useMemo<Configuration>(
    () => ({
      basePath: import.meta.env.VITE_API_URL,
      accessToken: accessToken,
      isJsonMime: (mime: string) => mime === 'application/json',
    }),
    [accessToken],
  );

  const authApi = useMemo(() => config && new AuthApi(config), [config]);
  const userApi = useMemo(() => config && new UserApi(config), [config]);
  const imageApi = useMemo(() => config && new ImageApi(config), [config]);
  const sessionApi = useMemo(() => config && new SessionApi(config), [config]);
  const fileApi = useMemo(() => config && new FileApi(config), [config]);
  const serverApi = useMemo(() => config && new ServerApi(config), [config]);
  const photoEntryApi = useMemo(() => config && new PhotoEntryApi(config), [config]);
  const astroObjectApi = useMemo(() => config && new AstroObjectApi(config), [config]);
  const aclApi = useMemo(() => config && new ACLApi(config), [config]);
  const defaultApi = useMemo(() => config && new DefaultApi(config), [config]);

  return (
    <ApiContext.Provider
      value={{
        authApi,
        userApi,
        imageApi,
        sessionApi,
        fileApi,
        serverApi,
        photoEntryApi,
        astroObjectApi,
        aclApi,
        defaultApi,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
