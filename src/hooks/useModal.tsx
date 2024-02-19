import { ComponentProps, FC, useContext, useEffect, useMemo, useRef } from 'react';
import { ERRORS, ModalManagerContext } from '~/contexts/ModalManager/ModalManagerContext';
import { ModalConfig, ModalProps } from '~/contexts/ModalManager/types';

export const useModal = <T extends FC>(
  id: string,
  component: T,
  config?: ModalConfig | undefined,
  defaultProps?: ModalProps<T>,
) => {
  const ctx = useContext(ModalManagerContext);
  const configRef = useRef(config);
  const defaultPropsRef = useRef(defaultProps || ({} as ComponentProps<T>));

  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, component, configRef.current, defaultPropsRef.current);
    return () => {
      ctx.remove(id);
    };
  }, [component, ctx, id]);

  if (!ctx) throw Error('Use this hook in ModalManagerProvider scope');

  const show = (props?: ModalProps<T>) => {
    ctx.show(id, props || defaultPropsRef.current).catch((err: Error) => {
      if (err.message === ERRORS.MODAL_NOT_FOUND) {
        ctx.register(id, component, configRef.current, defaultPropsRef.current);
        show(props);
      }
    });
  };
  const hide = () => ctx.hide(id);

  return { show, hide };
};

export const useModalConfig = (id: string) => {
  const ctx = useContext(ModalManagerContext);
  if (!ctx) throw Error('Use this hook in ModalManagerProvider scope');
  return useMemo(() => (config: ModalConfig) => ctx.updateConfig(id, config), [ctx, id]);
};
