const galleryDisclosures = 'details.gallery-disclosure, details.gallery-detail-set';

// Associate the return position with this browser history entry only.
window.addEventListener('click', (event) => {
  const link = event.target.closest('a.image-enlarge');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      link.origin !== location.origin || (link.target && link.target !== '_self')) return;

  const openGroups = Array.from(document.querySelectorAll(galleryDisclosures)).filter(group => group.open).map(group => group.id);
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

  // Restore expanded content immediately so its thumbnail can receive focus.
  const gallery = link.closest('.portfolio-gallery');
  if (gallery) gallery.classList.add('restoring-image');
  for (const group of document.querySelectorAll(galleryDisclosures)) {
    group.open = saved.openGroups.includes(group.id);
  }
  // WebKit may still scroll to the URL fragment after the first layout.
  // Keep the image in its former position across that paint.
  requestAnimationFrame(() => {
    const restorePosition = () => {
      link.focus({ preventScroll: true });
      window.scrollBy({ top: link.getBoundingClientRect().top - saved.top, behavior: 'instant' });
    };
    restorePosition();
    requestAnimationFrame(() => {
      restorePosition();
      history.scrollRestoration = saved.scrollRestoration || 'auto';
      if (gallery) gallery.classList.remove('restoring-image');
    });
  });
});

// Old image bookmarks now lead to the collection within its project.
function revealLinkedEvidence() {
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  const appendix = target.closest('details.technical-details');
  if (appendix) {
    appendix.open = true;
    requestAnimationFrame(() => appendix.querySelector('summary').focus());
    return;
  }
  const collection = target.closest('.project-gallery');
  if (!collection) return;
  for (let parent = target; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
  const disclosure = collection.querySelector(':scope > details');
  if (target === collection || target.classList.contains('legacy-anchor')) {
    if (disclosure) disclosure.open = true;
  }
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
}
window.addEventListener('hashchange', revealLinkedEvidence);
// Image-return restoration owns scroll position when returning from an original.
if (!history.state?.imageReturn) revealLinkedEvidence();
