# 관리자 운영 설정

로그인 화면은 `admin-login.html`, 관리 화면은 `admin.html`입니다. 로그인하지 않은 상태로 관리 화면에 접속하면 로그인 페이지로 이동하며, 선택한 게시판과 글 수정 링크는 로그인 후에도 유지됩니다.

관리 화면: `/admin.html`. 같은 도메인의 Cloudflare Worker + D1 환경에서 사용합니다.
`file://`나 정적 호스팅만으로는 로그인 및 저장 기능이 동작하지 않습니다.

## 제공 기능

- 이벤트 게시판, 유치부 캘린더, 초등부 캘린더: 등록, 수정, 삭제, 공개/비공개, 게시판 간 이동, 위/아래 순서 변경.
- 홈페이지에서 서버가 관리자 세션을 확인한 경우에만 글쓰기, 수정, 이동, 순서 변경, 삭제 버튼 표시.
- 팝업: 등록, 수정, 삭제, 순서 변경, 이미지/클릭 링크/폭, 공개 여부, 사용 여부, 한국 시간 기준 시작·종료 기간.
- 팝업은 순서대로 표시되고 ‘오늘 하루 보지 않기’는 팝업별로 저장됩니다.
- 관리 전의 기존 이벤트·캘린더 데이터를 최초 저장 때 함께 유지합니다. 마지막 글이나 팝업을 삭제하면 샘플을 다시 표시하지 않습니다.

## 1. D1 연결 및 마이그레이션

`wrangler.jsonc`의 `database_id`를 실제 D1 ID로 설정합니다. 현재 파일의 0으로 된 ID는 자리표시자입니다.

```sh
npm install
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
```

`0003_admin.sql`이 관리자 세션, 로그인 시도 제한, 관리 콘텐츠 테이블을 추가합니다.
실제 원격 적용은 운영 DB를 확인한 후 진행하세요.

## 2. 관리자 계정

관리자 아이디를 `wrangler.jsonc`의 `vars.ADMIN_USERNAME`으로 지정합니다(기본 `admin`).
비밀번호 원문은 코드나 공개 파일에 저장하지 않습니다.

```sh
node scripts/admin-password.mjs
```

12자 이상의 비밀번호를 입력하면 PBKDF2 해시가 출력됩니다. 다음 명령을 실행하고 **출력된 해시**를 입력합니다.

```sh
npx wrangler secret put ADMIN_PASSWORD_HASH
```

로컬 개발에서는 Git에서 제외된 `.dev.vars`에 아래 형식으로 설정합니다.

```text
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH="pbkdf2$100000$생성된salt$생성된hash"
```

계정 정보는 사용자에게 공개하지 않고, 운영자는 처음 설정한 비밀번호로 로그인합니다.
세션은 HttpOnly 쿠키로 8시간 유지되며 로그아웃 시 서버에서 폐기합니다.

## 3. 이미지 업로드 저장소 (R2)

이미지 주소 직접 입력은 R2 없이도 사용 가능합니다.
파일 업로드를 사용하려면 R2 버킷을 생성하고 `MEDIA` 바인딩을 설정합니다.

```sh
npx wrangler r2 bucket create dewford-media
```

`wrangler.jsonc`에 다음을 추가합니다.

```json
"r2_buckets": [{"binding": "MEDIA", "bucket_name": "dewford-media"}]
```

PNG, JPEG, WebP 파일을 최대 5MB까지 올릴 수 있습니다.
이미지는 `/api/media/고유파일명`에서 제공하며 이미지 파일 업로드가 완료된 뒤 글의 저장 버튼을 눌러 적용합니다.

## 4. 실행 및 검증

```sh
npm test
npm run dev
```

개발 서버의 `/admin.html`에서 로그인합니다. 운영 반영은 설정 완료 후 `npm run deploy`를 실행합니다.
현재 저장소의 서버 코드와 파일을 구현한 것이며, 실제 원격 DB 생성·계정 secret 등록·배포는 자동으로 수행하지 않습니다.

게시글 저장은 전체 관리 콘텐츠의 revision을 검사합니다. 다른 화면에서 수정한 경우 덮어쓰지 않고 최신 목록을 다시 확인하도록 안내합니다.
관리 API는 같은 출처의 요청과 CSRF 토큰을 검사합니다. 공개 API에는 비공개 글 및 사용하지 않거나 기간이 맞지 않는 팝업이 포함되지 않습니다.

비밀번호 해시는 Worker 런타임의 [PBKDF2 반복 횟수 제한](https://github.com/cloudflare/workerd/issues/1346)에 맞춰 생성합니다.
