import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PoiAdminResponse, PoiStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { PlaceAutocomplete, isPlacesEnabled } from '~/components/PlaceAutocomplete';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { PoiCategoriesField, PoiGalleryField, PoiHoursField } from '~/routes/Blog/Places/components/PoiEnrichment';
import { mkUseStyles } from '~/utils/theme';

type PoiEditorModalProps = {
  poi?: PoiAdminResponse;
  locale?: string;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const numeric = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Number(v)), 'Must be a number');

const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  latitude: z.string().min(1, 'Latitude is required').refine((v) => !Number.isNaN(Number(v)), 'Must be a number'),
  longitude: z.string().min(1, 'Longitude is required').refine((v) => !Number.isNaN(Number(v)), 'Must be a number'),
  address: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  websiteUrl: z.string().optional(),
  visitDurationMin: numeric,
});
type SchemaType = z.infer<typeof Schema>;

export const PoiEditorModal = (p: PoiEditorModalProps) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const isEdit = Boolean(p.poi);
  const canManage = p.canManage ?? true;
  const locale = p.locale ?? 'en';
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<PoiStatus>(p.poi?.status ?? PoiStatus.Active);
  const [rating, setRating] = useState<string>(p.poi?.creatorRating != null ? String(p.poi.creatorRating) : '');
  const [googlePlaceId, setGooglePlaceId] = useState(p.poi?.googlePlaceId ?? '');
  const [description, setDescription] = useState(
    p.poi?.translations.find((t) => t.locale === locale)?.description ?? '',
  );

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: p.poi?.name ?? '',
      latitude: p.poi?.latitude != null ? String(p.poi.latitude) : '',
      longitude: p.poi?.longitude != null ? String(p.poi.longitude) : '',
      address: p.poi?.address ?? '',
      country: p.poi?.country ?? '',
      region: p.poi?.region ?? '',
      city: p.poi?.city ?? '',
      websiteUrl: p.poi?.websiteUrl ?? '',
      visitDurationMin: p.poi?.visitDurationMin != null ? String(p.poi.visitDurationMin) : '',
    },
  });

  const handleSave = async (data: SchemaType) => {
    if (!blogPoiApi || !canManage) return;
    setSaving(true);
    const shared = {
      name: data.name,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      address: data.address || null,
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
      googlePlaceId: googlePlaceId || null,
      status,
      creatorRating: rating ? Number(rating) : null,
      visitDurationMin: data.visitDurationMin ? Number(data.visitDurationMin) : null,
      websiteUrl: data.websiteUrl || null,
    };
    try {
      if (isEdit && p.poi) {
        await blogPoiApi.poiControllerPatch({ id: p.poi.id, patchPoiDto: shared });
        await blogPoiApi.poiControllerUpsertTranslation({
          id: p.poi.id,
          locale,
          upsertPoiTranslationDto: { description: description || null },
        });
      } else {
        await blogPoiApi.poiControllerCreate({
          createPoiDto: { ...shared, locale, description: description || undefined },
        });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving POI:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        {isPlacesEnabled ? (
          <div style={styles.searchWrap}>
            <span style={styles.searchLabel}>Find on Google</span>
            <PlaceAutocomplete
              style={styles.searchInput}
              placeholder='Search a place…'
              onPlace={(place) => {
                if (place.name) formMethods.setValue('name', place.name);
                if (place.latitude != null) formMethods.setValue('latitude', String(place.latitude));
                if (place.longitude != null) formMethods.setValue('longitude', String(place.longitude));
                formMethods.setValue('address', place.address ?? '');
                formMethods.setValue('country', place.country ?? '');
                formMethods.setValue('region', place.region ?? '');
                formMethods.setValue('city', place.city ?? '');
                setGooglePlaceId(place.googlePlaceId ?? '');
              }}
            />
          </div>
        ) : (
          <span style={styles.noKey}>Google Places disabled — set VITE_GOOGLE_MAPS_API_KEY to search. Enter coordinates manually.</span>
        )}

        <Input name='name' label='Name' description='Canonical place name' disableAutofill={false} />
        <div style={styles.row}>
          <Input name='latitude' label='Latitude' description='-90…90' style={styles.flex} disableAutofill={false} />
          <Input name='longitude' label='Longitude' description='-180…180' style={styles.flex} disableAutofill={false} />
        </div>
        <Input name='address' label='Address' description='Optional' disableAutofill={false} />
        <div style={styles.row}>
          <Input name='country' label='Country' description='' style={styles.flex} disableAutofill={false} />
          <Input name='region' label='Region' description='' style={styles.flex} disableAutofill={false} />
          <Input name='city' label='City' description='' style={styles.flex} disableAutofill={false} />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <span style={styles.label}>Status</span>
            <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value as PoiStatus)}>
              {Object.values(PoiStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <span style={styles.label}>Rating (1–5)</span>
            <select style={styles.select} value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value=''>—</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <Input name='visitDurationMin' label='Visit (min)' description='' type='number' style={styles.flex} />
        </div>

        <Input name='websiteUrl' label='Website' description='Optional' disableAutofill={false} />

        <div style={styles.field}>
          <span style={styles.label}>Description ({locale.toUpperCase()})</span>
          <textarea
            style={styles.textarea}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Short localized description (optional)'
          />
        </div>

        {googlePlaceId ? <span style={styles.placeId}>googlePlaceId: {googlePlaceId}</span> : null}

        {isEdit && p.poi ? (
          <>
            <PoiCategoriesField poiId={p.poi.id} locale={locale} current={p.poi.categories.map((c) => c.categoryId)} />
            <PoiHoursField poiId={p.poi.id} current={p.poi.hours} />
            <PoiGalleryField poiId={p.poi.id} current={p.poi.images} />
          </>
        ) : (
          <span style={styles.editHint}>Create the place first, then reopen it to add categories, hours and gallery.</span>
        )}

        <Button
          label={isEdit ? 'Save place' : 'Create place'}
          onClick={formMethods.handleSubmit(handleSave)}
          loading={saving}
          disabled={!canManage}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 560,
    maxHeight: '76vh',
    overflowY: 'auto',
    paddingRight: t.spacing.s,
  },
  searchWrap: {
    gap: t.spacing.xs,
    marginBottom: t.spacing.s,
  },
  searchLabel: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  searchInput: {
    width: '100%',
    height: 44,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.blue + t.colorOpacity(0.12),
    color: t.colors.white,
    border: `1px solid ${t.colors.blue + t.colorOpacity(0.3)}`,
    outline: 'none',
    fontSize: 15,
  },
  noKey: {
    fontSize: 12,
    color: t.colors.yellow,
    marginBottom: t.spacing.s,
  },
  row: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  field: {
    flex: 1,
    minWidth: 0,
    gap: t.spacing.xs,
  },
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  select: {
    height: 38,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    colorScheme: 'dark',
    fontSize: 14,
  },
  textarea: {
    boxSizing: 'border-box',
    padding: t.spacing.m,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 14,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  placeId: {
    fontSize: 11,
    color: t.colors.dark05,
    fontFamily: 'monospace',
  },
  editHint: {
    fontSize: 12,
    color: t.colors.dark05,
    paddingTop: t.spacing.m,
    borderTop: `1px solid ${t.colors.white + t.colorOpacity(0.06)}`,
  },
}));
