for (const disclosure of document.querySelectorAll('.publication-video')) {
  const heading = disclosure.closest('.publication-featured')?.querySelector('[data-player-heading]');
  const summary = disclosure.querySelector('summary');
  let titleButton;

  function syncControls() {
    titleButton.setAttribute('aria-expanded', String(disclosure.open));
    titleButton.setAttribute('aria-label', (disclosure.open ? 'Close player for ' : 'Play ') + heading.textContent.trim());
    // The title is the keyboard Play control. The poster still responds to a click.
    summary.tabIndex = disclosure.open ? 0 : -1;
  }

  if (heading) {
    disclosure.id = disclosure.closest('.publication').id + '-player';
    titleButton = document.createElement('button');
    titleButton.type = 'button';
    titleButton.className = 'featured-title-toggle';
    titleButton.setAttribute('aria-controls', disclosure.id);
    titleButton.append(...heading.childNodes);
    heading.append(titleButton);
    syncControls();
    titleButton.addEventListener('click', () => { disclosure.open = !disclosure.open; });
  }

  disclosure.addEventListener('toggle', () => {
    const player = disclosure.querySelector('iframe');
    if (titleButton) syncControls();
    if (disclosure.open) {
      if (!player) {
        const template = disclosure.querySelector('template');
        template.after(template.content.cloneNode(true));
      }
    } else if (player) {
      player.remove();
      if (titleButton && document.activeElement === summary) titleButton.focus();
    }
  });
}
