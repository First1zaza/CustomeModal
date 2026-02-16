import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ALIGN_MAP = {
    left: "flex-start",
    center: "center",
    right: "flex-end"
};

const JUSTIFY_MAP = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end"
};

// Global scroll lock counter to prevent multiple modals from interfering
let scrollLockCount = 0;

function enableScrollLock() {
    if (scrollLockCount === 0) {
        const prevOverflow = document.body.style.overflow;
        document.body.dataset.scrollLockPrev = prevOverflow || "auto";
        document.body.style.overflow = "hidden";
    }
     scrollLockCount++;
}

function disableScrollLock() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
        const prevOverflow = document.body.dataset.scrollLockPrev || "auto";
        document.body.style.overflow = prevOverflow;
        delete document.body.dataset.scrollLockPrev;
    }
}

function Portal({ children, selector = "body" }) {
    const container = useMemo(() => document.createElement("div"), []);

    useEffect(() => {
        let validatedSelector = "body";
        if (typeof selector === "string" && selector.length > 0) {
            const isValid = /^[a-zA-Z0-9\-#\.:\[\]="'\s]+$/.test(selector);
            if (isValid) {
                try {
                    document.querySelector(selector);
                    validatedSelector = selector;
                } catch (e) {
                    console.warn("Invalid portal selector:", selector);
                }
            }
        }

        const host = document.querySelector(validatedSelector) ?? document.body;
        host.appendChild(container);

        return () => {
            if (host.contains(container)) {
                host.removeChild(container);
            }
        };
    }, [selector, container]);

    return createPortal(children, container);
}

export function Modal({
        open,
        onClose,
        children,
        lockScroll = true,
        closeOnEsc = true,
        dismissOnBackdrop = true,
        align = "center",
        justify = "center",
        containerStyle = {},
        overlayStyle = {},
        style = {},
        containerClassName = "",
        overlayClassName = "",
        className = "",
        portalSelector = "body"
    } = {}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open || !lockScroll) {
            return undefined;
        }

        enableScrollLock();
        return () => disableScrollLock();
    }, [open, lockScroll]);

    useEffect(() => {
        if (!open || !closeOnEsc) {
            return undefined;
        }

        function onKey(event) {
            if (event.key === "Escape") {
                onClose?.();
            }
        }

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, closeOnEsc, onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const timer = setTimeout(() => {
            if (!dialogRef.current) return;

            const focusable = dialogRef.current.querySelector(
                "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
            );
            if (focusable) {
                focusable.focus();
            } else {
                dialogRef.current.focus();
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [open]);

    // Ensure critical styles cannot be overridden
    const alignItems = ALIGN_MAP[align] || "center";
    const justifyContent = JUSTIFY_MAP[justify] || "center";

    const safeContainerStyle = {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems,
        justifyContent,
        padding: "12px",
        ...containerStyle,
        // Prevent override of critical properties
        pointerEvents: "auto"
    };

    const safeDialogStyle = {
        position: "relative",
        zIndex: 1,
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        maxWidth: "92vw",
        ...style,
        // Prevent display hidden
        display: style?.display === "none" ? "flex" : "flex"
    };

    if (!open) {
        return null;
    }

    return React.createElement(
        Portal,
        { selector: portalSelector },
        React.createElement(
            "div",
            {
                className: containerClassName,
                style: safeContainerStyle
            },
            React.createElement("div", {
                className: overlayClassName,
                style: {
                position: "absolute",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                ...overlayStyle
                },
                onClick: () => dismissOnBackdrop && onClose?.()
            }),
            React.createElement(
                "div",
                {
                    ref: dialogRef,
                    role: "dialog",
                    "aria-modal": "true",
                    tabIndex: -1,
                    className,
                    style: safeDialogStyle,
                    onClick: (event) => event.stopPropagation()
                },
                children
            )
        )
    );
}

export function useModal(options = {}) {
    const [open, setOpen] = useState(false);

    const openModal = () => setOpen(true);
    const closeModal = () => setOpen(false);

    function ModalSlot(props) {
        return React.createElement(Modal, {
            open,
            onClose: closeModal,
            ...options,
            ...props
        });
    }

    return {
        open,
        setOpen,
        openModal,
        closeModal,
        Modal: ModalSlot
    };
}
