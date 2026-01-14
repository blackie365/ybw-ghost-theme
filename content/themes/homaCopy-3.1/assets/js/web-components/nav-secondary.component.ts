import { themeConfig } from '../config';
import { formatSecondaryNavItems, NavSecondaryColumn } from './nav-secondary.helpers';

/**
 * Secondary Navigation Web Component
 * ----------------------------------
 * A custom element for rendering the site's secondary navigation menu in the footer.
 * 
 * Features:
 * - Organizes navigation into columns based on header items (href="#")
 * - Responsive design that adapts to screen size (2 columns on mobile, more on larger screens)
 * - External links open in a new tab
 * - Customizable header, item, and column classes
 * 
 * Usage:
 * ```html
 * <secondary-nav 
 *   header-class="custom-header-class" 
 *   item-class="custom-item-class"
 *   column-class="custom-column-class">
 * </secondary-nav>
 * ```
 * 
 * Configuration:
 * Navigation items are pulled from the Ghost theme configuration
 * via the themeConfig.site.secondaryNavigation property.
 */
export class SecondaryNavComponent extends HTMLElement {
  private _columns: NavSecondaryColumn[] = [];
  private _headerClass: string;
  private _itemClass: string;
  private _columnClass: string;

  constructor() {
    super();
    this._columns = formatSecondaryNavItems(themeConfig?.site?.secondaryNavigation || []);
    this._headerClass = this.getAttribute('header-class') || 'text-lg font-bold';
    this._itemClass = this.getAttribute('item-class') || 'text-base font-medium';
    this._columnClass = this.getAttribute('column-class') || 'flex flex-col gap-y-1';
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Returns the appropriate grid columns class based on column count
   * @returns {string} The CSS class for grid columns
   */
  private getGridColumnsClass = (): string => {
    const columnCount = this._columns.length;
    
    if (columnCount <= 0) {
      return 'grid-cols-1';
    }
    
    // On medium screens, limit to max 4 columns
    const mdColumns = Math.min(columnCount, 4);
    
    // On large screens, use actual number of columns, up to 5
    const lgColumns = Math.min(columnCount, 5);
    
    return `grid-cols-2 md:grid-cols-${mdColumns} lg:grid-cols-${lgColumns}`;
  }

  /**
   * Renders the secondary navigation with columns
   */
  render = () => {
    this.innerHTML = `
      <div role="navigation" class="grid gap-8 ${this.getGridColumnsClass()}" aria-label="Footer navigation">
        ${this._columns.map(column => this.renderColumn(column)).join('')}
      </div>
    `;
  }

  /**
   * Renders a single navigation column
   * @param {NavSecondaryColumn} column - The column to render
   * @returns {string} HTML markup for the column
   */
  private renderColumn = (column: NavSecondaryColumn) => {
    return `
      <div class="${this._columnClass}">
        ${column.title ? `<div class="${this._headerClass}">${column.title}</div>` : ''}
        ${column.items.map(item => this.renderItem(item)).join('')}
      </div>
    `;
  }

  /**
   * Renders a navigation item
   * @param {NavSecondaryItem} item - The navigation item to render
   * @returns {string} HTML markup for the item
   */
  private renderItem = (item: { label: string, url: string, isExternal: boolean }) => {
    const externalAttrs = item.isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
    return `
      <a href="${item.url}" class="${this._itemClass}" ${externalAttrs}>${item.label}</a>
    `;
  }
}

// Register the custom element
if (!customElements.get('secondary-nav')) {
  customElements.define('secondary-nav', SecondaryNavComponent);
} 