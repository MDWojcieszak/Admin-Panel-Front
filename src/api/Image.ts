import { api } from '~/adapters/api';
import { ApiTag, Auth } from '~/api/types';

interface ImageDataDto {
  localization: string;
  dateTaken: Date;
  title: string;
  description: string;
  authorId: string;
  imageId: string;
}

interface ImageId {
  id: string;
}

const ImageService = {
  tag: ApiTag.IMAGE,

  async create(data: ImageDataDto) {
    try {
      return await api<ImageDataDto, ImageId>(ImageService.tag).post('/create', data);
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },

  async getCover(data: ImageId) {
    try {
      return await api<ImageId, any>(ImageService.tag).get('/cover', Auth.DEFAULT, data);
    } catch (error) {
      console.error('Error getting cover image:', error);
      throw error;
    }
  },

  async getLowRes(data: ImageId) {
    try {
      return await api<ImageId, any>(ImageService.tag).get('/low-res', Auth.DEFAULT, data);
    } catch (error) {
      console.error('Error getting low-res image:', error);
      throw error;
    }
  },

  async getOriginal(data: ImageId) {
    try {
      return await api<ImageId, any>(ImageService.tag).get('/original', Auth.DEFAULT, data);
    } catch (error) {
      console.error('Error getting original image:', error);
      throw error;
    }
  },

  async delete(data: ImageId) {
    try {
      return await api<ImageId, ImageId>(ImageService.tag).delete('', data);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },
};
