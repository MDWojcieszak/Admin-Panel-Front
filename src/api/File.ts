import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/api/types';

const UploadFileResponse = z.object({
  id: z.string(),
});

type UploadFileResponse = z.infer<typeof UploadFileResponse>;

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
};
