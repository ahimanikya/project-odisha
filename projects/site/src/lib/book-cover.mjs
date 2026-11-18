export const coverViews = ['front', 'spine', 'back'];
export const coverAngles = { front: -8, spine: 90, back: 180 };

export function createCoverState(initial = 'front') {
  let view = coverViews.includes(initial) ? initial : 'front';
  let gesture = null;
  const api = {
    get view() { return view; },
    get gesture() { return gesture; },
    select(next) { if (coverViews.includes(next)) view = next; gesture = null; return view; },
    cancel() { gesture = null; return view; },
    begin(event, width) {
      if (gesture || event.isPrimary === false) { gesture = null; return false; }
      if (!['touch', 'pen'].includes(event.pointerType) || event.button > 0) return false;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, width: Math.max(width, 1), horizontal: false };
      return true;
    },
    move(event) {
      if (!gesture || event.pointerId !== gesture.id) return null;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      if (!gesture.horizontal && Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) { gesture = null; return null; }
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) gesture.horizontal = true;
      if (!gesture.horizontal) return null;
      return Math.max(-55, Math.min(55, -dx / gesture.width * 110));
    },
    finish(event) {
      if (!gesture || event.pointerId !== gesture.id) return view;
      const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
      const threshold = Math.min(80, Math.max(36, gesture.width * .16));
      const valid = gesture.horizontal && Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.5;
      gesture = null;
      if (valid) view = coverViews[(coverViews.indexOf(view) + (dx < 0 ? 1 : 2)) % coverViews.length];
      return view;
    }
  };
  return api;
}

export function bindBookCover(root, host = window) {
  if (root.dataset.coverReady) return;
  const viewport = root.querySelector('[data-cover-viewport]');
  const volume = root.querySelector('[data-cover-volume]');
  const controls = root.querySelector('[data-cover-controls]');
  const buttons = [...root.querySelectorAll('button[data-cover-view]')];
  const faces = [...root.querySelectorAll('[data-cover-face]')];
  const status = root.querySelector('[data-cover-status]');
  if (!viewport || !volume || !controls || buttons.length !== 3) return;
  const larger = root.querySelector('[data-cover-larger]');
  const state = createCoverState();
  const reduced = host.matchMedia('(prefers-reduced-motion: reduce)');
  const flat = host.matchMedia('(forced-colors: active)');
  const render = (announce = false) => {
    root.dataset.view = state.view;
    if (larger) {
      const src = larger.dataset[`${state.view}Src`];
      larger.hidden = !src;
      if (src) larger.setAttribute('href', src);
    }
    volume.style.setProperty('--book-angle', `${coverAngles[state.view]}deg`);
    root.removeAttribute('data-dragging');
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.coverView === state.view));
    for (const face of faces) face.setAttribute('aria-hidden', String(face.dataset.coverFace !== state.view));
    if (announce && status) status.textContent = `${state.view[0].toUpperCase() + state.view.slice(1)} cover view shown.`;
  };
  const cancel = () => { state.cancel(); render(); };
  for (const button of buttons) button.addEventListener('click', () => { state.select(button.dataset.coverView); render(true); });
  viewport.addEventListener('pointerdown', event => { state.begin(event, viewport.clientWidth); });
  root.ownerDocument.addEventListener('pointerdown', event => {
    if (state.gesture && event.pointerId !== state.gesture.id) cancel();
  }, true);
  viewport.addEventListener('pointermove', event => {
    const delta = state.move(event);
    if (delta === null) { if (!state.gesture) render(); return; }
    if (event.cancelable) event.preventDefault();
    if (viewport.setPointerCapture && !viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId);
    if (!reduced.matches && !flat.matches) {
      root.dataset.dragging = 'true';
      volume.style.setProperty('--book-angle', `${coverAngles[state.view] + delta}deg`);
    }
  });
  host.addEventListener('pointerup', event => {
    if (!state.gesture || event.pointerId !== state.gesture.id) return;
    const before = state.view;
    state.finish(event);
    render(before !== state.view);
  });
  host.addEventListener('pointercancel', cancel);
  viewport.addEventListener('lostpointercapture', event => {
    // Capture may move from a touched image to the viewport; its bubbled loss is not a cancellation.
    if (event.target === viewport && state.gesture) cancel();
  });
  host.addEventListener('blur', cancel);
  reduced.addEventListener('change', cancel);
  flat.addEventListener('change', cancel);
  render();
  root.dataset.coverReady = 'true';
  controls.hidden = false;
  const hint = root.querySelector('[data-cover-hint]');
  if (hint) hint.hidden = false;
}
