// Associate the return position with this browser history entry only.
window.addEventListener('click', (event) => {
  const link = event.target.closest('a.image-enlarge');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.origin !== location.origin || (link.target && link.target !== '_self')) return;

  const openGroups = Array.from(document.querySelectorAll('.portfolio-gallery details[open]'), group => group.id);
  history.replaceState({
    ...history.state,
    imageReturn: {
      id: link.id, href: link.href, top: link.getBoundingClientRect().top,
      openGroups, scrollRestoration: history.scrollRestoration
    }
  }, '');
  // This entry reopens disclosures before it can restore the saved position.
  history.scrollRestoration = 'manual';
});

window.addEventListener('pageshow', (event) => {
  const saved = history.state?.imageReturn;
  if (!saved) return;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!event.persisted && navigation?.type !== 'back_forward') return;

  const state = { ...history.state };
  delete state.imageReturn;
  history.replaceState(state, '');
  const link = document.getElementById(saved.id);
  if (!link || !link.matches('a.image-enlarge') || link.href !== saved.href) {
    history.scrollRestoration = saved.scrollRestoration || 'auto';
    return;
  }

  for (const group of document.querySelectorAll('.portfolio-gallery details')) {
    group.open = saved.openGroups.includes(group.id);
  }
  // WebKit may still scroll to the URL fragment after the first layout.
  // Keep the image in its former position across that paint.
  requestAnimationFrame(() => {
    link.focus({ preventScroll: true });
    const restorePosition = () => {
      window.scrollBy({ top: link.getBoundingClientRect().top - saved.top, behavior: 'instant' });
    };
    restorePosition();
    requestAnimationFrame(() => {
      restorePosition();
      history.scrollRestoration = saved.scrollRestoration || 'auto';
    });
  });
});
