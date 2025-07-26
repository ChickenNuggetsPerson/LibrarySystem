'use client'

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./text.css"


const NumericText = ({ val = "", animDelta = 50, spacing = 0, expand = false }) => {
    const [charArray, setNumArray] = useState(Array.from([], String));
    const [id] = useState(Math.random())

    useEffect(() => {

        const newCharArray = val.split("")

        // Only update the array if the value changes
        if (JSON.stringify(charArray) !== JSON.stringify(newCharArray)) {
            setNumArray(newCharArray);
        }
    }, [charArray, val]);

    return (
        <div className="flex flex-row">
            <AnimatePresence>
                {charArray.map((num, i) => (
                    <motion.div
                        key={id + "-" + i }
                        exit={{ 
                            opacity: 0, 
                            transform: "translateY(20px)",
                            width: "0rem",
                            marginRight: expand ? 0 : spacing
                        }}
                        initial={{
                            marginRight: expand ? 0 : spacing
                        }}
                        animate={{
                            marginRight: spacing
                        }}

                        transition={{ duration: 0.2, type: 'linear', delay: (i * animDelta)/1000 }}
                        style={{marginRight: spacing}}
                    >
                        <NumberDisplay value={num} key={id + " " + i} animDelay={i * animDelta} expand={expand}/>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};


interface DisplayParms {
    value: string
    animDelay: number,
    expand: boolean
}

const NumberDisplay = ({ value, animDelay, expand }: DisplayParms) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isNew, setNew] = useState(true)

    const [transitionClass, setClass] = useState("numeric-text fade-in")
    const [width, setWidth] = useState(expand ? "0rem" : "1rem")

    useEffect(() => {

        if (isNew) {

            // When the number appears

            setTimeout(() => {
                setDisplayValue(value)
            }, animDelay);

            setTimeout(() => {
                setClass("numeric-text fade-in fade-default")
                setWidth("1rem")
            }, animDelay + 250);

            setTimeout(() => {
                setClass("numeric-text")
            }, animDelay + 300);

            setNew(false)

        } else { 

            // When the value changes

            setTimeout(() => {
                setClass("numeric-text fade-out")
            }, animDelay);

            setTimeout(() => {
                setDisplayValue(value)
                setClass("numeric-text fade-in")
            }, animDelay + 150)

            setTimeout(() => {
                setClass("numeric-text fade-default")
            }, animDelay + 250)

            setTimeout(() => {
                setClass("numeric-text")
            }, animDelay + 300);

        }
    }, [value, animDelay, isNew]);



    return (
        <h1 className={transitionClass} style={{ width: width }}>
            {displayValue}
        </h1>
    );
};

export default NumericText;