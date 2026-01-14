/**
 * Color Scheme Manager
 * --------------------
 * Handles theme color scheme preferences and system sync.
 * 
 * Features:
 * - Light/Dark/System preference modes
 * - URL parameter override support
 * - System preference sync
 * - Session storage persistence
 */

/** Available color scheme options */
enum ColorSchemeType {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}

export class ColorSchemeManager {
  /** Storage key for persisting color scheme preference */
  private readonly STORAGE_KEY = 'color-scheme';

  /**
   * Checks URL parameters, stored preferences, and system settings and initializes the theme
   */
  constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    const colorSchemeParam = urlParams.get('color-scheme') as ColorSchemeType;
    const storedScheme = sessionStorage.getItem(this.STORAGE_KEY) as ColorSchemeType;

    if (colorSchemeParam && Object.values(ColorSchemeType).includes(colorSchemeParam)) {
      this.setColorScheme(colorSchemeParam);
    } else if (storedScheme && Object.values(ColorSchemeType).includes(storedScheme)) {
      this.setColorScheme(storedScheme);
    } else if (document.documentElement.dataset.colorScheme === ColorSchemeType.System) {
      this.initialize();
    }
  }

  /**
   * Sets the color scheme and stores the preference
   * @param scheme - The color scheme to set
   * @private
   */
  private setColorScheme(scheme: ColorSchemeType): void {
    document.documentElement.dataset.colorScheme = scheme;
    sessionStorage.setItem(this.STORAGE_KEY, scheme);
    
    if (scheme === ColorSchemeType.System) {
      this.initialize();
    }
  }

  /**
   * Initializes system preference monitoring
   * @private
   */
  private initialize(): void {
    this.updateTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.updateTheme(e.matches);
    });
  }

  /**
   * Updates the theme based on system dark mode preference
   * @param isDark - Whether system is in dark mode
   * @private
   */
  private updateTheme(isDark: boolean): void {
    document.documentElement.dataset.colorScheme = isDark ? ColorSchemeType.Dark : ColorSchemeType.Light;
  }
} 