import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { UserRole } from '~/types/user';
import { mkUseStyles } from '~/utils/theme';

export const CreateUserForm = () => {
  const styles = useStyles();
  return (
    <>
      {/* <Input description='xDDDD' label='haha' />
        <ImageInputWithPreview />
        <Select />
        <CalendarInput /> */}
      <div style={styles.row}>
        <Input style={styles.flex} label='Name' description='Enter user name' type='email' />
        <Input style={styles.flex} label='Surname' description='Enter user surname' type='email' />
      </div>
      <Select
        label='Role'
        options={[
          { label: 'User', value: UserRole.USER },
          { label: 'Moderator', value: UserRole.MODERATOR },
          { label: 'Admin', value: UserRole.ADMIN },
          { label: 'Owner', value: UserRole.OWNER },
        ]}
        description='Select user role'
      />
      <Input label='Email' description='Enter user e-mail address' type='email' />
      <Input label='Password' description='Enter user password' type='password' />
    </>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {},
  row: {
    gap: t.spacing.m,
    flexDirection: 'row',
  },
  flex: { flex: 1 },
}));
