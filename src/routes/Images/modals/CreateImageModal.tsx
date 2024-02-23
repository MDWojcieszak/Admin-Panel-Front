import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { ImageInputWithPreview } from '~/components/ImageInputWithPreview';
import { mkUseStyles } from '~/utils/theme';
import { validateFile } from '~/utils/validation/fileValidation';

const CreateImageSchema = z.object({
  image: z.instanceof(File, { message: 'Image is required' }).superRefine((file, ctx) => validateFile(file, ctx)),
  // email: z.string({ required_error: 'Email is required' }).email({ message: 'Incorrect email' }),
  // password: z.string({ required_error: 'Password is required' }).min(8, 'Password requires at least 8 characters'),
});
type CreateImageSchemaType = z.infer<typeof CreateImageSchema>;

export const CreateImageModal = () => {
  const [loading, setLoading] = useState(false);
  const styles = useStyles();
  const formMethods = useForm<CreateImageSchemaType>({
    resolver: zodResolver(CreateImageSchema),
  });

  const handleSubmit = (data: CreateImageSchemaType) => {
    console.log({ data });
    setLoading(true);
  };

  return (
    <FormProvider {...formMethods}>
      <form style={styles.form} onSubmit={formMethods.handleSubmit(handleSubmit)} noValidate>
        <ImageInputWithPreview name='image' description='Select Image' />
        <Button label='Create' loading={loading} />
      </form>
    </FormProvider>
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
  title: {
    alignSelf: 'center',
    userSelect: 'none',
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
