import {
    useEffect,
    useRef,
} from 'react'
import { createPortal } from 'react-dom'

const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
}

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const modalRef = useRef(null)

    useEffect(() => {
        if (!show) {
            return undefined
        }

        const previousOverflow =
            document.body.style.overflow

        document.body.style.overflow =
            'hidden'

        const handleKeyDown = (event) => {
            if (
                event.key === 'Escape' &&
                closeable
            ) {
                onClose()
            }
        }

        document.addEventListener(
            'keydown',
            handleKeyDown,
        )

        modalRef.current?.focus()

        return () => {
            document.body.style.overflow =
                previousOverflow

            document.removeEventListener(
                'keydown',
                handleKeyDown,
            )
        }
    }, [
        show,
        closeable,
        onClose,
    ])

    if (
        !show ||
        typeof document === 'undefined'
    ) {
        return null
    }

    const closeFromBackdrop = (event) => {
        if (
            closeable &&
            event.target === event.currentTarget
        ) {
            onClose()
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0"
            role="dialog"
            aria-modal="true"
            onMouseDown={closeFromBackdrop}
        >
            <div
                className="fixed inset-0 bg-gray-500/75 transition-opacity"
                aria-hidden="true"
            />

            <div
                className="relative flex min-h-full items-center justify-center"
                onMouseDown={closeFromBackdrop}
            >
                <div
                    ref={modalRef}
                    tabIndex={-1}
                    className={
                        `relative w-full overflow-hidden rounded-lg bg-white ` +
                        `shadow-xl transition-all ` +
                        `${maxWidthClasses[maxWidth] ?? maxWidthClasses['2xl']}`
                    }
                    onMouseDown={(event) =>
                        event.stopPropagation()
                    }
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    )
}
