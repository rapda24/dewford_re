/* Shared subpage titles: edit page copy and photos here for every subpage. */
(() => {
  if (!document.body.classList.contains('dewford-subpage')) return;
  const pages = {
    'why-dewford.html':['Why DEWFORD','영어로 생각하고 표현하는 아이로, DEWFORD와 함께 배움의 가능성을 넓혀갑니다.'],
    'educational-philosophy.html':['Vision & Mission','스스로 질문하고 생각하며, 자신의 생각을 표현하는 배움을 지향합니다.'],
    'rolling-enrollment.html':['Rolling Admissions','아이의 발달 단계와 영어 경험을 살피며, 알맞은 배움의 시작을 함께 준비합니다.'],
    'admissions-inquiry.html':['Apply Now','아이에게 맞는 교육 과정과 입학에 대해 편하게 문의해 주세요.'],
    'international-preschool.html':['International Early Learning Program','놀이와 탐구를 통해 영어로 세상을 이해하고, 스스로 읽는 힘을 기릅니다.'],
    'elementary-international.html':['International Primary Program','읽기와 쓰기, 탐구를 연결하며 영어로 생각하고 표현하는 힘을 넓혀갑니다.'],
    'elementary-esl.html':['Primary ESL Program','아이의 영어 수준에 맞춰 문장부터 글까지, 표현의 기초를 차근차근 다집니다.'],
    'preschool-calendar.html':['Early Learning Calendar','아이들의 배움과 다양한 경험으로 채워지는 유치부 일정을 확인하세요.'],
    'elementary-calendar.html':['Primary Calendar','초등 과정의 학습과 활동 일정을 확인하세요.'],
    'event.html':['Events','아이들의 배움과 성장이 담긴 DEWFORD의 순간들을 만나보세요.'],
    'detail.html':['Event Story','하나의 경험이 배움으로 이어지는 순간, 아이들의 이야기를 자세히 전합니다.'],
    'contact.html':['Contact','용산 이태원에서 시작하는 아이의 더 넓은 세상, DEWFORD를 만나보세요.']
  };
  const introductions = {
    'why-dewford.html': ['영어를 넘어,\n생각하는 힘을 키우는 곳', 'DEWFORD는 읽고, 질문하고, 자신의 생각을 표현하는 경험을 연결합니다. 아이가 영어로 세상을 이해하고 배움의 주체로 성장하도록 돕습니다.'],
    'educational-philosophy.html': ['정답을 말하는 데서\n자신의 생각을 펼치는 배움으로', '스스로 읽는 힘, 생각을 글로 옮기는 힘, 새로운 것을 탐구하는 태도. DEWFORD는 이 세 가지를 아이의 일상 속 배움으로 이어갑니다.'],
    'rolling-enrollment.html': ['아이의 지금을 살피고,\n다음 배움을 함께 준비합니다', '아이마다 영어를 만난 경험과 성장의 속도는 다릅니다. 현재의 발달 단계와 영어 수준을 세심하게 살펴 적합한 과정과 입학을 안내합니다.'],
    'admissions-inquiry.html': ['우리 아이에게 맞는 시작,\n상담에서 함께 찾아갑니다', '아이의 연령과 영어 경험, 궁금하신 점을 알려주세요. 교육 과정과 입학에 대해 차근차근 안내해 드리겠습니다.'],
    'international-preschool.html': ['놀며 발견하고,\n영어로 세상을 알아갑니다', '이야기와 놀이, 주제별 탐구를 통해 영어를 자연스럽게 사용합니다. 연령별 발달과 읽기 수준을 함께 살피며 스스로 읽고 표현하는 기초를 다집니다.'],
    'elementary-international.html': ['읽고 탐구한 생각이\n나만의 글과 표현이 됩니다', '읽기와 쓰기를 중심으로 문법과 어휘를 연결합니다. 질문하고 토론하며 생각을 넓히고, 문장에서 문단과 에세이로 표현의 깊이를 더합니다.'],
    'elementary-esl.html': ['기초를 단단하게,\n표현은 한 걸음 더 넓게', '아이의 현재 영어 수준에 맞춰 읽기·쓰기·문법·어휘를 함께 익힙니다. 이해한 내용을 자신의 문장으로 표현하며 다음 학습 단계로 나아갑니다.'],
    'preschool-calendar.html': ['작은 발견으로 채워지는\n아이들의 배움 달력', '유치부의 수업과 활동, 주요 일정을 한눈에 확인하세요. 가정에서도 아이의 새로운 경험과 성장의 순간을 함께 준비할 수 있습니다.'],
    'elementary-calendar.html': ['배움의 흐름을 살피고,\n다음 경험을 준비합니다', '초등 과정의 학습과 활동, 주요 일정을 안내합니다. 교실에서 이어지는 배움의 흐름을 확인하고 아이의 학교생활을 함께해 주세요.'],
    'event.html': ['함께 배우고 자라는\nDewford의 순간들', '교실 안팎에서 발견하고, 도전하고, 함께 성장하는 아이들의 이야기를 만나보세요.'],
    'contact.html': ['용산 이태원에서,\n아이의 새로운 배움을 만납니다', '교육 과정과 입학에 대한 궁금한 점을 남겨주세요. 방문에 필요한 위치와 연락처를 확인하고 DEWFORD와 첫 만남을 준비해 보세요.']
  };
  const pageImages = {
    'why-dewford.html':[['15','50% 42%'],['19','50% 40%'],['26','50% 40%']],
    'educational-philosophy.html':[['14-philosophy-uniform','62% 40%',1536],['21-philosophy-uniform','50% 38%',1536],['30-philosophy-uniform','50% 40%',1536]],
    'rolling-enrollment.html':[['20-enrollment-uniform-no-logo','50% 38%',1536],['07-enrollment-uniform','50% 40%',1536],['23-enrollment-uniform','62% 35%',1536]],
    'admissions-inquiry.html':[['02','60% 40%'],['05','62% 38%'],['15','50% 42%']],
    'international-preschool.html':[['06','55% 38%'],['17','50% 42%'],['14','62% 40%']],
    'elementary-international.html':[['18','50% 38%'],['22','50% 38%'],['27','35% 38%']],
    'elementary-esl.html':[['12','65% 38%'],['28','42% 38%'],['18','50% 38%']],
    'preschool-calendar.html':[['16','50% 45%'],['06','55% 38%'],['08','50% 40%']],
    'elementary-calendar.html':[['24','50% 40%'],['29','50% 40%'],['31','50% 38%']],
    'event.html':[['08','50% 40%'],['21','50% 38%'],['32','50% 40%']],
    'detail.html':[['30','50% 40%'],['26','50% 40%'],['35','50% 42%']],
    'contact.html':[['01','55% 43%'],['20','50% 38%'],['23','62% 35%']]
  };
  const filename = location.pathname.split('/').pop();
  const page = pages[filename];
  const appendSentences = (element, text) => {
    const sentences = text.match(/[^.]+\.(?:\s*|$)|[^.]+$/g) || [text];
    sentences.forEach((sentence, index) => {
      if (index) element.append(document.createElement('br'));
      element.append(document.createTextNode(sentence.trim()));
    });
  };
  const main = document.querySelector('#main-content');
  if (!page || !main) return;
  const section = document.createElement('section');
  section.id='pxl-page-title-elementor';section.className='dewford-page-title';
  section.setAttribute('aria-labelledby','dewford-page-title-heading');
  const photos = document.createElement('div');photos.className='dewford-page-title-photos';photos.setAttribute('aria-hidden','true');
  pageImages[filename].forEach(([id,focus,width=1800],i) => {
    const slide=document.createElement('div');slide.className='dewford-page-title-slide'+(i===0?' is-active':'');
    const img=document.createElement('img');img.alt='';img.decoding='async';img.sizes='100vw';
    img.srcset=`images/sub/title/sub-${id}-768.jpg 768w, images/sub/title/sub-${id}-${width}.jpg ${width}w`;
    img.src=`images/sub/title/sub-${id}-${width}.jpg`;img.style.objectPosition=focus;
    if(i===0)img.fetchPriority='high';
    slide.append(img);photos.append(slide);
  });
  const copy=document.createElement('div');copy.className='dewford-page-title-copy';
  const title=document.createElement('h1');title.id='dewford-page-title-heading';title.textContent=page[0];
  const description=document.createElement('p');appendSentences(description,page[1]);copy.append(title,description);
  section.append(photos,copy);main.prepend(section);
  const emblem = document.createElement("template");
  emblem.innerHTML = `<div class="elementor-element elementor-element-4c41d6b elementor-widget elementor-widget-pxl_circle_text dewford-subpage-emblem" data-e-type="widget" data-element_type="widget" data-id="4c41d6b">
  <div class="elementor-widget-container">
    <div class="dewford-subpage-emblem-link" role="img" aria-label="DEWFORD">
      <svg class="dewford-subpage-emblem-ring" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs><path id="dewford-subpage-emblem-path" d="M100,30 a70,70 0 1,1 0,140 a70,70 0 1,1 0,-140"/></defs>
        <text><textPath href="#dewford-subpage-emblem-path" textLength="439.8" lengthAdjust="spacing">DEWFORD · LEARN · THINK · EXPRESS · </textPath></text>
      </svg>
      <img class="dewford-subpage-emblem-symbol" src="images/common/symbol_3.png" alt="" width="311" height="311" decoding="async">
    </div>
  </div>
</div>`;
  if (filename !== 'detail.html' && main.dataset.pageIntro !== 'false') section.after(emblem.content.cloneNode(true));
  if (introductions[filename] && main.dataset.pageIntro !== 'false') {
    const [heading, text] = introductions[filename];
    const intro = document.createElement('header');
    intro.className = 'dewford-subpage-intro dewford-events-intro';
    const h2 = document.createElement('h2');
    heading.split('\n').forEach((line, index) => {
      if (index) h2.append(document.createElement('br'));
      h2.append(document.createTextNode(line));
    });
    const paragraph = document.createElement('p');appendSentences(paragraph, text);
    intro.append(h2, paragraph);
    main.querySelector('.dewford-subpage-emblem').after(intro);
  }
  const slides=[...photos.children];const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=0,timer,visible=true;
  const zooms = new Map();
  const startZoom = slide => {
    zooms.get(slide)?.cancel();
    if (reduced.matches) return;
    const animation = slide.querySelector('img').animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }],
      { duration: 6500, easing: 'linear', fill: 'forwards' }
    );
    zooms.set(slide, animation);
  };
  const schedule=()=>{
    clearTimeout(timer);
    const paused = reduced.matches || document.hidden || !visible;
    zooms.forEach(animation => paused ? animation.pause() : animation.play());
    if(paused)return;
    timer=setTimeout(()=>{
      const next=(active+1)%slides.length;const img=slides[next].querySelector('img');
      if(img.complete&&img.naturalWidth){startZoom(slides[next]);slides[next].classList.add('is-active');slides[active].classList.remove('is-active');active=next;}
      schedule();
    },5000);
  };
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();}).observe(section);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change', () => {
    zooms.forEach(animation => animation.cancel());
    zooms.clear();
    startZoom(slides[active]);
    schedule();
  });
  const firstImage = slides[active].querySelector('img');
  const begin = () => { startZoom(slides[active]); schedule(); };
  if (firstImage.complete) begin();
  else firstImage.addEventListener('load', begin, { once: true });
})();
