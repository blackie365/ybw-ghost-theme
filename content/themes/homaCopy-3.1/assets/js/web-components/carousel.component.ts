/**
 * Carousel Web Component
 * ---------------------
 * A custom element for implementing a horizontal scrolling carousel with navigation buttons.
 * 
 * Features:
 * - Smooth horizontal scrolling
 * - Previous/Next navigation buttons
 * - Automatic button disabling at start/end
 * - Responsive design
 * - Custom arrow styling
 * - Prevents MacOS trackpad back/forward navigation at carousel boundaries
 * - Customizable via class attributes
 * 
 * Usage:
 * ```html
 * <!-- Simple usage with direct children -->
 * <carousel-component>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </carousel-component>
 * 
 * <!-- With custom arrow classes -->
 * <carousel-component 
 *   left-arrow-class="custom-left-arrow" 
 *   right-arrow-class="custom-right-arrow">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </carousel-component>
 * 
 * <!-- With custom content class for scroll snapping -->
 * <carousel-component content-class="snap-x snap-mandatory">
 *   <div class="snap-start">Item 1</div>
 *   <div class="snap-start">Item 2</div>
 *   <div class="snap-start">Item 3</div>
 * </carousel-component>
 * ```
 * 
 * Attributes:
 * - left-arrow-class: Custom class for the left arrow button (optional)
 * - right-arrow-class: Custom class for the right arrow button (optional)
 * - content-class: Custom class for the content container (optional)
 */

const classNames = {
  carousel: 'carousel-container',
  content: 'carousel-content',
  leftButton: 'carousel-button',
  rightButton: 'carousel-button',
}

export class CarouselComponent extends HTMLElement {
  private _content: HTMLElement | null = null;
  private _leftButton: HTMLElement | null = null;
  private _rightButton: HTMLElement | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _leftArrowClass: string;
  private _rightArrowClass: string;
  private _contentClass: string;

  constructor() {
    super();
    this._leftArrowClass = this.getAttribute('left-arrow-class') || '';
    this._rightArrowClass = this.getAttribute('right-arrow-class') || '';
    this._contentClass = this.getAttribute('content-class') || '';
  }

  /**
   * Lifecycle callback when element is added to the DOM
   * Initializes the carousel and sets up event listeners
   */
  connectedCallback() {
    // Store original children before rendering
    const originalChildren = Array.from(this.childNodes);
    
    this.render();
    
    // Find the content container
    this._content = this.querySelector(`.${classNames.content}`);
    this._leftButton = this.querySelector('[data-carousel-prev]');
    this._rightButton = this.querySelector('[data-carousel-next]');
    
    // Move original children into the content container
    if (this._content) {
      originalChildren.forEach(child => {
        this._content?.appendChild(child);
      });
    }
    
    this._resizeObserver = new ResizeObserver(() => this.handleResize());
    
    this.setupEventListeners();
    if (this._content) {
      this._resizeObserver.observe(this._content);
    }
    this.updateButtonStates();
  }

  /**
   * Lifecycle callback when element is removed from the DOM
   * Cleans up event listeners and observers
   */
  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._leftButton?.removeEventListener('click', this.handlePrevClick);
    this._rightButton?.removeEventListener('click', this.handleNextClick);
    this._content?.removeEventListener('scroll', this.handleScroll);
    this._content?.removeEventListener('wheel', this.handleWheel);
  }

  /**
   * Lifecycle callback when attributes change
   * @param {string} name - Name of the changed attribute
   * @param {string} oldValue - Previous value
   * @param {string} newValue - New value
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'left-arrow-class' && this._leftButton) {
      this._leftArrowClass = newValue;
      this._leftButton.className = `${classNames.leftButton} ${this._leftArrowClass}`;
    }
    if (name === 'right-arrow-class' && this._rightButton) {
      this._rightArrowClass = newValue;
      this._rightButton.className = `${classNames.rightButton} ${this._rightArrowClass}`;
    }
    if (name === 'content-class' && this._content) {
      this._contentClass = newValue;
      this._content.className = `${classNames.content} ${this._contentClass}`;
    }
  }

  /**
   * Attributes to observe for changes
   */
  static get observedAttributes() {
    return ['left-arrow-class', 'right-arrow-class', 'content-class'];
  }

  /**
   * Renders the carousel structure
   * @private
   */
  private render() {
    // Create basic carousel structure
    this.innerHTML = `
      <div class="${classNames.carousel}">
        <div class="${classNames.content} ${this._contentClass}"></div>
        <div class="${classNames.leftButton} ${this._leftArrowClass}" data-icon="arrow_left" data-carousel-prev role="button" aria-label="Previous"></div>
        <div class="${classNames.rightButton} ${this._rightArrowClass}" data-icon="arrow_right" data-carousel-next role="button" aria-label="Next"></div>
      </div>
    `;
  }

  /**
   * Sets up event listeners for navigation and scroll
   * @private
   */
  private setupEventListeners() {
    this._leftButton?.addEventListener('click', this.handlePrevClick);
    this._rightButton?.addEventListener('click', this.handleNextClick);
    this._content?.addEventListener('scroll', this.handleScroll);
    this._content?.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  /**
   * Handle click on previous button
   * @private
   */
  private handlePrevClick = () => {
    this.scrollCarousel('backward');
  }

  /**
   * Handle click on next button
   * @private
   */
  private handleNextClick = () => {
    this.scrollCarousel('forward');
  }

  /**
   * Handle content scroll events
   * @private
   */
  private handleScroll = () => {
    this.updateButtonStates();
  }

  /**
   * Handle resize events and updates button states
   * @private
   */
  private handleResize = () => {
    this.updateButtonStates();
  }

  /**
   * Scrolls the carousel in the specified direction
   * @param {string} direction - The scroll direction ('forward' or 'backward')
   * @private
   */
  private scrollCarousel(direction: 'forward' | 'backward') {
    if (!this._content) return;
    
    // Check if scroll-snap is being used (via CSS classes)
    const hasScrollSnap = this._content.className.includes('snap-');
    
    if (hasScrollSnap && this._content.children.length > 0) {
      // Attempt to find the next/previous item for a scrollable container with snap points
      const items = Array.from(this._content.children) as HTMLElement[];
      const containerRect = this._content.getBoundingClientRect();
      
      if (direction === 'forward') {
        // Find the first item that's fully or partially out of view on the right
        const nextItem = items.find(item => {
          const itemRect = item.getBoundingClientRect();
          return itemRect.left > containerRect.right - 20; // Allow small overlap
        });
        
        if (nextItem) {
          nextItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          return;
        }
      } else {
        // Find the last item that's fully or partially out of view on the left
        // and then the item before it that should be scrolled to
        const visibleIndex = items.findIndex(item => {
          const itemRect = item.getBoundingClientRect();
          return itemRect.right > containerRect.left + 20; // Allow small overlap
        });
        
        if (visibleIndex > 0) {
          const prevItem = items[visibleIndex - 1];
          prevItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
          return;
        } else if (visibleIndex === 0) {
          // Already at the first item, scroll to the start
          this._content.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }
      }
    }
    
    // Default scrolling behavior
    const scrollAmount = Math.max(this.offsetWidth * 0.5, 300);
    this._content.scrollBy({
      left: direction === 'forward' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }

  /**
   * Updates the enabled/disabled state of navigation buttons
   * @private
   */
  private updateButtonStates() {
    if (!this._content || !this._leftButton || !this._rightButton) return;
    
    const isAtStart = this._content.scrollLeft <= 0;
    const isAtEnd = this._content.scrollLeft + this._content.clientWidth + 10 >= this._content.scrollWidth;

    this._leftButton.toggleAttribute('disabled', isAtStart);
    this._rightButton.toggleAttribute('disabled', isAtEnd);
    
    // Add visual disabled state classes
    this._leftButton.classList.toggle('disabled', isAtStart);
    this._rightButton.classList.toggle('disabled', isAtEnd);
  }

  /**
   * Handle wheel events to prevent MacOS back/forward navigation at carousel boundaries
   * Prevents browser from navigating back/forward when attempting to scroll beyond carousel limits
   * @param {WheelEvent} event - The wheel event
   * @private
   */
  private handleWheel = (event: WheelEvent) => {
    if (!this._content) return;
    
    // Only handle horizontal scrolling or trackpad gestures
    if (!event.deltaX) return;
    
    const maxScrollLeft = this._content.scrollWidth - this._content.clientWidth;
    const currentScrollLeft = this._content.scrollLeft;
    
    // Check if we're at the boundaries
    const isAtStart = currentScrollLeft <= 0 && event.deltaX < 0;
    const isAtEnd = currentScrollLeft >= maxScrollLeft && event.deltaX > 0;
    
    // If at boundary and trying to scroll beyond it, prevent the default action
    // This prevents the browser's back/forward navigation on trackpads
    if (isAtStart || isAtEnd) {
      event.preventDefault();
      
      // For better UX, we can manually set the scroll position at the boundary
      // This ensures the scroll doesn't "stick" slightly before the boundary
      if (isAtStart) {
        this._content.scrollLeft = 0;
      } else if (isAtEnd) {
        this._content.scrollLeft = maxScrollLeft;
      }
    }
  }
}

// Register the custom element
if (!customElements.get('carousel-component')) {
  customElements.define('carousel-component', CarouselComponent);
} 