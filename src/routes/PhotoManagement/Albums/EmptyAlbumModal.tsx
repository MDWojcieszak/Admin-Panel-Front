import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { useApi } from '~/hooks/useApi';
import { useToast } from '~/hooks/useToast';
import { getApiErrorMessage } from '~/utils/apiError';
import { mkUseStyles } from '~/utils/theme';

type EmptyAlbumModalProps = {
  onDone?: () => void | Promise<void>;
} & Partial<InternalModalProps>;

const schema = z.object({ albumName: z.string().min(1, 'Album name is required') });
type FormValues = z.infer<typeof schema>;

export const EmptyAlbumModal = (p: EmptyAlbumModalProps) => {
  const styles = useStyles();
  const { immichApi } = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { albumName: '' } });

  const submit = async (data: FormValues) => {
    if (!immichApi) return;
    setLoading(true);
    try {
      await immichApi.immichControllerCreateEmptyAlbum({ createEmptyAlbumDto: { albumName: data.albumName.trim() } });
      toast(`Created empty album "${data.albumName.trim()}"`, 'success');
      await p.onDone?.();
      await p.handleClose?.();
    } catch (e) {
      toast(getApiErrorMessage(e, 'Could not create the album.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.hint}>Creates an empty Immich album. You can attach photo entries to it afterwards.</span>
      <Input name='albumName' label='Album name' description='Name of the new album' type='text' control={formMethods.control} />
      <div style={styles.actions}>
        <Button label='Cancel' variant='secondary' onClick={() => p.handleClose?.()} />
        <Button label='Create album' onClick={formMethods.handleSubmit(submit)} loading={loading} />
      </div>
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    gap: t.spacing.s,
    width: 420,
  },
  hint: {
    fontSize: 13,
    color: t.colors.dark05,
    marginBottom: t.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.spacing.m,
    marginTop: t.spacing.s,
  },
}));
