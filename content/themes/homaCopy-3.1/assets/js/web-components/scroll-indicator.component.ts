/**
 * Scroll Indicator Web Component
 * ------------------------------
 * A custom element for displaying a circular progress indicator showing reading position.
 * 
 * Features:
 * - Circular progress animation
 * - Smooth fade in/out
 * - Click to scroll to top
 * - Only shows on long pages (> 2x viewport)
 * 
 * Usage:
 * ```html
 * <scroll-indicator icon="arrow_up" class="optional-extra-classes"></scroll-indicator>
 * ```
 * 
 * Attributes:
 * - icon: The icon to display inside the progress circle (defaults to "arrow_up")
 */

const classNames = {
  container: 'scroll-indicator',
  circle: 'progress-circle',
}

export class ScrollIndicatorComponent extends HTMLElement {
  private _circle: SVGCircleElement | null = null;
  private _cssClass: string;
  private _icon: string;
  private readonly CIRCLE_RADIUS = 47; // Percentage value for radius
  private readonly CIRCLE_LENGTH = 2 * Math.PI * this.CIRCLE_RADIUS; // Circumference in percentage units
  private readonly FADE_THRESHOLD = 100; // Pixels from top where fade starts/ends

  constructor() {
    super();
    this._cssClass = this.getAttribute('class') || '';
    this._icon = this.getAttribute('icon') || 'arrow_up';
  }

  connectedCallback() {
    this.render();
    this._circle = this.querySelector('circle');
    
    this.initializeEventListeners();
    this.checkVisibilityAndUpdate();
    this.updateCircleProgress();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    this.removeEventListener('click', this.scrollToTop);
  }

  /**
   * Renders the scroll indicator with SVG circle
   */
  private render() {
    this.innerHTML = `
      <div class="${classNames.container} ${this._cssClass}" data-icon="${this._icon}">
        <svg viewBox="0 0 100 100" overflow="visible">
          <circle cx="50" cy="50" r="${this.CIRCLE_RADIUS}" />
        </svg>
      </div>
    `;
  }

  /**
   * Sets up scroll, resize, and click event listeners
   * @private
   */
  private initializeEventListeners() {
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
    this.addEventListener('click', this.scrollToTop);
  }

  /**
   * Handle scroll events to update progress and opacity
   * @private
   */
  private handleScroll = () => {
    this.updateCircleProgress();
    this.updateOpacity();
  }

  /**
   * Handle resize events to check visibility
   * @private
   */
  private handleResize = () => {
    this.checkVisibilityAndUpdate();
  }

  /**
   * Scroll to top with smooth behavior when clicked
   * @private
   */
  private scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Checks if page is long enough to show indicator
   * @private
   */
  private checkVisibilityAndUpdate() {
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    if (documentHeight > viewportHeight * 2) {
      this.style.display = 'flex';
      this.updateOpacity();
    } else {
      this.style.display = 'none';
    }
  }

  /**
   * Updates the circular progress indicator
   * @private
   */
  private updateCircleProgress() {
    if (!this._circle) return;
    
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = Math.min(scrolled / documentHeight, 1);
    
    // Calculate the stroke dash offset to create the progress effect around the circle
    const dashOffset = this.CIRCLE_LENGTH * (1 - progress);
    
    // Apply the stroke dash properties to create the progress effect
    this._circle.style.strokeDasharray = `${this.CIRCLE_LENGTH}`;
    this._circle.style.strokeDashoffset = `${dashOffset}`;
  }

  /**
   * Updates indicator opacity based on scroll position
   * @private
   */
  private updateOpacity() {
    const scrolled = window.scrollY;
    
    if (scrolled < this.FADE_THRESHOLD) {
      const opacity = scrolled / this.FADE_THRESHOLD;
      this.style.opacity = opacity.toString();
    } else {
      this.style.opacity = '1';
    }
  }
}

// Register the custom element
if (!customElements.get('scroll-indicator')) {
  customElements.define('scroll-indicator', ScrollIndicatorComponent);
} 