const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --cm-overlay-bg: rgba(0, 0, 0, 0.55);
      --cm-bg: #ffffff;
      --cm-text: #1a1a1a;
      --cm-border: #e4e4e4;
      --cm-radius: 16px;
      --cm-width: 560px;
      --cm-max-width: 92vw;
      --cm-padding: 20px 22px;
      --cm-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
      --cm-header-gap: 10px;
      --cm-footer-gap: 12px;
      --cm-z-index: 1000;
      --cm-close-size: 36px;
      --cm-close-color: #4a4a4a;
      --cm-close-hover-bg: rgba(0, 0, 0, 0.08);
      --cm-close-hover-color: #111111;
      --cm-anim-duration: 180ms;

      display: none;
      position: fixed;
      inset: 0;
      z-index: var(--cm-z-index);
      font: inherit;
      color: var(--cm-text);
    }

    :host([open]) {
      display: block;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: var(--cm-overlay-bg);
      opacity: 0;
      transition: opacity var(--cm-anim-duration) ease;
    }

    :host([open]) .overlay {
      opacity: 1;
    }

    .dialog {
      position: relative;
      max-width: var(--cm-max-width);
      width: var(--cm-width);
      margin: 6vh auto 0;
      background: var(--cm-bg);
      border: 1px solid var(--cm-border);
      border-radius: var(--cm-radius);
      box-shadow: var(--cm-shadow);
      transform: translateY(10px) scale(0.98);
      opacity: 0;
      transition: transform var(--cm-anim-duration) ease, opacity var(--cm-anim-duration) ease;
      outline: none;
      overflow: hidden;
    }

    :host([open]) .dialog {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    :host([size="sm"]) .dialog {
      width: 420px;
    }

    :host([size="lg"]) .dialog {
      width: 720px;
    }

    :host([size="full"]) .dialog {
      width: min(96vw, 1100px);
      margin-top: 4vh;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--cm-header-gap);
      padding: var(--cm-padding);
      padding-bottom: 0;
    }

    .body {
      padding: var(--cm-padding);
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--cm-footer-gap);
      padding: var(--cm-padding);
      padding-top: 0;
    }

    .close-slot {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button {
      width: var(--cm-close-size);
      height: var(--cm-close-size);
      border-radius: 999px;
      border: none;
      background: transparent;
      color: var(--cm-close-color);
      font-size: 20px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background var(--cm-anim-duration) ease, color var(--cm-anim-duration) ease;
    }

    .close-button:hover,
    .close-button:focus-visible {
      background: var(--cm-close-hover-bg);
      color: var(--cm-close-hover-color);
      outline: none;
    }

    :host([show-close="false"]) .close-slot {
      display: none;
    }

    ::slotted([slot="header"]) {
      flex: 1;
    }
  </style>

  <div class="overlay" part="overlay"></div>
  <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
    <div class="header" part="header">
      <slot name="header"></slot>
      <div class="close-slot" part="close-slot">
        <slot name="close">
          <button class="close-button" type="button" part="close-button" aria-label="Close modal">&times;</button>
        </slot>
      </div>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
    <div class="footer" part="footer">
      <slot name="footer"></slot>
    </div>
  </div>
`;

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");

class CustomModal extends HTMLElement {
  static get observedAttributes() {
    return ["open", "size", "show-close", "close-on-backdrop", "aria-label"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._overlayEl = this.shadowRoot.querySelector(".overlay");
    this._dialogEl = this.shadowRoot.querySelector(".dialog");
    this._closeSlot = this.shadowRoot.querySelector(".close-slot");

    this._handleOverlayClick = this._handleOverlayClick.bind(this);
    this._handleCloseClick = this._handleCloseClick.bind(this);
    this._handleKeydown = this._handleKeydown.bind(this);
  }

  connectedCallback() {
    this._upgradeProperty("open");
    this._upgradeProperty("size");
    this._upgradeProperty("showClose");
    this._upgradeProperty("closeOnBackdrop");

    this._overlayEl.addEventListener("click", this._handleOverlayClick);
    this._closeSlot.addEventListener("click", this._handleCloseClick);
    this.addEventListener("keydown", this._handleKeydown);

    this._syncAria();
  }

  disconnectedCallback() {
    this._overlayEl.removeEventListener("click", this._handleOverlayClick);
    this._closeSlot.removeEventListener("click", this._handleCloseClick);
    this.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (name === "open") {
      if (this.open) {
        this._onOpen();
      } else {
        this._onClose();
      }
      return;
    }

    if (name === "aria-label") {
      this._syncAria();
    }
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(value) {
    if (value) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  openModal() {
    this.open = true;
  }

  closeModal() {
    this.open = false;
  }

  get closeOnBackdrop() {
    return !this._isFalseAttr("close-on-backdrop");
  }

  set closeOnBackdrop(value) {
    if (value === false) {
      this.setAttribute("close-on-backdrop", "false");
    } else {
      this.removeAttribute("close-on-backdrop");
    }
  }

  get showClose() {
    return !this._isFalseAttr("show-close");
  }

  set showClose(value) {
    if (value === false) {
      this.setAttribute("show-close", "false");
    } else {
      this.removeAttribute("show-close");
    }
  }

  _upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  _isFalseAttr(name) {
    const attr = this.getAttribute(name);
    return attr !== null && attr.toLowerCase() === "false";
  }

  _handleOverlayClick(event) {
    if (event.target !== this._overlayEl) {
      return;
    }
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }

  _handleCloseClick(event) {
    const target = event.target;
    if (target.closest("button") || target.closest("[data-close]") || target.closest("slot[name='close']")) {
      this.closeModal();
    }
  }

  _handleKeydown(event) {
    if (!this.open) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = this._getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      this._dialogEl.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.getRootNode().activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  _getFocusableElements() {
    const shadowFocusable = Array.from(this.shadowRoot.querySelectorAll(FOCUSABLE_SELECTORS));
    const lightFocusable = Array.from(this.querySelectorAll(FOCUSABLE_SELECTORS));

    return [...shadowFocusable, ...lightFocusable].filter((el) => {
      if (el.hasAttribute("disabled")) {
        return false;
      }
      if (el.getAttribute("aria-hidden") === "true") {
        return false;
      }
      return el.offsetParent !== null || el.getClientRects().length > 0;
    });
  }

  _onOpen() {
    this._lastActive = document.activeElement;
    this._syncAria();
    this.dispatchEvent(new CustomEvent("modal-opened", { bubbles: true }));

    window.requestAnimationFrame(() => {
      const focusable = this._getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        this._dialogEl.focus();
      }
    });
  }

  _onClose() {
    this.dispatchEvent(new CustomEvent("modal-closed", { bubbles: true }));

    if (this._lastActive && typeof this._lastActive.focus === "function") {
      this._lastActive.focus();
    }
  }

  _syncAria() {
    const label = this.getAttribute("aria-label");
    if (label) {
      this._dialogEl.setAttribute("aria-label", label);
    } else {
      this._dialogEl.removeAttribute("aria-label");
    }
  }
}

customElements.define("custom-modal", CustomModal);

export { CustomModal };
