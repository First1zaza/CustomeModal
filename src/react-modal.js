import React, { useEffect, useMemo, useState } from "react";
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

function Portal({ children, selector = "body" }) {
  const container = useMemo(() => document.createElement("div"), []);

  useEffect(() => {
    const host = document.querySelector(selector) ?? document.body;
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
  dismissOnBackdrop = true,
  className = "",
  overlayClassName = "",
  containerClassName = "",
  align = "center",
  justify = "center",
  lockScroll = true,
  closeOnEsc = true,
  containerStyle,
  overlayStyle,
  style,
  portalSelector = "body"
}) {
  useEffect(() => {
    if (!open || !lockScroll) {
      return undefined;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow || "auto";
    };
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

  if (!open) {
    return null;
  }

  const alignItems = JUSTIFY_MAP[justify] ?? "center";
  const justifyContent = ALIGN_MAP[align] ?? "center";

  return React.createElement(
    Portal,
    { selector: portalSelector },
    React.createElement(
      "div",
      {
        className: containerClassName,
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems,
          justifyContent,
          padding: "12px",
          ...containerStyle
        }
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
          role: "dialog",
          "aria-modal": "true",
          className,
          style: {
            position: "relative",
            zIndex: 1,
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
            maxWidth: "92vw",
            ...style
          },
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
