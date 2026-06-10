import { createContext } from 'react';
import {
  ACLApi,
  AstroObjectApi,
  AuthApi,
  BlogCategoriesApi,
  BlogCollectionsApi,
  BlogDocumentApi,
  BlogEditorialCommentsApi,
  BlogHomeAdminApi,
  BlogInteractionsApi,
  BlogLocalesApi,
  BlogMediaApi,
  BlogPOIApi,
  BlogPostsApi,
  BlogSectionsApi,
  BlogTemplatesApi,
  BlogVersioningApi,
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
  blogPostsApi: BlogPostsApi | false;
  blogVersioningApi: BlogVersioningApi | false;
  blogSectionsApi: BlogSectionsApi | false;
  blogLocalesApi: BlogLocalesApi | false;
  blogCategoriesApi: BlogCategoriesApi | false;
  blogPoiApi: BlogPOIApi | false;
  blogCollectionsApi: BlogCollectionsApi | false;
  blogHomeApi: BlogHomeAdminApi | false;
  blogTemplatesApi: BlogTemplatesApi | false;
  blogCommentsApi: BlogEditorialCommentsApi | false;
  blogInteractionsApi: BlogInteractionsApi | false;
  blogDocumentApi: BlogDocumentApi | false;
  blogMediaApi: BlogMediaApi | false;
};

export const ApiContext = createContext<ApiContextType | null>(null);
