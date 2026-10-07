/* Managed image carousel: a single image stays still. */
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
  const hidden=item=>{try{return Number(localStorage.getItem('dewford-popup-hidden-'+item.id))>Date.now();}catch{return false;}};
  function safeURL(value){try{const url=new URL(value,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}}
  items=items.filter(item=>!hidden(item)&&item.image&&safeURL(item.image));
  if(!items.length)return;
  const sliding=items.length>1,imageBox=popup.querySelector('.dewford-popup-image');
  let index=0,timer,controls,dots,paused=false,touchStart;
  const previousOverflow=document.documentElement.style.overflow;
  popup.classList.toggle('has-slides',sliding);
  const track=document.createElement('div');track.className='dewford-popup-track';
  const slides=[];
  function makeSlide(item,clone=false){
    const slide=document.createElement('div');slide.className='dewford-popup-slide';const image=document.createElement('img');image.src=safeURL(item.image);image.alt=item.title||'DEWFORD 안내';image.decoding='async';image.draggable=false;
    const href=item.link&&safeURL(item.link);if(href){const link=document.createElement('a');link.href=href;link.append(image);slide.append(link);}else slide.append(image);
    if(clone){slide.setAttribute('aria-hidden','true');slide.inert=true;}track.append(slide);return slide;
  }
  if(sliding)makeSlide(items[items.length-1],true);
  items.forEach(item=>slides.push(makeSlide(item)));
  if(sliding)makeSlide(items[0],true);
  imageBox.replaceChildren(track);
  popup.style.width=`min(${Math.min(1000,Math.max(240,...items.map(item=>Number(item.width)||480)))}px, calc(100vw - 32px))`;
  let physical=sliding?1:0,animating=false,settleTimer;
  function position(animate=false){track.classList.toggle('is-animating',animate);track.style.transform=`translateX(-${physical*100}%)`;}
  function render(){
    popup.setAttribute('aria-label',items[index].title||'DEWFORD 안내');
    slides.forEach((slide,i)=>{slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));});
    if(dots)Array.from(dots.children).forEach((dot,i)=>dot.setAttribute('aria-current',i===index?'true':'false'));
  }
  function settle(){clearTimeout(settleTimer);if(!animating)return;physical=index+1;position();animating=false;}
  track.addEventListener('transitionend',event=>{if(event.target===track&&event.propertyName==='transform')settle();});
  function restart(){clearInterval(timer);if(sliding&&popup.open&&!paused&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>go(index+1),5000);}
  async function go(next){
    if(!sliding||animating)return;const target=(next+items.length)%items.length;if(target===index)return;animating=true;
    try{await slides[target].querySelector('img').decode();}catch{}
    if(!popup.open){animating=false;return;}
    physical=next<0?0:next>=items.length?items.length+1:target+1;index=target;render();position(true);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)settle();else settleTimer=setTimeout(settle,550);restart();
  }
  if(sliding){
    controls=document.createElement('div');controls.className='dewford-popup-slider-controls';controls.setAttribute('aria-label','팝업 이미지 탐색');
    const button=(label,text,handler)=>{const el=document.createElement('button');el.type='button';el.setAttribute('aria-label',label);el.textContent=text;el.addEventListener('click',handler);return el;};
    dots=document.createElement('div');dots.className='dewford-popup-dots';
    items.forEach((item,i)=>dots.append(button(`${i+1}번째 이미지: ${item.title||'DEWFORD 안내'}`,'●',()=>go(i))));
    controls.append(button('이전 이미지','‹',()=>go(index-1)),dots,button('다음 이미지','›',()=>go(index+1)));imageBox.append(controls);
    popup.addEventListener('mouseenter',()=>{paused=true;clearInterval(timer);});popup.addEventListener('mouseleave',()=>{paused=false;restart();});
    popup.addEventListener('focusin',()=>{clearInterval(timer);});popup.addEventListener('focusout',event=>{if(!popup.contains(event.relatedTarget))restart();});
    document.addEventListener('visibilitychange',restart);
    imageBox.addEventListener('touchstart',event=>{touchStart=event.touches[0]?.clientX;clearInterval(timer);},{passive:true});
    imageBox.addEventListener('touchend',event=>{const end=event.changedTouches[0]?.clientX;if(touchStart!==undefined&&Math.abs(end-touchStart)>50)go(index+(end<touchStart?1:-1));else restart();touchStart=undefined;},{passive:true});
  }
  function close(){
    if(popup.querySelector('input').checked){const midnight=new Date();midnight.setHours(24,0,0,0);for(const item of items)try{localStorage.setItem('dewford-popup-hidden-'+item.id,String(midnight.getTime()));}catch{}}
    popup.close();
  }
  popup.querySelector('[data-popup-close]').addEventListener('click',close);
  popup.addEventListener('cancel',event=>{event.preventDefault();close();});
  popup.addEventListener('click',event=>{if(event.target!==popup)return;const r=popup.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
  popup.addEventListener('close',()=>{clearInterval(timer);clearTimeout(settleTimer);document.documentElement.style.overflow=previousOverflow;});
  render();position();popup.querySelector('input').checked=false;popup.showModal();document.documentElement.style.overflow='hidden';restart();
})();
