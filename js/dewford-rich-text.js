/* Render safe text nodes and a small set of formatting attributes. Never insert user HTML. */
(() => {
  const sizes={small:'.75em',large:'1.5em',huge:'2.5em'};
  function inline(text,attrs){
    let el=document.createTextNode(text);
    for(const [name,tag] of [['bold','strong'],['italic','em'],['underline','u'],['strike','s']])if(attrs[name]===true){const wrap=document.createElement(tag);wrap.append(el);el=wrap;}
    if(sizes[attrs.size]||['color','background'].some(name=>/^#[a-f0-9]{6}$/i.test(attrs[name]||''))){
      const span=document.createElement('span');if(sizes[attrs.size])span.style.fontSize=sizes[attrs.size];
      if(/^#[a-f0-9]{6}$/i.test(attrs.color||''))span.style.color=attrs.color;
      if(/^#[a-f0-9]{6}$/i.test(attrs.background||''))span.style.backgroundColor=attrs.background;
      span.append(el);el=span;
    }
    return el;
  }
  function render(root,content,fallback=''){
    root.replaceChildren();root.classList.add('dewford-rich-content');
    if(!Array.isArray(content?.ops)){root.textContent=fallback;return;}
    const lines=[];let parts=[];
    for(const op of content.ops){if(typeof op.insert!=='string')continue;const pieces=op.insert.split('\n');pieces.forEach((piece,i)=>{if(piece)parts.push(inline(piece,op.attributes||{}));if(i<pieces.length-1){lines.push({parts,attrs:op.attributes||{}});parts=[];}});}
    if(parts.length)lines.push({parts,attrs:{}});
    let group,groupType;
    for(const line of lines){
      const a=line.attrs;let el;
      if(['ordered','bullet'].includes(a.list)){
        const type=a.list==='ordered'?'ol':'ul';if(groupType!==type){group=document.createElement(type);root.append(group);groupType=type;}
        el=document.createElement('li');group.append(el);
      }else{groupType=null;el=document.createElement([1,2,3].includes(a.header)?'h'+a.header:a.blockquote===true?'blockquote':'p');root.append(el);}
      if(['center','right','justify'].includes(a.align))el.style.textAlign=a.align;
      el.append(...line.parts);if(!line.parts.length)el.append(document.createElement('br'));
    }
  }
  window.DEWFORD_RICH_TEXT=Object.freeze({render});
})();
