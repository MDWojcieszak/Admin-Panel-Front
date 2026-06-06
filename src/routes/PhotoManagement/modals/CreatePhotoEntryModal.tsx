import { useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiCheck, FiMoon } from 'react-icons/fi';

import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';
import { CreatePhotoEntryDto, PhotoEntryStatus, PhotoEntryType } from '~/api/api';

type AstroObjectListItem = {
  id: string;
  name: string;
  code?: string;
  aliases?: string;
};

type CreatePhotoEntryModalProps = Partial<InternalModalProps> & {
  astroObjects?: AstroObjectListItem[];
};

const PhotoEntrySchema = z
  .object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
    type: z.nativeEnum(PhotoEntryType),
    status: z.enum([PhotoEntryStatus.Planned, PhotoEntryStatus.Active]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    selectedAstroObjectIds: z.array(z.string()).optional(),
  });

type PhotoEntryFormValues = z.infer<typeof PhotoEntrySchema>;

export const CreatePhotoEntryModal = (p: CreatePhotoEntryModalProps) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const { photoEntryApi } = useApi();

  const formMethods = useForm<PhotoEntryFormValues>({
    resolver: zodResolver(PhotoEntrySchema),
    defaultValues: {
      name: '',
      type: PhotoEntryType.General,
      status: PhotoEntryStatus.Planned,
      startDate: '',
      endDate: '',
      selectedAstroObjectIds: [],
    },
  });

  const type = useWatch({ control: formMethods.control, name: 'type' });
  const selectedAstroObjectIds = useWatch({
    control: formMethods.control,
    name: 'selectedAstroObjectIds',
    defaultValue: [],
  });

  const astroObjects = useMemo(() => p.astroObjects ?? [], [p.astroObjects]);

  const toggleAstroObject = (astroObjectId: string) => {
    const current = selectedAstroObjectIds ?? [];
    const exists = current.includes(astroObjectId);

    formMethods.setValue(
      'selectedAstroObjectIds',
      exists ? current.filter((id) => id !== astroObjectId) : [...current, astroObjectId],
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const handleCreatePhotoEntry = async (data: PhotoEntryFormValues) => {
    if (!photoEntryApi) return;

    setLoading(true);

    try {
      const payload: CreatePhotoEntryDto = {
        name: data.name,
        type: data.type,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        astroObjectIds: data.type === PhotoEntryType.Astro ? data.selectedAstroObjectIds || [] : undefined,
      };

      await photoEntryApi.photoEntryControllerCreate({
        createPhotoEntryDto: payload,
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
      <Input name='name' label='Name' description='Enter photo entry name' type='text' />

      <div style={styles.row}>
        <Select
          name='type'
          style={styles.flex}
          label='Type'
          description='Select entry type'
          options={[
            { label: 'General', value: PhotoEntryType.General },
            { label: 'Work', value: PhotoEntryType.Work },
            { label: 'Astro', value: PhotoEntryType.Astro },
          ]}
        />

        <Select
          name='status'
          style={styles.flex}
          label='Status'
          description='Select entry status'
          options={[
            { label: 'Planned', value: PhotoEntryStatus.Planned },
            { label: 'Active', value: PhotoEntryStatus.Active },
          ]}
        />
      </div>

      <div style={styles.row}>
        <Input name='startDate' style={styles.flex} label='Start Date' description='Enter start date' type='date' />
        <Input name='endDate' style={styles.flex} label='End Date' description='Enter end date' type='date' />
      </div>

      {type === PhotoEntryType.Astro && (
        <div style={styles.astroSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIconWrap}>
              <FiMoon size={14} />
            </div>

            <div style={styles.sectionHeaderText}>
              <div style={styles.sectionTitle}>Astro objects (optional)</div>
              <div style={styles.sectionDescription}>
                Leave empty for general sky (Milky Way, timelapse), or pick catalogued objects to target them.
              </div>
            </div>
          </div>

          <div style={styles.astroList}>
            {astroObjects.length === 0 ? (
              <div style={styles.emptyState}>No astro objects available</div>
            ) : (
              astroObjects.map((astroObject) => {
                const checked = selectedAstroObjectIds?.includes(astroObject.id);

                return (
                  <button
                    key={astroObject.id}
                    type='button'
                    onClick={() => toggleAstroObject(astroObject.id)}
                    style={{
                      ...styles.astroItem,
                      ...(checked ? styles.astroItemActive : null),
                    }}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(checked ? styles.checkboxActive : null),
                      }}
                    >
                      {checked ? <FiCheck size={12} /> : null}
                    </div>

                    <div style={styles.astroItemContent}>
                      <div style={styles.astroItemTitle}>
                        {astroObject.code ? `${astroObject.code}` : astroObject.name}
                      </div>

                      <div style={styles.astroItemSubtitle}>{astroObject.name}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {formMethods.formState.errors.selectedAstroObjectIds ? (
            <div style={styles.errorText}>{formMethods.formState.errors.selectedAstroObjectIds.message}</div>
          ) : null}
        </div>
      )}

      <Button label='Create' onClick={formMethods.handleSubmit(handleCreatePhotoEntry)} loading={loading} />
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
  astroSection: {
    gap: t.spacing.s,
    marginBottom: t.spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.s,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    border: '1px solid rgba(168, 85, 247, 0.18)',
    color: '#D1B3FF',
  },
  sectionHeaderText: {
    gap: 2,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  sectionDescription: {
    opacity: 0.7,
    fontSize: 13,
  },
  astroList: {
    gap: t.spacing.s,
    maxHeight: 240,
    overflowY: 'auto',
    borderRadius: 12,
  },
  astroItem: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    flexDirection: 'row',
    gap: t.spacing.s,
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    textAlign: 'left',
  },
  astroItemActive: {
    border: '1px solid rgba(168, 85, 247, 0.28)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  checkbox: {
    width: 18,
    height: 18,
    minWidth: 18,
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    border: '1px solid rgba(168, 85, 247, 0.32)',
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    color: '#DCC2FF',
  },
  astroItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  astroItemTitle: {
    fontWeight: '500',
  },
  astroItemSubtitle: {
    fontSize: 12,
  },
  emptyState: {
    opacity: 0.7,
    fontSize: 13,
  },
  errorText: {
    color: t.colors.red,
    fontSize: 12,
  },
}));
