import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryKind, CategoryResponse } from '~/api/api';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { categoryLabel } from '~/routes/Blog/hooks/useBlogCategories';
import { mkUseStyles } from '~/utils/theme';

type CategoryEditorModalProps = {
  kind?: CategoryKind;
  locale?: string;
  category?: CategoryResponse;
  canManage?: boolean;
} & Partial<InternalModalProps>;

const Schema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().optional(),
  icon: z.string().optional(),
  order: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

export const CategoryEditorModal = (p: CategoryEditorModalProps) => {
  const styles = useStyles();
  const { blogCategoriesApi } = useApi();
  const isEdit = Boolean(p.category);
  const isSystem = p.category?.isSystem ?? false;
  const canManage = p.canManage ?? true;
  const locale = p.locale ?? 'en';
  const kind = p.category?.kind ?? p.kind ?? CategoryKind.Post;
  const [saving, setSaving] = useState(false);
  const [color, setColor] = useState(p.category?.color ?? '#6b7686');

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: {
      key: p.category?.key ?? '',
      label: p.category ? categoryLabel(p.category, locale) : '',
      icon: p.category?.icon ?? '',
      order: p.category?.order != null ? String(p.category.order) : '',
    },
  });

  const handleSave = async (data: SchemaType) => {
    if (!blogCategoriesApi || !canManage) return;
    setSaving(true);
    try {
      const order = data.order ? Number(data.order) : null;
      if (isEdit && p.category) {
        await blogCategoriesApi.categoryControllerPatch({
          id: p.category.id,
          patchBlogCategoryDto: {
            key: isSystem ? undefined : data.key,
            icon: data.icon || null,
            color: color || null,
            order,
          },
        });
        await blogCategoriesApi.categoryControllerUpsertTranslation({
          id: p.category.id,
          locale,
          upsertCategoryTranslationDto: { label: data.label || null },
        });
      } else {
        await blogCategoriesApi.categoryControllerCreate({
          createBlogCategoryDto: {
            kind,
            key: data.key,
            label: data.label || undefined,
            icon: data.icon || null,
            color: color || null,
            order: order ?? undefined,
            locale,
          },
        });
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
        <span style={styles.kindTag}>
          {kind} · {locale.toUpperCase()}
        </span>
        <Input
          name='key'
          label='Key'
          description={isSystem ? 'System category — key is locked' : 'Canonical, language-neutral key (e.g. food)'}
          disableAutofill={false}
        />
        <Input name='label' label={`Label (${locale.toUpperCase()})`} description='Display name for this language' disableAutofill={false} />
        <div style={styles.row}>
          <Input name='icon' label='Icon' description='Optional icon name' style={styles.flex} disableAutofill={false} />
          <Input name='order' label='Order' description='Sort order' type='number' style={styles.flex} />
        </div>
        <div style={styles.colorRow}>
          <span style={styles.colorLabel}>Color</span>
          <input type='color' value={color} onChange={(e) => setColor(e.target.value)} style={styles.colorInput} />
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
    width: 420,
  },
  kindTag: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: t.colors.blue04,
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
