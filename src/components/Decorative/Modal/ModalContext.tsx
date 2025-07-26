'use client';

import { ReactNode, createContext, useContext } from 'react';
import { ModalProps } from './Modal';

export type ModalContextType = {
    addModal: (modal: ModalProps) => void;
    popModal: () => void;
};

const ModalContextProvider = createContext<ModalContextType>({
    addModal: () => {
        throw new Error('addModal not implemented');
    },
    popModal: () => {
        throw new Error('popModal not implemented');
    },
});


export const useModalManager = () => {
    const context = useContext(ModalContextProvider);
    if (!context) throw new Error('ModalManagerContext not initialized');
    return context;
};


export function ModalContext({
    children,
    addModal,
    popModal,
}: {
    children: ReactNode;
    addModal: (modal: ModalProps) => void;
    popModal: () => void;
}) {
    return (
        <ModalContextProvider.Provider value={{ addModal, popModal }}>
            {children}
        </ModalContextProvider.Provider>
    );
}
