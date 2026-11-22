const menuButton = document.querySelector('.site-menu-toggle');
const header = menuButton.closest('header');
const navigation = document.getElementById(menuButton.getAttribute('aria-controls'));
const compactMenu = window.matchMedia('(max-width: 42em)');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.hidden = compactMenu.matches && !open;
}

function syncMenuLayout() {
  const focused = document.activeElement;
  menuButton.hidden = !compactMenu.matches;
  if (compactMenu.matches && navigation.contains(focused)) menuButton.focus();
  setMenuOpen(false);
  if (!compactMenu.matches && focused === menuButton) {
    (navigation.querySelector('[aria-current]') || navigation.querySelector('a')).focus();
  }
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

header.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    menuButton.focus();
    setMenuOpen(false);
  }
});

header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) setMenuOpen(false);
});

document.addEventListener('pointerdown', event => {
  if (menuButton.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenuOpen(false);
});

compactMenu.addEventListener('change', syncMenuLayout);
syncMenuLayout();
