import { RefinementCtx } from 'zod';

const ACCEPTED_MIME_TYPE = 'image/jpeg';
const MAX_SIZE = 1024 * 1024 * 24;
export const validateFile = (file: File, checkPassComplexity: RefinementCtx) => {
  if (ACCEPTED_MIME_TYPE !== file.type) {
    checkPassComplexity.addIssue({
      code: 'custom',
      message: `File must be one of [${ACCEPTED_MIME_TYPE}] but was ${file.type}`,
    });
  }
  if (file.size > MAX_SIZE) {
    checkPassComplexity.addIssue({
      code: 'custom',
      message: `The file must not be larger than ${MAX_SIZE} bytes: ${file.size}`,
    });
  }
};
