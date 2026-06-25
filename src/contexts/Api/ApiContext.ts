import { createContext } from 'react';
import {
  ACLApi,
  AstroObjectApi,
  AuthApi,
  BlogCategoriesApi,
  BlogCollectionsApi,
  BlogDocumentApi,
  BlogEditorialCommentsApi,
  BlogCountriesAdminApi,
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

type ApiContextType = {
  authApi: AuthApi | false;
  userApi: UserApi | false;
  imageApi: ImageApi | false;
  sessionApi: SessionApi | false;
  fileApi: FileApi | false;
  serverApi: ServerApi | false;
  notificationsApi: NotificationsApi | false;
  systemApi: SystemApi | false;
  photoEntryApi: PhotoEntryApi | false;
  astroObjectApi: AstroObjectApi | false;
  aclApi: ACLApi | false;
  defaultApi: DefaultApi | false;
  dashboardApi: DashboardApi | false;
  blogPostsApi: BlogPostsApi | false;
  blogVersioningApi: BlogVersioningApi | false;
  blogSectionsApi: BlogSectionsApi | false;
  blogLocalesApi: BlogLocalesApi | false;
  blogCategoriesApi: BlogCategoriesApi | false;
  blogCountriesApi: BlogCountriesAdminApi | false;
  blogPoiApi: BlogPOIApi | false;
  blogCollectionsApi: BlogCollectionsApi | false;
  blogHomeApi: BlogHomeAdminApi | false;
  blogCommentsApi: BlogEditorialCommentsApi | false;
  blogInteractionsApi: BlogInteractionsApi | false;
  blogDocumentApi: BlogDocumentApi | false;
  blogMediaApi: BlogMediaApi | false;
};

export const ApiContext = createContext<ApiContextType | null>(null);
