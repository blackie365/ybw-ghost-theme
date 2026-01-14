/**
 * Site Header Manager
 * --------------------
 * Handles mobile menu toggle functionality for the site header.
 * 
 * Features:
 * - Mobile menu toggle using data-nav-toggle element
 * - Updates body data-nav-open attribute for menu state
 */

const selectors = {
  navToggle: '[data-nav-toggle]'
}

export class SiteHeader {
  private navToggle: HTMLElement;

  constructor() {
    this.navToggle = document.querySelector(selectors.navToggle) as HTMLElement;
    this.navToggle.addEventListener('click', this.toggleNav);
  }

  private toggleNav = () => {
    document.body.dataset.navOpen = document.body.dataset.navOpen === 'true' ? 'false' : 'true';
  }
}