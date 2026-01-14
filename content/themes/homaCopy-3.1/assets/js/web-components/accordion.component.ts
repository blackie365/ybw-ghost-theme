/**
 * Accordion Web Component
 * -----------------------
 * A minimal collapsible section with a header that toggles content visibility.
 * 
 * Features:
 * - Smooth height animations for expanding/collapsing
 * - Accessible with proper ARIA attributes
 * - Content is hidden by default and revealed on click
 * - Can be initially open with the 'open' attribute
 * - Minimal styling - designed to be styled with external classes
 * 
 * Usage:
 * ```html
 * <accordion-component>
 *   <div slot="target" class="your-tailwind-classes">Click to Toggle</div>
 *   <div slot="content" class="your-tailwind-classes">Hidden content that appears when clicked</div>
 * </accordion-component>
 * 
 * <!-- Initially open accordion -->
 * <accordion-component open>
 *   <div slot="target" class="your-tailwind-classes">Click to Toggle</div>
 *   <div slot="content" class="your-tailwind-classes">This content is visible by default</div>
 * </accordion-component>
 * ```
 */

export class AccordionComponent extends HTMLElement {
  private contentSlot: HTMLElement | null = null;
  private targetSlot: HTMLElement | null = null;
  private contentWrapper: HTMLElement | null = null;
  private isOpen: boolean = false;

  // Define observed attributes
  static get observedAttributes() {
    return ['open'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    
    // Check if should be initially open
    if (this.hasAttribute('open')) {
      this.isOpen = true;
      this.updateOpenState();
    }
    
    this.updateAriaAttributes();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'open' && oldValue !== newValue) {
      this.isOpen = this.hasAttribute('open');
      if (this.contentWrapper && this.targetSlot) {
        this.updateOpenState();
      }
    }
  }

  /**
   * Renders the component structure
   */
  private render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .accordion-target {
          cursor: pointer;
          user-select: none;
        }
        
        .accordion-content-wrapper {
          overflow: hidden;
          transition: height 0.3s ease-out;
          height: 0;
        }
      </style>
      
      <div class="accordion-target" part="target">
        <slot name="target"></slot>
      </div>
      
      <div class="accordion-content-wrapper" part="content-wrapper">
        <div class="accordion-content" part="content">
          <slot name="content"></slot>
        </div>
      </div>
    `;

    this.targetSlot = this.shadowRoot.querySelector('.accordion-target');
    this.contentWrapper = this.shadowRoot.querySelector('.accordion-content-wrapper');
  }

  /**
   * Sets up event listeners for toggling
   */
  private setupEventListeners() {
    if (!this.targetSlot) return;

    this.targetSlot.addEventListener('click', () => this.toggle());
    this.targetSlot.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Updates the open/closed state visually
   */
  private updateOpenState() {
    if (!this.contentWrapper || !this.targetSlot) return;
    
    if (this.isOpen) {
      const contentHeight = this.contentWrapper.scrollHeight;
      this.contentWrapper.style.height = `${contentHeight}px`;
      
      // Set the attribute for styling purposes
      this.setAttribute('open', '');
    } else {
      this.contentWrapper.style.height = '0';
      
      // Remove the attribute
      this.removeAttribute('open');
    }
    
    this.updateAriaAttributes();
  }

  /**
   * Toggles the accordion open/closed state
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.updateOpenState();
    
    // Dispatch a custom event that can be listened for
    this.dispatchEvent(new CustomEvent('accordion-toggle', { 
      detail: { isOpen: this.isOpen }
    }));
  }

  /**
   * Updates ARIA attributes based on the current state
   */
  private updateAriaAttributes() {
    if (!this.targetSlot || !this.contentWrapper) return;
    
    const contentId = `accordion-content-${this._generateId()}`;
    this.contentWrapper.id = contentId;
    
    this.targetSlot.setAttribute('role', 'button');
    this.targetSlot.setAttribute('aria-expanded', this.isOpen.toString());
    this.targetSlot.setAttribute('aria-controls', contentId);
    this.targetSlot.setAttribute('tabindex', '0');
    
    this.contentWrapper.setAttribute('role', 'region');
    this.contentWrapper.setAttribute('aria-labelledby', `accordion-target-${this._generateId()}`);
    this.contentWrapper.setAttribute('aria-hidden', (!this.isOpen).toString());
  }

  /**
   * Generates a unique ID for this accordion instance
   */
  private _generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

// Register the custom element
if (!customElements.get('accordion-component')) {
  customElements.define('accordion-component', AccordionComponent);
} 