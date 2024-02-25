import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileService } from '~/api/File';
import { Button } from '~/components/Button';
import { MonthYearInput } from '~/components/MonthYearInput';
import { ImageInputWithPreview } from '~/components/ImageInputWithPreview';
import { Input } from '~/components/Input';
import { SideMotionContainer, SideMotionContainerRef } from '~/components/SideMotionContainer';
import { mkUseStyles } from '~/utils/theme';
import { validateFile } from '~/utils/validation/fileValidation';
import { TextArea } from '~/components/TextArea';
import { ImageService } from '~/api/Image';
import { InternalModalProps } from '~/contexts/ModalManager/types';

const ImageSchema = z.object({
  image: z.instanceof(File, { message: 'Image is required' }).superRefine((file, ctx) => validateFile(file, ctx)),
});
type ImageSchemaType = z.infer<typeof ImageSchema>;

const ImageDataSchema = z.object({
  localization: z.string({ required_error: 'Localization is required' }).min(1, 'Localization is required'),
  dateTaken: z.date(),

  title: z.string().optional(),
  description: z.string().optional(),
});
type ImageDataSchemaType = z.infer<typeof ImageDataSchema>;
enum StepCards {
  IMAGE = 'image',
  IMAGE_DATA = 'image_data',
}

type CreateImageModalProps = Partial<InternalModalProps>;

export const CreateImageModal = (p: CreateImageModalProps) => {
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [imageId, setImageId] = useState<string>();
  const styles = useStyles();
  const containerRef = useRef<SideMotionContainerRef>(null);
  const imageFormMethods = useForm<ImageSchemaType>({
    resolver: zodResolver(ImageSchema),
  });

  const imageDataFormMethods = useForm<ImageDataSchemaType>({
    resolver: zodResolver(ImageDataSchema),
  });

  const handleUploadImage = async (data: ImageSchemaType) => {
    if (imageId) return containerRef.current?.setActiveCard(StepCards.IMAGE_DATA);
    setImageUploadLoading(true);

    try {
      const response = await FileService.uploadImage(data.image);
      setImageId(response.id);
      containerRef.current?.setActiveCard(StepCards.IMAGE_DATA);
    } catch (e) {
      imageFormMethods.setError('image', { message: 'Error uploading image' });
    }
    setImageUploadLoading(false);
  };

  const handleSubmit = async (data: ImageDataSchemaType) => {
    if (!imageId) return;
    setLoading(true);
    try {
      await ImageService.create({ ...data, imageId });
      p.handleClose?.();
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <SideMotionContainer ref={containerRef} cards={[StepCards.IMAGE, StepCards.IMAGE_DATA]} cardWidth={400}>
      <FormProvider {...imageFormMethods}>
        <form style={styles.form} onSubmit={imageFormMethods.handleSubmit(handleUploadImage)} noValidate>
          <ImageInputWithPreview name='image' description='Select Image' />
          <Button label='Next' loading={imageUploadLoading} style={styles.button} />
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
          <MonthYearInput label='Date' name='dateTaken' description='Select the month and year the photo was taken' />
          {/* TODO: add date selector */}
          <Input name='title' label='Title' description='Enter photo title' type='string' />
          <TextArea name='description' label='Description' description='Enter photo description' type='string' />

          <div style={styles.row}>
            <Button
              label='Back'
              variant='secondary'
              onClick={() => containerRef.current?.setActiveCard('image')}
              style={styles.button}
              type='button'
            />
            <Button label='Create' loading={loading} style={styles.button} />
          </div>
        </form>
      </FormProvider>
    </SideMotionContainer>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    padding: t.spacing.m,
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
