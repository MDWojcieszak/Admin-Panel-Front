import { FaPlus } from 'react-icons/fa6';
import { Button } from '~/components/Button';
import { useModal } from '~/hooks/useModal';
import { ImagesTable } from '~/routes/Images/components/ImagesTable';
import { useImagesData } from '~/routes/Images/hooks/useImagesData';
import { CreateImageModal } from '~/routes/Images/modals/CreateImageModal';
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
  const styles = useStyles();

  const { data, pagination, setPagination, refresh } = useImagesData();

  return (
    <div style={styles.container}>
      <Button label='Add' icon={<FaPlus />} onClick={() => createImageModal.show()} />
      <ImagesTable setPagination={setPagination} images={data?.images} total={data?.total} pagination={pagination} />
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    height: '100%',
  },
}));
