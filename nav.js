// Mobile hamburger menu toggle — shared by index.html and tips.html
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

function setMenuIcon(isOpen) {
  if (!navToggle) return;
  navToggle.innerHTML = isOpen
    ? '<i class="fas fa-times"></i>'
    : '<i class="fas fa-bars"></i>';
  navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu?.classList.toggle("open");
  setMenuIcon(Boolean(isOpen));
});

// Close the menu after tapping a link (mobile)
navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    setMenuIcon(false);
  });
});
