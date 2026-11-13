const formButton = document.querySelector("#submit-button");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const emailFormat =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const RED = "2px solid hsl(0, 93%, 68%)";
const GREEN = "2px solid hsl(154, 59%, 51%)";

// Color alone isn't announced by screen readers, so also set aria-invalid
const markField = (input, isValid) => {
  input.style.borderBottom = isValid ? GREEN : RED;
  input.setAttribute("aria-invalid", String(!isValid));
};

const isValidEmail = () => emailFormat.test(emailInput.value);
const isValidName = () => nameInput.value.trim() !== "";

emailInput.addEventListener("input", () => markField(emailInput, isValidEmail()));
nameInput.addEventListener("input", () => markField(nameInput, isValidName()));

// Calendly: load its script/styles only when someone clicks "Book a call",
// so visitors who never book don't pay for the third-party download.
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
    loadCalendly()
      .then(() => window.Calendly.initPopupWidget({ url: CALENDLY_URL }))
      // If Calendly can't load (blocked, offline), fall back to its page
      .catch(() => window.open(CALENDLY_URL, "_blank", "noopener"));
  });
});

formButton.addEventListener("click", () => {
  markField(emailInput, isValidEmail());
  markField(nameInput, isValidName());

  if (isValidName() && isValidEmail()) {
    formButton.style.borderBottom = GREEN;
  }
});
