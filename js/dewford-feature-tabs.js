/* Keep the selected image in place and crossfade after the next photo is decoded. */
(() => {
  document.querySelectorAll('.features-section-two').forEach(section => {
    const cards = [...section.querySelectorAll('.feature-block-two .inner-box')];
    if (!cards.length) return;
    section.classList.add('dewford-feature-crossfade');
    let request = 0;
    let selected = cards.find(card => card.classList.contains('active')) || cards[0];
    cards.forEach(card => {
      card.classList.toggle('active', card === selected);
      card.tabIndex = 0;
      const image = card.querySelector('.image img');
      if (image) { image.loading = 'eager'; image.decode?.().catch(() => {}); }
      const activate = async () => {
        const current = ++request;
        if (image?.decode) { try { await image.decode(); } catch { return; } }
        if (current !== request || selected === card) return;
        selected.classList.remove('active');
        card.classList.add('active');
        selected = card;
      };
      card.addEventListener('pointerenter', activate);
      card.addEventListener('focus', activate);
      card.addEventListener('click', activate);
    });
  });
})();
