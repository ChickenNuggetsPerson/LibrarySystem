import { useCallback, useEffect, useRef } from "react"




export function useDebounce<T extends unknown[]>(cb: (...args: T) => void | (() => void), delay: number) {
    const cbRef = useRef(cb)
    const abortRef = useRef(() => { })
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)


    useEffect(() => {
        cbRef.current = cb
    }, [cb])

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current)
            }

            if (abortRef.current) {
                abortRef.current()
            }
        }
    }, [])

    return useCallback((skipDebounce: boolean, ...args: T) => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current)
        }

        if (abortRef.current) {
            abortRef.current()
        }

        if (skipDebounce) {
            const ab = cbRef.current(...args)
            if (ab) { abortRef.current = ab }
        } else {
            timeoutRef.current = setTimeout(() => {
                const ab = cbRef.current(...args)
                if (ab) { abortRef.current = ab }
            }, delay)
        }
    }, [delay])
}

