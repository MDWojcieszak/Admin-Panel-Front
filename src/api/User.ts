import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/api/types';
import { PaginationDto } from '~/api/types';
import { UserRole } from '~/types/user';

const UserDto = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  firstName: z.string(),
  lastName: z.string(),
});

export type UserDto = z.infer<typeof UserDto>;

const UserType = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(UserRole),
});

export type UserType = z.infer<typeof UserType>;

const UserDataResponse = z.object({
  total: z.number(),
  users: z.array(UserType),
  params: PaginationDto,
});

export type UserDataResponse = z.infer<typeof UserDataResponse>;

export const UserService = {
  tag: ApiTag.USER,

  async create(userData: UserDto) {
    try {
      await api(UserService.tag).post('create', {
        body: userData,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getList(data: PaginationDto): Promise<UserDataResponse> {
    try {
      const response = await api<PaginationDto>(UserService.tag).get('list', {
        body: data,
      });
      return UserDataResponse.parse(response);
    } catch (error) {
      console.error('Error getting users list:', error);
      throw error;
    }
  },
};
