import { api } from '~/adapters/api';
import { ApiTag } from '~/api/types';

interface FileRes {
  id: string;
}

export const FileService = {
  tag: ApiTag.FILE,

  async uploadImage(imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      return await api<any, FileRes>(FileService.tag).post('/upload/image', formData);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};
