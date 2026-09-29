/* Keep native details as the fallback, and animate their height when supported. */
(() => {
  const chapters = [...document.querySelectorAll('.dr-learning-chapter')];
  if (!chapters.length || !Element.prototype.animate) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();

  function settle(chapter, state) {
    if (states.get(chapter) !== state) return;
    chapter.open = state.expanded;
    chapter.style.height = '';
    chapter.style.overflow = '';
    states.delete(chapter);
  }

  function transition(chapter, expanded) {
    const previous = states.get(chapter);
    if ((previous?.expanded ?? chapter.open) === expanded) return;
    const start = chapter.getBoundingClientRect().height;
    previous?.animation?.cancel();
    const state = { expanded, animation: null };
    states.set(chapter, state);
    if (!expanded && chapter.contains(document.activeElement)) {
      chapter.querySelector('summary').focus({ preventScroll: true });
    }
    if (reducedMotion.matches) {
      settle(chapter, state);
      return;
    }
    chapter.style.height = '';
    chapter.style.overflow = 'hidden';
    chapter.open = true;
    const style = getComputedStyle(chapter);
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const end = expanded ? chapter.getBoundingClientRect().height : chapter.querySelector('summary').getBoundingClientRect().height + border;
    state.animation = chapter.animate(
      [{ height: `${start}px` }, { height: `${end}px` }],
      { duration: 420, easing: 'cubic-bezier(.22, .8, .25, 1)' }
    );
    state.animation.finished.then(() => settle(chapter, state)).catch(() => {});
  }

  chapters.forEach(chapter => {
    // Grouping is handled here so the outgoing panel can finish closing.
    chapter.removeAttribute('name');
    chapter.querySelector('summary').addEventListener('click', event => {
      event.preventDefault();
      const expanded = !(states.get(chapter)?.expanded ?? chapter.open);
      if (expanded) chapters.forEach(other => {
        if (other !== chapter) transition(other, false);
      });
      transition(chapter, expanded);
    });
  });
  function finishTransitions() {
    states.forEach((state, chapter) => {
      state.animation?.cancel();
      settle(chapter, state);
    });
  }
  window.addEventListener('resize', finishTransitions, { passive: true });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) finishTransitions();
  });
})();
