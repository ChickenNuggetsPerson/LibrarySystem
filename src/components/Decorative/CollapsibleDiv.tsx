'use client'
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";



type CollapsibleDivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
    title?: React.ReactNode,
    arrowSize?: number
};



const CollapsibleDiv = React.forwardRef<HTMLDivElement, CollapsibleDivProps>(
    ({ title, arrowSize = 24, children, ...rest }, ref) => {

        const [expanded, setExpanded] = useState(false)

        return (
            <motion.div
                ref={ref}
                // {...rest}
                className={rest.className}
                style={{ ...rest.style }}
            >
                <div className="relative">
                    <div className="absolute right-0">
                        <motion.div
                            animate={{ rotate: expanded ? 0 : 90 }}
                            className="bg-gray-100 icon"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <ChevronDown size={arrowSize} />
                        </motion.div>
                    </div>
                </div>

                {title &&
                    <>
                        {title}

                        <motion.div
                            animate={{ opacity: expanded ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-1"
                        >
                            <div className="bg-accent h-px"></div>
                        </motion.div>

                    </>
                }

                <motion.div
                    initial={{
                        height: 0
                    }}
                    animate={{
                        height: expanded ? "auto" : 0,
                    }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className="overflow-clip"
                >
                    {children}
                </motion.div>

            </motion.div>
        )
    }
)


CollapsibleDiv.displayName = "CollapsibleDiv"
export default CollapsibleDiv