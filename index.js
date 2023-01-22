const formButton = document.querySelector("#submit-button");
const emailInput = document.querySelector("#email");
const emailError = document.querySelector("#email-error");
const mailFormat = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
import sendgrid from "@sendgrid/mail";
const submitButton = (e) => {
  // form validation

  if (emailInput.value.match(mailFormat)) {
    // check for error message
    let errorMessageRef = document.querySelector("#error-message");
    if (errorMessageRef) {
      errorMessageRef.remove();
    }

    formButton.style.color = "var(--success-green)";

    formButton.style.textDecoration = "underline var(--success-green)";
    emailInput.style.borderBottom = "1px solid var(--success-green)";

    // import sendgrid library

    // configure and send email using Sendgrid
    sgMail.setApiKey(
      "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"
    );
    const msg = {
      to: document.querySelector("#email").value, // Change to your recipient
      from: "kadecampbelldev@gmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    sendgrid
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });

    // prevent form from submitting

    e.preventDefault();
  }
};

formButton.addEventListener("click", submitButton);
