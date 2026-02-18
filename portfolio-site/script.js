const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const themeToggle = document.getElementById("theme-toggle");
const themePreferenceKey = "portfolio-theme";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function readStoredTheme() {
  const stored = window.localStorage.getItem(themePreferenceKey);
  return stored === "dark" || stored === "light" ? stored : null;
}

function updateThemeToggle(theme) {
  if (!themeToggle) {
    return;
  }

  const isDark = theme === "dark";
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
}

function applyTheme(theme, shouldStore) {
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeToggle(theme);

  if (shouldStore) {
    window.localStorage.setItem(themePreferenceKey, theme);
  }
}

const storedTheme = readStoredTheme();
applyTheme(storedTheme || (systemThemeQuery.matches ? "dark" : "light"), false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });
}

const handleSystemThemeChange = (event) => {
  if (!readStoredTheme()) {
    applyTheme(event.matches ? "dark" : "light", false);
  }
};

if (typeof systemThemeQuery.addEventListener === "function") {
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);
} else if (typeof systemThemeQuery.addListener === "function") {
  systemThemeQuery.addListener(handleSystemThemeChange);
}

const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const roleText = document.getElementById("role-text");
const roles = [
  "MS Computer Science @ University of Oklahoma",
  "Full-Stack + AI/ML Builder",
  "Focused on High-Impact Software Engineering"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function animateRoleText() {
  if (!roleText) {
    return;
  }

  const currentRole = roles[roleIndex];

  if (deleting) {
    charIndex -= 1;
  } else {
    charIndex += 1;
  }

  roleText.textContent = currentRole.slice(0, charIndex);

  let delay = deleting ? 40 : 70;

  if (!deleting && charIndex === currentRole.length) {
    delay = 1300;
    deleting = true;
  }

  if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 280;
  }

  window.setTimeout(animateRoleText, delay);
}

animateRoleText();

const revealElements = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".count");

function formatCounterValue(rawValue, divisor, suffix) {
  const value = rawValue / divisor;
  const isDecimal = divisor !== 1;
  const formatted = isDecimal ? value.toFixed(1) : Math.round(value).toString();
  return `${formatted}${suffix}`;
}

function runCounter(counter) {
  if (counter.dataset.animated === "true") {
    return;
  }

  const target = Number(counter.dataset.target || 0);
  const divisor = Number(counter.dataset.divisor || 1);
  const suffix = counter.dataset.suffix || "";
  const start = performance.now();
  const duration = 1200;

  counter.dataset.animated = "true";

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * eased;

    counter.textContent = formatCounterValue(currentValue, divisor, suffix);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = formatCounterValue(target, divisor, suffix);
    }
  }

  requestAnimationFrame(step);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");

        if (entry.target.querySelector(".count")) {
          counters.forEach(runCounter);
        }
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));

window.setTimeout(() => {
  counters.forEach(runCounter);
}, 350);

const progressBar = document.getElementById("scroll-progress");
const sections = Array.from(document.querySelectorAll("main section[id]"));
const linkMap = new Map(
  Array.from(document.querySelectorAll(".nav-links a")).map((a) => [a.getAttribute("href")?.slice(1), a])
);

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (progressBar) {
    const width = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    progressBar.style.width = `${width}%`;
  }

  const offset = scrollTop + 180;
  let currentId = sections[0]?.id;

  for (const section of sections) {
    if (offset >= section.offsetTop) {
      currentId = section.id;
    }
  }

  linkMap.forEach((link, id) => {
    link.classList.toggle("active", id === currentId);
  });
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

const cursorGlow = document.querySelector(".cursor-glow");
if (cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

const tiltCards = document.querySelectorAll(".tilt-card");

for (const card of tiltCards) {
  card.addEventListener("mousemove", (event) => {
    const bounds = card.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateX = ((y / bounds.height) - 0.5) * -8;
    const rotateY = ((x / bounds.width) - 0.5) * 8;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
}
