import { FaPlus } from 'react-icons/fa6';
import { Button } from '~/components/Button';
import { useModal } from '~/hooks/useModal';
import { ImagesTable } from '~/routes/Images/components/ImagesTable';
import { CreateImageModal } from '~/routes/Images/modals/CreateImageModal';

export const Gallery = () => {
  const createImageModal = useModal('create-image', CreateImageModal, { title: 'Add Image' });

  return (
    <>
      <Button label='Add' icon={<FaPlus />} onClick={() => createImageModal.show()} />
      <ImagesTable />
    </>
  );
};
