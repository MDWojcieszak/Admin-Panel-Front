import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { AuthService, CheckRegisterToken } from '~/api/Auth';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { Input } from '~/components/Input';
import { CommonNavigationRoute } from '~/navigation/types';
import { mkUseStyles } from '~/utils/theme';
import { validatePassword } from '~/utils/validation/passwordValidation';

const RegisterSchema = z
  .object({
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password requires at least 8 characters')
      .superRefine(validatePassword),
    confirmPassword: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password requires at least 8 characters')
      .superRefine(validatePassword),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password must match',
    path: ['confirmPassword'],
  });
type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const UserRegister = () => {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<CheckRegisterToken>();
  const [isRegistered, setIsRegistered] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkToken = async (token: string) => {
    try {
      const res = await AuthService.checkRegisterToken(token);
      setUserData(res);
    } catch (e) {
      //TODO: error screen
      navigate('/' + CommonNavigationRoute.SIGN_IN);
    }
  };

  const registerUser = async (token: string, password: string) => {
    try {
      const res = await AuthService.registerUser({ password }, token);
      if (res) setIsRegistered(true);
      setLoading(false);
    } catch (e) {
      //TODO: error screen
      navigate('/' + CommonNavigationRoute.SIGN_IN);
    }
  };
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;
    checkToken(token);
  }, [searchParams]);

  const handleRegister = (data: RegisterSchemaType) => {
    const token = searchParams.get('token');
    if (!token) return;
    setLoading(true);

    registerUser(token, data.password);
  };

  const handleSignIn = () => {
    navigate('/' + CommonNavigationRoute.SIGN_IN);
  };

  const formMethods = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
  });

  return (
    <GlassCard style={styles.container}>
      {isRegistered ? (
        <>
          <h1 style={styles.title}>Welcome {userData?.firstName}</h1>

          <p style={styles.instruction}>
            Your account has been successfully created! You can now sign in using your credentials to access your
            account. Thank you for joining us!
          </p>
          <Button label='Sign In' type='button' onClick={handleSignIn} style={styles.button} />
        </>
      ) : (
        <>
          <h1 style={styles.title}>Welcome {userData?.firstName}</h1>
          <p style={styles.instruction}>
            To finish setting up your account, please create a password in the designated field and confirm it to
            proceed.
          </p>

          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(handleRegister)} style={styles.form} noValidate>
              <Input name='password' label='Password' description='Your password' type='password' />
              <Input
                name='confirmPassword'
                label='Confirm Password'
                description='Your password confirmation'
                type='password'
              />

              <Button label='Create account' loading={loading} style={styles.button} />
            </form>
          </FormProvider>
        </>
      )}
    </GlassCard>
  );
};

const useStyles = mkUseStyles((t) => ({
  container: {
    margin: 'auto',
    alignSelf: 'center',
    padding: t.spacing.m,
    minWidth: 350,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    alignSelf: 'center',
    userSelect: 'none',
  },
  instruction: {
    alignSelf: 'center',
    textAlign: 'center',
    width: 350 - t.spacing.m * 2,
    marginBottom: t.spacing.l,
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
