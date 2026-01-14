/*
  Main Entry
  ---------
  Application initialization and setup.
  Loads and configures all site features.
*/

import reframe from "reframe.js";

import './web-components/nav-primary.component';
import './web-components/social-icons.component';
import './web-components/scroll-indicator.component';
import './web-components/carousel.component';
import './web-components/nav-secondary.component';
import './web-components/color-scheme-switcher.component';
import './web-components/accordion.component';

import { themeConfig } from "./config.ts";

import { SiteHeader } from './site-header.ts';
import { HomepageTagsOrder } from './homepage-tags-order.ts';
import { FormHandler } from './form-handler.ts';
import { Pagination } from './pagination.ts';
import { Lightbox } from './lightbox.ts';

import { SyntaxHighlighting } from './syntax-highlighting.ts';
import { ProgressiveWebAppManager } from "./pwa-manager.ts";
import { ColorSchemeManager } from './color-scheme-manager.ts'

new ColorSchemeManager();
new SiteHeader();
new HomepageTagsOrder();
new Pagination();
new SyntaxHighlighting();

if (themeConfig?.enableAppMode && themeConfig?.site) {
  new ProgressiveWebAppManager(themeConfig.site);
}

document.querySelectorAll<HTMLFormElement>(FormHandler.SELECTOR).forEach(form => new FormHandler(form));
document.querySelectorAll<HTMLElement>(Lightbox.SELECTOR).forEach(lightbox => new Lightbox(lightbox));

reframe('iframe[src*="youtube.com"]', {
  class: 'reframe-iframe',
});