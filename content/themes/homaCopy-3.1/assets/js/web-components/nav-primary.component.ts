import { themeConfig } from '../config';
import { formatPrimaryNavItems, NavPrimaryItem } from './nav-primary.helpers';

/**
 * Primary Navigation Web Component
 * ------------------------------
 * A custom element for rendering the site's primary navigation menu.
 * 
 * Features:
 * - Responsive design that automatically adapts to screen size
 * - Supports nested dropdown menus (up to 2 levels)
 * - Automatic overflow handling with "More" menu
 * - Fully accessible with proper ARIA attributes
 * - Works with Ghost's primary navigation configuration
 * 
 * Usage:
 * ```html
 * <primary-nav class="optional-extra-classes"></primary-nav>
 * ```
 * 
 * Configuration:
 * Navigation items are pulled from the Ghost theme configuration
 * via the themeConfig.site.primaryNavigation property.
 */

const classNames = {
  nav: 'nav',
  navItem: 'nav-item',
  navItemWithMenu: 'nav-item-with-menu',
  menu: 'menu',
  menuItem: 'menu-item',
  menuItemWithSubmenu: 'menu-item-with-submenu',
  submenu: 'submenu',
  submenuItem: 'submenu-item',
}

export class PrimaryNavComponent extends HTMLElement {
  private _items: NavPrimaryItem[] = [];
  private _visibleItems: number;
  private _cssClass: string;

  constructor() {
    super();
    this._items = formatPrimaryNavItems(themeConfig?.site?.primaryNavigation || []);
    this._visibleItems = this._items.length;

    this._cssClass = this.getAttribute('class') || '';
  }

  connectedCallback() {
    this.render();
    this.handleResize();
    this.setupEventListeners();
  }

  /**
   * Renders the navigation menu with visible items and more dropdown
   */
  render = () => {
    const itemsToRender = this._items.slice(0, this._visibleItems);

    this.innerHTML = `
      <nav class="${classNames.nav} ${this._cssClass}" role="navigation" aria-label="Primary Navigation">
        ${itemsToRender.map(
      item => item.items
        ? this.renderItemWithMenu(item, classNames.navItemWithMenu, classNames.navItem, classNames.menu, classNames.menuItem)
        : this.renderItemWithLink(item, classNames.navItem)
    ).join('')}
        ${this.renderMoreMenu()}
      </nav>
    `;
  }

  /**
   * Detects if the navigation is in mobile mode
   * @returns {boolean} True if in mobile mode
   */
  private isMobile = () => {
    return document.querySelector('[data-nav-toggle]')?.checkVisibility();
  }

  /**
   * Renders a simple navigation link
   * @param {NavPrimaryItem} item - The navigation item to render
   * @param {string} itemClass - CSS class for the item
   * @returns {string} HTML markup for the link
   */
  private renderItemWithLink = (item: NavPrimaryItem, itemClass: string) => {
    return `
      <a 
        href="${item.url}" 
        class="${itemClass}" 
        ${item.isCurrent ? 'aria-current="page"' : ''}
        role="menuitem"
        tabindex="0"
      >
        ${item.label}
      </a>
    `;
  }

  /**
   * Renders a navigation item with a dropdown menu
   * @param {NavPrimaryItem} item - The navigation item with submenu
   * @param {string} rootClass - CSS class for the container element
   * @param {string} itemClass - CSS class for the trigger element
   * @param {string} menuClass - CSS class for the dropdown menu
   * @param {string} menuItemClass - CSS class for items in the dropdown
   * @returns {string} HTML markup for menu with dropdown
   */
  private renderItemWithMenu = (item: NavPrimaryItem, rootClass: string, itemClass: string, menuClass: string, menuItemClass: string) => {
    const menuId = `menu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
    return `
      <div class="${rootClass}" role="none">
        <div 
          role="button"
          class="${itemClass}"
          aria-haspopup="true"
          aria-controls="${menuId}"
          tabindex="0"
        >
          <span>${item.label}</span>
          <span aria-hidden="true" role="presentation">∨</span>
        </div>
        <div 
          id="${menuId}"
          role="menu" 
          aria-label="${item.label} menu"
          class="${menuClass}"

        >
          ${item.items?.map(menuItem => this.renderItemWithLink(menuItem, menuItemClass)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Renders the "More" dropdown menu for overflow items
   * @returns {string} HTML markup for the more menu, or empty string if no overflow
   */
  private renderMoreMenu = () => {
    const moreItems = this._items.slice(this._visibleItems);

    if (moreItems.length === 0) {
      return '';
    }

    return `
      <div class="${classNames.navItemWithMenu}" role="none">
        <div 
          role="button"
          aria-haspopup="true"
          aria-controls="more-menu"
          class="${classNames.navItem}"
        >
          <span data-icon="more"></span>
        </div>
        <div 
          id="more-menu"
          role="menu" 
          aria-label="More menu options"
          class="${classNames.menu}"
        >
          ${moreItems.map(
      item => item.items
        ? this.renderItemWithMenu(item, classNames.menuItemWithSubmenu, classNames.menuItem, classNames.submenu, classNames.submenuItem)
        : this.renderItemWithLink(item, classNames.menuItem)
    ).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Detects if the navigation items are overflowing to multiple lines
   * @returns {boolean} True if navigation is overflowing
   */
  private isOverflowing = () => {
    const nav = this.children[0];
    const firstItemTop = nav.children[0].getBoundingClientRect().top;
    const lastItemTop = nav.children[nav.children.length - 1].getBoundingClientRect().top;
    return firstItemTop < lastItemTop;
  }

  /**
   * Sets up event listeners for responsive behavior
   */
  private setupEventListeners = () => {
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Handles responsive layout changes when window is resized
   * Automatically determines how many items can fit in the navigation
   * before moving remaining items to the "More" dropdown
   */
  private handleResize = () => {
    if (this.isMobile()) {
      this._visibleItems = this._items.length;
      this.render();
    } else {
      for (let i = this._items.length; i > 0; i--) {
        this._visibleItems = i;
        this.render();
        if (!this.isOverflowing()) {
          break;
        }
      }
    }
  }
}

// Register the custom element
if (!customElements.get('primary-nav')) {
  customElements.define('primary-nav', PrimaryNavComponent);
} 