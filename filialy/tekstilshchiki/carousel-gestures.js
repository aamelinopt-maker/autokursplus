/* Shared touch and keyboard controls for the branch's local carousels. */
window.akBindCarouselGestures = (viewport, previous, next) => {
  let start = null, suppressClick = false;
  viewport.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType === 'mouse' || !event.isPrimary || event.target.closest('video, input, select')) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  viewport.addEventListener('pointerup', event => {
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < Math.min(64, Math.max(36, viewport.clientWidth * .12)) || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    suppressClick = true;
    (dx > 0 ? previous : next)();
  });
  viewport.addEventListener('pointercancel', () => { start = null; });
  viewport.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
  viewport.addEventListener('keydown', event => {
    suppressClick = false;
    if (event.target !== viewport || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    (event.key === 'ArrowLeft' ? previous : next)();
  });
};
