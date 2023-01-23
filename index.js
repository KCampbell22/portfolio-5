const formButton = document.querySelector("#submit-button");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const emailFormat =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const validateEmail = () => {
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
};

const validateName = () => {
  nameInput.addEventListener("input", function (event) {
    // validate that the name field is not empty
    if (event.target.value === "") {
      // change the border-bottom to red
      nameInput.style.borderBottom = "2px solid hsl(0, 93%, 68%)";
    } else {
      // change the border-bottom to green
      nameInput.style.borderBottom = "2px solid hsl(154, 59%, 51%)";
    }
  });
};

formButton.addEventListener("click", function (event) {
  // validate email on submit
  event.preventDefault();
  if (!emailFormat.test(emailInput.value)) {
    event.preventDefault();
    console.log("invalid email");
    emailInput.style.borderBottom = "2px solid hsl(0, 93%, 68%)";
  } else {
    console.log("valid email");

    emailInput.style.borderBottom = "2px solid hsl(154, 59%, 51%)";
  }

  // check if name is empty and email is valid if either are false abort submit
  if (nameInput.value === "" || !emailFormat.test(emailInput.value)) {
    console.log("invalid name or email");
    event.preventDefault();
  } else {
    // turn the button border-bottom green
    console.log("valid name and email");
    formButton.style.borderBottom = "2px solid hsl(154, 59%, 51%)";
  }
});

// on load validate email and name

window.addEventListener("load", function () {
  validateEmail();
  validateName();
});