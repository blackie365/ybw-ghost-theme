import { themeConfig } from '../config';

/**
 * Social Icons Web Component
 * 
 * A custom element for rendering social media icons as a web component.
 * Dynamically injects social media icons and links based on global configuration.
 * 
 * Configuration:
 * 1. Automatically includes Facebook and Twitter links from Ghost site settings
 * 2. Additional social links can be configured via the global window.social object:
 * ```typescript
 * window.social = {
 *   instagram: 'https://instagram.com/username',
 *   linkedin: 'https://linkedin.com/in/username'
 * };
 * ```
 */
declare global {
  interface Window {
    social?: Record<string, string>;
  }
}

type SocialLink = {
  name: string;
  url: string;
}

const classNames = {
  container: 'social-icons',
  icon: 'social-icon',
}

export class SocialIconsComponent extends HTMLElement {
  private _socialLinks: SocialLink[] = [];
  private _cssClass: string;

  constructor() {
    super();
    this._socialLinks = this.getSocialLinks();
    this._cssClass = this.getAttribute('class') || '';
  }

  private getSocialLinks(): SocialLink[] {
    const links: SocialLink[] = [];
    
    // Add Facebook from Ghost settings
    if (themeConfig?.site?.facebook) {
      links.push({
        name: 'facebook',
        url: `https://facebook.com/${themeConfig.site.facebook}`
      });
    }
    
    // Add Twitter/X from Ghost settings
    if (themeConfig?.site?.twitter) {
      links.push({
        name: 'x',
        url: `https://x.com/${themeConfig.site.twitter}`
      });
    }

    // Add additional social links from window.social
    if (window.social) {
      Object.entries(window.social).forEach(([name, url]) => {
        links.push({
          name: name.toLowerCase(),
          url   
        });
      });
    }
    
    return links;
  }

  connectedCallback() {
    this.render();
  }

  render = () => {
    if (Object.keys(this._socialLinks).length === 0) {
      this.style.display = 'none';
      return;
    }

    this.innerHTML = `
      <div class="${classNames.container} ${this._cssClass}" role="navigation" aria-label="Social Media Links">
        ${this._socialLinks.map(this.renderSocialIcon).join('')}
      </div>
    `;
  }

  private renderSocialIcon = ({ name, url }: SocialLink) => {
    if (!url) return '';
    
    return `
      <a 
        href="${url}" 
        class="${classNames.icon}"
        data-icon="${name}"
        target="_blank"
        rel="noopener"
        aria-label="${name}"
      ></a>
    `;
  }
}

// Register the custom element
if (!customElements.get('social-icons')) {
  customElements.define('social-icons', SocialIconsComponent);
} 