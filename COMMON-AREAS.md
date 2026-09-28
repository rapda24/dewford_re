# Dewford 공통 영역

메인 `index.html`과 새 서브 페이지 11개가 같은 공통 영역을 사용합니다.

- `js/dewford-common.js`: `header`, `footer`, `floating` HTML 수정
- `js/dewford-ui.js`: 스크롤 헤더 및 전체 메뉴 동작
- `css/dewford-brand.css`: 공통 스타일과 ID / 서브 컬러
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
