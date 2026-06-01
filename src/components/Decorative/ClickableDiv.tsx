'use client'
import React from "react";
import { motion } from "framer-motion";



type ClickableDivProps = React.HTMLAttributes<HTMLDivElement> & {
    onClick?: () => void,
    enabled?: boolean
}


const ClickableDiv = React.forwardRef<HTMLDivElement, ClickableDivProps>(
    ({ onClick, enabled, children, ...rest }, ref) => {

        enabled = enabled ?? true

        if (!enabled) {
            return (
                <div
                    ref={ref}
                    {...rest}
                    className={rest.className}
                    style={{ ...rest.style }}
                >
                    {children}
                </div>
            )
        }

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