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

  // ---------- Collections grid ----------
  const fallbackIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M6 9h12l-6 12L6 9Z"/><path d="M3 9h18L18 3H6L3 9Z"/></svg>`;

  const grid = document.getElementById('collectionsGrid');
  (collectionsData.items || []).forEach(item => {
    const card = document.createElement('div');
    card.className = 'collection-card';
    const visual = item.image
      ? `<img class="collection-photo" src="${item.image}" alt="${item.name}">`
      : `<div class="collection-icon">${fallbackIcon}</div>`;
    card.innerHTML = `
      ${visual}
      <h3>${item.name}</h3>
      <p>${item.description}</p>
    `;
    grid.appendChild(card);
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
