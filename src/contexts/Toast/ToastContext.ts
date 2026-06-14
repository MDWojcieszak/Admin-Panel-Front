import { createContext } from 'react';

export type ToastType = 'error' | 'success' | 'info';
export type ShowToast = (message: string, type?: ToastType) => void;

export const ToastContext = createContext<ShowToast>(() => undefined);
