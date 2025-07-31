import { useState } from "react"
import { ModalProps } from "../Modal/Modal"
import TextInput from "@/components/Forms/TextInput"



interface promtTextInputOptions {
    addModal: (modal: ModalProps) => void,
    title?: string,
    message?: string,
    defaultValue?: string
}
export async function promtTextInput(
    options: promtTextInputOptions
) : Promise<string> {
    return new Promise(resolve => {
        options.addModal({
            title: options.title,
            required: true,
            component: (push, pop) => (<M message={options.message} defaultVal={options.defaultValue ?? ""} cb={(val) => {
                pop()
                resolve(val)
            }} />)
        })

    })
}


function M({ message, defaultVal, cb }: { message?: string, defaultVal: string, cb: (val: string) => void }) {

    const [val, setVal] = useState(defaultVal)

    return (
        <div>
            {message && <p>{message}</p>}

            <TextInput val={val} onChange={(val) => setVal(val)} />

            <button type="submit" className={`primary-button w-full`} onClick={() => {
                cb(val)
            }}>Submit</button>

        </div>
    )
}