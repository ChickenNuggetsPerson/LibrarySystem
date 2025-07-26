import { ChangeEvent, useEffect, useState } from "react";




export default function DateInput({
    id = "",
    label = "",
    val = new Date(),
    disabled = false,
    onChange = () => { }
}: {
    id?: string,
    label?: string,
    val?: Date,
    disabled?: boolean,
    onChange?: (val: Date) => void
}) {

    const [state, setState] = useState(new Date())
    useEffect(() => {
        setState(val)
    }, [val])

    function formatDate(v: Date): string {
        return v.toISOString().split('T')[0]; // Ensure YYYY-MM-DD
    }

    function c(event: ChangeEvent<HTMLInputElement>): void {
        const date = event.target.valueAsDate ?? new Date()
        date.setHours(25)

        setState(date)
        onChange(date)
    }

    return (
        <div className={"relative z-0 w-full group " + (disabled ? "opacity-50" : "")}>
            <input
                type="date"
                name={id}
                id={id}
                onChange={c}
                className="block py-1.5 px-1 w-full text-sm text-gray-900 border-1 border-gray-300 rounded-sm appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" value={formatDate(state)}
                readOnly={disabled}
            />
            <label
                htmlFor={id}
                className="peer-focus:font-medium z-10 bg-white ml-1 px-1 absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
                {label}
            </label>
        </div>
    )
}