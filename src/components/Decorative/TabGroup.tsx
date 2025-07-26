'use client'


import React from "react";
import { useUrlState } from 'state-in-url';


type TabGroupProps = React.HTMLAttributes<HTMLDivElement> & {
    tabNames: string[],
    verticalTabs?: boolean
}

function longestStrLength(strs: string[]) : number {
    let max = 0
    strs.forEach(str => {
        if (str.length > max) { max = str.length }
    })
    return max
}

const TabGroup = React.forwardRef<HTMLDivElement, TabGroupProps>(
    ({ tabNames, verticalTabs = false, children, ...rest }, ref) => {

        const { urlState, setUrl } = useUrlState({ selected: 0 });

        const maxLength = longestStrLength(tabNames)

        return (
            <div ref={ref} style={{ ...rest.style }} {...rest}>

                <div className={`h-fit flex ${verticalTabs ? "flex-row" : "flex-col"}`}>
                    
                    {/* Tabs */}
                    <div className={`flex ${verticalTabs ? "flex-col w-fit" : "flex-row w-full"} select-none`}>
                        {tabNames.map((name, i) => (
                            <div
                                key={name}
                                className={`w-full clearSmallCard text-lg text-end ${urlState.selected == i ? "bg-primary/80 text-white font-semibold" : "bg-white font-light"}`}
                                style={{
                                    padding: 12,
                                    borderTopRightRadius: verticalTabs ? 0 : undefined,
                                    borderBottomLeftRadius: verticalTabs ? undefined : 0,
                                    borderBottomRightRadius: 0,
                                    zIndex: urlState.selected == i ? 100 : 0,
                                    width: maxLength * 14
                                }}
                                onClick={() => setUrl({ selected: i })}
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    <div
                        className="card w-fit"
                        style={{
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: verticalTabs ? undefined : 0,
                            borderBottomLeftRadius: verticalTabs ? 0 : undefined,
                            zIndex: 200
                        }}
                    >
                        {React.Children.toArray(children)[urlState.selected]}
                    </div>
                </div>

            </div>
        )
    })

TabGroup.displayName = "TabGroup"
export default TabGroup
