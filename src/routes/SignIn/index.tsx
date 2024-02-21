import { useCallback, useEffect, useState } from 'react';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { Input } from '~/components/Input';
import { mkUseStyles } from '~/utils/theme';
import { z } from 'zod';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { validatePassword } from '~/utils/validation/passwordValidation';
import { AuthService } from '~/api/Auth';
import { useUser } from '~/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { MainNavigationRoute } from '~/navigation/types';
import { UserState } from '~/contexts/User/UserContext';

const SignInSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email({ message: 'Incorrect email' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password requires at least 8 characters')
    .superRefine(validatePassword),
});
type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignIn = () => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = useUser();
  const handleSignIn = useCallback(async (data: SignInSchemaType) => {
    console.log(data);
    setLoading(true);
    try {
      const res = await AuthService.signIn({ ...data, platform: 'Windows' });
      user.setTokens(res);
    } catch (error: any) {
      console.log(error.message);
    }
  }, []);

  console.log(user.userState);

  useEffect(() => {
    if (user.userState !== UserState.LOGGED_IN) return;
    navigate('/' + MainNavigationRoute.DASHBOARD);
  }, [user.userState]);

  const formMethods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
  });

  return (
    <GlassCard style={styles.container}>
      <h1 style={styles.title}>Welcome</h1>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(handleSignIn)} style={styles.form} noValidate>
          <Input name='email' label='Email' description='Your e-mail address' type='email' />
          <Input name='password' label='Password' description='Your password' type='password' />
          <Button label='Sign In' loading={loading} style={styles.button} />
        </form>
      </FormProvider>
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    padding: t.spacing.m,
    minWidth: 300,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    alignSelf: 'center',
    userSelect: 'none',
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
