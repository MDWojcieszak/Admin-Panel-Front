import { createContext, FC } from 'react';

import { InternalModalProps, ModalConfig, ModalProps } from '~/contexts/ModalManager/types';

export type ModalManager = {
  register: <T extends FC<Partial<InternalModalProps>>>(
    id: string,
    component: T,
    config: ModalConfig | undefined,
    defaultProps: ModalProps<T>,
  ) => void;
  show: <T extends FC<Partial<InternalModalProps>>>(id: string, newProps: ModalProps<T>) => Promise<void>;
  hide: F1<string, Promise<void>>;
  remove: F1<string>;
  resolveShow: F1<string>;
  resolveHide: F1<string>;
  updateConfig: F2<string, ModalConfig>;
};

export const ERRORS = {
  MODAL_NOT_FOUND: 'MODAL_NOT_FOUND',
  MODAL_ALREADY_SHOWN: 'MODAL_ALREADY_SHOWN',
} as const;
export type Error = (typeof ERRORS)[keyof typeof ERRORS];

export const ModalManagerContext = createContext<ModalManager | null>(null);
