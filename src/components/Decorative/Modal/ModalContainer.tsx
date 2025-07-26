'use client';

import React, { useState } from 'react';
import { ModalContext } from './ModalContext';
import Modal, { ModalProps } from './Modal';
import { AnimatePresence, motion } from 'framer-motion';

export default function ModalContainer({ children }: { children: React.ReactNode }) {
    const [modals, setModals] = useState<ModalProps[]>([]);

    function addModal(modal: ModalProps) {
        setModals(prev => [...prev, modal]);
    }

    function optionalPopModal() {
        if (modals[modals.length - 1]?.required) return;
        forcePopModal();
    }

    function forcePopModal() {
        if (modals.length === 0) return;
        setModals(prev => prev.toSpliced(prev.length - 1, 1));
    }

    return (
        <ModalContext addModal={addModal} popModal={forcePopModal}>

            <AnimatePresence>
                {modals.map((modal, i) => (
                    <motion.div
                        key={`Modals-${i}`}
                        className='fixed top-0 left-0 w-screen h-screen flex flex-col justify-center'
                        style={{
                            zIndex: 999 + i * 200,
                            // backgroundColor: "rgba(0.1, 0.1, 0.1, 0.02)",
                        }}
                        onClick={optionalPopModal}

                    // Opacity of background blur fades in
                    initial={{ opacity: 0, backdropFilter: "none" }}
                    animate={{ opacity: 1, backdropFilter: i == 0 ? "blur(5px)" : "none" }}
                    exit={{ opacity: 0, backdropFilter: "none"  }}
                    transition={{ duration: 0.1 }}
                    >
                        <div onClick={(e) => e.stopPropagation()} className='mx-auto'>
                            <motion.div
                                key={`Modals-${i}-animte`}
                                initial={{ y: "-10vh" }}
                                animate={{ y: 0, x: (i - modals.length + 1) * 50 }}
                                exit={{    y: "10vh" }}
                                transition={{ type: "spring", duration: 0.75 }}
                            >
                                <Modal modal={modal} />
                            </motion.div>

                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {children}
        </ModalContext>
    );
}
