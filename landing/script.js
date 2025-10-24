// Mobile menu toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Requirements toggle
const requirementsToggle = document.getElementById("requirementsToggle");
const requirementsContent = document.getElementById("requirementsContent");

requirementsToggle.addEventListener("click", () => {
  requirementsToggle.classList.toggle("active");
  requirementsContent.classList.toggle("active");
});

// Close mobile menu when clicking on a link
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerHeight = document.querySelector("header").offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Add animation on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in-up");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

document.querySelectorAll(".feature-card, .screenshot-card").forEach((el) => {
  observer.observe(el);
});
