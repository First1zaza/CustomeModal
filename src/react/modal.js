import { useEffect, useRef, useState, createElement } from "react";
import { createPortal } from "react-dom";

const ALIGN_MAP = { left: "flex-start", center: "center", right: "flex-end" };
const JUSTIFY_MAP = { top: "flex-start", center: "center", bottom: "flex-end" };
const WIDTH_MAP = { 
    sm: "300px", md: "500px", lg: "720px", xl: "960px", 
    "2xl": "1140px", "3xl": "1280px", "4xl": "1440px", "5xl": "1600px" 
};

let scrollLocks = 0;
let prevOverflow = "";

export function Modal({
    children,
    dismissOnBackdrop = true,
    align = "center",
    justify = "center",
    width = "lg",
    _open = false,
    _onClose
}) {
    useEffect(() => {
        if (!_open) return;

        if (scrollLocks === 0) {
            prevOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
        }
        scrollLocks++;

        const onEsc = (e) => e.key === "Escape" && _onClose?.();
        document.addEventListener("keydown", onEsc);

        return () => {
            scrollLocks--;
            if (scrollLocks === 0 && prevOverflow !== undefined) {
                document.body.style.overflow = prevOverflow;
            }
            document.removeEventListener("keydown", onEsc);
        };
    }, [_open, _onClose]);

    if (!_open) return null;

    const alignItems = ALIGN_MAP[align] || "center";
    const justifyContent = JUSTIFY_MAP[justify] || "center";
    const widthValue = typeof width === "number" ? `${width}px` : (WIDTH_MAP[width] || width || "720px");

    return createPortal(
        createElement("div", {
            style: {
                position: "fixed", inset: 0, zIndex: 1000, display: "flex",
                alignItems, justifyContent, padding: "12px"
            }
        },
            createElement("div", {
                style: { position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)" },
                onClick: () => dismissOnBackdrop && _onClose?.()
            }),
            createElement("div", {
                role: "dialog", "aria-modal": "true",
                style: {
                    position: "relative",
                    width: widthValue, maxWidth: "92vw", maxHeight: "90vh", overflow: "auto"
                },
                onClick: (e) => e.stopPropagation()
            }, children)
        ),
        document.body
    );
}

export function useModal(options = {}) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const stateRef = useRef({ open, options });
    stateRef.current = { open, options };

    const modalSlotRef = useRef(null);
    if (!modalSlotRef.current) {
        modalSlotRef.current = function ModalSlot(props) {
            const current = stateRef.current;
            return createElement(Modal, {
                _open: current.open,
                _onClose: close,
                ...current.options,
                ...props
            });
        };
        modalSlotRef.current.displayName = "ModalSlot";
    }

    return {
        open,
        setOpen,
        openModal: () => setOpen(true),
        closeModal: close,
        Modal: modalSlotRef.current
    };
}
