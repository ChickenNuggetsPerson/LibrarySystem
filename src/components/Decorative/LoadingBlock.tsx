import React from "react"

type LoadingBlockProps = React.HTMLAttributes<HTMLDivElement> & {
    w?: number | string,
    h?: number | string
}


const LoadingBlock = React.forwardRef<HTMLDivElement, LoadingBlockProps>(
    ({ w = 30, h = 8, ...rest }, ref) => {

        return (
            <div
                {...rest}
                className={`bg-gray-200/50 animate-pulse rounded-lg w-${w} h-${h} ml-2 ${rest.className}`}
                style={rest.style}
                ref={ref}
            ></div>
        )
    }
)


LoadingBlock.displayName = "LoadingBlock"
export default LoadingBlock