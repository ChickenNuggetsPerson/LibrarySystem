import { ChangeEvent } from "react"




export default function LargeTextInput({
    id = "",
    label = "",
    val = "",
    placeholder = "",
    disabled = false,
    onChange = () => {}
}: {
    id?: string,
    label?: string,
    val?: string,
    placeholder?: string,
    disabled?: boolean,
    onChange?: (val: string) => void,
}) {

    function c(event: ChangeEvent<HTMLTextAreaElement>): void {
        onChange(event.target.value)
    }

    return (
        <div className={"relative z-0 w-full mb-5 group " + (disabled ? "opacity-50" : "")}>
            <textarea name={id} id={id} onChange={c} className="rounded block py-2.5 px-2.5 w-full text-sm text-gray-900 bg-gray-300/20 border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder={placeholder} defaultValue={val} readOnly={disabled} />
            <label htmlFor={id} className="z-50 peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-8 translate-x-2 scale-75 top-3 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8">{label}</label>
        </div>
    )
}