import { FaPlus } from 'react-icons/fa6';
import { Button } from '~/components/Button';

import { useModal } from '~/hooks/useModal';
import { UsersTable } from '~/routes/Accounts/components/UsersTable';
import { useUsersData } from '~/routes/Accounts/hooks/useUsersData';
import { CreateUserModal } from '~/routes/Accounts/modals/CreateUserModal';

import { mkUseStyles } from '~/utils/theme';

export const Accounts = () => {
  const createUserModal = useModal(
    'create-user',
    CreateUserModal,
    { title: 'Add user' },
    {
      handleClose: async () => {
        refresh();
        createUserModal.hide();
      },
    },
  );
  const styles = useStyles();

  const { data, pagination, setPagination, refresh } = useUsersData();

  return (
    <div style={styles.container}>
      <Button label='Add' icon={<FaPlus />} onClick={() => createUserModal.show()} />
      <UsersTable setPagination={setPagination} users={data?.users} total={data?.total} pagination={pagination} />
    </div>
  );
};

const useStyles = mkUseStyles(() => ({
  container: {
    height: '100%',
  },
}));
