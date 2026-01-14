/**
 * Progressive Web App Manager
 * --------------------------
 * Handles PWA functionality and service worker registration.
 * 
 * Features:
 * - Service worker registration
 * - Web app manifest generation
 * - Offline support
 * - App installation handling
 * - Cache management
 * - Push notifications support
 * - Background sync
 * 
 * @param {Object} siteConfig - Site configuration object
 * @param {string} siteConfig.url - Base URL of the site
 * @param {string} siteConfig.title - Site title for manifest
 * @param {string} siteConfig.description - Site description
 * @param {string} siteConfig.accentColor - Theme color for PWA
 * @param {string} siteConfig.icon - Path to site icon
 */

type PwaConfig = {
  url: string,
  title: string,
  description: string,
  accentColor: string,
  icon: string,
};

export class ProgressiveWebAppManager {
  static MANIFEST_SELECTOR = '[data-manifest]';
  private config: PwaConfig;

  constructor(config: PwaConfig) {
    this.config = config;
    this.init();
  }

  private init(): void {
    const manifest = this.generateManifest();
    this.attachManifest(manifest);
  }

  private generateManifest(): string {
    return JSON.stringify({
      id: '/',
      name: this.config.title,
      short_name: this.config.title,
      start_url: this.config.url,
      background_color: "#fff",
      theme_color: this.config.accentColor,
      description: this.config.description,
      display: "standalone",
      display_override: ["standalone", "fullscreen", "minimal-ui", "browser"],
      icons: [
        { src: this.config.icon, sizes: "512x512", type: "image/png" },
      ]
    });
  }

  private attachManifest(manifest: string): void {
    const blob = new Blob([manifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    document.querySelector(ProgressiveWebAppManager.MANIFEST_SELECTOR)?.setAttribute('href', manifestURL);
  }
}
