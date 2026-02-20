# Custom Modal

Lightweight modal component for React. Focused on rendering any React children, with simple API and optional imperative control.

## Install

```bash
npm install custome-modal
```

Or with yarn/pnpm:
```bash
yarn add custome-modal
pnpm add custome-modal
```

## QuickStart

```tsx
"use client";

import { useModal } from "custome-modal/react";

export default function Example() {
  const { openModal, closeModal, Modal } = useModal();

  return (
    <div>
      <button onClick={openModal}>Open modal</button>

      <Modal width="lg">
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

### Multiple Modals

```tsx
"use client";

import { useModal } from "custome-modal/react";

export default function Example() {
  const confirmModal = useModal();
  const detailModal = useModal();

  return (
    <div className="space-y-3">
      <button onClick={confirmModal.openModal}>Open confirm</button>
      <button onClick={detailModal.openModal}>Open detail</button>

      <confirmModal.Modal width="md">
        <h2>Confirm delete</h2>
        <p>Are you sure?</p>
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={confirmModal.closeModal}>Cancel</button>
          <button onClick={confirmModal.closeModal}>Delete</button>
        </div>
      </confirmModal.Modal>

      <detailModal.Modal width="lg">
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

- `children` (ReactNode) - custom content. Default: `undefined`.
- `dismissOnBackdrop` (boolean) - click backdrop to close. Default: `true`.
- `align` (`left` | `center` | `right`) - horizontal alignment inside viewport. Default: `center`.
- `justify` (`top` | `center` | `bottom`) - vertical alignment inside viewport. Default: `center`.
- `width` (`sm` | `md` | `lg` | `xl` | `2xl` | `3xl` | `4xl` | `5xl` | number | string) - modal width. Default: `lg`.

## Methods (from useModal)

- `openModal()` - open the modal.
- `closeModal()` - close the modal.
- `setOpen(value: boolean)` - set open state directly.

## Notes

- Works with any React app (Next.js, Vite, CRA, etc.)
- For Next.js, use within `"use client"` components only.
