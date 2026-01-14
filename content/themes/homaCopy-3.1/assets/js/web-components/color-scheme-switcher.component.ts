/**
 * Color Scheme Switcher Web Component
 * ------------------------------------
 * A minimalist button that toggles between light and dark color schemes.
 * 
 * Features:
 * - Simple sun/moon icon toggle
 * - Smooth transition animations
 * - Updates color scheme based on current setting
 * - Customizable icon class
 * 
 * Usage:
 * ```html
 * <color-scheme-switcher icon-class="custom-icon-class"></color-scheme-switcher>
 * ```
 */

enum ColorSchemeType {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

export class ColorSchemeSwitcherComponent extends HTMLElement {
  private _iconClass: string;
  private readonly STORAGE_KEY = 'color-scheme';

  constructor() {
    super();
    this._iconClass = this.getAttribute('icon-class') || '';
  }

  connectedCallback() {
    this.render();
    this.addEventListener('click', this.toggleColorScheme);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.toggleColorScheme);
  }

  /**
   * Renders the component with the appropriate icon based on current color scheme
   */
  private render = () => {
    const isDark = this.isDarkMode();
    // Show sun icon in dark mode (to switch to light) and moon icon in light mode (to switch to dark)
    const buttonLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    
    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-label', buttonLabel);
    
    this.innerHTML = `
      <div class="relative ${this._iconClass}">
        <div class="transition-opacity duration-300 ease-in-out ${isDark ? 'opacity-100' : 'opacity-0'}">
          <span data-icon="sun" aria-hidden="true"></span>
        </div>
        <div class="absolute inset-0 transition-opacity duration-300 ease-in-out ${isDark ? 'opacity-0' : 'opacity-100'}">
          <span data-icon="moon" aria-hidden="true"></span>
        </div>
      </div>
    `;
  }

  /**
   * Toggles between light and dark color schemes
   */
  private toggleColorScheme = () => {
    const isDark = this.isDarkMode();
    const newScheme = isDark ? ColorSchemeType.Light : ColorSchemeType.Dark;
    
    document.documentElement.dataset.colorScheme = newScheme;
    sessionStorage.setItem(this.STORAGE_KEY, newScheme);
    
    this.render();
  }

  /**
   * Determines if the current color scheme is dark
   * @returns {boolean} True if current scheme is dark
   */
  private isDarkMode = (): boolean => {
    const currentScheme = document.documentElement.dataset.colorScheme;
    
    if (currentScheme === ColorSchemeType.Dark) {
      return true;
    } else if (currentScheme === ColorSchemeType.Light) {
      return false;
    } else if (currentScheme === ColorSchemeType.System) {
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Default fallback
    return false;
  }
}

// Register the custom element
if (!customElements.get('color-scheme-switcher')) {
  customElements.define('color-scheme-switcher', ColorSchemeSwitcherComponent);
} 