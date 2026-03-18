import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';
import { CreateAstroObjectDto } from '~/api/api';

type CreateAstroObjectModalProps = Partial<InternalModalProps>;

enum AstroCatalog {
  MESSIER = 'M',
  NGC = 'NGC',
  IC = 'IC',
  SH2 = 'Sh2',
  BARNARD = 'B',
}

const AstroObjectSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  catalog: z.nativeEnum(AstroCatalog).optional(),
  number: z
    .string()
    .optional()
    .refine((value) => !value || /^\d+$/.test(value), 'Number must be numeric'),
  thumbnailUrl: z.string().optional(),
});

type AstroObjectFormValues = z.infer<typeof AstroObjectSchema>;

export const CreateAstroObjectModal = (p: CreateAstroObjectModalProps) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const { astroObjectApi } = useApi();

  const formMethods = useForm<AstroObjectFormValues>({
    resolver: zodResolver(AstroObjectSchema),
    defaultValues: {
      name: '',
      catalog: undefined,
      number: '',
      thumbnailUrl: '',
    },
  });

  const handleCreateAstroObject = async (data: AstroObjectFormValues) => {
    if (!astroObjectApi) return;

    setLoading(true);

    try {
      const code = data.catalog && data.number ? `${data.catalog}${data.number}` : undefined;

      const payload: CreateAstroObjectDto = {
        name: data.name,
        code,
        thumbnailUrl: data.thumbnailUrl || undefined,
      };

      await astroObjectApi.astroObjectControllerCreate({
        createAstroObjectDto: payload,
      });

      p.handleClose?.();
    } catch (error: any) {
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.row}>
        <Select
          name='catalog'
          style={styles.flex}
          label='Catalog'
          description='Select object catalog'
          options={[
            { label: 'Messier (M)', value: AstroCatalog.MESSIER },
            { label: 'NGC', value: AstroCatalog.NGC },
            { label: 'IC', value: AstroCatalog.IC },
            { label: 'Sharpless (Sh2)', value: AstroCatalog.SH2 },
            { label: 'Barnard (B)', value: AstroCatalog.BARNARD },
          ]}
        />

        <Input name='number' style={styles.flex} label='Number' description='Enter catalog number' type='number' />
      </div>
      <Input name='name' label='Name' description='Enter astro object name' type='text' />

      {/* <Input name='thumbnailUrl' label='Thumbnail URL' description='Enter thumbnail URL' type='text' /> */}

      <Button
        label='Create'
        style={{ marginTop: 100 }}
        onClick={formMethods.handleSubmit(handleCreateAstroObject)}
        loading={loading}
      />
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  row: {
    gap: t.spacing.m,
    flexDirection: 'row',
  },
  flex: {
    flex: 1,
  },
}));
