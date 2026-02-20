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

const WIDTH_MAP = {
    sm: "300px",
    md: "500px",
    lg: "720px",
    xl: "960px",
    "2xl": "1140px",
    "3xl": "1280px",
    "4xl": "1440px",
    "5xl": "1600px"
};

let scrollLockCount = 0;

function enableScrollLock() {
    if (scrollLockCount === 0) {
        const prevOverflow = document.body.style.overflow;
        document.body.dataset.scrollLockPrev = prevOverflow || "auto";
        document.body.style.overflow = "hidden";
    }
    scrollLockCount += 1;
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
        let host = document.body;
        if (typeof selector === "string" && selector.length > 0) {
            try {
                host = document.querySelector(selector) ?? document.body;
            } catch {
                host = document.body;
            }
        }

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
    children,
    dismissOnBackdrop = true,
    align = "center",
    justify = "center",
    width = "lg",
    _open = false,
    _onClose,
    _lockScroll = true,
    _closeOnEsc = true
} = {}) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!_open || !_lockScroll) {
            return undefined;
        }
        enableScrollLock();
        return () => disableScrollLock();
    }, [_open, _lockScroll]);

    useEffect(() => {
        if (!_open || !_closeOnEsc) {
            return undefined;
        }

        function onKey(event) {
            if (event.key === "Escape") {
                _onClose?.();
            }
        }

        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [_open, _closeOnEsc, _onClose]);


    if (!_open) {
        return null;
    }

    const alignItems = ALIGN_MAP[align] || "center";
    const justifyContent = JUSTIFY_MAP[justify] || "center";
    const widthValue = typeof width === "number" ? `${width}px` : (WIDTH_MAP[width] || width);

    const safeContainerStyle = {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems,
        justifyContent,
        padding: "12px"
    };

    const safeOverlayStyle = {
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)"
    };

    const safeDialogStyle = {
        position: "relative",
        zIndex: 1,
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        width: widthValue || "720px",
        maxWidth: "92vw",
        maxHeight: "85vh",
        overflow: "auto"
    };

    return React.createElement(
        Portal,
        { selector: "body" },
        React.createElement(
            "div",
            {
                className: "",
                style: safeContainerStyle
            },
            React.createElement("div", {
                className: "",
                style: safeOverlayStyle,
                onClick: () => dismissOnBackdrop && _onClose?.()
            }),
            React.createElement(
                "div",
                {
                    ref: dialogRef,
                    role: "dialog",
                    "aria-modal": "true",
                    className: "",
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

    const stateRef = useRef({
        open,
        closeModal,
        options
    });

    stateRef.current = {
        open,
        closeModal,
        options
    };

    const modalSlotRef = useRef(null);
    if (!modalSlotRef.current) {
        modalSlotRef.current = function ModalSlot(props) {
            const current = stateRef.current;
            return React.createElement(Modal, {
                _open: current.open,
                _onClose: current.closeModal,
                _lockScroll: true,
                _closeOnEsc: true,
                ...current.options,
                ...props
            });
        };
        modalSlotRef.current.displayName = "ModalSlot";
    }

    return {
        open,
        setOpen,
        openModal,
        closeModal,
        Modal: modalSlotRef.current
    };
}
