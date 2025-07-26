'use client'
import React from "react";
import { motion } from "framer-motion";



type ClickableDivProps = React.HTMLAttributes<HTMLDivElement> & {
    onClick?: () => void
}


const ClickableDiv = React.forwardRef<HTMLDivElement, ClickableDivProps>(
    ({ onClick, children, ...rest }, ref) => {

        return (
            <motion.div
                ref={ref}
                // {...rest}
                className={rest.className}
                style={{ ...rest.style }}

                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.1 },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
            >
                {children}
            </motion.div>
        )
    }
)


ClickableDiv.displayName = "ClickableDiv"
export default ClickableDiv