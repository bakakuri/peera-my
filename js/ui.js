export const header = () => `
<header class="hdr">
  <a class="logo" href="#/" aria-label="Peera.My — მთავარი გვერდი"><img src="assets/logo.webp" alt="Peera.My" width="140" height="40"></a>
</header>`;

export function flag(code) {
  if (code === "de")
    return `<span class="flag"><i style="height:34%;background:#111"></i><i style="height:33%;background:#DD0000"></i><i style="height:33%;background:#FFCE00"></i></span>`;
  if (code === "es")
    return `<span class="flag"><i style="height:28%;background:#C8102E"></i><i style="height:44%;background:#FFC400"></i><i style="height:28%;background:#C8102E"></i></span>`;
  return `<span class="flag"><svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden="true"><rect width="28" height="28" fill="#1F3FA8"/><path d="M0 0l28 28M28 0L0 28" stroke="#fff" stroke-width="5"/><path d="M0 0l28 28M28 0L0 28" stroke="#D8212F" stroke-width="2"/><path d="M14 0v28M0 14h28" stroke="#fff" stroke-width="8"/><path d="M14 0v28M0 14h28" stroke="#D8212F" stroke-width="4"/></svg></span>`;
}

const ICONS = {
  home: `<path d="M12 3.2l8.6 7.4a1 1 0 0 1 .3 1.1l-.1.2V19a1.5 1.5 0 0 1-1.5 1.5h-3.4v-5.6h-5.8v5.6H6.7A1.5 1.5 0 0 1 5.2 19v-7.1l-.1-.2a1 1 0 0 1 .3-1.1z" fill="currentColor"/>`,
  cards: `<rect x="3" y="7" width="14" height="12" rx="3" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="2.2"/><path d="M7 4h12a2 2 0 0 1 2 2v9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`,
  lesson: `<path d="M2.5 5.2C5.6 4 9.2 4.2 12 6v13.6c-2.8-1.8-6.4-2-9.5-.8zM21.5 5.2C18.4 4 14.8 4.2 12 6v13.6c2.8-1.8 6.4-2 9.5-.8z" fill="currentColor"/>`,
  progress: `<rect x="3.5" y="12" width="4.6" height="8.5" rx="1.6" fill="currentColor"/><rect x="9.7" y="7" width="4.6" height="13.5" rx="1.6" fill="currentColor"/><rect x="15.9" y="3" width="4.6" height="17.5" rx="1.6" fill="currentColor"/>`,
};

export const svg = (name, size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

const NAV = [
  { id: "home", href: "#/", label: "მთავარი" },
  { id: "cards", href: "#/cards", label: "ბარათები" },
  { id: "lesson", href: "#/lesson", label: "გაკვეთილი" },
  { id: "progress", href: "#/progress", label: "პროგრესი" },
];

export function navHtml(active) {
  return `<div class="nav-pill">${NAV.map(
    (n) => `<a class="nav-item${n.id === active ? " active" : ""}" href="${n.href}" aria-label="${n.label}"${n.id === active ? ' aria-current="page"' : ""}>${svg(n.id)}<span>${n.label}</span></a>`
  ).join("")}</div>`;
}

export const icon = {
  star: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#FFC21A" stroke="#F5A300" stroke-width="1" stroke-linejoin="round" d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z"/></svg>`,
  flame: `<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="flm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC83D"/><stop offset="1" stop-color="#FF5A1F"/></linearGradient></defs><path fill="url(#flm)" d="M12 2c1.2 4.2 6 5.8 6 11a6 6 0 0 1-12 0c0-2.4 1.2-3.8 2.4-5 .3 1.6 1 2.4 2 2.6C10.2 8 10.4 5 12 2z"/></svg>`,
  trophy: `<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path fill="#FFC21A" stroke="#F5A300" stroke-width="1" stroke-linejoin="round" d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" fill="none" stroke="#F5A300" stroke-width="1.6"/><rect x="10.5" y="14" width="3" height="4" fill="#F5A300"/><rect x="8" y="18" width="8" height="3" rx="1" fill="#FFC21A" stroke="#F5A300" stroke-width="1"/></svg>`,
  speaker: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1D1B5C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="#1D1B5C"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a9 9 0 0 1 0 12"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  back: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>`,
  flip: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFC83D" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 2v5h-5M6 22v-5h5"/></svg>`,
  play: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#1D1B5C" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`,
  lock: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
};

// მიღწევების აიკონები (emoji-ს გარეშე)
export const badgeIcon = (id) => {
  const paths = {
    first: `<path d="M12 21V11M12 11c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    words3: `<path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z" fill="currentColor"/>`,
    streak3: `<path d="M12 2c1.2 4.2 6 5.8 6 11a6 6 0 0 1-12 0c0-2.4 1.2-3.8 2.4-5 .3 1.6 1 2.4 2 2.6C10.2 8 10.4 5 12 2z" fill="currentColor"/>`,
    xp100: `<path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z" fill="currentColor"/>`,
    rev25: `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>`,
    lesson: `<path d="M4 15v-3a8 8 0 0 1 16 0v3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><rect x="3" y="13" width="5" height="8" rx="2.5" fill="currentColor"/><rect x="16" y="13" width="5" height="8" rx="2.5" fill="currentColor"/>`,
  };
  return `<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">${paths[id] || ""}</svg>`;
};
