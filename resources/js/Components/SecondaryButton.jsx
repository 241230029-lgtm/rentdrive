export default function SecondaryButton({
    className = '',
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={props.type ?? 'button'}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center rounded-md border border-gray-300 ` +
                `bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 ` +
                `shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 ` +
                `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ` +
                `${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`
            }
        >
            {children}
        </button>
    )
}
