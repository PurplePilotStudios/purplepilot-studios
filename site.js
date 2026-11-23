(() => {
  'use strict';
  const cfg = window.PURPLEPILOT_CONFIG;
  if (!cfg || !Array.isArray(cfg.games)) {
    console.error('PurplePilot: Missing config.js game data.');
    return;
  }

  const isUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try { return ['https:', 'http:'].includes(new URL(url).protocol); }
    catch (_) { return false; }
  };

  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = String(content);
    return node;
  };

  const artMarkup = {
    christmas: '<div class="snow-hill"></div><div class="platform platform-one"></div><div class="platform platform-two"></div><div class="platform platform-three"></div><div class="pine pine-one"></div><div class="pine pine-two"></div>',
    arcade: '<div class="arcade-cabinet cab-one"></div><div class="arcade-cabinet cab-two"></div>',
    future: '<div class="future-star">✳</div>'
  };

  const titles = {
    christmas: 'CHRISTMAS<br>OBBY',
    arcade: 'ARCADE',
    future: 'NEXT UP'
  };

  const grid = document.getElementById('game-grid');
  cfg.games.forEach(game => {
    const card = element('article', 'game-card');
    const artType = Object.hasOwn(artMarkup, game.art) ? game.art : 'future';
    const art = element('div', `card-art art-${artType}`);
    // Only fixed, authored HTML fragments are inserted; config fields use textContent.
    art.innerHTML = artMarkup[artType] + `<span class="card-art-title">${titles[artType]}</span>`;
    art.appendChild(element('span', 'card-flag', game.eyebrow || 'PURPLEPILOT'));
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', `Illustrated artwork for ${game.name}`);

    const body = element('div', 'card-body');
    const meta = element('div', 'card-meta');
    meta.appendChild(element('span', 'card-type', game.type || 'Roblox game'));

    const canPlay = game.status === 'playable' && isUrl(game.url);
    const statusLabel = canPlay ? 'Available now' : game.status === 'link-pending' ? 'Game link pending' : 'In development';
    meta.appendChild(element('span', `card-status${canPlay ? ' playable' : ''}`, statusLabel));
    body.appendChild(meta);
    body.appendChild(element('h3', '', game.name));
    body.appendChild(element('p', 'game-description', game.description));

    let action;
    if (canPlay) {
      action = element('a', 'card-action active');
      action.href = game.url;
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
      action.appendChild(element('span', '', 'Play on Roblox'));
      action.appendChild(element('span', 'arrow', '↗'));
      action.setAttribute('aria-label', `Play ${game.name} on Roblox (opens a new tab)`);
    } else {
      action = element('div', 'card-action inactive');
      action.appendChild(element('span', '', game.status === 'link-pending' ? 'Play link coming soon' : 'Coming soon'));
      action.appendChild(element('span', 'arrow', '⌛'));
    }
    body.appendChild(action);
    card.append(art, body);
    grid.appendChild(card);
  });

  const announcement = cfg.announcement || {};
  if (announcement.eyebrow) document.getElementById('announcement-eyebrow').textContent = '02 / ' + announcement.eyebrow;
  if (announcement.body) document.getElementById('announcement-body').textContent = announcement.body;

  const socialWrap = document.getElementById('social-links');
  const availableSocials = (cfg.socials || []).filter(item => isUrl(item.url));
  if (isUrl(cfg.studio?.communityUrl)) {
    availableSocials.unshift({ name: 'Roblox community', handle: 'Join PurplePilot Studios', url: cfg.studio.communityUrl });
  }
  if (availableSocials.length) {
    socialWrap.textContent = '';
    availableSocials.forEach(social => {
      const link = element('a', 'social-link');
      link.href = social.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const info = element('span', '');
      info.appendChild(element('span', '', social.name));
      info.appendChild(element('span', 'social-handle', social.handle || ''));
      link.appendChild(info);
      link.appendChild(element('span', 'social-arrow', '↗'));
      socialWrap.appendChild(link);
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
})();
