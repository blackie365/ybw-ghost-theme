/**
 * Lightbox Component
 * ------------------
 * Creates an image lightbox/gallery viewer with navigation and zoom.
 * Uses PhotoSwipe library.
*/

import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';

export class Lightbox {
  static SELECTOR = '.kg-image-card, .kg-gallery-card';

  private element: HTMLElement;
  private lightbox: any;

  constructor(element: HTMLElement) {
    this.element = element;
    this.setupLightbox(element);
  }

  private setupLightbox(element): void {
    this.element = element;
    const images: HTMLImageElement[] = Array.from(element.querySelectorAll('img'));

    this.lightbox = new PhotoSwipeLightbox({
      gallery: element,
      children: 'img',
      thumbSelector: 'img',
      padding: { top: 32, bottom: 32, left: 32, right: 32 },
      pswpModule: PhotoSwipe
    });

    this.lightbox.addFilter('domItemData', (itemData, imageEl) => {
      if (imageEl) {
        const { src, width, height } = this.getOptimalImageSource(imageEl);
        itemData.src = src;
        itemData.w = width;
        itemData.h = height;
        itemData.msrc = imageEl.src;
        itemData.thumbCropped = true;
      }
    
      return itemData;
    });

    this.lightbox.init();
  }

  private getOptimalImageSource(imgElement: HTMLImageElement) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const srcset = imgElement.srcset;

    if (!srcset) {
      const { src, width, height } = imgElement;
      return { src, width, height };
    }

    const sources = srcset.split(',').map(source => {
      const [url, width] = source.trim().split(' ');
      return { url, width: parseInt(width.slice(0, -1)) };
    });

    // Sort sources by width in descending order
    sources.sort((a, b) => b.width - a.width);

    // Find the smallest source that fits the screen
    const { url, width } = sources.find(source => source.width <= screenWidth) || sources[sources.length - 1];

    // Calculate the height based on the aspect ratio of the original image dimensions
    const aspectRatio = imgElement.width / imgElement.height;
    const height = Math.round(width / aspectRatio);

    return { src: url, width, height };
  }
}
