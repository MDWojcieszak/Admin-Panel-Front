import { api } from '~/adapters/api';
import { ApiTag, Auth, Role } from '~/api/types';

interface UserDto {
  email: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

interface UserId {
  id: string;
}

const User = {
  basePath: '/image',
  tag: ApiTag.IMAGE,

  async create(imageData: UserDto, auth: Auth = Auth.DEFAULT) {
    try {
      return await api<UserDto, UserId>(User.tag).post('/create', imageData, auth);
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },
};
