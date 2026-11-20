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

  // Tablet & phone: cards behave like a swipeable stack (see style.css)
  const stackMode = window.matchMedia("(max-width: 1023px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animateCards = () => stackMode.matches && !reducedMotion.matches;

  // Which card peeks out from underneath the active one (none on desktop)
  const setBehind = (target) => {
    slides.forEach((slide) => {
      const behind = slide === target && stackMode.matches;
      slide.classList.toggle("is-behind", behind);
      if (behind) slide.setAttribute("inert", ""); else slide.removeAttribute("inert");
      if (!behind) slide.style.removeProperty("transform");
    });
  };
  const peekNext = () => setBehind(slides[(current + 1) % n]);

  function show(k, direction, initial, enter) {
    const next = (k + n) % n;
    const dir = direction || (next > current ? 1 : -1);

    // Pause the Scheduler demo (or any video) when leaving its slide
    slides[current].querySelectorAll("video").forEach((v) => v.pause());
    // Videos start with preload="none"; fetch the first frame once their slide is opened
    slides[next].querySelectorAll('video[preload="none"]').forEach((v) => { v.preload = "metadata"; });

    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === next));
    slides[next].style.setProperty("--from", `${dir * 24}px`);
    slides[next].dataset.enter = enter || "slide";
    pickerButtons.forEach((btn, i) => btn.setAttribute("aria-current", String(i === next)));

    current = next;
    posEl.textContent = pad(current + 1);
    progressBar.style.width = `${Math.round(((current + 1) / n) * 100)}%`;
    peekNext();

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

  // Throw the active card off-screen, then promote the card underneath.
  // step = +1 (next, card flies left) or -1 (previous, card flies right).
  let flying = false;
  const resetCard = (card) => {
    card.style.removeProperty("transition");
    card.style.removeProperty("transform");
    card.style.removeProperty("opacity");
  };

  function fly(step) {
    if (flying) return;
    if (!animateCards()) { show(current + step, step); return; }
    flying = true;
    const card = slides[current];
    const target = (current + step + n) % n;
    const width = slidesWrap.offsetWidth;
    setBehind(slides[target]);
    // Grow the card underneath into place while the top card flies away
    slides[target].style.transition = "transform .3s cubic-bezier(.2, .8, .2, 1)";
    slides[target].style.transform = "none";
    card.style.transition = "transform .3s ease-in, opacity .3s ease-in";
    card.style.transform = `translateX(${-step * width * 1.3}px) rotate(${-step * 16}deg)`;
    card.style.opacity = "0";
    setTimeout(() => {
      resetCard(card);
      slides[target].style.removeProperty("transition");
      show(target, step, false, "none");
      flying = false;
    }, 300);
  }

  carousel.querySelector(".carousel-prev").addEventListener("click", () => fly(-1));
  carousel.querySelector(".carousel-next").addEventListener("click", () => fly(1));

  // Arrow keys while focus is inside the carousel (not inside a video's controls)
  carousel.addEventListener("keydown", (event) => {
    if (event.target.closest("video, input, textarea, select")) return;
    if (event.key === "ArrowLeft") fly(-1);
    if (event.key === "ArrowRight") fly(1);
  });

  // Swipe: the card follows the finger (with a slight tilt) on tablets and
  // phones. Release far enough, or flick, and it flies off; otherwise it
  // springs back. Vertical movement is left alone so the page still scrolls.
  let drag = null;
  let suppressClick = false;

  // Swipes may start on a video (it fills much of the card on phones), but not
  // on its controls bar, so dragging the seek bar still scrubs the video.
  const onVideoControls = (event) => {
    const video = event.target.closest("video");
    if (!video) return false;
    return event.clientY > video.getBoundingClientRect().bottom - 56;
  };

  slidesWrap.addEventListener("pointerdown", (event) => {
    suppressClick = false;
    if (!stackMode.matches || flying || event.button > 0 || onVideoControls(event)) return;
    drag = { x: event.clientX, y: event.clientY, t: performance.now(), dx: 0, active: false, id: event.pointerId };
  });

  slidesWrap.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // scrolling
      if (Math.abs(dx) < 10) return;
      drag.active = true;
      slidesWrap.setPointerCapture(event.pointerId);
      slidesWrap.classList.add("is-dragging");
      slides[current].style.transition = "none";
    }
    drag.dx = dx;
    const card = slides[current];
    const width = slidesWrap.offsetWidth;
    card.style.transform = `translateX(${dx}px) rotate(${(dx / width) * 12}deg)`;

    // Show the card you'd land on, growing as you drag further
    const under = slides[(current + (dx < 0 ? 1 : -1) + n) % n];
    if (!under.classList.contains("is-behind")) setBehind(under);
    const progress = Math.min(1, Math.abs(dx) / (width * 0.5));
    under.style.transition = "none";
    under.style.transform = `translateY(${14 * (1 - progress)}px) scale(${0.95 + 0.05 * progress})`;
  });

  const endDrag = (cancelled) => {
    if (!drag) return;
    const { dx, t, active } = drag;
    drag = null;
    slidesWrap.classList.remove("is-dragging");
    if (!active) return;
    suppressClick = true; // the end of a drag isn't a tap on a link

    const width = slidesWrap.offsetWidth;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - t); // px per ms
    if (!cancelled && (Math.abs(dx) > width * 0.28 || velocity > 0.6)) {
      fly(dx < 0 ? 1 : -1);
    } else {
      // Spring back
      const card = slides[current];
      card.style.transition = "transform .35s cubic-bezier(.2, .8, .2, 1)";
      card.style.transform = "";
      slides.forEach((s) => {
        if (s.classList.contains("is-behind")) {
          s.style.transition = "transform .35s cubic-bezier(.2, .8, .2, 1)";
          s.style.removeProperty("transform");
        }
      });
      setTimeout(() => {
        if (flying) return;
        resetCard(card);
        slides.forEach((s) => s.style.removeProperty("transition"));
        peekNext();
      }, 350);
    }
  };
  slidesWrap.addEventListener("pointerup", () => endDrag(false));
  slidesWrap.addEventListener("pointercancel", () => endDrag(true));

  // A drag that started on a link or button shouldn't also click it
  slidesWrap.addEventListener("click", (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }
  }, true);

  // Turn the stack on/off when crossing the tablet breakpoint (e.g. rotating)
  stackMode.addEventListener("change", peekNext);

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
