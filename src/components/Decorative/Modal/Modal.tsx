'use client'

import { ReactNode } from "react";
import { useModalManager } from "./ModalContext";
import { X } from "lucide-react";


export interface ModalProps {
    title?: string,
    required?: boolean,
    background?: boolean,
    component: (push: (modal: ModalProps) => void, pop: () => void) => ReactNode
}

export default function Modal({ modal }: { modal: ModalProps }) {

    const { addModal, popModal } = useModalManager()

    modal.title = modal.title ?? ""
    modal.required = modal.required ?? false
    modal.background = modal.background ?? true

    return (
        <div
            className={`${modal.background ? "card min-w-md" : ""} w-fit h-fit`}
            style={{ backdropFilter: modal.background ? "blur(5px)" : "none" }}
        >

            {(modal.background && !modal.required) &&
                <div className="relative">
                    <div className="absolute right-0">
                        <X onClick={popModal} className="cursor-pointer" />
                    </div>
                </div>
            }

            {modal.title.trim() !== "" &&
                <>
                    <h1 className="text-2xl font-bold">
                        {modal.title}
                    </h1><div className="h-px bg-accent mb-3"></div>
                </>
            }

            <div style={{
                zIndex: 1000
            }}>
                {modal.component(addModal, popModal)}
            </div>

        </div>
    )
}