import InfiniteScroll from 'infinite-scroll';

/**
 * Pagination Component
 * Implements "Load More" functionality for post listings using Infinite Scroll.
 * 
 * Features:
 * - Manual load more button
 * - Status messages for loading states
 * - Preserves scroll position
 * 
 * @example
 * ```html
 * <div data-posts>
 *   <!-- Post items -->
 *   <button data-pagination-load-more>Load More</button>
 *   <div data-pagination-status></div>
 * </div>
 * ```
 */
export class Pagination {
  /** DOM selectors used by the pagination */
  static SELECTORS = {
    FEED: '[data-posts]',
    NEXT_PAGE: '[data-pagination-next]',
    LOAD_MORE: '[data-pagination-load-more]',
    STATUS: '[data-pagination-status]',
    POST: '.post-card',
    PAGINATION_NAV: '.pagination nav'
  }

  /** Infinite scroll instance */
  private infiniteScroll: any;

  /**
   * Creates a new Pagination instance
   */
  constructor() {
    this.initialize();
  }

  /**
   * Initializes infinite scroll functionality
   * @returns {boolean} Whether initialization was successful
   * @private
   */
  initialize() {
    const feed = document.querySelector(Pagination.SELECTORS.FEED);
    const nextPage = document.querySelector(Pagination.SELECTORS.NEXT_PAGE);

    if (!feed || !nextPage) {
      return false;
    }

    this.infiniteScroll = new InfiniteScroll(feed, {
      path: Pagination.SELECTORS.NEXT_PAGE,
      append: Pagination.SELECTORS.POST,
      scrollThreshold: false,
      hideNav: Pagination.SELECTORS.PAGINATION_NAV,
      button: Pagination.SELECTORS.LOAD_MORE,
      status: Pagination.SELECTORS.STATUS,
      history: false,
      historyTitle: false
    });

    return true;
  }
}