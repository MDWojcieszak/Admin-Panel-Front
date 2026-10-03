import { z } from 'zod';
import { api } from '~/adapters/api';
import { ApiTag } from '~/apiOld/types';

const UploadResponse = z.object({ id: z.string() });

type UploadResponse = z.infer<typeof UploadResponse>;

/**
 * Hand-written for one reason: the backend documents POST /gear/images with
 * `@ApiBody({ type: FileDto })`, a body of `{ id }`, so the generated
 * gearControllerUploadImage sends an id instead of the file. Once the spec
 * describes the `file` field, switch to the generated method and drop this.
 */
export const GearImageService = {
  async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api<FormData>(ApiTag.GEAR).post('images', { body: formData, type: 'FormData' });
    return UploadResponse.parse(response);
  },
};
