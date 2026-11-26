for (const gallery of document.querySelectorAll('.role-gallery')) {
  const strip = gallery.querySelector('.role-thumbnails');
  const controls = gallery.querySelector('.role-gallery-controls');
  const [previous, next] = controls.querySelectorAll('button');

  function updateControls() {
    // Compare with the full row so hiding the controls gives the space back.
    controls.hidden = strip.scrollWidth <= gallery.clientWidth + 1;
    previous.setAttribute('aria-disabled', strip.scrollLeft <= 1);
    next.setAttribute('aria-disabled', strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1);
  }

  function scrollPage(button, direction) {
    if (button.getAttribute('aria-disabled') === 'true') return;
    strip.scrollBy({ left: direction * strip.clientWidth });
  }

  previous.addEventListener('click', () => scrollPage(previous, -1));
  next.addEventListener('click', () => scrollPage(next, 1));
  strip.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(strip);
  updateControls();
}
