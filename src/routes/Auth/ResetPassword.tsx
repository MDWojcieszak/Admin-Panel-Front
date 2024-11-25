import { useCallback, useState } from 'react';
import { Button } from '~/components/Button';
import { GlassCard } from '~/components/GlassCard';
import { Input } from '~/components/Input';
import { mkUseStyles } from '~/utils/theme';
import { z } from 'zod';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthService } from '~/api/Auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validatePassword } from '~/utils/validation/passwordValidation';

import { CommonNavigationRoute } from '~/navigation/types';
import { ResultContainer } from '~/routes/Auth/components/ResultContainer';

const ResetPasswordRequest = z.object({
  email: z.string({ required_error: 'Email is required' }).email({ message: 'Incorrect email' }),
});
type ResetPasswordRequest = z.infer<typeof ResetPasswordRequest>;

const NewPassword = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password requires at least 8 characters')
    .superRefine(validatePassword),
  confirmPassword: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password requires at least 8 characters')
    .superRefine(validatePassword),
});
type NewPassword = z.infer<typeof NewPassword>;

enum Result {
  SEND_SUCCESS,
  RESET_SUCCESS,
  RESET_FAILED,
}

export const ResetPassword = () => {
  const styles = useStyles();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token'));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>();
  const navigate = useNavigate();
  const resetPasswordRequestMethods = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordRequest),
  });

  const resetPasswordMethods = useForm<NewPassword>({
    resolver: zodResolver(NewPassword),
  });

  const handleResetPassword = useCallback(async (data: NewPassword) => {
    if (data.password !== data.confirmPassword)
      return resetPasswordMethods.setError('confirmPassword', { message: 'Passwords must be the same' });
    if (!token) return;
    setLoading(true);
    try {
      await AuthService.resetPassword({ newPassword: data.password, deleteSessions: true }, token);
      setResult(Result.RESET_SUCCESS);
    } catch (error: any) {
      setResult(Result.RESET_FAILED);
    }
    setLoading(false);
  }, []);

  const handleResetRequest = useCallback(async (data: ResetPasswordRequest) => {
    setLoading(true);
    try {
      const res = await AuthService.resetPasswordRequest(data);
      console.log(res);
    } catch (error: any) {
      console.log(error.message);
    }
    setLoading(false);
    setResult(Result.SEND_SUCCESS);
  }, []);

  const handleGoToSignIn = () => {
    navigate('/' + CommonNavigationRoute.SIGN_IN);
  };

  const handleTryAgain = () => {
    setToken(null);
    setResult(undefined);
  };

  if (token) {
    return (
      <GlassCard style={styles.container}>
        <h1 style={styles.title}>New Password</h1>
        {result === Result.RESET_SUCCESS && (
          <ResultContainer
            message='We have successfully reset your password.'
            subMessage='Go to login and enter your new credentials.'
            onSuccess={handleGoToSignIn}
            successLabel='Sign In'
          />
        )}
        {result === Result.RESET_FAILED && (
          <ResultContainer
            message='Password reset failed, you can try resending the email or returning to the login page'
            success={false}
            onSuccess={handleTryAgain}
            successLabel='Try again'
            onCancel={handleGoToSignIn}
            cancelLabel='Sign In'
          />
        )}
        {result === undefined && (
          <>
            <p style={styles.instruction}>Enter your new password, make sure the passwords are the same</p>
            <FormProvider {...resetPasswordMethods}>
              <form onSubmit={resetPasswordMethods.handleSubmit(handleResetPassword)} style={styles.form} noValidate>
                <Input name='password' label='Password' description='Your password' type='password' />
                <Input
                  name='confirmPassword'
                  label='Confirm Password'
                  description='Your password confirmation'
                  type='password'
                />
                <Button label='Change' loading={loading} style={styles.button} />
              </form>
            </FormProvider>
          </>
        )}
      </GlassCard>
    );
  }
  return (
    <GlassCard style={styles.container}>
      <h1 style={styles.title}>Password Reset</h1>
      {result === Result.SEND_SUCCESS && (
        <ResultContainer
          message=' We have sent you an e-mail with a password reset, please follow the instructions sent there.'
          subMessage="If you can't find it, check spam or offers."
        />
      )}
      {result === undefined && (
        <>
          <p style={styles.instruction}>Enter your email address and we will send you a message</p>
          <FormProvider {...resetPasswordRequestMethods}>
            <form
              onSubmit={resetPasswordRequestMethods.handleSubmit(handleResetRequest)}
              style={styles.form}
              noValidate
            >
              <Input name='email' label='Email' description='Your e-mail address' type='email' />
              <Button label='Send request' loading={loading} style={styles.button} />
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
  instruction: {
    alignSelf: 'center',
    textAlign: 'center',
    width: 350 - t.spacing.m * 2,
    marginBottom: t.spacing.l,
    color: t.colors.lightBlue,
  },
  button: {
    marginTop: t.spacing.m,
  },
}));
