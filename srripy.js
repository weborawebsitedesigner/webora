import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// =====================================
// WEBORA - FIREBASE CONFIGURATION
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyBEL0YdPvSzccNyC0KSFDGmrWuaJh12yGY",
  authDomain: "webora-813f2.firebaseapp.com",
  projectId: "webora-813f2",
  storageBucket: "webora-813f2.firebasestorage.app",
  messagingSenderId: "530393451146",
  appId: "1:530393451146:web:6f0c0aa4d652c9c283bb73",
  measurementId: "G-JYBXX1JYYZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {

  // =====================================
  // WEBORA - MAIN SETTINGS
  // =====================================

  const cartSection = document.getElementById("cart-section");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const clearCartButton = document.getElementById("clear-cart");

  const accountModal = document.getElementById("account-modal");
  const orderModal = document.getElementById("order-modal");

  const accountTitle = document.getElementById("account-title");
  const signinTab = document.getElementById("signin-tab");
  const signupTab = document.getElementById("signup-tab");
  const accountForm = document.getElementById("account-form");
  const nameField = document.getElementById("name-field");
  const accountName = document.getElementById("account-name");
  const accountEmail = document.getElementById("account-email");
  const accountPassword = document.getElementById("account-password");
  const accountMessage = document.getElementById("account-message");

  const orderForm = document.getElementById("order-form");
  const orderService = document.getElementById("order-service");
  const customerName = document.getElementById("customer-name");
  const customerEmail = document.getElementById("customer-email");
  const projectDetails = document.getElementById("project-details");
  const orderMessage = document.getElementById("order-message");

  const pricingButton = document.getElementById("pricing-payment");
  const pricingMessage = document.getElementById("pricing-message");

  let cart = [];
  let selectedService = "";
  let accountMode = "signin";
  let demoCustomer = null;

  // =====================================
  // HELPER FUNCTIONS
  // =====================================

  function showModal(modal) {
    if (!modal) return;

    modal.hidden = false;
    modal.style.display = "flex";
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function hideModal(modal) {
    if (!modal) return;

    modal.classList.remove("show");
    modal.style.display = "none";
    modal.hidden = true;

    if (
      (!accountModal || accountModal.hidden) &&
      (!orderModal || orderModal.hidden)
    ) {
      document.body.style.overflow = "";
    }
  }

  function showMessage(element, message) {
    if (element) {
      element.textContent = message;
      element.hidden = false;
    }
  }

  function hideMessage(element) {
    if (element) {
      element.textContent = "";
      element.hidden = true;
    }
  }

  function getServiceName(card) {
    return (
      card.dataset.service ||
      card.querySelector("h3")?.textContent.trim() ||
      "Webora Service"
    );
  }

  // =====================================
  // STAR RATINGS + DESCRIPTIONS
  // =====================================

  document.querySelectorAll(".service-card").forEach(function (card) {
    const ratingButtons = card.querySelectorAll("[data-rating]");
    const description = card.querySelector(".service-description");
    const ratingMessage = card.querySelector(".rating-message");
    const addButton = card.querySelector(".add-to-cart");

    let currentRating = 0;

    if (description) {
      description.hidden = true;
      description.style.display = "none";
    }

    function updateStars(rating) {
      ratingButtons.forEach(function (button) {
        const value = Number(button.dataset.rating);
        const filled = value <= rating;

        button.classList.toggle("active", filled);
        button.classList.toggle("selected", filled);
        button.setAttribute("aria-pressed", String(filled));

        button.style.color = filled ? "#f5b301" : "#aeb4c2";
      });
    }

    ratingButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentRating = Number(button.dataset.rating);

        updateStars(currentRating);

        if (description) {
          description.hidden = false;
          description.style.display = "";
        }

        if (ratingMessage) {
          ratingMessage.textContent =
            "Thank you! You rated this service " +
            currentRating +
            " out of 5 stars.";
        }
      });
    });

    if (addButton) {
      addButton.addEventListener("click", function () {
        if (currentRating === 0) {
          showMessage(
            ratingMessage,
            "Please rate this service first by selecting the stars."
          );
          return;
        }

        addServiceToCart(getServiceName(card));
      });
    }
  });

  // =====================================
  // CART FUNCTIONS
  // =====================================

  function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.replaceChildren();

    if (cart.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-cart";
      emptyMessage.textContent = "Your selection is empty.";
      cartItemsContainer.appendChild(emptyMessage);
    } else {
      cart.forEach(function (service, index) {
        const item = document.createElement("div");
        item.className = "cart-item";

        const name = document.createElement("span");
        name.textContent = service;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-cart-item";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove " + service);

        removeButton.addEventListener("click", function () {
          cart.splice(index, 1);
          renderCart();
        });

        item.append(name, removeButton);
        cartItemsContainer.appendChild(item);
      });
    }

    if (cartCount) {
      cartCount.textContent = String(cart.length);
    }
  }

  function addServiceToCart(service) {
    if (cart.includes(service)) {
      alert("This service is already in Your Selection.");
      return;
    }

    cart.push(service);
    renderCart();

    alert(service + " has been added to Your Selection.");
  }

  if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
      cart = [];
      renderCart();
    });
  }

  // Open Your Selection / cart
  document.querySelectorAll(
    '[href="#cart-section"], [data-open-cart]'
  ).forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (!cartSection) return;

      event.preventDefault();
      cartSection.hidden = false;
      cartSection.style.display = "";

      renderCart();
      cartSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  // =====================================
  // OPEN SIGN-IN BEFORE ORDERING
  // =====================================

  function startOrder(service) {
    selectedService = service || "";

    if (orderService) {
      orderService.value = selectedService;
    }

    hideMessage(accountMessage);
    hideMessage(orderMessage);

    if (accountName) accountName.value = "";
    if (accountEmail) accountEmail.value = "";
    if (accountPassword) accountPassword.value = "";

    if (customerName && demoCustomer) {
      customerName.value = demoCustomer.name || "";
    }

    if (customerEmail && demoCustomer) {
      customerEmail.value = demoCustomer.email || "";
    }

    setAccountMode("signin");
    showModal(accountModal);
  }

  document.querySelectorAll(".order-now").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const card = button.closest(".service-card");
      const service = card
        ? getServiceName(card)
        : button.dataset.service || "";

      startOrder(service);
    });
  });

  const cartOrderButton = document.getElementById("cart-order-now");

  if (cartOrderButton) {
    cartOrderButton.addEventListener("click", function (event) {
      event.preventDefault();

      if (cart.length === 0) {
        alert("Please add a service to Your Selection first.");
        return;
      }

      startOrder(cart.join(", "));
    });
  }

  // =====================================
  // SIGN-IN / CREATE ACCOUNT TABS
  // =====================================

  function setAccountMode(mode) {
    accountMode = mode;

    const isSignup = mode === "signup";

    if (accountTitle) {
      accountTitle.textContent = isSignup
        ? "Create Your Webora Account"
        : "Sign In to Webora";
    }

    if (nameField) {
      nameField.hidden = !isSignup;
      nameField.style.display = isSignup ? "" : "none";
    }

    if (accountName) {
      accountName.required = isSignup;
    }

    if (accountPassword) {
      accountPassword.autocomplete = isSignup
        ? "new-password"
        : "current-password";
    }

    if (signinTab) {
      signinTab.classList.toggle("active", !isSignup);
      signinTab.setAttribute("aria-pressed", String(!isSignup));
    }

    if (signupTab) {
      signupTab.classList.toggle("active", isSignup);
      signupTab.setAttribute("aria-pressed", String(isSignup));
    }

    hideMessage(accountMessage);
  }

  if (signinTab) {
    signinTab.addEventListener("click", function () {
      setAccountMode("signin");
    });
  }

  if (signupTab) {
    signupTab.addEventListener("click", function () {
      setAccountMode("signup");
    });
  }

  
 // =====================================
  // FIREBASE SIGN-IN / CREATE ACCOUNT
  // =====================================

  if (accountForm) {
    accountForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!accountForm.reportValidity()) return;

      const email = accountEmail ? accountEmail.value.trim() : "";
      const password = accountPassword ? accountPassword.value : "";
      const name = accountName ? accountName.value.trim() : "";

      if (accountMode === "signup" && !name) {
        showMessage(accountMessage, "Please enter your name.");
        return;
      }

      const submitButton = accountForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (submitButton) submitButton.disabled = true;

      try {
        let userCredential;

        if (accountMode === "signup") {
          userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          await updateProfile(userCredential.user, {
            displayName: name
          });
        } else {
          userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        }

        const user = userCredential.user;

        demoCustomer = {
          name: user.displayName || name || "",
          email: user.email || email
        };

        if (customerName) {
          customerName.value = demoCustomer.name;
        }

        if (customerEmail) {
          customerEmail.value = demoCustomer.email;
        }

        if (orderService) {
          orderService.value = selectedService;
        }

        hideMessage(accountMessage);
        hideModal(accountModal);
        showModal(orderModal);

        showMessage(
          orderMessage,
          "You are signed in successfully. Please complete your order details."
        );

      } catch (error) {
        let message = "Something went wrong. Please try again.";

        if (error.code === "auth/email-already-in-use") {
          message = "This email already has an account. Please sign in.";
        } else if (error.code === "auth/invalid-email") {
          message = "Please enter a valid email address.";
        } else if (error.code === "auth/weak-password") {
          message = "Password must contain at least 6 characters.";
        } else if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          message = "Email or password is incorrect.";
        } else if (error.code === "auth/too-many-requests") {
          message = "Too many attempts. Please try again later.";
        }

        showMessage(accountMessage, message);

      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  // =====================================
  // CLOSE POPUPS
  // =====================================

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      hideModal(accountModal);
    });
  });

  document.querySelectorAll("[data-close-order]").forEach(function (button) {
    button.addEventListener("click", function () {
      hideModal(orderModal);
    });
  });

  [accountModal, orderModal].forEach(function (modal) {
    if (!modal) return;

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideModal(modal);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hideModal(accountModal);
      hideModal(orderModal);
    }
  });

  // =====================================
  // PRICING & PAYMENT NOTE
  // =====================================

  if (pricingButton && pricingMessage) {
    pricingMessage.hidden = true;
    pricingMessage.style.display = "none";

    pricingButton.addEventListener("click", function () {
      const isHidden =
        pricingMessage.hidden ||
        pricingMessage.style.display === "none";

      pricingMessage.hidden = !isHidden;
      pricingMessage.style.display = isHidden ? "" : "none";

      if (isHidden) {
        pricingMessage.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    });
  }
// =====================================
  // ORDER FORM - EMAILJS
  // =====================================

  if (orderForm) {
    orderForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!orderForm.reportValidity()) return;

      const submitButton = orderForm.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      if (submitButton) submitButton.disabled = true;

      try {
        const emailjsModule = await import(
          "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm"
        );

        const emailjs = emailjsModule.default || emailjsModule;

        const formData = new FormData(orderForm);

        const orderDetails = Array.from(formData.entries())
          .map(([key, value]) => ${key}: ${value})
          .join("\n");

        const customer = {
          customer_name:
            customerName?.value?.trim() ||
            demoCustomer?.name ||
            "Not provided",

          customer_email:
            customerEmail?.value?.trim() ||
            demoCustomer?.email ||
            "",

          service_name:
            orderService?.value ||
            selectedService ||
            "Webora Service",

          order_details: orderDetails || "No additional details"
        };

        await emailjs.send(
          "service_yp2ogg8",
          "template_bslt39w",
          customer,
          "o3TJjuAEMk23ZILyS"
        );

        showMessage(
          orderMessage,
          "Your order has been sent successfully! We will contact you regarding pricing and payment."
        );

      } catch (error) {
        console.error("EmailJS order error:", error);

        showMessage(
          orderMessage,
          "Your order email could not be sent. Please check your EmailJS settings and try again."
        );

      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }
 

  // =====================================
  // CURRENT YEAR
  // =====================================

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Start with an empty cart
  renderCart();
  setAccountMode("signin");
});

