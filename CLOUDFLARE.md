# Cloudflare 연결 준비

GitHub `rapda24/dewford_re`에서 소스를 관리하고 Cloudflare Workers에서 정적 사이트와 JSON API를 함께 제공하며, D1에 데이터를 저장하는 구조입니다. 아직 Cloudflare 리소스를 생성하거나 배포하지 않았습니다.

## 파일 구성

- `wrangler.jsonc`: Worker, 정적 파일, D1 연결 설정
- `server/worker.js`: 공개 JSON API
- `migrations/0001_public_content.sql`: 공개 콘텐츠 테이블
- `js/dewford-config.js`: 프런트엔드 API 주소
- `js/dewford-api.js`: JSON 요청과 오류/시간 초과 처리
- `scripts/build.mjs`: 공개 파일만 `dist/`로 복사

공통 헤더·풋터·플로팅은 계속 `js/dewford-common.js`에서 관리합니다. JSON은 API 데이터 형식이며, 기존 화면 HTML을 DB로 옮기지는 않았습니다. 이벤트 게시판 외의 서브 페이지 본문은 비어 있습니다. 메인과 이벤트 페이지에서는 게시물 API를 요청합니다.

## 최초 연결

Node.js 22 이상 환경에서 다음 순서로 실행합니다.

```sh
npm install
npx wrangler login
npx wrangler d1 create dewford-db
```

생성된 `database_id`를 `wrangler.jsonc`의 0으로 채워진 임시 ID 대신 입력합니다. 이미 D1이 있다면 해당 DB의 이름과 ID를 사용합니다.

```sh
npm run db:local
npm run dev
```

로컬 `/api/health`에서 `data.status: "ok"`를 확인합니다. 원격 DB 초기화와 실제 배포는 다음 명령으로 진행합니다.

```sh
npm run db:remote
npm run deploy
```

`db:remote`는 원격 DB를 변경하므로 배포 대상 DB를 확인한 후 실행합니다. 인증 토큰은 Cloudflare 로그인이나 CI 비밀 변수로만 관리하고 프런트 JS에 넣지 않습니다.

## GitHub 자동 배포

Cloudflare Workers의 Git 연결에서 `rapda24/dewford_re`를 선택합니다.

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Worker name: `dewford-re`
- Root directory: 저장소 루트

최초 연결 전에 실제 D1 ID를 설정하고 원격 마이그레이션을 적용합니다. 이 저장소에서 GitHub push나 Cloudflare 계정 연결은 아직 수행하지 않았습니다.

## JSON 데이터 사용

공개 콘텐츠 조회 API와 비공개 상담 접수 저장 API를 제공합니다.

- `GET /api/health`: DB 연결과 테이블 준비 여부
- `GET /api/content/why-dewford`: 해당 slug의 공개 JSON
- 없는 콘텐츠/비공개 콘텐츠: HTTP 404
- DB 미설정/장애: HTTP 503

`public_content`에는 `slug`, JSON 문자열 `payload`, `published`(1이면 공개), `updated_at`을 저장합니다. 공개 콘텐츠 전용이며 문의·개인정보 저장 용도가 아닙니다. 콘텐츠 편집 화면은 추후 기능 작업 시 추가합니다. 상담 요청은 별도 inquiries 테이블에 저장합니다.

본문 개발 시 사용 예:

```js
const { data } = await DewfordAPI.content('why-dewford');
document.querySelector('[data-page-title]').textContent = data.title;
```

`updated_at`은 콘텐츠를 변경할 때 함께 갱신합니다. 현재 DB에 임의 콘텐츠는 넣지 않았습니다.

## GitHub Pages와 API를 따로 운영할 때

`js/dewford-config.js`의 `apiBaseUrl`을 실제 Worker 주소(`https://YOUR-WORKER.workers.dev/api`)로 바꿉니다. Worker의 `ALLOWED_ORIGINS`는 허용하는 프런트 origin을 쉼표로 구분합니다. 현재 `https://rapda24.github.io`가 설정되어 있으며 커스텀 도메인을 사용하면 해당 origin을 추가합니다.

Cloudflare에서 사이트와 API를 함께 운영할 때는 기본 `/api`를 그대로 사용합니다. 로컬 HTML 직접 열기는 디자인 확인용이며 DB 요청은 `npm run dev` 또는 실제 API 주소가 필요합니다.

## 검증

```sh
npm test
npm run build
npx wrangler deploy --dry-run
```

공식 문서: https://developers.cloudflare.com/workers/static-assets/binding/ 및 https://developers.cloudflare.com/d1/get-started/

## 이벤트 게시판과 상담 신청

메인 이벤트 영역과 `event.html`은 `/api/content/events`의 동일한 공개 콘텐츠를 사용합니다. 메인에는 날짜순 최신 3개, 게시판에는 전체를 표시합니다. 상세 URL은 `event.html?id=게시물ID`입니다. 관리자 작성 화면은 아직 없으며 D1 `public_content`에서 slug를 `events`, published를 `1`로 설정합니다. payload 형식은 다음과 같습니다(실제 게시물만 입력).

```json
{"posts":[{"id":"unique-post-id","title":"게시물 제목","date":"2026-09-28","excerpt":"요약","body":"본문","image":"https://공개-이미지-주소"}]}
```

게시물 이미지는 메인과 서브가 같은 데이터를 사용하므로 공용 이미지는 `images/common/` 또는 공개 외부 URL에 둡니다. 본문은 안전한 일반 텍스트로 표시합니다.

상담폼은 `POST /api/inquiries`에 JSON을 보내 `inquiries` 테이블에 저장합니다. `0002_inquiries.sql` 마이그레이션을 로컬/원격에 각각 적용해야 합니다. 필수 입력·동의 여부·길이·형식·숨김 봇 필드를 서버에서도 검사합니다. 문의 조회 API는 공개하지 않습니다. 접수 후 자동 이메일 발송은 구현하지 않았습니다.

`npm run dev`로 사이트와 API를 함께 실행해야 합니다. Live Server(5500)만으로는 DB 접수가 되지 않으며 실패 안내가 표시됩니다. 실제 Cloudflare D1 설정 및 배포는 여전히 별도로 필요합니다.

배포 시 Cloudflare 파일당 25 MiB 제한을 넘고 현재 페이지에서 참조하지 않는 이미지 원본은 dist에서 제외합니다. 원본 폴더는 그대로 보존하며, 이 이미지를 추후 사용할 때는 웹용 크기로 최적화해야 합니다.
