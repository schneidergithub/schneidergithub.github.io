(() => {
  const dialog = document.querySelector('.image-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const title = dialog.querySelector('h2');
  const stage = dialog.querySelector('.viewer-stage');
  const caption = dialog.querySelector('.viewer-caption');
  const error = dialog.querySelector('.viewer-error');
  const previous = dialog.querySelector('.viewer-previous');
  const next = dialog.querySelector('.viewer-next');
  const close = dialog.querySelector('.viewer-close');
  const original = dialog.querySelector('.viewer-original');
  let trigger;
  let images = [];
  let position = 0;
  let pagePosition;
  let generation = 0;

  function show(index) {
    position = index;
    const link = images[index];
    const image = new Image();
    const version = ++generation;
    const label = link.dataset.imageCaption || link.querySelector('img').alt;
    image.alt = link.querySelector('img').alt;
    image.decoding = 'async';
    error.hidden = true;
    stage.setAttribute('aria-busy', 'true');
    stage.replaceChildren(image);
    caption.textContent = `${index + 1} of ${images.length} · ${label}`;
    original.href = link.href;
    previous.disabled = index === 0;
    next.disabled = index === images.length - 1;
    // A control becoming disabled must not leave focus on the page behind it.
    if (document.activeElement === previous && previous.disabled) next.focus();
    if (document.activeElement === next && next.disabled) previous.focus();
    image.addEventListener('load', () => {
      if (version === generation) stage.removeAttribute('aria-busy');
    });
    image.addEventListener('error', () => {
      if (version !== generation) return;
      stage.removeAttribute('aria-busy');
      image.hidden = true;
      error.hidden = false;
    });
    image.src = link.href;
  }

  function finish(restore = true) {
    document.documentElement.classList.remove('image-viewer-open');
    if (restore && trigger?.isConnected) {
      const opener = trigger;
      const saved = pagePosition;
      const restorePosition = () => {
        if (dialog.open || trigger !== opener || !opener.isConnected) return;
        opener.focus({ preventScroll: true });
        if (innerWidth !== saved.width || innerHeight !== saved.height) {
          opener.scrollIntoView({ block: 'center', behavior: 'instant' });
        } else {
          window.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
        }
      };
      restorePosition();
      // WebKit can finish viewport layout and native focus scrolling after close.
      requestAnimationFrame(() => {
        restorePosition();
        requestAnimationFrame(restorePosition);
      });
    }
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a.image-enlarge');
    const group = link?.closest('[data-image-group]');
    if (!link || !group || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.origin !== location.origin || (link.target && link.target !== '_self')) return;
    // The real href remains available for unsupported browsers and modified clicks.
    event.preventDefault();
    trigger = link;
    pagePosition = { x: scrollX, y: scrollY, width: innerWidth, height: innerHeight };
    images = [...group.querySelectorAll('a.image-enlarge')].sort((a, b) =>
      Number(a.dataset.imageOrder) - Number(b.dataset.imageOrder));
    title.textContent = group.dataset.imageTitle || 'Project images';
    show(images.indexOf(link));
    dialog.showModal();
    document.documentElement.classList.add('image-viewer-open');
    close.focus();
  });

  previous.addEventListener('click', () => show(position - 1));
  next.addEventListener('click', () => show(position + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => finish());
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' && position > 0) {
      event.preventDefault(); show(position - 1);
    } else if (event.key === 'ArrowRight' && position < images.length - 1) {
      event.preventDefault(); show(position + 1);
    } else if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button:not(:disabled), a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  // Do not restore an open overlay when a page returns from the back/forward cache.
  window.addEventListener('pagehide', () => {
    trigger = null;
    if (dialog.open) dialog.close();
    finish(false);
  });
})();
