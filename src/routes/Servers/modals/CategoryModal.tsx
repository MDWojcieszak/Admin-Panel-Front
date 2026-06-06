import { useState } from 'react';
import { ServerCategoriesDto } from '~/api/api';
import { Button } from '~/components/Button';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { mkUseStyles } from '~/utils/theme';

type CategoryModalProps = {
  serverId?: string;
  category?: ServerCategoriesDto;
  canManage?: boolean;
} & Partial<InternalModalProps>;

export const CategoryModal = (p: CategoryModalProps) => {
  const styles = useStyles();
  const { serverApi } = useApi();
  const isEdit = Boolean(p.category);
  const canManage = p.canManage ?? true;

  const [name, setName] = useState(p.category?.name ?? '');
  const [value, setValue] = useState(p.category?.value ?? '');
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!serverApi || !canManage) return;
    if (!isEdit && !value.trim()) {
      setError('Value is required');
      return;
    }
    setError(undefined);
    setSaving(true);
    try {
      if (isEdit && p.category) {
        await serverApi.serverControllerPatchCategory({ id: p.category.id, patchCategoryDto: { name } });
      } else if (p.serverId) {
        await serverApi.serverControllerCreateCategory({
          serverId: p.serverId,
          createCategoryDto: { name: name || undefined, value },
        });
      }
      p.handleClose?.();
    } catch (e) {
      console.error('Error saving category:', e);
      setError('Could not save the category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Name</label>
      <input
        style={styles.input}
        value={name}
        disabled={!canManage}
        onChange={(e) => setName(e.target.value)}
        placeholder='Display name'
      />
      {!isEdit ? (
        <>
          <label style={styles.label}>Value</label>
          <input
            style={styles.input}
            value={value}
            disabled={!canManage}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Unique key'
          />
        </>
      ) : null}
      {error ? <span style={styles.error}>{error}</span> : null}
      <Button label={isEdit ? 'Save' : 'Create category'} onClick={handleSave} loading={saving} disabled={!canManage} />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 360,
  },
  label: {
    fontSize: 12,
    color: t.colors.blue04,
  },
  input: {
    padding: t.spacing.m,
    color: t.colors.white,
    fontSize: 16,
    borderRadius: t.borderRadius.default,
    backgroundColor: t.colors.gray02 + t.colorOpacity(0.6),
    border: 0,
    outline: 'none',
  },
  error: {
    color: t.colors.red,
    fontSize: 14,
  },
}));
