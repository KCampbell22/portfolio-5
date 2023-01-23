const formButton = document.querySelector("#submit-button");
const emailInput = document.querySelector("#email");
const emailFormat =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

emailInput.addEventListener("input", function (event) {
  // validate email as user types
  if (!emailFormat.test(event.target.value)) {
    console.log("invalid email");
    emailInput.style.borderBottom = "2px solid hsl(0, 93%, 68%)";
  } else {
    console.log("valid email");

    emailInput.style.borderBottom = "2px solid hsl(154, 59%, 51%)";
  }
});

formButton.addEventListener("click", function (event) {
  // validate email on submit
  event.preventDefault();
  if (!emailFormat.test(emailInput.value)) {
    event.preventDefault();
    console.log("invalid email");
    emainInput.style.borderBottom = "2px solid hsl(0, 93%, 68%)";
  } else {
    console.log("valid email");

    emailInput.style.borderBottom = "2px solid hsl(154, 59%, 51%)";
  }
});



