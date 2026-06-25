import { ReactNode, useContext, useMemo } from 'react';
import {
  ACLApi,
  AstroObjectApi,
  AuthApi,
  BlogCategoriesApi,
  BlogCollectionsApi,
  BlogCountriesAdminApi,
  BlogDocumentApi,
  BlogEditorialCommentsApi,
  BlogHomeAdminApi,
  BlogInteractionsApi,
  BlogLocalesApi,
  BlogMediaApi,
  BlogPOIApi,
  BlogPostsApi,
  BlogSectionsApi,
  BlogVersioningApi,
  DashboardApi,
  DefaultApi,
  FileApi,
  ImageApi,
  NotificationsApi,
  PhotoEntryApi,
  ServerApi,
  SessionApi,
  SystemApi,
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
  const notificationsApi = useMemo(() => config && new NotificationsApi(config), [config]);
  const systemApi = useMemo(() => config && new SystemApi(config), [config]);
  const photoEntryApi = useMemo(() => config && new PhotoEntryApi(config), [config]);
  const astroObjectApi = useMemo(() => config && new AstroObjectApi(config), [config]);
  const aclApi = useMemo(() => config && new ACLApi(config), [config]);
  const defaultApi = useMemo(() => config && new DefaultApi(config), [config]);
  const dashboardApi = useMemo(() => config && new DashboardApi(config), [config]);
  const blogPostsApi = useMemo(() => config && new BlogPostsApi(config), [config]);
  const blogVersioningApi = useMemo(() => config && new BlogVersioningApi(config), [config]);
  const blogSectionsApi = useMemo(() => config && new BlogSectionsApi(config), [config]);
  const blogLocalesApi = useMemo(() => config && new BlogLocalesApi(config), [config]);
  const blogCategoriesApi = useMemo(() => config && new BlogCategoriesApi(config), [config]);
  const blogCountriesApi = useMemo(() => config && new BlogCountriesAdminApi(config), [config]);
  const blogPoiApi = useMemo(() => config && new BlogPOIApi(config), [config]);
  const blogCollectionsApi = useMemo(() => config && new BlogCollectionsApi(config), [config]);
  const blogHomeApi = useMemo(() => config && new BlogHomeAdminApi(config), [config]);
  const blogCommentsApi = useMemo(() => config && new BlogEditorialCommentsApi(config), [config]);
  const blogInteractionsApi = useMemo(() => config && new BlogInteractionsApi(config), [config]);
  const blogDocumentApi = useMemo(() => config && new BlogDocumentApi(config), [config]);
  const blogMediaApi = useMemo(() => config && new BlogMediaApi(config), [config]);

  return (
    <ApiContext.Provider
      value={{
        authApi,
        userApi,
        imageApi,
        sessionApi,
        fileApi,
        serverApi,
        notificationsApi,
        systemApi,
        photoEntryApi,
        astroObjectApi,
        aclApi,
        defaultApi,
        dashboardApi,
        blogPostsApi,
        blogVersioningApi,
        blogSectionsApi,
        blogLocalesApi,
        blogCategoriesApi,
        blogCountriesApi,
        blogPoiApi,
        blogCollectionsApi,
        blogHomeApi,
        blogCommentsApi,
        blogInteractionsApi,
        blogDocumentApi,
        blogMediaApi,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
