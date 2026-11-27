import { state } from "./state.js";

export const header = () => `
<header class="hdr">
  <a class="logo" href="#/" aria-label="Peera.My — მთავარი გვერდი"><img src="assets/logo.png" alt="Peera.My" width="140" height="40"></a>
  <div class="head-actions">
    <a class="streak-chip" href="#/progress" aria-label="სწავლის სერია: ${state.stats.streak || 0} დღე"><img src="assets/icons/flame.png" alt=""><b>${state.stats.streak || 0} დღე</b></a>
    <a class="header-bell" href="#/awards" aria-label="მიღწევები"><img src="assets/icons/bell.png" alt=""></a>
    <a class="header-avatar" href="#/profile" aria-label="ჩემი პროფილი"><img src="assets/girl-dict.png" alt=""></a>
  </div>
</header>`;

export function flag(code) {
  if (code === "de")
    return `<span class="flag"><i style="height:34%;background:#111"></i><i style="height:33%;background:#DD0000"></i><i style="height:33%;background:#FFCE00"></i></span>`;
  if (code === "es")
    return `<span class="flag"><i style="height:28%;background:#C8102E"></i><i style="height:44%;background:#FFC400"></i><i style="height:28%;background:#C8102E"></i></span>`;
  return `<span class="flag"><svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden="true"><rect width="28" height="28" fill="#1F3FA8"/><path d="M0 0l28 28M28 0L0 28" stroke="#fff" stroke-width="5"/><path d="M0 0l28 28M28 0L0 28" stroke="#D8212F" stroke-width="2"/><path d="M14 0v28M0 14h28" stroke="#fff" stroke-width="8"/><path d="M14 0v28M0 14h28" stroke="#D8212F" stroke-width="4"/></svg></span>`;
}

export const svg = (name, size = 24) => `<img class="ui-icon ui-icon-${name}" src="assets/icons/${name === "lesson" ? "lessons" : name === "dict" ? "dictionary" : name}.png" width="${size}" height="${size}" alt="" aria-hidden="true">`;

const NAV = [
  { id: "home", href: "#/", label: "მთავარი" },
  { id: "cards", href: "#/cards", label: "სწავლა" },
  { id: "lesson", href: "#/lesson", label: "გაკვეთილები" },
  { id: "awards", href: "#/awards", label: "მიღწევები" },
  { id: "profile", href: "#/profile", label: "პროფილი" },
];

export function navHtml(active) {
  const items = active === "dict" ? NAV.map(n => n.id === "lesson" ? { id: "dict", href: "#/dictionary", label: "ლექსიკონი" } : n) : active === "progress" ? NAV.map(n => n.id === "awards" ? { id: "progress", href: "#/progress", label: "პროგრესი" } : n) : NAV;
  return `<div class="nav-pill">${items.map(
    (n) => `<a class="nav-item${n.id === active ? " active" : ""}" href="${n.href}" aria-label="${n.label}"${n.id === active ? ' aria-current="page"' : ""}>${svg(n.id)}<span>${n.label}</span></a>`
  ).join("")}</div>`;
}

const ico = (name, size = 24) => `<img class="ui-icon ui-icon-${name}" src="assets/icons/${name}.png" width="${size}" height="${size}" alt="" aria-hidden="true">`;
export const icon = Object.fromEntries(["star", "flame", "trophy", "speaker", "arrow", "back", "play", "lock"].map(name => [name, ico(name, name === "speaker" ? 28 : 24)]));

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
