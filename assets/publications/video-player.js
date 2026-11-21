for (const disclosure of document.querySelectorAll('.publication-video')) {
  disclosure.addEventListener('toggle', () => {
    const player = disclosure.querySelector('iframe');
    if (disclosure.open) {
      if (!player) {
        const template = disclosure.querySelector('template');
        disclosure.append(template.content.cloneNode(true));
      }
    } else if (player) {
      player.remove();
    }
  });
}
