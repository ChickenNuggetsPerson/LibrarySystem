import { ModalProps } from "../Modal/Modal"




interface infoUserOptions {
    addModal: (modal: ModalProps) => void,
    title?: string,
    message?: string,
}
export function infoUser(
    options: infoUserOptions
) {
    options.addModal({
        title: options.title,
        required: false,
        component: () => (
            <div className="w-sm">
                {options.message && <p>{options.message}</p>}
            </div>
        )
    })
}