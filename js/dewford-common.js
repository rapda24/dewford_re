/* Shared markup for index.html and the new Dewford subpages.
 * Edit header, footer or floating here; every page uses the same source.
 * Loaded before dewford-ui.js and the template scripts. No fetch/build required.
 */
(() => {
  'use strict';
  const components = {
    header: `<header class="dewford-header">
<a class="dewford-brand dewford-logo" href="index.html" aria-label="DEWFORD INTERNATIONAL COLLEGE 홈"><img class="dewford-logo-symbol" src="images/common/symbol_2.png" width="311" height="311" alt=""><img class="dewford-logo-text" src="images/common/logo-text.svg" width="224" height="51" alt=""></a>
<nav class="dewford-desktop-nav" aria-label="주 메뉴"><ul id="dewford-menu" class="dewford-navigation">
                            <li class="menu-item menu-item-has-children"><a lang="en" href="why-dewford.html"><span
                                  class="pxl-menu-item-text">ABOUT DEWFORD</span></a>
                              <ul class="sub-menu">
                                <li class="menu-item"><a href="why-dewford.html"><span>Why Dewford</span></a></li>
                                <li class="menu-item"><a href="educational-philosophy.html"><span>Vision &amp;
                                      Mission</span></a></li>
                              </ul>
                            </li>
                            <li class="menu-item menu-item-has-children"><a lang="en"
                                href="rolling-enrollment.html"><span class="pxl-menu-item-text">ADMISSIONS</span></a>
                              <ul class="sub-menu">
                                <li class="menu-item"><a href="rolling-enrollment.html"><span>Rolling
                                      Admissions</span></a></li>
                                <li class="menu-item"><a href="admissions-inquiry.html"><span>Apply Now</span></a></li>
                              </ul>
                            </li>
                            <li class="menu-item menu-item-has-children"><a lang="en"
                                href="international-preschool.html"><span class="pxl-menu-item-text">PROGRAMS</span></a>
                              <ul class="sub-menu">
                                <li class="menu-item"><a href="international-preschool.html"><span>International Early
                                      Learning Program</span></a></li>
                                <li class="menu-item"><a href="elementary-international.html"><span>International
                                      Primary Program</span></a></li>
                                <li class="menu-item"><a href="elementary-esl.html"><span>Primary ESL Program</span></a>
                                </li>
                              </ul>
                            </li>
                            <li class="menu-item menu-item-has-children"><a lang="en"
                                href="preschool-calendar.html"><span class="pxl-menu-item-text">CALENDAR</span></a>
                              <ul class="sub-menu">
                                <li class="menu-item"><a href="preschool-calendar.html"><span>International Early
                                      Learning Calendar</span></a></li>
                                <li class="menu-item"><a href="elementary-calendar.html"><span>Primary
                                      Calendar</span></a></li>
                                <li class="menu-item"><a href="event.html"><span>Events</span></a></li>
                              </ul>
                            </li>
                            <li class="menu-item"><a lang="en" href="contact.html"><span
                                  class="pxl-menu-item-text">CONTACT</span></a></li>
                          </ul></nav>
<div class="dewford-header-actions"><a class="dewford-email" href="mailto:ADMIN@DEWFORD.COM">ADMIN@DEWFORD.COM</a><button class="dewford-menu-toggle" type="button" aria-label="전체 메뉴 열기" aria-expanded="false" aria-controls="dewford-drawer"><span class="dewford-menu-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></button><a class="dewford-header-talk" href="admissions-inquiry.html"><span aria-hidden="true">+</span>LET’S TALK</a></div>
</header>
<dialog id="dewford-drawer" class="dewford-drawer" aria-label="전체 메뉴">
<button class="dewford-menu-close" type="button" aria-label="전체 메뉴 닫기" autofocus><span>Close</span><span class="dewford-menu-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></button>
<div class="dewford-dialog-layout">
  <div class="dewford-dialog-story"><h2>영어로 생각하고 표현하는 아이로.<br>Dewford에서 배움의 가능성을 넓혀갑니다.</h2><img class="dewford-dialog-photo" src="images/common/menu-learning.webp" width="1920" height="1183" alt="함께 책을 읽는 아버지와 아이"></div>
  <div class="dewford-dialog-navigation">
    <div class="dewford-dialog-crest" aria-hidden="true"><svg viewBox="0 0 160 160"><defs><path id="dewford-crest-circle" d="M80,80 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0"/></defs><text><textPath href="#dewford-crest-circle" textLength="410">DEWFORD · LEARN · THINK · EXPRESS · </textPath></text></svg><img src="images/common/symbol_4.png" width="311" height="311" alt=""></div>
    <nav aria-label="전체 메뉴"><ul class="dewford-dialog-links"><li><div class="dewford-dialog-row"><a href="why-dewford.html">ABOUT DEWFORD</a><button class="dewford-submenu-toggle" type="button" aria-expanded="false" aria-controls="dewford-dialog-sub-0" aria-label="ABOUT DEWFORD 하위 메뉴"><span aria-hidden="true">+</span></button></div><ul id="dewford-dialog-sub-0" class="dewford-dialog-submenu" hidden><li><a href="why-dewford.html">Why Dewford</a></li><li><a href="educational-philosophy.html">Vision &amp; Mission</a></li></ul></li><li><div class="dewford-dialog-row"><a href="rolling-enrollment.html">ADMISSIONS</a><button class="dewford-submenu-toggle" type="button" aria-expanded="false" aria-controls="dewford-dialog-sub-1" aria-label="ADMISSIONS 하위 메뉴"><span aria-hidden="true">+</span></button></div><ul id="dewford-dialog-sub-1" class="dewford-dialog-submenu" hidden><li><a href="rolling-enrollment.html">Rolling Admissions</a></li><li><a href="admissions-inquiry.html">Apply Now</a></li></ul></li><li><div class="dewford-dialog-row"><a href="international-preschool.html">PROGRAMS</a><button class="dewford-submenu-toggle" type="button" aria-expanded="false" aria-controls="dewford-dialog-sub-2" aria-label="PROGRAMS 하위 메뉴"><span aria-hidden="true">+</span></button></div><ul id="dewford-dialog-sub-2" class="dewford-dialog-submenu" hidden><li><a href="international-preschool.html">International Early Learning Program</a></li><li><a href="elementary-international.html">International Primary Program</a></li><li><a href="elementary-esl.html">Primary ESL Program</a></li></ul></li><li><div class="dewford-dialog-row"><a href="preschool-calendar.html">CALENDAR</a><button class="dewford-submenu-toggle" type="button" aria-expanded="false" aria-controls="dewford-dialog-sub-3" aria-label="CALENDAR 하위 메뉴"><span aria-hidden="true">+</span></button></div><ul id="dewford-dialog-sub-3" class="dewford-dialog-submenu" hidden><li><a href="preschool-calendar.html">International Early Learning Calendar</a></li><li><a href="elementary-calendar.html">Primary Calendar</a></li><li><a href="event.html">Events</a></li></ul></li><li><div class="dewford-dialog-row"><a href="contact.html">CONTACT</a></div></li></ul></nav>
  </div>
</div>
</dialog>`,
    footer: `<footer class="main-footer footer-style-home-two dewford-footer">
 <div class="widgets-section"><div class="auto-container"><div class="row">
  <div class="upper-box col-lg-12"><div class="footer-logo"><a class="dewford-logo" href="index.html" aria-label="DEWFORD INTERNATIONAL COLLEGE 홈"><img class="dewford-logo-symbol" src="images/common/symbol_2.png" width="311" height="311" alt=""><img class="dewford-logo-text" src="images/common/logo-text.svg" width="224" height="51" alt=""></a></div><div class="text">영어를 통해 세상을 이해하고, 스스로 질문하며 자신의 생각과 논리를 표현하는 아이로 성장합니다.</div><div class="dewford-footer-socials" role="group" aria-label="Dewford 소셜 채널"><a class="dewford-footer-social dewford-social-kakao"
                              href="contact.html#kakao-channel" aria-label="카카오톡 채널 안내" title="카카오톡"><svg
                                aria-hidden="true" width="28" height="28" viewBox="0 0 32 32">
                                <path fill="currentColor"
                                  d="M16 5C8.8 5 3 9.4 3 14.8c0 3.5 2.4 6.5 6 8.2l-1.5 5.2 6-3.7c.8.1 1.7.2 2.5.2 7.2 0 13-4.4 13-9.9S23.2 5 16 5Z" />
                                <text x="16" y="18" text-anchor="middle" fill="#fee500" font-family="Arial,sans-serif"
                                  font-size="7.5" font-weight="700">TALK</text>
                              </svg></a><a class="dewford-footer-social dewford-social-instagram" href="#none"
                              aria-label="인스타그램" title="인스타그램"><svg aria-hidden="true" width="22" height="22"
                                viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor"
                                  stroke-width="1.8" />
                                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8" />
                                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                              </svg></a><a class="dewford-footer-social dewford-social-facebook" href="#none"
                              aria-label="페이스북" title="페이스북"><svg aria-hidden="true" width="22" height="22"
                                viewBox="0 0 24 24">
                                <path fill="currentColor"
                                  d="M14 22v-9h3l.5-4H14V7c0-1.1.3-2 2-2h2V1.4A25 25 0 0 0 15 1c-3 0-5 1.8-5 5v3H7v4h3v9Z" />
                              </svg></a><a class="dewford-footer-social dewford-social-youtube" href="#none"
                              aria-label="유튜브" title="유튜브"><svg aria-hidden="true" width="22" height="22"
                                viewBox="0 0 24 24">
                                <path fill="currentColor"
                                  d="M21.6 6.3a2.7 2.7 0 0 0-1.9-1.9C18 4 12 4 12 4s-6 0-7.7.4a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 5.7 2.7 2.7 0 0 0 1.9 1.9C6 20 12 20 12 20s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-5.7Z" />
                                <path class="dewford-youtube-play" fill="#f00" d="m10 8 6 4-6 4Z" />
                              </svg></a></div></div>
  <div class="footer-column col-xl-5"><div class="about-widget">
   <h2 class="footer-title">영어로 생각하고<br><strong>표현하는 아이로</strong></h2>
   <div class="footer-text">아이에게 맞는 배움의 시작,<br>Dewford와 함께 상담해 보세요.</div>
   <a class="theme-btn btn-style-two" href="admissions-inquiry.html"><span class="btn-title">입학·교육 상담 신청</span><i class="icon fa-light fa-arrow-right" aria-hidden="true"></i></a>
  </div></div>
  <nav class="footer-column col-xl-2 offset-xl-1 col-md-4" aria-label="ABOUT DEWFORD"><div class="footer-widget"><h4 class="widget-title">ABOUT DEWFORD</h4><ul class="user-links"><li><a href="why-dewford.html">Why Dewford</a></li><li><a href="educational-philosophy.html">Vision &amp; Mission</a></li><li><a href="rolling-enrollment.html">Admissions</a></li></ul></div></nav><nav class="footer-column col-xl-2 col-md-4" aria-label="PROGRAMS"><div class="footer-widget"><h4 class="widget-title">PROGRAMS</h4><ul class="user-links"><li><a href="international-preschool.html">International Early Learning</a></li><li><a href="elementary-international.html">International Primary</a></li><li><a href="elementary-esl.html">Primary ESL</a></li></ul></div></nav><nav class="footer-column col-xl-2 col-md-4" aria-label="QUICK LINKS"><div class="footer-widget"><h4 class="widget-title">QUICK LINKS</h4><ul class="user-links"><li><a href="preschool-calendar.html">Calendar</a></li><li><a href="admissions-inquiry.html">Apply Now</a></li><li><a href="contact.html">Contact</a></li></ul></div></nav>
  <div class="footer-column col-xl-6 offset-xl-6 dewford-footer-contact-row"><div class="row clearfix">
   <div class="info-box col-md-5"><div class="info"><div class="text">PHONE</div><h4 class="title"><a href="tel:0264011012">02-6401-1012</a></h4><div class="text dewford-footer-email-label">EMAIL</div><a class="dewford-footer-email" href="mailto:ADMIN@DEWFORD.COM">ADMIN@DEWFORD.COM</a></div></div>
   <div class="info-box col-md-7"><div class="info"><div class="text">ADDRESS</div><h4 class="title two"><a href="contact.html">(04392) 서울시 용산구 장문로27,<br>청화아파트 상가 1층 #101호</a></h4></div></div>
  </div></div>
 </div><div class="footer-bottom"><div class="copyright">© 2026 DEWFORD INTERNATIONAL COLLEGE. All rights reserved.</div></div></div></div>
</footer>`,
    floating: `  <nav class="dewford-floating-links" aria-label="빠른 안내">
    <ul>
      <li><a href="admissions-inquiry.html"><span>Admissions Inquiry</span><svg aria-hidden="true" width="20"
            height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" />
          </svg></a></li>
      <li><a href="international-preschool.html"><span>Programs</span><svg aria-hidden="true" width="20" height="20"
            viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" />
          </svg></a></li>
      <li><a href="preschool-calendar.html"><span>Calendar</span><svg aria-hidden="true" width="20" height="20"
            viewBox="0 0 24 24" fill="none">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" />
          </svg></a></li>
      <li><a href="contact.html"><span>Visit Us</span><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"
            fill="none">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" />
          </svg></a></li>
    </ul>
  </nav>
  <a class="dewford-kakao-floating" href="contact.html#kakao-channel" aria-label="카카오채널 안내" title="카카오채널 안내"><img src="images/common/kakao-talk.svg" width="28" height="28" alt=""></a>
  <button class="dewford-scroll-top pxl-scroll-top" type="button" aria-label="맨 위로" title="맨 위로" hidden>
    <svg class="dewford-scroll-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <svg class="pxl-scroll-progress-circle" viewBox="-1 -1 102 102" aria-hidden="true"><path pathLength="100" d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"/></svg>
  </button>`,
  };
  document.querySelectorAll('[data-dewford-component]').forEach(placeholder => {
    const markup = components[placeholder.dataset.dewfordComponent];
    if (!markup) return;
    const template = document.createElement('template');
    template.innerHTML = markup;
    placeholder.replaceWith(template.content.cloneNode(true));
  });
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.dewford-navigation a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });
})();
