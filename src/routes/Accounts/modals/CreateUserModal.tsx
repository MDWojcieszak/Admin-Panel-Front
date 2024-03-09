import { useState } from 'react';
import { Button } from '~/components/Button';
import { mkUseStyles } from '~/utils/theme';
import { InternalModalProps } from '~/contexts/ModalManager/types';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '~/types/user';
import { UserService } from '~/api/User';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';

type CreateUserModalProps = Partial<InternalModalProps>;

const UserSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email({ message: 'Incorrect email' }),
  firstName: z.string(),
  lastName: z.string(),
  role: z.nativeEnum(UserRole),
});

type UserSchemaType = z.infer<typeof UserSchema>;

export const CreateUserModal = (p: CreateUserModalProps) => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<UserSchemaType>({
    resolver: zodResolver(UserSchema),
  });

  const handleCreateUser = async (data: UserSchemaType) => {
    setLoading(true);
    try {
      await UserService.create(data);
      p.handleClose?.();
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <FormProvider {...formMethods}>
      <Select
        name='role'
        label='Role'
        options={[
          { label: 'User', value: UserRole.USER },
          { label: 'Moderator', value: UserRole.MODERATOR },
          { label: 'Admin', value: UserRole.ADMIN },
          { label: 'Owner', value: UserRole.OWNER },
        ]}
        description='Select user role'
      />
      <div style={styles.row}>
        <Input
          name='firstName'
          style={styles.flex}
          label='First Name'
          description='Enter user first name'
          type='text'
        />
        <Input name='lastName' style={styles.flex} label='Last Name' description='Enter user last name' type='text' />
      </div>

      <Input name='email' label='Email' description='Enter user e-mail address' type='email' />
      <Button label='Create' onClick={formMethods.handleSubmit(handleCreateUser)} loading={loading} />
    </FormProvider>
  );
};

const useStyles = mkUseStyles((t) => ({
  successContainer: { alignItems: 'center', gap: t.spacing.m },
  circle: {
    backgroundColor: t.colors.mainGreen,
    width: 50,
    height: 50,
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    gap: t.spacing.m,
    flexDirection: 'row',
  },
  flex: { flex: 1 },
}));
