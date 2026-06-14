import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PoiAdminResponse, PoiStatus } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { PlaceAutocomplete, isPlacesEnabled } from '~/components/PlaceAutocomplete';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { countryName, useBlogCountries } from '~/routes/Blog/hooks/useBlogCountries';
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
  countryId: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  websiteUrl: z.string().optional(),
  visitDurationMin: numeric,
  status: z.string(),
  rating: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

const statusLabel = (s: string) =>
  s
    .toLowerCase()
    .split('_')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');

const STATUS_OPTIONS = Object.values(PoiStatus).map((s) => ({ value: s, label: statusLabel(s) }));

// creatorRating is a raw 1–5 in the API; show editorial labels instead of bare numbers.
const RATING_OPTIONS = [
  { value: '', label: 'No rating' },
  { value: '5', label: '★★★★★ Must-see' },
  { value: '4', label: '★★★★ Highly recommended' },
  { value: '3', label: '★★★ Recommended' },
  { value: '2', label: '★★ Worth a stop' },
  { value: '1', label: '★ Skippable' },
];

export const PoiEditorModal = (p: PoiEditorModalProps) => {
  const styles = useStyles();
  const { blogPoiApi } = useApi();
  const isEdit = Boolean(p.poi);
  const canManage = p.canManage ?? true;
  const locale = p.locale ?? 'en';
  const [saving, setSaving] = useState(false);
  const [googlePlaceId, setGooglePlaceId] = useState(p.poi?.googlePlaceId ?? '');
  const { countries } = useBlogCountries();
  const countryOptions = [
    { value: '', label: 'No country' },
    ...countries.map((c) => ({ value: c.id, label: countryName(c, locale) })),
  ];
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
      countryId: '',
      region: p.poi?.region ?? '',
      city: p.poi?.city ?? '',
      websiteUrl: p.poi?.websiteUrl ?? '',
      visitDurationMin: p.poi?.visitDurationMin != null ? String(p.poi.visitDurationMin) : '',
      status: p.poi?.status ?? PoiStatus.Active,
      rating: p.poi?.creatorRating != null ? String(p.poi.creatorRating) : '',
    },
  });

  // Responses carry the country as a slug; resolve it to the FK once the countries list loads.
  useEffect(() => {
    if (!p.poi?.country || !countries.length) return;
    const match = countries.find((c) => c.slug === p.poi?.country);
    if (match) formMethods.setValue('countryId', match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, p.poi?.country]);

  const handleSave = async (data: SchemaType) => {
    if (!blogPoiApi || !canManage) return;
    setSaving(true);
    const shared = {
      name: data.name,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      address: data.address || null,
      region: data.region || null,
      city: data.city || null,
      countryId: data.countryId || null,
      googlePlaceId: googlePlaceId || null,
      status: data.status as PoiStatus,
      creatorRating: data.rating ? Number(data.rating) : null,
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
                formMethods.setValue('region', place.region ?? '');
                formMethods.setValue('city', place.city ?? '');
                setGooglePlaceId(place.googlePlaceId ?? '');
                // Match Google's country to an existing BlogCountry (ISO code first, then name/slug) and select it.
                const cc = place.countryCode?.toUpperCase();
                const cn = place.country?.toLowerCase();
                const match = countries.find(
                  (c) =>
                    (cc && c.code?.toUpperCase() === cc) ||
                    (cn &&
                      (c.slug.toLowerCase() === cn || c.translations.some((t) => t.name.toLowerCase() === cn))),
                );
                if (match) formMethods.setValue('countryId', match.id);
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
          <Select label='Country' name='countryId' control={formMethods.control} options={countryOptions} style={styles.flex} />
          <Input name='region' label='Region' description='' style={styles.flex} disableAutofill={false} />
        </div>
        <Input name='city' label='City' description='' disableAutofill={false} />

        <div style={styles.row}>
          <Select label='Status' name='status' control={formMethods.control} options={STATUS_OPTIONS} style={styles.flex} />
          <Select label='Rating' name='rating' control={formMethods.control} options={RATING_OPTIONS} style={styles.flex} />
        </div>
        <div style={styles.row}>
          <Input name='visitDurationMin' label='Visit (min)' description='' type='number' style={styles.flex} />
          <Input name='websiteUrl' label='Website' description='Optional' style={styles.flex} disableAutofill={false} />
        </div>

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
