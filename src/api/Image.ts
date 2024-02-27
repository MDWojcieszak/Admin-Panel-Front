import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag, Auth, PaginationDto } from '~/api/types';
const ImageDataDto = z.object({
  imageId: z.string(),
  localization: z.string(),
  dateTaken: z.coerce.date(),
  title: z.string().optional().nullable(),

  description: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
});

export type ImageDataDto = z.infer<typeof ImageDataDto>;

const ImageType = z.object({
  id: z.string(),
  imageId: z.string(),
  localization: z.string(),
  dateTaken: z.coerce.date(),
  title: z.string().optional().nullable(),

  description: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
});

export type ImageType = z.infer<typeof ImageType>;

const ImageDataResponse = z.object({
  total: z.number(),
  images: z.array(ImageType),
  params: PaginationDto,
});

export type ImageDataResponse = z.infer<typeof ImageDataResponse>;

const ImageId = z.object({
  id: z.string(),
});

export type ImageId = z.infer<typeof ImageId>;

export const ImageService = {
  tag: ApiTag.IMAGE,

  async create(data: ImageDataDto) {
    try {
      await api(ImageService.tag).post('create', {
        body: data,
      });
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },

  async getList(data: PaginationDto): Promise<ImageDataResponse> {
    try {
      const response = await api<PaginationDto>(ImageService.tag).get('list', {
        body: data,
      });
      return ImageDataResponse.parse(response);
    } catch (error) {
      console.error('Error getting images list:', error);
      throw error;
    }
  },

  async getCover(data: ImageId) {
    try {
      const response = await api<ImageId>(ImageService.tag).getBlob('cover', { body: data });
      return response;
    } catch (error) {
      console.error('Error getting cover image:', error);
      throw error;
    }
  },

  async getLowRes(data: ImageId) {
    try {
      const response = await api<ImageId>(ImageService.tag).getBlob('low-res', {
        body: data,
        auth: Auth.PUBLIC,
      });
      return response;
    } catch (error) {
      console.error('Error getting low-res image:', error);
      throw error;
    }
  },

  async getOriginal(data: ImageId) {
    try {
      const response = await api<ImageId>(ImageService.tag).getBlob('original', { body: data, auth: Auth.PUBLIC });
      return response;
    } catch (error) {
      console.error('Error getting original image:', error);
      throw error;
    }
  },

  async delete(data: ImageId) {
    try {
      const response = await api<ImageId>(ImageService.tag).delete('original', { body: data });
      return response;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};
