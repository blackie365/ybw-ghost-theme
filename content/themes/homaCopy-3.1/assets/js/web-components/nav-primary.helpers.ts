import { GhostNavigationItem } from "../config";

const SUBMENU_ITEM_PREFIX = '-';


/**
 * Check if the label is a submenu item
 * @param {string | null} label - The label of the item
 * @returns {boolean} True if the label is a submenu item, false otherwise
 */
function isSubmenuItem(label: string | null): boolean {
  return label?.startsWith(SUBMENU_ITEM_PREFIX) ?? false;
}

/**
 * Format the label of the item
 * @param {string | null} label - The label of the item
 * @returns {string} The formatted label
 */ 
function formatLabel(label: string | null): string {
  if (!label) {
    return '';
  }

  return isSubmenuItem(label) ? label.substring(SUBMENU_ITEM_PREFIX.length).trim() : label;
}

export type NavPrimaryItem = {
  label: string;
  url: string;
  isCurrent: boolean;
  items?: NavPrimaryItem[];
}

/**
 * Format the items
 * @param {GhostNavigationItem[]} initialItems - The initial items from the theme config
 * @returns {NavPrimaryItem[]} The formatted items
 */
export function formatPrimaryNavItems(initialItems: GhostNavigationItem[]): NavPrimaryItem[] {
  const items: NavPrimaryItem[] = [];
  let currentParentIndex = -1;
  const currentUrl = window.location.pathname;

  for (let i = 0; i < initialItems.length; i++) {
    const currentItem = initialItems[i];
    const isSubItem = isSubmenuItem(currentItem.label);
    const itemUrl = currentItem.url || '';
    const isCurrent = itemUrl ? currentUrl === itemUrl : false;

    if (!isSubItem) {
      // This is a parent/main menu item
      items.push({
        label: formatLabel(currentItem.label),
        url: itemUrl,
        isCurrent,
        items: []
      });
      currentParentIndex = items.length - 1;
    } else if (currentParentIndex >= 0) {
      // This is a submenu item, add it to the most recent parent
      const subItem = {
        label: formatLabel(currentItem.label),
        url: itemUrl,
        isCurrent
      };
      
      items[currentParentIndex].items!.push(subItem);
      
      // If a submenu item is current, also mark the parent as current
      if (isCurrent) {
        items[currentParentIndex].isCurrent = true;
      }
    }
  }

  // Remove empty items arrays
  for (const item of items) {
    if (item.items && item.items.length === 0) {
      delete item.items;
    }
  }
  
  return items;
}