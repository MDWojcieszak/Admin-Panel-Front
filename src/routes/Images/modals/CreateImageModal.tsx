import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { ImageInputWithPreview } from '~/components/ImageInputWithPreview';
import { Input } from '~/components/Input';
import { mkUseStyles } from '~/utils/theme';
import { validateFile } from '~/utils/validation/fileValidation';

const ImageSchema = z.object({
  image: z.instanceof(File, { message: 'Image is required' }).superRefine((file, ctx) => validateFile(file, ctx)),
});
type ImageSchemaType = z.infer<typeof ImageSchema>;

const ImageDataSchema = z.object({
  localization: z.string(),
  dateTaken: z.date(),

  title: z.string().optional(),
  description: z.string().optional(),
});
type ImageDataSchemaType = z.infer<typeof ImageDataSchema>;
type Step = 'image' | 'imageData';

export const CreateImageModal = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('image');
  const styles = useStyles();

  const imageFormMethods = useForm<ImageSchemaType>({
    resolver: zodResolver(ImageSchema),
  });

  const imageDataFormMethods = useForm<ImageDataSchemaType>({
    resolver: zodResolver(ImageDataSchema),
  });

  const handleSelectImage = (data: ImageSchemaType) => {
    setStep('imageData');
  };

  const handleSubmit = (data: ImageDataSchemaType) => {
    console.log(data);
  };

  return (
    <>
      <FormProvider {...imageFormMethods}>
        <form style={styles.form} onSubmit={imageFormMethods.handleSubmit(handleSelectImage)} noValidate>
          <ImageInputWithPreview name='image' description='Select Image' />
          <Button label='Next' loading={loading} style={styles.button} />
        </form>
      </FormProvider>
      <FormProvider {...imageDataFormMethods}>
        <form style={styles.form} onSubmit={imageDataFormMethods.handleSubmit(handleSubmit)} noValidate>
          <Input
            name='localization'
            label='Localization'
            description='Enter the location where the photo was taken'
            type='string'
          />
          {/* TODO: add date selector */}
          <Input name='title' label='Title' description='Enter photo title' type='string' />
          <Input name='description' label='Description' description='Enter photo description' type='string' />
          <div style={styles.row}>
            <Button label='Back' variant='secondary' style={styles.button} />
            <Button label='Create' loading={loading} style={styles.button} />
          </div>
        </form>
      </FormProvider>
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    padding: t.spacing.m,
    minWidth: 500,
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
