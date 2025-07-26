import { ModalProps } from "../Modal/Modal"



interface buttonOptions {
    title: string,
    type: string
}
interface promptUserOptions {
    addModal: (modal: ModalProps) => void,
    title?: string,
    message?: string,
    falseButton?: buttonOptions,
    trueButton?: buttonOptions
}
export async function promptUser(
    options: promptUserOptions
) {


    return new Promise(resolve => {
        options.addModal({
            title: options.title,
            required: true,
            component: (push, pop) => (
                <div className="w-sm">
                    {options.message && <p>{options.message}</p>} 

                    <div className="flex flex-row justify-between pt-5">

                        {options.falseButton &&
                            <button type="submit" className={`${options.falseButton.type}-button w-4/9`} onClick={() => {
                                pop()
                                resolve(false)
                            }}>{options.falseButton.title}</button>
                        }
                        {!options.falseButton && <div></div>}

                        {options.trueButton &&
                            <button type="submit" className={`${options.trueButton.type}-button w-4/9`} onClick={() => {
                                pop()
                                resolve(true)
                            }}>{options.trueButton.title}</button>
                        }
                        {!options.trueButton && <div></div>}

                    </div>

                </div>
            )
        })

    })
}