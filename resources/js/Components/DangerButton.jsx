export default function DangerButton({
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={props.type ?? 'submit'}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center rounded-md border border-transparent ` +
                `bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ` +
                `transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none ` +
                `focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 ` +
                `${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`
            }
        >
            {children}
        </button>
    )
}
