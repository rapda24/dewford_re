# Dewford 공통 영역

메인 `index.html`과 새 서브 페이지 11개가 같은 공통 영역을 사용합니다.

- `js/dewford-common.js`: `header`, `footer`, `floating` HTML 수정
- `js/dewford-ui.js`: 스크롤 헤더 및 전체 메뉴 동작
- `css/dewford-brand.css`, `css/dewford-navigation.css`, `css/dewford-shared-ui.css`: 공통 구조와 기본 스타일
- `css/dewford-common-chrome.css`: 메인 기준 header / footer / floating 최종 스타일. 모든 공개 페이지에서 마지막 CSS로 로드하며, 서브페이지 색상·전환 효과가 공통 영역을 덮어쓰지 않도록 관리
- 각 서브 HTML의 `<main id="main-content">`: 향후 본문 작업 위치

공통 파일을 저장하고 페이지를 새로 고침하면 모두 반영됩니다. 별도 빌드나 서버 없이 로컬 HTML 열기 및 정적 호스팅에서 사용할 수 있습니다. JavaScript가 활성화되어 있어야 합니다.

원본 템플릿인 `index-2.html` 및 `page-*.html`은 참고용으로 유지합니다. 인트로와 롤링 배너는 메인 페이지에만 적용합니다. 풋터는 index-2.html 레이아웃에 원본 Dewford의 연락처·주소·로고·배경색(#351044)을 적용했습니다. 인스타그램·페이스북·유튜브 링크는 요청에 따라 #none으로 설정했습니다.

## 빈 서브 페이지

- `why-dewford.html`: Why Dewford
- `educational-philosophy.html`: Vision & Mission
- `rolling-enrollment.html`: Rolling Admissions
- `admissions-inquiry.html`: Apply Now
- `international-preschool.html`: International Early Learning Program
- `elementary-international.html`: International Primary Program
- `elementary-esl.html`: Primary ESL Program
- `preschool-calendar.html`: International Early Learning Calendar
- `elementary-calendar.html`: Primary Calendar
- `event.html`: Events
- `contact.html`: Contact

## 이미지 사용 규칙

- `images/main/`: 메인 페이지 전용. 현재 히어로는 `main_08.jpg`, `main_09.jpg`, `main_10.jpg`를 사용합니다.
- `images/sub/`: 서브 페이지 본문 전용. 현재 빈 본문에는 이미지를 추가하지 않습니다.
- `images/common/`: 로고, 심볼, 카카오톡 등 공통 이미지. 로고는 `logo-text.svg`를 사용하며 어두운 배경에서는 CSS로 흰색 표시합니다.
- 기존 템플릿의 다른 이미지 폴더는 참고용으로 보존합니다.

## 글자 굵기

본문은 400 이상, 설명·메뉴는 500~600을 사용합니다. 타이틀은 500의 보조 문구와 700의 핵심 문구로 강약을 줍니다. 100~300의 얇은 굵기는 새 화면에 사용하지 않습니다.

## 헤더·전체 메뉴

`css/dewford-navigation.css`에서 원본 기준 헤더와 전체 화면 다이얼로그 스타일을 관리합니다. 전체 메뉴 사진은 `images/common/menu-learning.webp`를 사용합니다. `LET’S TALK`는 로컬 `admissions-inquiry.html`로 연결됩니다.

## 공통 이미지 팝업

- `js/dewford-image-viewer.js`, `css/dewford-image-viewer.css`: 원본 크기를 유지하고 화면을 넘을 때만 축소하는 공통 레이어 팝업
- 푸터 `교습비`: `admin-tuition.html`에서 별도 등록한 이미지 사용. 최초 저장 전에는 기존 팝업 이미지를 기본값으로 제공
- `detail.html`: 대표 이미지 및 추가 사진을 클릭한 위치부터 열고, 버튼·키보드 방향키·10dvh 미리보기로 수동 이동
- 재사용: `DewfordImageViewer.open([{src:'이미지 경로',alt:'설명'}], 시작인덱스)`

## 상담폼·교습비 관리

- 공통 상담폼: `js/dewford-common.js`의 `inquiry` 컴포넌트, `css/dewford-consultation.css`
- Home / Contact / Apply Now는 같은 입력 항목과 `POST /api/inquiries`를 사용하며, 접수 후 `admin-inquiries.html`에서 확인합니다.
- 교습비: `admin-tuition.html`에서 업로드 후 저장. `GET/POST /api/admin/tuition`은 관리자 세션과 CSRF로 보호되며, 공개 푸터는 `GET /api/content/tuition`으로 이미지를 조회합니다.
- 기존 `public_content` 및 이미지 저장소를 사용하므로 추가 DB 마이그레이션은 필요하지 않습니다.
