const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --cm-overlay-bg: rgba(0, 0, 0, 0.55);
      --cm-bg: #ffffff;
      --cm-text: #1a1a1a;
      --cm-radius: 16px;
      --cm-width: 720px;
      --cm-max-width: 92vw;
      --cm-max-height: 85vh;
      --cm-padding: 12px;
      --cm-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
      --cm-z-index: 1000;
      --cm-anim-duration: 180ms;
      --cm-align-items: center;
      --cm-justify-content: center;

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
      display: flex;
      align-items: var(--cm-align-items);
      justify-content: var(--cm-justify-content);
      padding: var(--cm-padding);
      background: var(--cm-overlay-bg);
      opacity: 0;
      transition: opacity var(--cm-anim-duration) ease;
    }

    :host([open]) .overlay {
      opacity: 1;
    }

    .dialog {
      position: relative;
      width: var(--cm-width);
      max-width: var(--cm-max-width);
      max-height: var(--cm-max-height);
      overflow: auto;
      background: var(--cm-bg);
      border-radius: var(--cm-radius);
      box-shadow: var(--cm-shadow);
      transform: translateY(10px) scale(0.98);
      opacity: 0;
      transition: transform var(--cm-anim-duration) ease, opacity var(--cm-anim-duration) ease;
      outline: none;
    }

    :host([open]) .dialog {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  </style>

  <div class="overlay" part="overlay">
    <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
      <slot></slot>
    </div>
  </div>
`;

class CustomModal extends HTMLElement {
  static get observedAttributes() {
    return ["open", "width", "align", "justify", "dismiss-on-backdrop"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._overlayEl = this.shadowRoot.querySelector(".overlay");
    this._dialogEl = this.shadowRoot.querySelector(".dialog");

    this._handleOverlayClick = this._handleOverlayClick.bind(this);
  }

  connectedCallback() {
    this._upgradeProperty("open");
    this._upgradeProperty("width");
    this._upgradeProperty("align");
    this._upgradeProperty("justify");
    this._upgradeProperty("dismissOnBackdrop");

    this._overlayEl.addEventListener("click", this._handleOverlayClick);
    this._syncLayout();
  }

  disconnectedCallback() {
    this._overlayEl.removeEventListener("click", this._handleOverlayClick);
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

    if (name === "width" || name === "align" || name === "justify") {
      this._syncLayout();
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

  get dismissOnBackdrop() {
    return !this._isFalseAttr("dismiss-on-backdrop");
  }

  set dismissOnBackdrop(value) {
    if (value === false) {
      this.setAttribute("dismiss-on-backdrop", "false");
    } else {
      this.removeAttribute("dismiss-on-backdrop");
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
    if (this.dismissOnBackdrop) {
      this.closeModal();
    }
  }

  _onOpen() {
    this._lastActive = document.activeElement;
    this.dispatchEvent(new CustomEvent("modal-opened", { bubbles: true }));

    window.requestAnimationFrame(() => {
      this._dialogEl.focus();
    });
  }

  _onClose() {
    this.dispatchEvent(new CustomEvent("modal-closed", { bubbles: true }));

    if (this._lastActive && typeof this._lastActive.focus === "function") {
      this._lastActive.focus();
    }
  }

  _syncLayout() {
    const align = (this.getAttribute("align") || "center").toLowerCase();
    const justify = (this.getAttribute("justify") || "center").toLowerCase();
    const width = (this.getAttribute("width") || "lg").toLowerCase();

    const alignMap = {
      left: "flex-start",
      center: "center",
      right: "flex-end"
    };

    const justifyMap = {
      top: "flex-start",
      center: "center",
      bottom: "flex-end"
    };

    const widthMap = {
      sm: "300px",
      md: "500px",
      lg: "720px",
      xl: "960px",
      "2xl": "1140px",
      "3xl": "1280px",
      "4xl": "1440px",
      "5xl": "1600px"
    };

    const widthValue = widthMap[width] || width;
    this.style.setProperty("--cm-align-items", alignMap[align] || "center");
    this.style.setProperty("--cm-justify-content", justifyMap[justify] || "center");
    this.style.setProperty("--cm-width", this._formatWidth(widthValue));
  }

  _formatWidth(value) {
    if (!value) {
      return "720px";
    }
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }
    return value;
  }
}

customElements.define("custom-modal", CustomModal);

export { CustomModal };
