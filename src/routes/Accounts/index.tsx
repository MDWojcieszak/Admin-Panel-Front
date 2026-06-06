import { FaPlus } from 'react-icons/fa6';
import { Button } from '~/components/Button';

import { useCan } from '~/hooks/usePermissions';
import { useModal } from '~/hooks/useModal';
import { UsersTable } from '~/routes/Accounts/components/UsersTable';
import { useUsersData } from '~/routes/Accounts/hooks/useUsersData';
import { CreateUserModal } from '~/routes/Accounts/modals/CreateUserModal';
import { UserDetailsModal } from '~/routes/Accounts/modals/UserDetailsModal';

import { mkUseStyles } from '~/utils/theme';

export const Accounts = () => {
  const styles = useStyles();
  const can = useCan();
  const canManage = can('user.manage');

  const { users, total, pagination, setPagination, refresh } = useUsersData();

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

  const detailsModal = useModal(
    'user-details',
    UserDetailsModal,
    { title: 'User details' },
    {
      handleClose: async () => {
        refresh();
        detailsModal.hide();
      },
    },
  );

  const handleDetails = (id: string) => {
    const user = users?.find((u) => u.id === id);
    if (user) detailsModal.show({ user });
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <h2 style={styles.title}>Users</h2>
        {canManage ? <Button label='Add user' icon={<FaPlus />} onClick={() => createUserModal.show()} /> : null}
      </div>
      <UsersTable
        setPagination={setPagination}
        users={users}
        total={total}
        pagination={pagination}
        onDetails={handleDetails}
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
