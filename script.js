/* ==========================================================
   SHAGUN JEWELLERY — SITE LOGIC
   Loads text and collections from /data/settings.json and
   /data/collections.json, then fills in the page.

   These two files are what the Admin Panel (/admin) edits.
   You should not need to edit this file.
   ========================================================== */

(async function () {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null && val !== '') el.textContent = val;
  };

  let settings, collectionsData;

  try {
    const [settingsRes, collectionsRes] = await Promise.all([
      fetch('data/settings.json', { cache: 'no-store' }),
      fetch('data/collections.json', { cache: 'no-store' })
    ]);
    settings = await settingsRes.json();
    collectionsData = await collectionsRes.json();
  } catch (err) {
    console.error('Could not load site content:', err);
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="background:#B8912F;color:#fff;padding:10px;text-align:center;font-family:sans-serif;">Content failed to load. If you are viewing this file locally, some browsers block local file loading — view it through your live site or a local server instead.</div>');
    return;
  }

  // Brand
  setText('brandName', settings.business_name);
  setText('footBrand', settings.business_name);
  setText('footLegal', settings.full_legal_name);
  setText('footNote', settings.footer_note);
  setText('year', new Date().getFullYear());

  // Hero
  setText('heroHeading', settings.hero_heading);
  setText('heroSub', settings.hero_subheading);
  setText('ctaPrimary', settings.cta_primary);
  setText('ctaSecondary', settings.cta_secondary);

  // About
  setText('aboutHeading', settings.about_heading);
  const aboutParas = document.getElementById('aboutParas');
  [settings.about_paragraph_1, settings.about_paragraph_2].forEach(p => {
    if (!p) return;
    const el = document.createElement('p');
    el.textContent = p;
    aboutParas.appendChild(el);
  });

  // Custom design
  setText('customHeading', settings.custom_design_heading);
  setText('customText', settings.custom_design_text);

  // ---------- Collections grid (click a card to open its photo + video gallery) ----------
  const fallbackIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 9h12l-6 12L6 9Z"/><path d="M3 9h18L18 3H6L3 9Z"/></svg>`;

  // The admin panel may store media as one text value or a list; handle both
  const toList = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
  // A file counts as a video if its name ends in a common video extension
  const isVideo = u => /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(u || '');

  const grid = document.getElementById('collectionsGrid');
  (collectionsData.items || []).forEach(item => {
    const media = toList(item.photos);
    const firstPhoto = media.find(m => !isVideo(m));
    const cover = item.image || firstPhoto || '';
    const card = document.createElement('div');
    card.className = 'collection-card' + (media.length ? ' has-gallery' : '');

    const nVid = media.filter(isVideo).length;
    const nImg = media.length - nVid;
    const parts = [];
    if (nImg) parts.push(`${nImg} photo${nImg > 1 ? 's' : ''}`);
    if (nVid) parts.push(`${nVid} video${nVid > 1 ? 's' : ''}`);

    const visual = cover
      ? `<img class="collection-photo" src="${cover}" alt="${item.name}">`
      : `<div class="collection-icon">${fallbackIcon}</div>`;
    const hint = media.length
      ? `<span class="view-gallery">View ${parts.join(' &amp; ')} &rarr;</span>`
      : '';
    card.innerHTML = `${visual}<h3>${item.name}</h3><p>${item.description}</p>${hint}`;

    if (media.length) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${item.name} photos and videos`);
      card.addEventListener('click', () => openGallery(item, media, card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGallery(item, media, card); }
      });
    }
    grid.appendChild(card);
  });

  // ---------- Gallery pop-up + full-size viewer (photos and videos) ----------
  // Extra styling for video thumbnails/player lives here so styles.css doesn't need to change
  const mediaCss = document.createElement('style');
  mediaCss.textContent = `
    .gallery-grid .thumb { position: relative; aspect-ratio: 1 / 1; overflow: hidden; cursor: zoom-in; background: #000; border: 1px solid rgba(184,145,47,0.25); }
    .gallery-grid .thumb img, .gallery-grid .thumb video { width: 100%; height: 100%; object-fit: cover; display: block; border: 0; aspect-ratio: auto; }
    .gallery-grid .thumb:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
    .gallery-grid .thumb .play-badge { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; background: rgba(20,24,14,0.18); }
    .gallery-grid .thumb .play-badge span { width: 54px; height: 54px; border-radius: 50%; background: rgba(47,56,35,0.78); border: 1px solid rgba(212,175,55,0.75); color: var(--gold-pale); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; padding-left: 3px; }
    .lightbox video { display: none; max-width: 88vw; max-height: 84vh; background: #000; }
  `;
  document.head.appendChild(mediaCss);

  const gal = document.createElement('div');
  gal.className = 'gallery-modal';
  gal.innerHTML = `
    <div class="gallery-backdrop"></div>
    <div class="gallery-panel" role="dialog" aria-modal="true" aria-labelledby="galTitle">
      <button type="button" class="gallery-close" aria-label="Close gallery">&times;</button>
      <div class="gallery-head"><h3 id="galTitle"></h3><p id="galDesc"></p></div>
      <div class="gallery-grid" id="galGrid"></div>
      <div class="gallery-cta"><a id="galWa" class="btn btn-gold" target="_blank" rel="noopener">Ask about this collection on WhatsApp</a></div>
    </div>
    <div class="lightbox" id="lightbox">
      <button type="button" class="lb-close" aria-label="Close">&times;</button>
      <button type="button" class="lb-prev" aria-label="Previous">&#10094;</button>
      <img id="lbImg" alt="">
      <video id="lbVideo" controls playsinline></video>
      <button type="button" class="lb-next" aria-label="Next">&#10095;</button>
      <span class="lb-count" id="lbCount"></span>
    </div>`;
  document.body.appendChild(gal);

  const galGrid = gal.querySelector('#galGrid');
  const lightbox = gal.querySelector('#lightbox');
  const lbImg = gal.querySelector('#lbImg');
  const lbVideo = gal.querySelector('#lbVideo');
  const lbCount = gal.querySelector('#lbCount');
  let currentMedia = [], currentIndex = 0, currentName = '', lastFocus = null;

  function openGallery(item, media, triggerEl) {
    currentMedia = media;
    currentName = item.name;
    lastFocus = triggerEl;
    gal.querySelector('#galTitle').textContent = item.name;
    gal.querySelector('#galDesc').textContent = item.description || '';
    gal.querySelector('#galWa').href =
      `https://wa.me/${settings.whatsapp}?text=` +
      encodeURIComponent(`Hi Shagun Jewellery, I'm interested in your ${item.name}.`);

    galGrid.innerHTML = '';
    media.forEach((src, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      thumb.setAttribute('role', 'button');
      if (isVideo(src)) {
        const v = document.createElement('video');
        v.src = src + '#t=0.1';        // shows the first frame as the thumbnail
        v.muted = true;
        v.preload = 'metadata';
        v.playsInline = true;
        thumb.appendChild(v);
        const badge = document.createElement('div');
        badge.className = 'play-badge';
        badge.innerHTML = '<span>&#9654;</span>';
        thumb.appendChild(badge);
        thumb.setAttribute('aria-label', `Play ${item.name} video ${i + 1}`);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${item.name} photo ${i + 1}`;
        img.loading = 'lazy';
        thumb.appendChild(img);
        thumb.setAttribute('aria-label', `View ${item.name} photo ${i + 1}`);
      }
      thumb.addEventListener('click', () => openLightbox(i));
      thumb.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
      galGrid.appendChild(thumb);
    });

    gal.classList.add('open');
    document.body.style.overflow = 'hidden';
    gal.querySelector('.gallery-panel').scrollTop = 0;
    gal.querySelector('.gallery-close').focus();
  }

  function closeGallery() {
    closeLightbox();
    gal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function stopVideo() {
    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();
  }
  function openLightbox(i) {
    currentIndex = i;
    showLightbox();
    lightbox.classList.add('open');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    stopVideo();
  }
  function showLightbox() {
    const src = currentMedia[currentIndex];
    if (isVideo(src)) {
      lbImg.style.display = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src = src;
      const p = lbVideo.play();
      if (p && p.catch) p.catch(() => {});   // if the browser blocks autoplay, the viewer can press play
    } else {
      stopVideo();
      lbVideo.style.display = 'none';
      lbImg.style.display = 'block';
      lbImg.src = src;
      lbImg.alt = `${currentName} photo ${currentIndex + 1}`;
    }
    lbCount.textContent = `${currentIndex + 1} / ${currentMedia.length}`;
  }
  function stepLightbox(d) {
    currentIndex = (currentIndex + d + currentMedia.length) % currentMedia.length;
    showLightbox();
  }

  gal.querySelector('.gallery-backdrop').addEventListener('click', closeGallery);
  gal.querySelector('.gallery-close').addEventListener('click', closeGallery);
  gal.querySelector('.lb-close').addEventListener('click', closeLightbox);
  gal.querySelector('.lb-prev').addEventListener('click', () => stepLightbox(-1));
  gal.querySelector('.lb-next').addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!gal.classList.contains('open')) return;
    if (e.key === 'Escape') { lightbox.classList.contains('open') ? closeLightbox() : closeGallery(); }
    if (lightbox.classList.contains('open') && e.target !== lbVideo) {
      if (e.key === 'ArrowRight') stepLightbox(1);
      if (e.key === 'ArrowLeft') stepLightbox(-1);
    }
  });

  // Swipe left/right on phones inside the full-size viewer
  let touchX = null;
  lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
    touchX = null;
  });

  // ---------- Contact ----------
  setText('c-address', settings.address);
  setText('c-phone', settings.phone);
  setText('c-email', settings.email);
  document.getElementById('mapFrame').src = settings.map_embed_url;

  const timingsTable = document.getElementById('timingsTable');
  (settings.timings || []).forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${t.day}</td><td>${t.hours}</td>`;
    timingsTable.appendChild(row);
  });

  const socialRow = document.getElementById('socialRow');
  const socialIcons = {
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="18" height="18"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/></svg>`
  };
  ['instagram', 'facebook'].forEach(key => {
    if (settings[key]) {
      const a = document.createElement('a');
      a.href = settings[key];
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = socialIcons[key];
      socialRow.appendChild(a);
    }
  });

  // ---------- WhatsApp links ----------
  const waNumber = settings.whatsapp;
  const waBaseMsg = encodeURIComponent("Hi Shagun Jewellery, I'd like to share a design / ask about your collections.");
  const waUrl = `https://wa.me/${waNumber}?text=${waBaseMsg}`;
  document.getElementById('waFloat').href = waUrl;
  document.getElementById('waCustomBtn').href = waUrl;

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  // ---------- Inquiry form -> opens email client with prefilled details ----------
  const form = document.getElementById('inquiryForm');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('cd-name').value.trim();
    const phone = document.getElementById('cd-phone').value.trim();
    const notes = document.getElementById('cd-notes').value.trim();

    const subject = encodeURIComponent(`Custom Design Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\n\nDesign details:\n${notes}\n\n(Please attach your design photo to this email before sending.)`
    );
    window.location.href = `mailto:${settings.email}?subject=${subject}&body=${body}`;
    showToast('Opening your email app — don\u2019t forget to attach your photo!');
    form.reset();
  });
})();
