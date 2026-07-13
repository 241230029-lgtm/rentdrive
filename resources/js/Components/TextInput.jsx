import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'

const TextInput = forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    },
    ref,
) {
    const inputRef = useRef(null)

    useImperativeHandle(
        ref,
        () => inputRef.current,
    )

    useEffect(() => {
        if (isFocused) {
            inputRef.current?.focus()
        }
    }, [isFocused])

    return (
        <input
            {...props}
            ref={inputRef}
            type={type}
            className={
                `rounded-md border-gray-300 shadow-sm ` +
                `focus:border-indigo-500 focus:ring-indigo-500 ` +
                `${className}`
            }
        />
    )
})

export default TextInput
