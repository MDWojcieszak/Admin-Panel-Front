import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useBlogLocales } from '~/routes/Blog/hooks/useBlogLocales';
import { mkUseStyles } from '~/utils/theme';

type CreatePostModalProps = Partial<InternalModalProps>;

const Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  locale: z.string().optional(),
});
type SchemaType = z.infer<typeof Schema>;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const CreatePostModal = (p: CreatePostModalProps) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { blogPostsApi } = useApi();
  const { locales, defaultLocale } = useBlogLocales();
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const formMethods = useForm<SchemaType>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '', slug: '', locale: '' },
  });

  useEffect(() => {
    if (defaultLocale) formMethods.setValue('locale', defaultLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLocale]);

  // Auto-suggest slug from the title until the user edits the slug field.
  const title = formMethods.watch('title');
  useEffect(() => {
    if (!slugEdited) formMethods.setValue('slug', slugify(title || ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, slugEdited]);

  const localeOptions = locales.map((l) => ({ label: `${l.name} · ${l.code}`, value: l.code }));

  const handleCreate = async (data: SchemaType) => {
    if (!blogPostsApi) return;
    setSaving(true);
    try {
      const res = await blogPostsApi.postControllerCreate({
        createPostDto: { slug: data.slug, title: data.title, locale: data.locale || undefined },
      });
      p.handleClose?.();
      navigate('/blog/posts/' + res.data.id + '/edit');
    } catch (e) {
      console.error('Error creating post:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div style={styles.container}>
        <Input name='title' label='Title' description='Working title (default locale)' disableAutofill={false} />
        <div onInput={() => setSlugEdited(true)}>
          <Input name='slug' label='Slug' description='URL identifier, e.g. iceland-ring-road' disableAutofill={false} />
        </div>
        {localeOptions.length ? (
          <Select name='locale' label='Locale' description='Initial content language' options={localeOptions} />
        ) : null}
        <Button label='Create post' onClick={formMethods.handleSubmit(handleCreate)} loading={saving} />
      </div>
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 420,
  },
}));
