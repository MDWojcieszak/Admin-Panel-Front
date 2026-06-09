import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryKind, CategoryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { LockedField } from '~/components/LockedField';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { mkUseStyles, useTheme } from '~/utils/theme';

type CategoryEditorModalProps = {
  kind?: CategoryKind;
  category?: CategoryResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  key: z.string().min(1, 'Key is required'),
  icon: z.string().optional(),
  order: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

export const CategoryEditorModal = (p: CategoryEditorModalProps) => {
  const styles = useStyles();
  const theme = useTheme();
  const { blogCategoriesApi } = useApi();
  const { locales, defaultLocale } = useBlogLocales();
  const isEdit = Boolean(p.category);
  const isSystem = p.category?.isSystem ?? false;
  const canManage = p.canManage ?? true;
  const kind = p.category?.kind ?? p.kind ?? CategoryKind.Post;
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(p.category?.color ?? '#6b7686');

  const [activeLang, setActiveLang] = useState('');
  useEffect(() => {
    if (!activeLang && defaultLocale) setActiveLang(defaultLocale);
  }, [defaultLocale, activeLang]);

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (p.category?.translations ?? []).forEach((t) => {
      if (t.label) map[t.locale] = t.label;
    });
    return map;
  });

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: {
      key: p.category?.key ?? '',
      icon: p.category?.icon ?? '',
      order: p.category?.order != null ? String(p.category.order) : '',
    },
  });

  const handleSave = async (data: SchemaType) => {
    if (!blogCategoriesApi || !canManage) return;
    setSaving(true);
    const order = data.order ? Number(data.order) : null;
    try {
      let id = p.category?.id;
      const baseLocale = activeLang || defaultLocale;
      if (isEdit && p.category) {
        await blogCategoriesApi.categoryControllerPatch({
          id: p.category.id,
          patchBlogCategoryDto: { key: isSystem ? undefined : data.key, icon: data.icon || null, color: color || null, order },
        });
      } else {
        const res = await blogCategoriesApi.categoryControllerCreate({
          createBlogCategoryDto: {
            kind,
            key: data.key,
            icon: data.icon || null,
            color: color || null,
            order: order ?? undefined,
            locale: baseLocale,
            label: labels[baseLocale] || undefined,
          },
        });
        id = res.data.id;
      }
      // Persist every language's label.
      if (id) {
        for (const loc of Object.keys(labels)) {
          if (!isEdit && loc === baseLocale) continue; // already set on create
          await blogCategoriesApi.categoryControllerUpsertTranslation({
            id,
            locale: loc,
            upsertCategoryTranslationDto: { label: labels[loc] || null },
          });
        }
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving category:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <span style={styles.kindTag}>{kind}</span>

        {isSystem ? (
          <LockedField label='Key' value={p.category?.key} hint='System category — key is locked' />
        ) : (
          <Input name='key' label='Key' description='Canonical, language-neutral key (e.g. food)' disableAutofill={false} />
        )}

        {/* Localized label with in-modal language tabs */}
        <div style={styles.labelBlock}>
          <div style={styles.langRow}>
            <span style={styles.langLabel}>Label</span>
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
                    {labels[l.code] ? <span style={styles.dot} /> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <input
            style={styles.input}
            placeholder={`Label (${activeLang.toUpperCase()})`}
            value={labels[activeLang] ?? ''}
            onChange={(e) => setLabels((prev) => ({ ...prev, [activeLang]: e.target.value }))}
          />
        </div>

        <div style={styles.row}>
          <Input name='icon' label='Icon' description='Optional icon name' style={styles.flex} disableAutofill={false} />
          <Input name='order' label='Order' description='Sort order' type='number' style={styles.flex} />
        </div>
        <div style={styles.colorRow}>
          <span style={styles.colorLabel}>Color</span>
          <input type='color' value={color || '#6b7686'} onChange={(e) => setColor(e.target.value)} style={styles.colorInput} />
          <button type='button' style={styles.clearColor} onClick={() => setColor('')}>
            clear
          </button>
        </div>
        <Button
          label={isEdit ? 'Save category' : 'Create category'}
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
    width: 440,
  },
  kindTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
  },
  labelBlock: {
    gap: t.spacing.xs,
    marginTop: t.spacing.xs,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langLabel: {
    fontSize: 12,
    color: t.colors.blue04,
  },
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: t.colors.lightGreen,
  },
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
  row: {
    flexDirection: 'row',
    gap: t.spacing.m,
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.m,
    marginBottom: t.spacing.m,
  },
  colorLabel: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  colorInput: {
    width: 48,
    height: 34,
    padding: 0,
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
  },
  clearColor: {
    height: 30,
    padding: `0 ${t.spacing.s}px`,
    borderRadius: t.borderRadius.small,
    border: `1px solid ${t.colors.white + t.colorOpacity(0.1)}`,
    background: 'transparent',
    color: t.colors.dark05,
    cursor: 'pointer',
    fontSize: 12,
  },
}));
