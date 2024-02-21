import { RefinementCtx } from 'zod';

export const validatePassword = (password: string, checkPassComplexity: RefinementCtx) => {
  const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
  const containsLowercase = (ch: string) => /[a-z]/.test(ch);
  const containsSpecialChar = (ch: string) => /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
  let countOfUpperCase = 0,
    countOfLowerCase = 0,
    countOfNumbers = 0,
    countOfSpecialChar = 0;
  for (let i = 0; i < password.length; i++) {
    let ch = password.charAt(i);
    if (!isNaN(+ch)) countOfNumbers++;
    else if (containsUppercase(ch)) countOfUpperCase++;
    else if (containsLowercase(ch)) countOfLowerCase++;
    else if (containsSpecialChar(ch)) countOfSpecialChar++;
  }
  if (countOfLowerCase < 1)
    return checkPassComplexity.addIssue({
      code: 'custom',
      message: 'Password requires a lowercase letter',
    });
  if (countOfUpperCase < 1)
    return checkPassComplexity.addIssue({
      code: 'custom',
      message: 'Password requires an uppercase letter',
    });
  if (countOfSpecialChar < 1)
    return checkPassComplexity.addIssue({
      code: 'custom',
      message: 'Password requires special character',
    });
  if (countOfNumbers < 1) {
    checkPassComplexity.addIssue({
      code: 'custom',
      message: 'Password requires at least one number',
    });
  }
};
