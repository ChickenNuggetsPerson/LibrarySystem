'use client'

import { ChangeEvent } from "react";



export default function TextInput({
    id = "",
    label = "",
    val = "",
    placeholder = "",
    disabled = false,
    obfuscate = false,
    onChange = () => { },
}: {
    id?: string,
    label?: string,
    val?: string,
    placeholder?: string,
    disabled?: boolean,
    obfuscate?: boolean,
    onChange?: (val: string) => void,
}) {


    function c(event: ChangeEvent<HTMLInputElement>): void {
        onChange(event.target.value)
    }

    return (
        <div className={"relative z-0 w-full mb-5 group " + (disabled ? "opacity-50" : "")}>
            <input type={obfuscate ? "password" : "text"} name={id} id={id} onChange={c} className="block py-2.5 px-0 w-full text-sm text-gray-50 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-up peer" placeholder={placeholder} defaultValue={val} readOnly={disabled} />
            <label htmlFor={id} className="peer-focus:font-medium absolute text-sm text-gray-100  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-primary-up peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{label}</label>
        </div>
    )
}