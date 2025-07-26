'use client'

import { Check } from "lucide-react"
import { useEffect, useState } from "react"





interface CheckboxInputProps {
    id?: string
    label?: string
    val?: boolean
    disabled?: boolean
    changeCB?: (val: boolean) => void
}

export default function CheckboxInput({ 
    id = "", 
    label = "",
    val = false, 
    disabled = false, 
    changeCB = () => {}
}: CheckboxInputProps) {

    const [selected, setSelected] = useState(false)

    useEffect(() => {
        setSelected(val)
    }, [val])

    function clicked() {
        setSelected(!selected)
        changeCB(!selected)
    }

    return (
        <div className={"mb-5 " + (disabled ? "opacity-50" : "")}>

            <input type="hidden" name={id} id={id} value={JSON.stringify(selected)} readOnly={true} ></input>

            <div className="flex flex-row prevent-select" onClick={() => {clicked()}}>
                <div className={"w-7 h-7 border border-primary rounded flex flex-col justify-center " + (selected ? "bg-primary" : "")} >
                    {selected && <Check stroke="white" className="m-auto" strokeWidth={3}/>}
                </div>
                <label htmlFor={id+"-"} className="text-md ml-2">{label}</label>
            </div>

        </div>
    )
}