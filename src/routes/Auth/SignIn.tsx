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
import { useAuth } from '~/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CommonNavigationRoute, MainNavigationRoute } from '~/navigation/types';
import { UserState } from '~/contexts/User/AuthContext';
import { motion } from 'framer-motion';
import { ResultContainer } from '~/routes/Auth/components/ResultContainer';
const SignInSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email({ message: 'Incorrect email' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password requires at least 8 characters')
    .superRefine(validatePassword),
});
type SignInSchemaType = z.infer<typeof SignInSchema>;

enum Result {
  SIGN_IN_FAILED,
}

export const SignIn = () => {
  const styles = useStyles();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>();

  const navigate = useNavigate();
  const auth = useAuth();
  const handleSignIn = useCallback(async (data: SignInSchemaType) => {
    setLoading(true);
    try {
      const res = await AuthService.signIn({ ...data, platform: 'Windows' });
      auth.setTokens(res);
    } catch (error: any) {
      setResult(Result.SIGN_IN_FAILED);
    }
    setLoading(false);
  }, []);

  const handleResetPassword = () => {
    navigate('/' + CommonNavigationRoute.RESET_PASSWORD);
  };

  useEffect(() => {
    if (auth.userState !== UserState.LOGGED_IN) return;
    navigate('/' + MainNavigationRoute.DASHBOARD);
  }, [auth.userState]);

  const formMethods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
  });

  const handleTryAgain = () => {
    setResult(undefined);
  };

  return (
    <GlassCard style={styles.container}>
      <h1 style={styles.title}>Welcome</h1>
      {result === Result.SIGN_IN_FAILED && (
        <ResultContainer
          message='Something went wrong, please make sure you are entering the correct credentials.'
          success={false}
          onSuccess={handleTryAgain}
          successLabel='Try again'
        />
      )}
      {result === undefined && (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(handleSignIn)} style={styles.form} noValidate>
            <Input name='email' label='Email' description='Your e-mail address' type='email' />
            <Input name='password' label='Password' description='Your password' type='password' />
            <motion.div onClick={handleResetPassword} whileHover={{ textDecoration: 'underline' }} style={styles.text}>
              Forgot password?
            </motion.div>
            <Button label='Sign In' loading={loading} style={styles.button} />
          </form>
        </FormProvider>
      )}
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
  text: {
    color: t.colors.lightBlue,
    alignItems: 'flex-end',
    fontSize: 14,
    cursor: 'pointer',
    userSelect: 'none',
  },
  title: {
    alignSelf: 'center',
    userSelect: 'none',
    marginBottom: t.spacing.m,
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
