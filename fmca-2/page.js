(() => {
  const english = {
  "skip": "Skip to content",
  "aboutNav": "About",
  "servicesNav": "Services",
  "geoNav": "Locations",
  "contactNav": "Contact",
  "heroFirst": "Warehouse",
  "heroSecond": "operations",
  "heroSub": "in Central Asia",
  "explore": "Explore services",
  "introH": "From building handover to day-to-day operations",
  "introP": "FMCA manages warehouse real estate. We look after buildings and their engineering systems, review existing management and help owners assess operating costs.",
  "operating": "Operating a warehouse",
  "operatingBody": "Property and tenant management, equipment maintenance, dispatch and facility services.",
  "management": "Property management",
  "engineering": "Engineering systems",
  "service": "Facility services",
  "auditTitle": "Taking over a facility",
  "auditBody": "A review of the current management company and operating costs.",
  "auditAction": "Request an audit",
  "btsTitle": "Build-to-suit projects",
  "btsBody": "An assessment of operating charges for a warehouse built to an occupier’s requirements.",
  "btsAction": "Request an estimate",
  "geoHeading": "Where we work",
  "contactTitle": "Discuss your facility",
  "brief": "Prepare an enquiry",
  "address": "Office A3, 44a Abai Avenue, Almaty",
  "prototype": "Local preview",
  "study": "Reference study (in Russian)"
};
  const isEnglish = new URLSearchParams(location.search).get("lang") === "en";
  const language = isEnglish ? "en" : "ru";
  document.documentElement.lang = language;
  if (isEnglish) {
    document.title = "FMCA | Warehouse operations in Central Asia";
    document.querySelectorAll("[data-t]").forEach(node => {
      node.textContent = english[node.dataset.t];
    });
    document.querySelectorAll("[data-nav]").forEach(nav => nav.setAttribute("aria-label", "Sections"));
    document.querySelectorAll("[data-brief]").forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set("lang","en");
      link.href = url;
    });
  }
  const languageLinks = document.querySelectorAll("[data-lang]");
  function updateLanguages() {
    languageLinks.forEach(link => {
      const url = new URL(link.href);
      url.hash = location.hash;
      link.href = url;
      if (link.dataset.lang === language) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    });
  }
  updateLanguages();
  window.addEventListener("hashchange", updateLanguages);

  const header = document.querySelector(".header");
  const toggle = document.querySelector(".menu-switch");
  const menu = document.querySelector(".nav-small");
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 42);
  function setMenu(open) {
    menu.hidden = !open;
    header.classList.toggle("open",open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = isEnglish ? (open ? "Close menu" : "Open menu") : (open ? "Закрыть меню" : "Открыть меню");
    toggle.setAttribute("aria-label",label);
  }
  updateHeader();
  setMenu(false);
  window.addEventListener("scroll", updateHeader, { passive: true });
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
  document.addEventListener("click", event => { if (!menu.hidden && !header.contains(event.target)) setMenu(false); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      setMenu(false);
      toggle.focus();
    }
  });
  matchMedia("(min-width: 791px)").addEventListener("change", () => setMenu(false));

  const hero = document.querySelector(".hero");
  const film = document.querySelector(".hero-film");
  const motion = document.querySelector(".motion");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = navigator.connection?.saveData === true;
  let wantsMotion = !reduced.matches && !saveData;
  let inView = true;
  let failed = false;
  function updateControl() {
    const paused = film.paused;
    const label = isEnglish ? (paused ? "Play video" : "Pause video") : (paused ? "Включить видео" : "Приостановить видео");
    motion.setAttribute("aria-label",label);
    motion.title = label;
    motion.classList.toggle("play", paused);
  }
  function syncVideo() {
    if (failed) return;
    if (!wantsMotion || !inView || document.hidden) {
      film.pause();
      updateControl();
      return;
    }
    if (!film.getAttribute("src")) film.src = film.dataset.src;
    film.muted = true;
    film.play().catch(updateControl);
  }
  film.addEventListener("playing", () => {
    hero.classList.add("film-on");
    updateControl();
  });
  film.addEventListener("pause",updateControl);
  film.addEventListener("error", () => {
    failed = true;
    hero.classList.remove("film-on");
    motion.hidden = true;
  });
  motion.addEventListener("click", () => { wantsMotion = film.paused; syncVideo(); });
  reduced.addEventListener("change", () => {
    wantsMotion = !reduced.matches && !saveData;
    syncVideo();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncVideo();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange",syncVideo);
  if (film.canPlayType("video/mp4")) {
    motion.hidden = false;
    updateControl();
    syncVideo();
  }
})();
