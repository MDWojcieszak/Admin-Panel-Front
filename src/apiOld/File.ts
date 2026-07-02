import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/apiOld/types';

const UploadFileResponse = z.object({
  id: z.string(),
});

type UploadFileResponse = z.infer<typeof UploadFileResponse>;

const MultiUploadResponse = z.object({
  images: z.array(z.object({ id: z.string() })),
  uploaded: z.number(),
  failed: z.number(),
});

type MultiUploadResponse = z.infer<typeof MultiUploadResponse>;

export const FileService = {
  tag: ApiTag.FILE,

  async uploadImage(imageFile: File): Promise<UploadFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      console.log(formData.get('file'));

      const response = await api<FormData>(FileService.tag).post('upload/image', { body: formData, type: 'FormData' });
      return UploadFileResponse.parse(response);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async uploadImages(files: File[]): Promise<MultiUploadResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await api<FormData>(FileService.tag).post('upload/images', {
        body: formData,
        type: 'FormData',
      });
      return MultiUploadResponse.parse(response);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },
};
