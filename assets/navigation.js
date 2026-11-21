const menuButton = document.querySelector('.site-menu-toggle');
const header = menuButton.closest('header');
const compactMenu = window.matchMedia('(max-width: 42em)');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
}

menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
});

header.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && compactMenu.matches && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

header.addEventListener('focusout', (event) => {
  if (!header.contains(event.relatedTarget)) closeMenu();
});

compactMenu.addEventListener('change', closeMenu);
menuButton.hidden = false;
