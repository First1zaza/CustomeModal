import type { ReactNode } from "react";

type Align = "left" | "center" | "right";

type Justify = "top" | "center" | "bottom";

type Width = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | number | string;

export type ModalProps = {
  children?: ReactNode;
  dismissOnBackdrop?: boolean;
  align?: Align;
  justify?: Justify;
  width?: Width;
};

export function Modal(props: ModalProps): JSX.Element | null;

export function useModal(options?: Partial<ModalProps>): {
  open: boolean;
  setOpen: (value: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  Modal: (props: ModalProps) => JSX.Element | null;
};
