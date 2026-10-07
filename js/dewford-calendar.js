(function () {
 'use strict';
 const root=document.querySelector('[data-dewford-calendar]');
 if(!root)return;
 const today=new Date();today.setHours(0,0,0,0);
 let displayed=new Date(today.getFullYear(),today.getMonth(),1),selected=new Date(today),events=[];
 const requested=new URLSearchParams(location.search).get('date');
 if(/^\d{4}-\d{2}-\d{2}$/.test(requested||'')){const d=new Date(requested+'T00:00:00');if(!Number.isNaN(d.getTime())){selected=d;displayed=new Date(d.getFullYear(),d.getMonth(),1);}}
 const grid=root.querySelector('.dewford-calendar-days'),heading=root.querySelector('[data-calendar-month]'),picker=root.querySelector('[data-calendar-picker]'),details=root.querySelector('[data-calendar-details]');
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const label=d=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(d);
 const imageModal=document.createElement('dialog');imageModal.className='dewford-calendar-image-modal';imageModal.setAttribute('aria-label','일정 이미지 확대');
 const enlarged=document.createElement('img'),closeImage=document.createElement('button');closeImage.type='button';closeImage.className='dewford-calendar-image-close';closeImage.textContent='×';closeImage.setAttribute('aria-label','이미지 닫기');imageModal.append(closeImage,enlarged);document.body.append(imageModal);
 let imageOpener,previousOverflow;
 function openImage(src,alt,opener){imageOpener=opener;enlarged.src=src;enlarged.alt=alt;previousOverflow=document.documentElement.style.overflow;imageModal.showModal();document.documentElement.style.overflow='hidden';}
 closeImage.addEventListener('click',()=>imageModal.close());
 imageModal.addEventListener('click',event=>{if(event.target===imageModal)imageModal.close();});
 imageModal.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow||'';enlarged.removeAttribute('src');if(imageOpener?.isConnected)imageOpener.focus({preventScroll:true});});
 function safeImage(src){try{const url=new URL(src,location.href);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}}
 function showDetails(){
  details.replaceChildren();
  const matches=events.filter(e=>e.date===key(selected));
  if(!matches.length){const title=document.createElement('h3');title.textContent=label(selected);const p=document.createElement('p');p.textContent='등록된 일정이 없습니다. 확정된 학사 일정은 추후 안내합니다.';details.append(title,p);return;}
  const list=document.createElement('ul');list.className='dewford-calendar-schedule-list';
  matches.forEach(event=>{
   const li=document.createElement('li');li.className='dewford-calendar-schedule';li.dataset.calendarId=event.id||'';
   const media=document.createElement('div');media.className='dewford-calendar-schedule-media';
   [event.image,...(Array.isArray(event.gallery)?event.gallery:[])].filter(Boolean).forEach(src=>{
    const url=safeImage(src);if(!url)return;
    const button=document.createElement('button');button.type='button';button.className='dewford-calendar-photo';button.setAttribute('aria-label',`${event.title} 이미지 확대`);
    const img=document.createElement('img');img.src=url;img.alt=event.alt||event.title;img.loading='lazy';button.append(img);button.addEventListener('click',()=>openImage(url,img.alt,button));
    img.addEventListener('error',()=>{button.remove();if(!media.childElementCount){media.remove();li.classList.remove('has-photo');}});media.append(button);
   });
   if(media.childElementCount){li.classList.add('has-photo');li.append(media);}
   const copy=document.createElement('div');copy.className='dewford-calendar-schedule-copy';
   const date=document.createElement('div');date.className='dewford-calendar-schedule-date';const time=document.createElement('time');time.dateTime=event.date;time.textContent=label(selected);
   const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.innerHTML='<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 3v4m10-4v4M3 11h18M7 15h2m4 0h2m-8 3h2"/>';date.append(time,icon);
   const title=document.createElement('strong');title.className='dewford-calendar-schedule-title';title.textContent=event.title;copy.append(date,title);
   const body=document.createElement('div');body.className='dewford-calendar-schedule-body';
   if(event.content?.ops&&window.DEWFORD_RICH_TEXT)window.DEWFORD_RICH_TEXT.render(body,event.content);
   else if(event.description){const p=document.createElement('p');p.textContent=event.description;body.append(p);}
   copy.append(body);li.append(copy);list.append(li);
  });details.append(list);
 }
 function render(focus=false){
  heading.textContent=`${displayed.getFullYear()}년 ${displayed.getMonth()+1}월`;
  picker.value=`${displayed.getFullYear()}-${String(displayed.getMonth()+1).padStart(2,'0')}`;
  grid.replaceChildren();const first=new Date(displayed.getFullYear(),displayed.getMonth(),1-displayed.getDay());
  for(let i=0;i<42;i++){
   const date=new Date(first);date.setDate(first.getDate()+i);
   const button=document.createElement('button');button.type='button';button.dataset.date=key(date);button.className='dewford-calendar-day';
   button.setAttribute('aria-label',label(date));button.setAttribute('aria-pressed',String(key(date)===key(selected)));
   if(date.getMonth()!==displayed.getMonth())button.classList.add('is-outside');
   if(key(date)===key(today)){button.classList.add('is-today');button.setAttribute('aria-current','date');}
   if(key(date)===key(selected))button.classList.add('is-selected');
   const number=document.createElement('span');number.className='dewford-calendar-number';number.textContent=date.getDate();button.append(number);
   const matches=events.filter(e=>e.date===key(date));
   if(matches.length){button.classList.add('has-events');button.setAttribute('aria-label',label(date)+`, 일정 ${matches.length}개`);const count=document.createElement('span');count.className='dewford-calendar-event';count.textContent=matches.length===1?matches[0].title:`일정 ${matches.length}개`;button.append(count);}
   button.addEventListener('click',()=>{selected=date;displayed=new Date(date.getFullYear(),date.getMonth(),1);render(true);});
   button.addEventListener('keydown',event=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(event.key in offsets))return;event.preventDefault();selected=new Date(date);selected.setDate(selected.getDate()+offsets[event.key]);displayed=new Date(selected.getFullYear(),selected.getMonth(),1);render(true);});
   grid.append(button);
  }
  showDetails();if(focus)grid.querySelector(`[data-date="${key(selected)}"]`)?.focus({preventScroll:true});
 }
 function moveMonth(amount){displayed=new Date(displayed.getFullYear(),displayed.getMonth()+amount,1);selected=new Date(displayed);render();}
 root.querySelector('[data-calendar-prev]').addEventListener('click',()=>moveMonth(-1));
 root.querySelector('[data-calendar-next]').addEventListener('click',()=>moveMonth(1));
 root.querySelector('[data-calendar-today]').addEventListener('click',()=>{selected=new Date(today);displayed=new Date(today.getFullYear(),today.getMonth(),1);render();});
 picker.addEventListener('change',()=>{if(!/^\d{4}-\d{2}$/.test(picker.value))return;const [year,month]=picker.value.split('-').map(Number);displayed=new Date(year,month-1,1);selected=new Date(displayed);render();});
 render();
 const loadEvents=()=> (async()=>{try {const result=await DewfordAPI.content('calendar');if(result.data && Array.isArray(result.data[root.dataset.dewfordCalendar]))return result.data;}catch{}const response=await fetch('js/data/dewford-calendar.json');if(!response.ok)throw Error('calendar');return response.json();})().then(data=>{events=(data[root.dataset.dewfordCalendar]||[]).filter(e=>typeof e.date==='string'&&typeof e.title==='string');render();}).catch(()=>{root.querySelector('[data-calendar-notice]').textContent='일정 데이터를 불러오지 못했습니다. 학사 일정은 행정실로 문의해 주세요.';});
 loadEvents();window.addEventListener('dewford:content-changed',loadEvents);
})();
