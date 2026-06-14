import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlogCountryAdminResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CountryEditorModalProps = {
  country?: BlogCountryAdminResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  code: z.string().optional(),
  order: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

export const CountryEditorModal = (p: CountryEditorModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCountriesApi } = useApi();
  const { locales, defaultLocale } = useBlogLocales();
  const toast = useToast();
  const isEdit = Boolean(p.country);
  const canManage = p.canManage ?? true;
  const [saving, setSaving] = useState(false);

  const [activeLang, setActiveLang] = useState('');
  useEffect(() => {
    if (!activeLang && defaultLocale) setActiveLang(defaultLocale);
  }, [defaultLocale, activeLang]);

  const fromTranslations = (key: 'name' | 'intro') => {
    const map: Record<string, string> = {};
    (p.country?.translations ?? []).forEach((t) => {
      const v = key === 'name' ? t.name : t.intro;
      if (v) map[t.locale] = v;
    });
    return map;
  };
  const [names, setNames] = useState<Record<string, string>>(fromTranslations('name'));
  const [intros, setIntros] = useState<Record<string, string>>(fromTranslations('intro'));

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: {
      slug: p.country?.slug ?? '',
      code: p.country?.code ?? '',
      order: p.country?.order != null ? String(p.country.order) : '',
    },
  });

  const handleSave = async (data: SchemaType) => {
    if (!blogCountriesApi || !canManage) return;
    setSaving(true);
    const order = data.order ? Number(data.order) : null;
    const baseLocale = activeLang || defaultLocale;
    try {
      let id = p.country?.id;
      if (isEdit && p.country) {
        await blogCountriesApi.countryControllerPatch({
          id: p.country.id,
          patchBlogCountryDto: { slug: data.slug, code: data.code || null, order },
        });
      } else {
        const res = await blogCountriesApi.countryControllerCreate({
          createBlogCountryDto: {
            slug: data.slug,
            code: data.code || null,
            order: order ?? undefined,
            locale: baseLocale,
            name: names[baseLocale] || undefined,
          },
        });
        id = res.data.id;
      }
      // Persist every language that has a name (intro alone can't be saved — name is required).
      if (id) {
        for (const loc of locales.map((l) => l.code)) {
          const name = names[loc]?.trim();
          if (!name) continue;
          await blogCountriesApi.countryControllerUpsertTranslation({
            id,
            locale: loc,
            upsertCountryTranslationDto: { name, intro: intros[loc] || null },
          });
        }
      }
      p.handleClose?.();
    } catch (e) {
      const err = e as { response?: { status?: number } };
      console.error('Error saving country:', e);
      toast(err.response?.status === 409 ? 'That slug is already taken.' : 'Could not save the country.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <div style={styles.row}>
          <Input name='slug' label='Slug' description='URL key, unique (e.g. iceland)' style={styles.flex} disableAutofill={false} />
          <Input name='code' label='Code' description='ISO (optional)' style={styles.flex} disableAutofill={false} />
        </div>

        {/* Localized name + intro with in-modal language tabs */}
        <div style={styles.langRow}>
          <span style={styles.langLabel}>Localized text</span>
          <div style={styles.langTabs}>
            {locales.map((l) => {
              const active = l.code === activeLang;
              return (
                <button
                  key={l.code}
                  type='button'
                  style={{
                    ...styles.langTab,
                    color: active ? theme.colors.white : theme.colors.dark05,
                    backgroundColor: active ? theme.colors.blue + theme.colorOpacity(0.25) : 'transparent',
                  }}
                  onClick={() => setActiveLang(l.code)}
                >
                  {l.code.toUpperCase()}
                  {names[l.code] ? <span style={styles.dot} /> : null}
                </button>
              );
            })}
          </div>
        </div>
        <input
          style={styles.input}
          placeholder={`Name (${activeLang.toUpperCase()})`}
          value={names[activeLang] ?? ''}
          onChange={(e) => setNames((prev) => ({ ...prev, [activeLang]: e.target.value }))}
        />
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder={`Intro (${activeLang.toUpperCase()}) — shown on the country page (optional)`}
          value={intros[activeLang] ?? ''}
          onChange={(e) => setIntros((prev) => ({ ...prev, [activeLang]: e.target.value }))}
        />

        <Input name='order' label='Order' description='Sort order in the menu' type='number' style={styles.flex} />

        <Button
          label={isEdit ? 'Save country' : 'Create country'}
          onClick={formMethods.handleSubmit(handleSave)}
          loading={saving}
          disabled={!canManage}
        />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: { gap: t.spacing.s, width: 460 },
  row: { flexDirection: 'row', gap: t.spacing.m },
  flex: { flex: 1, minWidth: 0 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing.xs },
  langLabel: { fontSize: 12, color: t.colors.blue04 },
  langTabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray05 + t.colorOpacity(0.6),
  },
  langTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 40,
    height: 26,
    paddingLeft: t.spacing.s,
    paddingRight: t.spacing.s,
    border: 0,
    cursor: 'pointer',
    borderRadius: t.borderRadius.small,
    fontSize: 12,
    fontWeight: 700,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: t.colors.lightGreen },
  input: {
    height: 44,
    boxSizing: 'border-box',
    padding: `0 ${t.spacing.m}px`,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    color: t.colors.white,
    border: 0,
    outline: 'none',
    fontSize: 15,
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
}));
