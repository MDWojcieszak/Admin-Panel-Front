import { FC, PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { Modal } from '~/components/Modal';

import { ERRORS, ModalManager, ModalManagerContext } from '~/contexts/ModalManager/ModalManagerContext';
import { InternalModalProps, ModalType } from '~/contexts/ModalManager/types';

export const ModalManagerProvider = ({ children }: PropsWithChildren) => {
  const [collection, setCollection] = useState<ModalType<FC<Partial<InternalModalProps>>>[]>([]);
  const resolveShowRef = useRef<{ resolve: F0; id: string }[]>([]);
  const resolveHideRef = useRef<{ resolve: F0; id: string }[]>([]);

  const register = useCallback<ModalManager['register']>((id, component, config, defaultProps) => {
    const newModal: ModalType<typeof component> = {
      id,
      component,
      config: config || {},
      props: defaultProps || {},
      visible: false,
    };
    setCollection((prev) => {
      if (prev.find((modal) => modal.id === id) && config?.allowSameId) return prev;
      if (prev.find((modal) => modal.id === id) && !config?.allowSameId) {
        return prev;
      }
      return [...prev, newModal];
    });
  }, []);

  const show = useCallback<ModalManager['show']>(
    (id, props) =>
      new Promise((resolve, reject) => {
        setCollection((prev) => {
          if (!prev.find((modal) => modal.id === id)) reject(ERRORS.MODAL_NOT_FOUND);
          if (prev.find((modal) => modal.id === id && modal.visible)) {
            resolve();
            return prev;
          }
          if (prev.some((modal) => modal.visible)) {
            reject(ERRORS.MODAL_ALREADY_SHOWN);
            return prev;
          }
          resolveShowRef.current.push({ resolve, id });
          return prev.map((item) => ({
            ...item,
            visible: item.id === id,
            props: item.id === id ? { ...item.props, ...props } : item.props,
          }));
        });
      }),
    [],
  );

  const hide = useCallback<ModalManager['hide']>((id) => {
    setCollection((prev) => {
      const newCollection = [...prev];
      const index = newCollection.findIndex((item) => item.id === id);
      if (index !== -1 && newCollection[index].visible) newCollection[index].visible = false;
      return newCollection;
    });
    return new Promise<void>((resolve) => resolveHideRef.current.push({ resolve, id }));
  }, []);

  const remove = useCallback<ModalManager['remove']>((id) => {
    setCollection((prev) => {
      const newCollection = prev.filter((modal) => modal.id !== id);
      return newCollection.length === prev.length ? prev : newCollection;
    });
  }, []);
  const resolveShow = useCallback<ModalManager['resolveShow']>((id) => {
    const index = resolveShowRef.current.findIndex(({ id: modalId }) => modalId === id);
    if (index !== -1) {
      resolveShowRef.current[index].resolve();
      resolveShowRef.current.splice(index, 1);
    }
  }, []);
  const resolveHide = useCallback<ModalManager['resolveHide']>((id) => {
    const index = resolveHideRef.current.findIndex(({ id: modalId }) => modalId === id);
    if (index !== -1) {
      resolveHideRef.current[index].resolve();
      resolveHideRef.current.splice(index, 1);
    }
  }, []);

  const updateConfig = useCallback<ModalManager['updateConfig']>((id, newConfig) => {
    setCollection((prev) => {
      const newCollection = [...prev];
      const index = newCollection.findIndex((item) => item.id === id);
      if (index !== -1) newCollection[index].config = { ...newCollection[index].config, ...newConfig };
      return newCollection;
    });
  }, []);

  const value: ModalManager = useMemo(
    () => ({ register, remove, show, hide, resolveShow, resolveHide, updateConfig }),
    [register, remove, show, hide, resolveShow, resolveHide, updateConfig],
  );

  return (
    <ModalManagerContext.Provider value={value}>
      {children}
      {collection.map((el) => (
        <Modal
          handleClose={el.config.disableClose ? undefined : el.props.handleClose || (() => hide(el.id))}
          isVisible={el.visible}
          key={el.id}
          resolveHide={() => resolveHide(el.id)}
          resolveShow={() => resolveShow(el.id)}
          title={el.config.title}
        >
          <el.component
            handleClose={el.config.disableClose ? undefined : () => hide(el.id)}
            handleShow={() => show(el.id, el.props)}
            isVisible={el.visible}
            {...el.props}
          />
        </Modal>
      ))}
    </ModalManagerContext.Provider>
  );
};
