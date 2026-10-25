import { useState } from 'react';
import { DocumentResponse } from '~/api/api';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';

export type UploadTarget = { projectId?: string; taskId?: string };

export type UploadProgress = { name: string; percent: number };

/**
 * Uploads files one after another, each pinned to the target when given.
 * A file you already had comes back as the existing document, said so once.
 */
export const useDocumentUpload = (target?: UploadTarget) => {
  const { documentsApi } = useApi();
  const toast = useToast();
  const [progress, setProgress] = useState<UploadProgress>();

  const upload = async (files: File[]): Promise<DocumentResponse[]> => {
    if (!documentsApi || !files.length) return [];
    const done: DocumentResponse[] = [];
    let duplicates = 0;
    for (const file of files) {
      setProgress({ name: file.name, percent: 0 });
      try {
        const { data } = await documentsApi.documentControllerUpload(
          { file, projectId: target?.projectId, taskId: target?.taskId },
          {
            onUploadProgress: (e) =>
              setProgress({ name: file.name, percent: e.total ? Math.round((e.loaded / e.total) * 100) : 0 }),
          },
        );
        done.push(data.document);
        if (data.duplicate) duplicates++;
      } catch (e) {
        toast(getApiErrorMessage(e, `Could not upload ${file.name}.`), 'error');
      }
    }
    setProgress(undefined);
    if (duplicates) {
      toast(
        duplicates === 1
          ? 'You already had that file; the existing document was used.'
          : `You already had ${duplicates} of those files; the existing documents were used.`,
        'info',
      );
    }
    return done;
  };

  return { upload, progress, uploading: !!progress };
};
