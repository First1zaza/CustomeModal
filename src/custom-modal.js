const template = document.createElement("template");

template.innerHTML = `
  <style>
    :host {
      --cm-overlay-bg: rgba(0, 0, 0, 0.5);
      --cm-width: 720px;
      --cm-max-width: 92vw;
      --cm-max-height: 90vh;
      --cm-align-items: center;
      --cm-justify-content: center;
      --cm-z-index: 1000;

      display: none;
      position: fixed;
      inset: 0;
      z-index: var(--cm-z-index);
      font: inherit;
    }

    :host([open]) {
      display: flex;
      align-items: var(--cm-align-items);
      justify-content: var(--cm-justify-content);
      padding: 12px;
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: var(--cm-overlay-bg);
    }

    .dialog {
      position: relative;
      z-index: 1;
      width: var(--cm-width);
      max-width: var(--cm-max-width);
      max-height: var(--cm-max-height);
      overflow: auto;
      outline: none;
    }
  </style>

  <div class="overlay" part="overlay"></div>
  <div class="dialog" part="dialog" role="dialog" aria-modal="true" tabindex="-1">
    <slot></slot>
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
    this._handleKeyDown = this._handleKeyDown.bind(this);
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
    if (this._hasScrollLock) {
      this._releaseScrollLock();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === "open") {
      if (this.hasAttribute("open")) {
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

  _handleOverlayClick() {
    if (this.dismissOnBackdrop) {
      this.closeModal();
    }
  }

  _handleKeyDown(event) {
    if (event.key === "Escape" && this.open) {
      this.closeModal();
    }
  }

  _acquireScrollLock() {
    if (window._cmScrollLocks === undefined) {
      window._cmScrollLocks = 0;
    }
    if (window._cmScrollLocks === 0) {
      window._cmPrevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    window._cmScrollLocks++;
    this._hasScrollLock = true;
  }

  _releaseScrollLock() {
    if (!this._hasScrollLock) return;
    
    window._cmScrollLocks--;
    this._hasScrollLock = false;
    
    if (window._cmScrollLocks === 0 && window._cmPrevOverflow !== undefined) {
      document.body.style.overflow = window._cmPrevOverflow;
    }
  }

  _onOpen() {
    this._lastActive = document.activeElement;
    document.addEventListener("keydown", this._handleKeyDown);
    this._acquireScrollLock();
    
    this.dispatchEvent(new CustomEvent("modal-opened", { bubbles: true }));

    window.requestAnimationFrame(() => {
      this._dialogEl.focus();
    });
  }

  _onClose() {
    document.removeEventListener("keydown", this._handleKeyDown);
    this._releaseScrollLock();
    
    this.dispatchEvent(new CustomEvent("modal-closed", { bubbles: true }));

    if (this._lastActive && typeof this._lastActive.focus === "function") {
      this._lastActive.focus();
    }
  }

  _syncLayout() {
    const align = (this.getAttribute("align") || "center").toLowerCase();
    const justify = (this.getAttribute("justify") || "center").toLowerCase();
    const width = (this.getAttribute("width") || "lg").toLowerCase();

    const alignMap = { left: "flex-start", center: "center", right: "flex-end" };
    const justifyMap = { top: "flex-start", center: "center", bottom: "flex-end" };
    const widthMap = {
      sm: "300px", md: "500px", lg: "720px", xl: "960px",
      "2xl": "1140px", "3xl": "1280px", "4xl": "1440px", "5xl": "1600px"
    };

    const widthValue = widthMap[width] || width || "720px";
    
    this.style.setProperty("--cm-align-items", alignMap[align] || "center");
    this.style.setProperty("--cm-justify-content", justifyMap[justify] || "center");
    this.style.setProperty("--cm-width", /^\d+$/.test(widthValue) ? `${widthValue}px` : widthValue);
  }
}

customElements.define("custom-modal", CustomModal);

export { CustomModal };
