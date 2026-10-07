/* Managed popups, preserving the temporary image until the first admin save. */
(async () => {
  const popup=document.getElementById('dewford-home-popup');
  if(!popup||typeof popup.showModal!=='function')return;
  const introReady=document.getElementById('dewford-intro')?new Promise(resolve=>document.addEventListener('dewford:intro-complete',resolve,{once:true})):Promise.resolve();
  let items=[{id:'home-2026',title:'DEWFORD 안내',image:'images/sub/pop2026_1.png',width:480}];
  try {
    const response=await fetch('/api/content/popups',{headers:{Accept:'application/json'}});
    if(response.ok){const result=await response.json();if(Array.isArray(result.data?.popups))items=result.data.popups;}
  }catch{}
  await introReady;
  let current,previousOverflow;
  const hidden=item=>{try{return Number(localStorage.getItem('dewford-popup-hidden-'+item.id))>Date.now();}catch{return false;}};
  items=items.filter(item=>!hidden(item));
  function safeURL(value){try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}}
  function next(){
    current=items.shift();if(!current)return;
    const src=safeURL(current.image);if(!src){next();return;}
    popup.querySelector('input').checked=false;
    popup.setAttribute('aria-label',current.title||'DEWFORD 안내');popup.style.width=`min(${Math.min(1000,Math.max(240,Number(current.width)||480))}px, calc(100vw - 32px))`;
    const image=popup.querySelector('.dewford-popup-image img');image.src=src;image.alt=current.title||'DEWFORD 안내';
    const imageBox=popup.querySelector('.dewford-popup-image');imageBox.replaceChildren();
    const href=current.link&&safeURL(current.link);
    if(href){const link=document.createElement('a');link.href=href;link.append(image);imageBox.append(link);}else imageBox.append(image);
    previousOverflow=document.documentElement.style.overflow;popup.showModal();document.documentElement.style.overflow='hidden';
  }
  function close(){
    if(popup.querySelector('input').checked&&current){const midnight=new Date();midnight.setHours(24,0,0,0);try{localStorage.setItem('dewford-popup-hidden-'+current.id,String(midnight.getTime()));}catch{}}
    popup.close();
  }
  popup.querySelector('[data-popup-close]').addEventListener('click',close);
  popup.addEventListener('cancel',event=>{event.preventDefault();close();});
  popup.addEventListener('click',event=>{if(event.target!==popup)return;const r=popup.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
  popup.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;next();});
  next();
})();
