/* ==========================================================================
   Theme (light / dark)
   By default it follows the visitor's clock: dark from NIGHT_START to NIGHT_END.
   Using the toggle overrides that for the rest of the visit (sessionStorage).
   The initial theme is set by an inline script in <head> to avoid a flash;
   keep its hours in sync with these.
   ========================================================================== */
const NIGHT_START = 19; // 7pm
const NIGHT_END = 7;    // 7am
const root = document.documentElement;
const themeButtons = document.querySelectorAll(".theme-toggle");

const isNight = () => {
  const hour = new Date().getHours();
  return hour >= NIGHT_START || hour < NIGHT_END;
};

const hasManualTheme = () => {
  try { return sessionStorage.getItem("theme") !== null; } catch (e) { return false; }
};

const syncThemeButtons = () => {
  const dark = root.getAttribute("data-theme") === "dark";
  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  });
};

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { sessionStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    syncThemeButtons();
  });
});
syncThemeButtons();

// If the page is left open across 7am/7pm, switch over (unless they picked a theme)
setInterval(() => {
  if (hasManualTheme()) return;
  const wanted = isNight() ? "dark" : "light";
  if (root.getAttribute("data-theme") !== wanted) {
    root.setAttribute("data-theme", wanted);
    syncThemeButtons();
  }
}, 60 * 1000);

/* ==========================================================================
   Mobile menu
   ========================================================================== */
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

const setMenu = (open) => {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.classList.toggle("is-open", open);
};

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

// Close after picking a link
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// Close with Escape (only while the menu is open) and on outside clicks
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener("click", (event) => {
  if (mobileMenu.classList.contains("is-open") && !event.target.closest(".site-header")) {
    setMenu(false);
  }
});

/* ==========================================================================
   Projects carousel
   Without JavaScript every project is listed; with it, one shows at a time.
   ========================================================================== */
const carousel = document.querySelector(".carousel");

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll(".slide"));
  const slidesWrap = carousel.querySelector(".slides");
  const posEl = carousel.querySelector(".carousel-pos");
  const totalEl = carousel.querySelector(".carousel-total");
  const progressBar = carousel.querySelector(".progress-bar");
  const picker = carousel.querySelector(".carousel-picker");
  const n = slides.length;
  const pad = (x) => String(x).padStart(2, "0");
  let current = 0;

  totalEl.textContent = pad(n);

  const pickerButtons = slides.map((slide, k) => {
    const name = slide.querySelector("h3").textContent;
    slide.style.setProperty("--hue", slide.dataset.hue || 245);
    slide.setAttribute("aria-label", `${k + 1} of ${n}: ${name}`);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = slide.dataset.short || name;
    btn.setAttribute("aria-label", `Show project ${k + 1}: ${name}`);
    btn.addEventListener("click", () => show(k));
    picker.appendChild(btn);
    return btn;
  });

  function show(k, direction, initial) {
    const next = (k + n) % n;
    const dir = direction || (next > current ? 1 : -1);

    // Pause the Scheduler demo (or any video) when leaving its slide
    slides[current].querySelectorAll("video").forEach((v) => v.pause());
    // Videos start with preload="none"; fetch the first frame once their slide is opened
    slides[next].querySelectorAll('video[preload="none"]').forEach((v) => { v.preload = "metadata"; });

    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === next));
    slides[next].style.setProperty("--from", `${dir * 24}px`);
    pickerButtons.forEach((btn, i) => btn.setAttribute("aria-current", String(i === next)));

    current = next;
    posEl.textContent = pad(current + 1);
    progressBar.style.width = `${Math.round(((current + 1) / n) * 100)}%`;

    // Keep the active chip visible when the picker scrolls (phones).
    // Skipped on page load: reading layout there forces an extra reflow.
    if (initial) return;
    requestAnimationFrame(() => {
      const active = pickerButtons[current];
      if (picker.scrollWidth > picker.clientWidth) {
        picker.scrollTo({
          left: active.offsetLeft - picker.clientWidth / 2 + active.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    });
  }

  carousel.querySelector(".carousel-prev").addEventListener("click", () => show(current - 1, -1));
  carousel.querySelector(".carousel-next").addEventListener("click", () => show(current + 1, 1));

  // Arrow keys while focus is inside the carousel (not inside a video's controls)
  carousel.addEventListener("keydown", (event) => {
    if (event.target.closest("video, input, textarea, select")) return;
    if (event.key === "ArrowLeft") { show(current - 1, -1); }
    if (event.key === "ArrowRight") { show(current + 1, 1); }
  });

  // Swipe on touch screens
  let startX = null;
  let startY = null;
  slidesWrap.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" || event.target.closest("video")) return;
    startX = event.clientX;
    startY = event.clientY;
  });
  slidesWrap.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? show(current + 1, 1) : show(current - 1, -1);
    }
  });
  slidesWrap.addEventListener("pointercancel", () => { startX = null; });

  show(0, 1, true);
}

/* ==========================================================================
   Contact form validation (Netlify Forms handles the actual submission)
   ========================================================================== */
const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");
const emailFormat =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const checks = [
  [nameInput, () => nameInput.value.trim() !== ""],
  [emailInput, () => emailFormat.test(emailInput.value.trim())],
  [messageInput, () => messageInput.value.trim() !== ""],
];

// Color alone isn't announced by screen readers, so aria-invalid drives the styling
const markField = (input, isValid) => input.setAttribute("aria-invalid", String(!isValid));

checks.forEach(([input, isValid]) => {
  input.addEventListener("input", () => {
    // Only start flagging once someone has typed or tried to submit
    if (input.value !== "" || input.hasAttribute("aria-invalid")) markField(input, isValid());
  });
});

form.addEventListener("submit", (event) => {
  let firstInvalid = null;
  checks.forEach(([input, isValid]) => {
    const ok = isValid();
    markField(input, ok);
    if (!ok && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) {
    event.preventDefault();
    formStatus.textContent = "Please fill in your name, a valid email and a message.";
    formStatus.className = "form-status is-error";
    firstInvalid.focus();
  } else {
    formStatus.textContent = "Sending…";
    formStatus.className = "form-status";
  }
});

// Let the JS messages above handle errors instead of the browser's bubbles
form.setAttribute("novalidate", "");

/* ==========================================================================
   Phones: sticky "Let's talk" button + contact form in a bottom sheet.
   The one contact form is moved into the sheet while it's open and moved
   back afterwards, so Netlify still sees a single form in the page.

   States:
   - closed
   - expanded:  modal sheet (page behind is dimmed and locked)
   - minimized: slim bar at the bottom (page behind scrolls normally)
   Switching between modal and non-modal means closing and re-opening the
   <dialog>. Its close event arrives later, so when it does, a dialog that is
   open again means it was one of those internal switches, not a real close.
   ========================================================================== */
const contactDialog = document.querySelector("#contact-dialog");
const mobileCta = document.querySelector(".mobile-cta");

let closeContactDialog = () => {};

if (contactDialog && mobileCta && typeof contactDialog.showModal === "function") {
  const ctaButton = mobileCta.querySelector("button");
  const slot = contactDialog.querySelector(".dialog-form-slot");
  const head = contactDialog.querySelector(".dialog-head");
  const dialogTitle = contactDialog.querySelector("#contact-dialog-title");
  const toggleButton = contactDialog.querySelector(".dialog-toggle");
  const formHome = document.createComment(" contact form returns here ");
  form.before(formHome);
  dialogTitle.setAttribute("tabindex", "-1");

  let state = "closed";
  let addedHistoryEntry = false;

  const reopen = (modal) => {
    if (contactDialog.open) contactDialog.close();
    contactDialog.classList.toggle("is-minimized", !modal);
    modal ? contactDialog.showModal() : contactDialog.show();
  };

  const expand = () => {
    const fromClosed = state === "closed";
    if (fromClosed) {
      slot.appendChild(form);
      // So the phone's back button closes the form instead of leaving the page
      history.pushState({ contactDialog: true }, "");
      addedHistoryEntry = true;
    }
    reopen(true);
    state = "expanded";
    root.classList.add("dialog-open", "sheet-active");
    toggleButton.setAttribute("aria-label", "Minimize contact form");
    if (fromClosed) contactDialog.scrollTop = 0;
    // Start screen readers at the title rather than popping the keyboard open
    dialogTitle.focus({ preventScroll: true });
  };

  const minimize = () => {
    if (state !== "expanded") return;
    reopen(false);
    state = "minimized";
    root.classList.remove("dialog-open"); // page can scroll again
    toggleButton.setAttribute("aria-label", "Expand contact form");
    toggleButton.focus({ preventScroll: true });
  };

  closeContactDialog = () => {
    if (contactDialog.open) contactDialog.close();
  };

  ctaButton.addEventListener("click", expand);
  contactDialog.querySelector(".dialog-close").addEventListener("click", closeContactDialog);
  toggleButton.addEventListener("click", () => (state === "expanded" ? minimize() : expand()));

  // Tapping the minimized bar (anywhere but its buttons) brings the sheet back up
  head.addEventListener("click", (event) => {
    if (state === "minimized" && !event.target.closest("button") && !dragMoved) expand();
  });

  // Tapping the dimmed page above the expanded sheet closes it. Clicks on the
  // backdrop report the dialog itself as the target; anything typed is kept.
  contactDialog.addEventListener("click", (event) => {
    if (event.target === contactDialog && state === "expanded") closeContactDialog();
  });

  // Escape closes it in either state (the minimized bar isn't modal, so handle it here)
  contactDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state === "minimized") closeContactDialog();
  });

  // Fully closed: the close button, Escape, back button or tapping the dimmed page
  contactDialog.addEventListener("close", () => {
    if (contactDialog.open) return; // re-opened as part of expand/minimize
    state = "closed";
    contactDialog.classList.remove("is-minimized");
    formHome.after(form);
    root.classList.remove("dialog-open", "sheet-active");
    if (addedHistoryEntry) {
      addedHistoryEntry = false;
      history.back();
    }
    ctaButton.focus({ preventScroll: true });
  });

  window.addEventListener("popstate", () => {
    if (contactDialog.open) {
      addedHistoryEntry = false; // the browser already went back
      closeContactDialog();
    }
  });

  // Links to the contact section bring the sheet back up while it's minimized,
  // since the form is inside the sheet at that point
  document.querySelectorAll('a[href="#contact"], a[href="#contact-form"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      if (state === "minimized") {
        event.preventDefault();
        expand();
      }
    });
  });

  // Drag the header: down to minimize, up (on the bar) to expand
  let dragStartY = null;
  let dragDy = 0;
  let dragMoved = false;

  head.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || state === "closed") return;
    dragStartY = event.clientY;
    dragDy = 0;
    dragMoved = false;
    head.setPointerCapture(event.pointerId);
    contactDialog.style.transition = "none";
  });

  head.addEventListener("pointermove", (event) => {
    if (dragStartY === null) return;
    dragDy = event.clientY - dragStartY;
    if (Math.abs(dragDy) > 6) dragMoved = true;
    // The expanded sheet follows the finger downward
    if (state === "expanded") {
      contactDialog.style.transform = `translateY(${Math.max(0, dragDy)}px)`;
    }
  });

  const endDrag = () => {
    if (dragStartY === null) return;
    dragStartY = null;
    contactDialog.style.transition = "transform .2s ease";
    contactDialog.style.transform = "";
    setTimeout(() => { contactDialog.style.transition = ""; }, 200);

    if (state === "expanded" && dragDy > 80) minimize();
    else if (state === "minimized" && dragDy < -30) expand();
    // Let the click that follows a drag through to the bar's tap handler only if it wasn't a drag
    setTimeout(() => { dragMoved = false; }, 0);
  };
  head.addEventListener("pointerup", endDrag);
  head.addEventListener("pointercancel", endDrag);

  // Show the button only between the hero and the contact section
  mobileCta.hidden = false;
  const inView = new Map();
  const watched = [
    document.querySelector(".hero"),
    document.querySelector("#contact"),
    document.querySelector(".site-footer"),
  ].filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => inView.set(entry.target, entry.isIntersecting));
    const show = watched.every((el) => !inView.get(el));
    mobileCta.classList.toggle("is-visible", show);
  });
  watched.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Calendly: load its script/styles only when someone clicks "Book a call",
   so visitors who never book don't pay for the third-party download.
   ========================================================================== */
const CALENDLY_URL = "https://calendly.com/kadecampbelldev";
let calendlyLoading;

const loadCalendly = () => {
  if (!calendlyLoading) {
    calendlyLoading = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return calendlyLoading;
};

document.querySelectorAll(".js-calendly").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    // Calendly's popup can't appear above an open modal, so close the form first
    if (link.closest("dialog")) closeContactDialog();
    loadCalendly()
      .then(() => window.Calendly.initPopupWidget({ url: CALENDLY_URL }))
      // If Calendly can't load (blocked, offline), fall back to its page
      .catch(() => window.open(CALENDLY_URL, "_blank", "noopener"));
  });
});

/* ==========================================================================
   Footer year
   ========================================================================== */
document.querySelector("#year").textContent = new Date().getFullYear();
