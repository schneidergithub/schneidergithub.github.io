(() => {
  for (const index of document.querySelectorAll('.project-index')) {
    const choices = [...index.querySelectorAll('.index-choices a')];
    const panels = [...index.querySelectorAll('.index-panel')];
    function selectCollection() {
      const target = document.getElementById(location.hash.slice(1));
      const selected = panels.find(panel => panel.contains(target)) || panels[0];
      for (const panel of panels) panel.hidden = panel !== selected;
      for (const link of choices) {
        if (link.hash.slice(1) === selected.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
      if (target && selected.contains(target) && target !== selected) {
        target.scrollIntoView({block: 'nearest', inline: 'center', behavior: 'instant'});
      }
    }
    // Keep the picker in place while preserving shareable links and browser Back.
    for (const link of choices) link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      selectCollection();
    });
    index.classList.add('index-ready');
    selectCollection();
    window.addEventListener('hashchange', selectCollection);
  }

  for (const track of document.querySelectorAll('[data-filmstrip]')) {
    const region = track.parentElement;
    const slides = [...track.children];
    const controls = region.querySelector('.filmstrip-controls');
    const status = controls.querySelector('.filmstrip-status');
    const [previous, next] = controls.querySelectorAll('button');
    const openAll = region.querySelector('[data-open-collection]');
    if (openAll && typeof document.querySelector('.image-viewer')?.showModal === 'function') {
      track.classList.add('contact-ready');
      openAll.hidden = false;
    }
    controls.hidden = false;
    region.classList.add('filmstrip-ready');
    controls.querySelector('.gallery-plate').hidden = slides.length < 2;
    let current = -1;
    let targetIndex = null;
    let timer;
    function update() {
      if (!track.clientWidth) return;
      const left = track.getBoundingClientRect().left + track.clientLeft + parseFloat(getComputedStyle(track).paddingLeft);
      let nearest = slides.reduce((best, slide, index) =>
        Math.abs(slide.getBoundingClientRect().left - left) < Math.abs(slides[best].getBoundingClientRect().left - left) ? index : best, 0);
      if (track.scrollLeft > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) nearest = slides.length - 1;
      if (current === nearest) return;
      current = nearest;
      status.textContent = (current + 1) + ' of ' + slides.length + ' · ' + slides[current].dataset.slideTitle;
      previous.setAttribute('aria-disabled', String(current === 0));
      next.setAttribute('aria-disabled', String(current === slides.length - 1));
    }
    function navigate(step, moveFocus) {
      const start = targetIndex ?? current;
      const index = Math.max(0, Math.min(slides.length - 1, start + step));
      if (index === start) return;
      targetIndex = index;
      const link = slides[index].querySelector('a');
      if (moveFocus) link.focus({preventScroll:true});
      track.scrollBy({
        left: slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      });
    }
    previous.addEventListener('click', () => navigate(-1, false));
    next.addEventListener('click', () => navigate(1, false));
    track.addEventListener('keydown', event => {
      if (track.scrollWidth <= track.clientWidth || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      current = slides.indexOf(event.target.closest('figure'));
      navigate(event.key === 'ArrowLeft' ? -1 : 1, true);
    });
    track.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { targetIndex = null; update(); }, 100);
    }, {passive:true});
    if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(track);
    window.addEventListener('hashchange', update);
    update();
  }
})();
