/**
 * Partners Banner Module
 * Handles fetching, rotating, and displaying partner adverts
 * with weighted priority and accessibility features
 */

(function() {
  const API_URL = 'https://us-central1-newmembersdirectory130325.cloudfunctions.net';
  const ROTATION_INTERVAL_MS = 8000;

  // DOM elements
  const section = document.getElementById('partners-banner-section');
  const carousel = document.getElementById('partners-carousel');
  const error = document.getElementById('partners-error');
  const link = document.getElementById('partner-link');
  const nameEl = document.getElementById('partner-name');
  const headlineEl = document.getElementById('partner-headline');
  const descriptionEl = document.getElementById('partner-description');
  const detailLogoEl = document.getElementById('partner-detail-logo');
  const imageEl = document.getElementById('partner-image');
  const videoEl = document.getElementById('partner-video');

  const trackedViews = new Set();
  let partnersCache = [];
  let rotationTimer = null;
  let currentDetailIndex = 0;

  if (!section) return;

  function checkReducedMotion() {}

  async function fetchPartners() {
    const response = await fetch(`${API_URL}/getPartnersActive?limit=12`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const partners = data.partners || [];
    console.log('[partners-banner] Loaded partners:', partners.length);
    return partners;
  }

  function selectFeaturedPartner(partners) {
    return partners.find((partner) => {
      const type = (partner.assetType || '').toLowerCase();
      return type === 'video' && (partner.assetUrl || partner.logoUrl);
    }) || partners[0];
  }

  function renderMedia(partner) {
    if (!partner) return;
    const assetType = (partner.assetType || 'image').toLowerCase();
    const assetUrl = partner.assetUrl || partner.logoUrl || '';
    const posterUrl = partner.assetPosterUrl || '';
    const isVideo = assetType === 'video' && !!assetUrl;

    if (imageEl) {
      imageEl.classList.add('hidden');
      imageEl.removeAttribute('src');
      imageEl.alt = partner.name || 'Partner';
    }

    if (videoEl) {
      videoEl.classList.add('hidden');
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.removeAttribute('poster');
      videoEl.removeAttribute('loop');
      videoEl.removeAttribute('autoplay');
      videoEl.removeAttribute('muted');
      videoEl.load();
    }

    if (isVideo && videoEl) {
      videoEl.classList.remove('hidden');
      videoEl.src = assetUrl;
      if (posterUrl) {
        videoEl.setAttribute('poster', posterUrl);
      }
      const shouldMute = partner.videoMuted !== false;
      const shouldLoop = partner.videoLoop !== false;
      const shouldAutoplay = partner.videoAutoplay !== false;

      videoEl.muted = shouldMute;
      videoEl.loop = shouldLoop;
      videoEl.autoplay = shouldAutoplay;
      videoEl.setAttribute('playsinline', '');
      videoEl.controls = false;

      if (shouldMute) videoEl.setAttribute('muted', '');
      if (shouldLoop) videoEl.setAttribute('loop', '');
      if (shouldAutoplay) videoEl.setAttribute('autoplay', '');

      videoEl.load();
      if (shouldAutoplay) {
        const playPromise = videoEl.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      }
    } else if (imageEl) {
      if (assetUrl) {
        imageEl.src = assetUrl;
        imageEl.classList.remove('hidden');
      }
    }

    maybeTrackPartner(partner.id);
  }

  function renderPartnerDetails(partner) {
    if (!partner) return;

    nameEl.textContent = partner.name || 'Featured Partner';
    headlineEl.textContent = partner.headline || '';
    if (descriptionEl) {
      descriptionEl.textContent = partner.description || '';
    }

    if (detailLogoEl) {
      const logoSrc = partner.logoUrl || partner.assetPosterUrl || partner.assetUrl || '';
      if (logoSrc) {
        detailLogoEl.src = logoSrc;
        detailLogoEl.classList.remove('hidden');
        detailLogoEl.alt = `${partner.name || 'Partner'} logo`;
      } else {
        detailLogoEl.classList.add('hidden');
      }
    }

    link.href = partner.websiteUrl || '#';
    maybeTrackPartner(partner.id);
  }

  function startDetailRotation(partners) {
    if (rotationTimer) {
      clearInterval(rotationTimer);
    }

    if (partners.length <= 1) {
      return;
    }

    rotationTimer = window.setInterval(() => {
      currentDetailIndex = (currentDetailIndex + 1) % partners.length;
      renderPartnerDetails(partners[currentDetailIndex]);
    }, ROTATION_INTERVAL_MS);
  }

  function maybeTrackPartner(partnerId) {
    if (!partnerId || trackedViews.has(partnerId)) return;
    trackedViews.add(partnerId);
    fetch(`${API_URL}/trackPartnerView?id=${partnerId}`, {method: 'POST'}).catch(console.error);
  }

  async function init() {
    try {
      checkReducedMotion();
      const partners = await fetchPartners();
      if (partners.length === 0) {
        section.style.display = 'none';
        return;
      }

      partnersCache = partners;
      currentDetailIndex = 0;

      const featuredPartner = selectFeaturedPartner(partners);
      renderMedia(featuredPartner);
      renderPartnerDetails(partners[currentDetailIndex]);
      startDetailRotation(partners);

      carousel?.classList.remove('hidden');
      error?.classList.add('hidden');
    } catch (err) {
      console.error('Error initializing partners banner:', err);
      error?.classList.remove('hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
