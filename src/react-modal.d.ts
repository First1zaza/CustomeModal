import type { CSSProperties, ReactNode } from "react";

type Align = "left" | "center" | "right";

type Justify = "top" | "center" | "bottom";

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  dismissOnBackdrop?: boolean;
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  align?: Align;
  justify?: Justify;
  lockScroll?: boolean;
  closeOnEsc?: boolean;
  containerStyle?: CSSProperties;
  overlayStyle?: CSSProperties;
  style?: CSSProperties;
  portalSelector?: string;
};

export function Modal(props: ModalProps): JSX.Element | null;

export function useModal(options?: Partial<ModalProps>): {
  open: boolean;
  setOpen: (value: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  Modal: (props: Partial<ModalProps>) => JSX.Element | null;
};
