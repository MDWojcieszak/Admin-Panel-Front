import { ReactNode, useContext, useMemo } from 'react';
import { AstroObjectApi, AuthApi, FileApi, ImageApi, PhotoEntryApi, ServerApi, SessionApi, UserApi } from '~/api/api';
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

  console.log(config);

  const authApi = useMemo(() => config && new AuthApi(config), [config]);
  const userApi = useMemo(() => config && new UserApi(config), [config]);
  const imageApi = useMemo(() => config && new ImageApi(config), [config]);
  const sessionApi = useMemo(() => config && new SessionApi(config), [config]);
  const fileApi = useMemo(() => config && new FileApi(config), [config]);
  const serverApi = useMemo(() => config && new ServerApi(config), [config]);
  const photoEntryApi = useMemo(() => config && new PhotoEntryApi(config), [config]);
  const astroObjectApi = useMemo(() => config && new AstroObjectApi(config), [config]);

  return (
    <ApiContext.Provider
      value={{ authApi, userApi, imageApi, sessionApi, fileApi, serverApi, photoEntryApi, astroObjectApi }}
    >
      {children}
    </ApiContext.Provider>
  );
};
