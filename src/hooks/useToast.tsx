import { useContext } from 'react';
import { ToastContext } from '~/contexts/Toast/ToastContext';

/** Show a transient toast: `toast('Saved', 'success')`. */
export const useToast = () => useContext(ToastContext);
