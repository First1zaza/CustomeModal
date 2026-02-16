# Custom Modal

Custom modal component for Next.js only. Focused on rendering any React children, with simple API and optional imperative control.

## Install

```bash
# local file import
```

## QuickStart

### Option 1

```tsx
"use client";

import { useModal } from "custom-modal/react";

export default function Example() {
  const { openModal, closeModal, Modal } = useModal();

  return (
    <div>
      <button onClick={openModal}>Open modal</button>

      <Modal className="p-6 w-[520px]">
        <h2>Confirm action</h2>
        <p>Custom content here</p>
        <div className="mt-6 flex gap-2 justify-end">
          <button onClick={closeModal}>Cancel</button>
          <button onClick={closeModal}>Confirm</button>
        </div>
      </Modal>
    </div>
  );
}
```

### Option 2

```tsx
"use client";

import { useState } from "react";
import { Modal } from "custom-modal/react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-6">Custom body content</div>
      </Modal>
    </div>
  );
}
```

### Multiple Modals

```tsx
"use client";

import { useModal } from "custom-modal/react";

export default function Example() {
  const confirmModal = useModal();
  const detailModal = useModal();

  return (
    <div className="space-y-3">
      <button onClick={confirmModal.openModal}>Open confirm</button>
      <button onClick={detailModal.openModal}>Open detail</button>

      <confirmModal.Modal className="p-6 w-[480px]">
        <h2>Confirm delete</h2>
        <p>Are you sure?</p>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={confirmModal.closeModal}>Cancel</button>
          <button onClick={confirmModal.closeModal}>Delete</button>
        </div>
      </confirmModal.Modal>

      <detailModal.Modal className="p-6 w-[520px]">
        <h2>Order detail</h2>
        <p>Any custom content here</p>
        <div className="mt-4 flex justify-end">
          <button onClick={detailModal.closeModal}>Close</button>
        </div>
      </detailModal.Modal>
    </div>
  );
}
```

## Props

- `open` (boolean) - show modal. Default: `false`.
- `onClose` (() => void) - callback when modal requests close (ESC/backdrop). Default: `undefined`.
- `children` (ReactNode) - custom content. Default: `undefined`.
- `dismissOnBackdrop` (boolean) - click backdrop to close. Default: `true`.
- `closeOnEsc` (boolean) - press ESC to close. Default: `true`.
- `lockScroll` (boolean) - lock `body` scroll when open. Default: `true`.
- `align` (`left` | `center` | `right`) - horizontal alignment inside viewport. Default: `center`.
- `justify` (`top` | `center` | `bottom`) - vertical alignment inside viewport. Default: `center`.
- `className` (string) - class for dialog container. Default: `""`.
- `overlayClassName` (string) - class for backdrop. Default: `""`.
- `containerClassName` (string) - class for wrapper. Default: `""`.
- `style` (CSSProperties) - inline styles for dialog container. Default: `undefined`.
- `overlayStyle` (CSSProperties) - inline styles for backdrop. Default: `undefined`.
- `containerStyle` (CSSProperties) - inline styles for wrapper. Default: `undefined`.
- `portalSelector` (string) - portal target selector. Default: `"body"`.

## Methods (from useModal)

- `openModal()` - open the modal.
- `closeModal()` - close the modal.
- `setOpen(value: boolean)` - set open state directly.

## Notes

- This library is intended for Next.js client components only.
- If you use the controlled mode, the modal closes only when you update `open`.
