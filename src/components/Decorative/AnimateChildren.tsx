'use client'

import { motion } from "framer-motion";
import React from "react";



type AnimateChildrenProps = React.HTMLAttributes<HTMLDivElement> & {
    x?: number,
    y?: number,
    fade?: boolean,
    duration?: number,
    dt?: number
}

const AnimateChildren = React.forwardRef<HTMLDivElement, AnimateChildrenProps>(
    ({ x = 0, y = 0, fade = false, duration = 0.75, dt = 0.02, children, ...rest }, ref) => {
        return (
            <div
                ref={ref}
                {...rest}
                style={{ ...rest.style }}
            >
                {React.Children.map(children, (child, index) => (
                    <motion.div
                        initial={{ x: x, y: y, opacity: fade ? 0 : 1 }}
                        exit={{ x: x, y: y, opacity: fade ? 0 : 1 }}
                        animate={{ x: 0, y: 0, opacity: 1 }}
                        transition={{ duration: duration, delay: index * dt, type: 'spring' }}
                        key={index}
                    >
                        {child}
                    </motion.div>
                ))}
            </div>
        )
    })

AnimateChildren.displayName = "AnimateChildren"
export default AnimateChildren
