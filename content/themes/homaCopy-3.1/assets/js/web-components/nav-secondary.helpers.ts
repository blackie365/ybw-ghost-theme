import { GhostNavigationItem } from "../config";

// Type definitions
export type NavSecondaryItem = {
  label: string;
  url: string;
  isExternal: boolean;
}

export type NavSecondaryColumn = {
  title: string;
  items: NavSecondaryItem[];
}

/**
 * Determines if a URL is external
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL is external
 */
export function isExternalUrl(url: string): boolean {
  if (!url) return false;
  
  // Skip anchor links and javascript: links
  if (url.startsWith('#') || url.startsWith('javascript:')) {
    return false;
  }
  
  try {
    // Try to create a URL object - this will throw if invalid
    const urlObj = new URL(url, window.location.origin);
    
    // Check if the domain is different from the current domain
    return urlObj.hostname !== window.location.hostname;
  } catch (e) {
    // If URL parsing fails, it's likely a relative URL (not external)
    return false;
  }
}

/**
 * Format the navigation items into columns
 * @param {GhostNavigationItem[]} items - The navigation items from the theme config
 * @returns {NavSecondaryColumn[]} An array of column objects with their items
 */
export function formatSecondaryNavItems(items: GhostNavigationItem[]): NavSecondaryColumn[] {
  // Handle empty or invalid items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }
  
  const columns: NavSecondaryColumn[] = [];
  let currentColumn: NavSecondaryColumn | null = null;

  for (const item of items) {
    const url = item.url || '';
    const label = item.label || '';
    const isExternal = isExternalUrl(url);

    // If the item has # as URL, it's a column header
    if (url === '#') {
      // Create a new column with this item as the title
      currentColumn = {
        title: label,
        items: []
      };
      columns.push(currentColumn);
    } else if (currentColumn) {
      // Add this item to the current column
      currentColumn.items.push({
        label,
        url,
        isExternal
      });
    } else {
      // If there's no current column yet, create a default one
      currentColumn = {
        title: '', // Empty title for the first column if no header is provided
        items: [{
          label,
          url,
          isExternal
        }]
      };
      columns.push(currentColumn);
    }
  }

  // Handle empty columns - make sure they have at least an empty items array
  if (columns.length === 0) {
    columns.push({
      title: '',
      items: []
    });
  }

  return columns;
} 