/* Shared manual image viewer for tuition and article attachments. */
(() => {
  const dialog=document.createElement('dialog');dialog.id='dewford-image-viewer';dialog.setAttribute('aria-label','이미지 크게 보기');
  const stage=document.createElement('div');stage.className='dewford-viewer-stage';
  const photo=document.createElement('img');photo.className='dewford-viewer-photo';photo.alt='';photo.draggable=false;
  const status=document.createElement('p');status.className='dewford-viewer-status';status.setAttribute('role','status');
  const button=(label,text,cls)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.textContent=text;return b;};
  const close=button('이미지 팝업 닫기','×','dewford-viewer-close');
  const prev=button('이전 이미지','‹','dewford-viewer-prev'),next=button('다음 이미지','›','dewford-viewer-next');
  const thumbs=document.createElement('div');thumbs.className='dewford-viewer-thumbnails';thumbs.setAttribute('aria-label','이미지 미리보기');
  const toolbar=document.createElement('div');toolbar.className='dewford-viewer-toolbar';toolbar.append(close);
  stage.append(photo,status,prev,next);dialog.append(toolbar,stage,thumbs);document.body.append(dialog);
  let items=[],index=0,opener,previousOverflow,version=0;
  function safeURL(value){if(typeof value!=='string'||!value.trim())return '';try{const u=new URL(value,location.href);return ['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
  function fit(){
    if(!dialog.open||!photo.naturalWidth||photo.hidden)return;
    const width=document.documentElement.clientWidth,height=window.visualViewport?.height||window.innerHeight;
    const availableWidth=Math.max(1,width-32),availableHeight=Math.max(1,height-32-46-(items.length>1?height*.1+24:0));
    const scale=Math.min(1,availableWidth/photo.naturalWidth,availableHeight/photo.naturalHeight);
    const imageWidth=photo.naturalWidth*scale;
    const previewWidth=Math.min(width*.9,availableWidth);
    dialog.style.width=Math.max(imageWidth,items.length>1?previewWidth:0)+'px';
    stage.style.width=toolbar.style.width=imageWidth+'px';
    photo.style.width=imageWidth+'px';photo.style.height=photo.naturalHeight*scale+'px';
  }
  function render(){
    const current=++version,item=items[index];photo.hidden=true;photo.removeAttribute('src');photo.style.width='';photo.style.height='';
    stage.style.width=toolbar.style.width='';
    dialog.style.width=items.length>1?'min(90vw, calc(100vw - 32px))':'min(320px, calc(100vw - 32px))';
    status.hidden=false;status.textContent='이미지를 불러오고 있습니다.';
    prev.hidden=next.hidden=thumbs.hidden=items.length<2;
    for(const [i,b] of [...thumbs.children].entries())b.setAttribute('aria-current',String(i===index));
    const loader=new Image();loader.onload=()=>{if(current!==version||!dialog.open)return;photo.src=item.src;photo.alt=item.alt||`이미지 ${index+1}`;photo.hidden=false;status.hidden=true;fit();};
    loader.onerror=()=>{if(current!==version||!dialog.open)return;status.textContent='이미지를 불러오지 못했습니다.';};loader.src=item.src;
    thumbs.children[index]?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  function open(images,start=0,trigger=document.activeElement){
    if(!dialog.open&&previousOverflow!==undefined)cleanup();
    items=images.map(item=>({src:safeURL(item.src),alt:item.alt||''})).filter(item=>item.src);if(!items.length)return;
    index=Math.min(items.length-1,Math.max(0,start));opener=trigger;
    thumbs.replaceChildren();items.forEach((item,i)=>{const b=button(`${i+1}번째 이미지 보기`,'','dewford-viewer-thumbnail');const img=new Image();img.src=item.src;img.alt=item.alt||`이미지 ${i+1}`;b.append(img);b.addEventListener('click',()=>{index=i;render();});thumbs.append(b);});
    if(!dialog.open){previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();}
    render();close.focus({preventScroll:true});
  }
  const go=direction=>{index=(index+direction+items.length)%items.length;render();};
  prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));close.addEventListener('click',()=>{dialog.close();cleanup();});
  dialog.addEventListener('keydown',event=>{if(items.length>1&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();go(event.key==='ArrowLeft'?-1:1);}});
  function cleanup(){if(previousOverflow===undefined)return;version++;document.documentElement.style.overflow=previousOverflow;previousOverflow=undefined;photo.removeAttribute('src');thumbs.replaceChildren();opener?.focus?.({preventScroll:true});}
  dialog.addEventListener('close',()=>{if(!dialog.open)cleanup();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();cleanup();});
  photo.addEventListener('load',fit);
  window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);
  window.DewfordImageViewer=Object.freeze({open});
  function articleImage(target){return target.closest('[data-dewford-article-image]')||target.closest('.dewford-article-image-trigger')?.querySelector('[data-dewford-article-image]');}
  function openArticle(img){const images=[...img.closest('[data-news-detail]').querySelectorAll('[data-dewford-article-image]')];open(images.map(el=>({src:el.currentSrc||el.src,alt:el.alt})),images.indexOf(img),img);}
  document.addEventListener('click',async event=>{
    const img=articleImage(event.target);if(img){event.preventDefault();openArticle(img);return;}
    const fee=event.target.closest('[data-dewford-tuition]');if(!fee)return;event.preventDefault();if(fee.disabled)return;
    fee.disabled=true;
    try{
      const result=await window.DewfordAPI.content('tuition');
      if(!safeURL(result.data?.image))throw new Error('IMAGE_UNAVAILABLE');
      open([{src:result.data.image,alt:'교습비 안내'}],0,fee);
    }catch{
      if(!dialog.open&&previousOverflow!==undefined)cleanup();
      version++;items=[];opener=fee;photo.hidden=true;photo.removeAttribute('src');thumbs.replaceChildren();thumbs.hidden=prev.hidden=next.hidden=true;
      stage.style.width=toolbar.style.width='';dialog.style.width='320px';status.hidden=false;status.textContent='교습비 안내 이미지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      if(!dialog.open){previousOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();}
      close.focus({preventScroll:true});
    }finally{fee.disabled=false;}
  });
  document.addEventListener('keydown',event=>{const img=articleImage(event.target);if(img&&['Enter',' '].includes(event.key)){event.preventDefault();openArticle(img);}});
})();
