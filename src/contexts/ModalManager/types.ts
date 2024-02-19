import React, { ComponentProps, VFC } from 'react';

import { Theme } from '~/utils/theme';

export type InternalModalProps = {
  isVisible: boolean;
  title?: string;
  titleIcon?: React.ReactNode;
  titleColor?: keyof Theme['colors'];
  showHeader?: boolean;
  handleShow?: F0<Promise<void>>;
  handleClose?: F0<Promise<void>>;
  resolveShow?: F0;
  resolveHide?: F0;
};

export type ModalProps<T extends VFC> = ComponentProps<T> & Partial<InternalModalProps>;

export type ModalTypes = 'bottom' | 'center' | 'custom';

export type ModalConfig = {
  type?: ModalTypes;
  disableClose?: boolean;
  title?: string;
  titleColor?: keyof Theme['colors'];
  allowSameId?: boolean;
  showHeader?: boolean;
};

export type ModalType<T extends VFC> = {
  id: string;
  visible: boolean;
  component: T;
  config: ModalConfig;
  props: ModalProps<T>;
};
