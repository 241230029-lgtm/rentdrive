export default function ApplicationLogo({
    className = '',
    ...props
}) {
    return (
        <svg
            {...props}
            className={className}
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="6"
                y="6"
                width="108"
                height="108"
                rx="28"
                fill="currentColor"
                opacity="0.12"
            />

            <path
                d="M33 69L39 48C40.7 42.2 46 38 52 38H68C74 38 79.3 42.2 81 48L87 69"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M27 72C27 66.5 31.5 62 37 62H83C88.5 62 93 66.5 93 72V82C93 85.3 90.3 88 87 88H33C29.7 88 27 85.3 27 82V72Z"
                fill="currentColor"
            />

            <circle
                cx="41"
                cy="80"
                r="7"
                fill="white"
            />

            <circle
                cx="79"
                cy="80"
                r="7"
                fill="white"
            />

            <path
                d="M44 55H76"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
            />
        </svg>
    )
}
