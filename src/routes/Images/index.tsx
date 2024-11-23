import { useCallback } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { ImageService } from '~/api/Image';
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
    await ImageService.delete({ id: imageId });
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
      <Button label='Add' icon={<FaPlus />} onClick={() => createImageModal.show()} />
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

const useStyles = mkUseStyles(() => ({
  container: {
    height: '100%',
  },
}));
