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

  // Animate a loaded thumbnail while the full-resolution image is requested.
  function enterFrom(thumbnail, source) {
    if (!source || !thumbnail.naturalWidth || !thumbnail.animate ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frame = stage.getBoundingClientRect();
    const fit = Math.min(frame.width / thumbnail.naturalWidth, frame.height / thumbnail.naturalHeight);
    const width = thumbnail.naturalWidth * fit;
    const height = thumbnail.naturalHeight * fit;
    if (!width || !height) return;
    const preview = thumbnail.cloneNode();
    preview.removeAttribute('id');
    preview.removeAttribute('loading');
    preview.alt = '';
    preview.className = 'viewer-preview';
    const left = frame.left + (frame.width - width) / 2;
    const top = frame.top + (frame.height - height) / 2;
    Object.assign(preview.style, {left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px'});
    dialog.append(preview);
    const scale = Math.min(source.width / width, source.height / height);
    const dx = source.left + source.width / 2 - left - width / 2;
    const dy = source.top + source.height / 2 - top - height / 2;
    const animation = preview.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')' },
      { transform: 'none' }
    ], {duration: 180, easing: 'cubic-bezier(.2,.75,.25,1)'});
    animation.onfinish = animation.oncancel = () => preview.remove();
  }

  function show(index) {
    dialog.querySelector('.viewer-preview')?.remove();
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
    dialog.querySelector('.viewer-preview')?.remove();
    document.documentElement.classList.remove('image-viewer-open');
    if (restore && trigger?.isConnected) {
      const opener = trigger;
      const saved = pagePosition;
      const restorePosition = () => {
        if (dialog.open || trigger !== opener || !opener.isConnected) return;
        const group = opener.closest('[data-image-group]');
        const destination = opener.getClientRects().length ? opener :
          [group?.querySelector('[data-open-collection]'), group?.querySelector('a.image-enlarge')].find(el => el?.getClientRects().length);
        if (!destination) return;
        destination.focus({ preventScroll: true });
        if (innerWidth !== saved.width || innerHeight !== saved.height) {
          destination.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
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
    const opener = event.target.closest('a.image-enlarge, button[data-open-collection]');
    const group = opener?.closest('[data-image-group]');
    const link = opener?.matches('a') ? opener : group?.querySelector('a.image-enlarge');
    if (!link || !group || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.origin !== location.origin || (link.target && link.target !== '_self')) return;
    // The real href remains available for unsupported browsers and modified clicks.
    event.preventDefault();
    trigger = opener;
    const thumbnail = link.querySelector('img');
    const source = opener === link && link.closest('.curated-gallery, .project-index')
      ? thumbnail.getBoundingClientRect() : null;
    pagePosition = { x: scrollX, y: scrollY, width: innerWidth, height: innerHeight };
    images = [...group.querySelectorAll('a.image-enlarge')].sort((a, b) =>
      Number(a.dataset.imageOrder) - Number(b.dataset.imageOrder));
    title.textContent = group.dataset.imageTitle || 'Project images';
    show(images.indexOf(link));
    dialog.showModal();
    document.documentElement.classList.add('image-viewer-open');
    close.focus();
    enterFrom(thumbnail, source);
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
