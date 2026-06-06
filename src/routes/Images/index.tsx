import { useCallback } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { ImageService } from '~/apiOld/Image';
import { Button } from '~/components/Button';
import { useModal } from '~/hooks/useModal';
import { ImagesTable } from '~/routes/Images/components/ImagesTable';
import { useImagesData } from '~/routes/Images/hooks/useImagesData';
import { CreateImageModal } from '~/routes/Images/modals/CreateImageModal';
import { EditImageModal } from '~/routes/Images/modals/EditImageModal';
import { mkUseStyles } from '~/utils/theme';
export const Gallery = () => {
  const createImageModal = useModal(
    'create-image',
    CreateImageModal,
    { title: 'Add Image' },
    {
      handleClose: async () => {
        refresh();
        createImageModal.hide();
      },
    },
  );

  const editImageModal = useModal(
    'edit-image',
    EditImageModal,
    {},
    {
      handleClose: async () => {
        editImageModal.hide();
        refresh();
      },
    },
  );

  const styles = useStyles();

  const { data, pagination, setPagination, refresh } = useImagesData();
  const handleDelete = async (imageId: string) => {
    try {
      await ImageService.delete({ id: imageId });
    } catch (e) {
      console.error('Error deleting image:', e);
    }
    refresh();
  };
  const handleEdit = useCallback(
    (imageId: string) => {
      editImageModal.show({
        imageId,
        title: 'Edit Image',
      });
    },
    [data],
  );
  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Gallery</h2>
        <Button label='Add image' icon={<FaPlus />} onClick={() => createImageModal.show()} />
      </div>
      <ImagesTable
        setPagination={setPagination}
        images={data?.images}
        total={data?.total}
        pagination={pagination}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />
    </div>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    height: '100%',
    minHeight: 0,
    gap: t.spacing.m,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.m,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
}));
