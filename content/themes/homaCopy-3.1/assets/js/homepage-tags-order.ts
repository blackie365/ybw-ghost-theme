import { themeConfig } from './config';

/**
 * Reorders the homepage tag sections based on the order specified
 * in the themeConfig.homepageTags setting.
 * It assigns a CSS `order` style to each section element
 * identified by the `data-tag` attribute, assuming the parent
 * container is a flex container (e.g., using Tailwind's `flex`).
 */
export class HomepageTagsOrder {
  constructor() {
    const tags = themeConfig?.homepageTags?.split(',').map((tag) => tag.trim());
    tags?.forEach((tag, index) => {
      const tagElement = document.querySelector(`[data-tag="${tag}"]`) as HTMLElement;
      if (tagElement) {
        tagElement.style.order = `${index}`;
      }
    });
  }
}