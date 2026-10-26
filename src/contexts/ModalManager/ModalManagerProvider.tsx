import { FC, PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { Modal } from '~/components/Modal';

import { ERRORS, ModalManager, ModalManagerContext } from '~/contexts/ModalManager/ModalManagerContext';
import { InternalModalProps, ModalProps, ModalType } from '~/contexts/ModalManager/types';

export const ModalManagerProvider = ({ children }: PropsWithChildren) => {
  const [collection, setCollection] = useState<ModalType<FC<Partial<InternalModalProps>>>[]>([]);
  const resolveShowRef = useRef<{ resolve: F0; id: string }[]>([]);
  const resolveHideRef = useRef<{ resolve: F0; id: string }[]>([]);
  // Each opening starts from what the modal was registered with.
  const defaultsRef = useRef<Record<string, object>>({});
  const collectionRef = useRef(collection);
  collectionRef.current = collection;
  const isAnyVisible = useCallback(() => collectionRef.current.some((modal) => modal.visible), []);

  const register = useCallback<ModalManager['register']>((id, component, config, defaultProps) => {
    if (!(id in defaultsRef.current)) defaultsRef.current[id] = (defaultProps as object) || {};
    const newModal: ModalType<typeof component> = {
      id,
      component,
      config: config || {},
      props: (defaultProps as ModalProps<typeof component>) || ({} as ModalProps<typeof component>),
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
          if (!prev.find((modal) => modal.id === id)) {
            reject(ERRORS.MODAL_NOT_FOUND);
            return prev;
          }
          if (prev.find((modal) => modal.id === id && modal.visible)) {
            resolve();
            return prev;
          }
          resolveShowRef.current.push({ resolve, id });
          // Modals stack: one opened from inside another (a picker or a confirm
          // inside a side panel) goes on top, and closing it uncovers the first.
          // Refusing it, as before, left those buttons silently doing nothing.
          const opened = prev.find((item) => item.id === id)!;
          return [
            ...prev.filter((item) => item.id !== id),
            {
              ...opened,
              visible: true,
              // From the defaults, not the last opening: an Add after an Edit kept the
              // edited item and silently saved over it.
              props: { ...defaultsRef.current[id], ...props },
            },
          ];
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
    delete defaultsRef.current[id];
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
    () => ({ register, remove, show, hide, resolveShow, resolveHide, updateConfig, isAnyVisible }),
    [register, remove, show, hide, resolveShow, resolveHide, updateConfig, isAnyVisible],
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
          showHeader={el.config.showHeader}
          type={el.config.type}
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
