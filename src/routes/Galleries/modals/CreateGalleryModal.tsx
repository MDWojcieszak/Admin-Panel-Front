import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type CreateGalleryModalProps = {
  onCreated?: (id: string) => void;
} & Partial<InternalModalProps>;

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const CreateGalleryModal = (p: CreateGalleryModalProps) => {
  const styles = useStyles();
  const { galleriesApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', slug: '', description: '' },
  });

  const submit = async (data: FormValues) => {
    if (!galleriesApi) return;
    setLoading(true);
    try {
      const { data: gallery } = await galleriesApi.galleriesControllerCreate({
        createGalleryDto: {
          title: data.title.trim(),
          slug: data.slug?.trim() || undefined,
          description: data.description?.trim() || undefined,
        },
      });
      toast(`Gallery "${gallery.title}" created`, 'success');
      p.onCreated?.(gallery.id);
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the gallery.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Input name='title' label='Title' description='Gallery title' type='text' control={formMethods.control} />
      <Input name='slug' label='Slug' description='URL slug (optional — auto from title)' type='text' control={formMethods.control} />
      <Input name='description' label='Description' description='Optional description' type='text' control={formMethods.control} />
      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button label='Create gallery' onClick={formMethods.handleSubmit(submit)} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 420,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
