/* Apply Korean tracking within mixed-language text, including dynamic event cards. */
(() => {
  const excluded = 'script,style,svg,textarea,select,option,code,pre,.dewford-rich-content,.ql-editor,.dewford-korean-text,[contenteditable="true"],.char';
  const korean = /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+(?:[\s·,.!?…“”‘’()–—\-]*[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]+)*/g;
  function apply(root) {
    if (root.nodeType === Node.ELEMENT_NODE && root.closest(excluded)) return;
    const nodes = [];
    if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
    else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) nodes.push(walker.currentNode);
    }
    nodes.forEach(node => {
      if (!node.parentElement || node.parentElement.closest(excluded)) return;
      const text = node.nodeValue;
      const matches = [...text.matchAll(korean)];
      if (!matches.length) return;
      const fragment = document.createDocumentFragment();
      let offset = 0;
      for (const match of matches) {
        fragment.append(text.slice(offset, match.index));
        const span = document.createElement('span');
        span.className = 'dewford-korean-text'; span.lang = 'ko'; span.textContent = match[0];
        fragment.append(span); offset = match.index + match[0].length;
      }
      fragment.append(text.slice(offset)); node.replaceWith(fragment);
    });
  }
  apply(document.body);
  new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) apply(node);
  }).observe(document.body, {childList:true,subtree:true});
})();
