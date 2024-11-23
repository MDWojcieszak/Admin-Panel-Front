import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { MonthYearInput } from '~/components/MonthYearInput';
import { Input } from '~/components/Input';
import { mkUseStyles } from '~/utils/theme';
import { TextArea } from '~/components/TextArea';
import { ImageService } from '~/api/Image';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useImageData } from '~/routes/Images/hooks/useImageData';

const ImageDataSchema = z.object({
  localization: z.string({ required_error: 'Localization is required' }).min(1, 'Localization is required'),
  dateTaken: z.date(),

  title: z.string().optional(),
  description: z.string().optional(),
});
type ImageDataSchemaType = z.infer<typeof ImageDataSchema>;

type CreateImageModalProps = Partial<InternalModalProps> & {
  imageId?: string;
};

export const EditImageModal = (p: CreateImageModalProps) => {
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const currentImage = useImageData(p.imageId || '');
  const imageDataFormMethods = useForm<ImageDataSchemaType>({
    resolver: zodResolver(ImageDataSchema),
  });

  const handleSubmit = async (data: ImageDataSchemaType) => {
    if (!p.imageId) return;
    setLoading(true);
    try {
      await ImageService.update(p.imageId, { ...data });
      p.handleClose?.();
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <FormProvider {...imageDataFormMethods}>
        <form style={styles.form} onSubmit={imageDataFormMethods.handleSubmit(handleSubmit)} noValidate>
          <Input
            name='localization'
            label='Localization'
            defaultValue={currentImage.localization}
            description='Enter the location where the photo was taken'
            type='string'
          />
          <MonthYearInput
            label='Date'
            defaultValue={currentImage.dateTaken}
            name='dateTaken'
            description='Select the month and year the photo was taken'
          />
          <Input
            name='title'
            label='Title'
            description='Enter photo title'
            type='string'
            defaultValue={currentImage.title}
          />
          <TextArea
            defaultValue={currentImage.description}
            name='description'
            label='Description'
            description='Enter photo description'
            type='string'
          />

          <div style={styles.row}>
            <Button
              label='Cancel'
              variant='secondary'
              onClick={() => p.handleClose?.()}
              style={styles.button}
              type='button'
            />
            <Button label='Update' loading={loading} style={styles.button} />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    minWidth: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  title: {
    alignSelf: 'center',
    userSelect: 'none',
  },
  button: {
    marginTop: t.spacing.m,
    flex: 1,
  },
}));
