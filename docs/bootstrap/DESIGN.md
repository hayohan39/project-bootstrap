# 설계 근거

이 템플릿의 구조를 정한 이유들. 이전에 쓰던 툴킷(claude-devflow)에서 실제로 밟은 문제와
검토 결과를 이 리포지토리만으로 이해할 수 있도록 옮겨 둔 것이다.

## 1. 리포지토리 생성은 Actions 가 한다

Claude 클라우드 세션(웹·모바일)의 GitHub 접근은 전용 프록시를 거친다. 설정으로 풀 수 없다.

| 제약 | 내용 |
| --- | --- |
| GraphQL 차단 | `gh repo create`, `gh pr create/list/checks/view`, `gh workflow run` 이 GraphQL 을 써서 403 |
| 리포지토리 스코프 | API 요청은 세션에 붙은 리포지토리에만 닿는다. `POST /user/repos` 도 막힌다 |
| 설정 쓰기 차단 | 리포지토리 설정 변경(템플릿 지정 등), Actions 시크릿/변수 읽기·쓰기 불가 |

그래서:

- **새 리포지토리는 `new-project.yml` 이 만든다.** Actions 러너에는 프록시가 없어
  `BOOTSTRAP_PAT` 이 그대로 동작한다. 세션은 이 리포지토리에 대한 REST 호출
  (`POST /repos/{owner}/{repo}/actions/workflows/new-project.yml/dispatches`)만 하면 되고,
  이것은 붙어 있는 리포지토리라 프록시를 통과한다.
- **세션 안의 GitHub 작업은 REST 로** — `scripts/gh.mjs` (PR 생성·상태, 워크플로 dispatch).
  `gh run list/view`, `gh api` 는 REST 라 된다.
- 템플릿 지정, 시크릿 설정처럼 설정 쓰기가 필요한 일은 사람이 GitHub 웹에서 한다.

`BOOTSTRAP_PAT` 은 **classic** PAT(`repo` + `workflow`)을 쓴다. fine-grained PAT 은 개인 계정에서
리포지토리 생성이 안 되는 경우가 있고, `workflow` 스코프가 없으면 초기화 커밋(템플릿 전용
워크플로 삭제)을 push 할 수 없다.

## 2. DB 는 Neon

처음에는 Supabase 를 썼다가 바꿨다. 프로젝트를 계속 찍어내는 용도에서 차이가 결정적이다.

| | Supabase Free | Neon Free |
| --- | --- | --- |
| 프로젝트 수 | 활성 2개 | 100개 |
| 미사용 시 | 1주 후 일시정지 → **배포된 앱이 멈춤** | 5분 후 scale-to-zero → 다음 요청에 깨어남(콜드 스타트만) |
| 자동화 | 생성 후 준비 완료까지 폴링 | 생성 응답에 바로 연결 정보 |
| 범위 | DB + Auth + Storage + Realtime | **Postgres 만** |

Auth·파일 저장소·Realtime 은 필요할 때 프로젝트별로 붙인다(CLAUDE.md 의 "인프라 결정").
가끔 여는 개인 앱이 열 때마다 죽어 있지 않은 것이 더 중요했다.

리전 기본값은 `aws-ap-southeast-1`(싱가포르). Neon 에는 서울·도쿄 리전이 없다.

**NAS 등 자체 호스팅 DB 는 권하지 않는다.** 마이그레이션(GitHub Actions)과 앱(Vercel 함수)이
모두 공개 인터넷에서 접속해야 하므로 공개 노출·TLS·백업·패치를 직접 떠안게 되고,
집 인터넷이 끊기면 배포와 앱이 같이 멈춘다. (MCP 는 LLM 에 도구를 노출하는 규약이지
DB 호스팅 수단이 아니다.) 무거운 상시 워크로드가 생기면 DB 는 Neon 에 두고 그 워크로드만
따로 두는 편이 낫다.

### 연결 문자열 두 개

| 이름 | 어디 | 누가 씀 | 종류 |
| --- | --- | --- | --- |
| `DATABASE_URL` (GitHub 시크릿) | 프로젝트 리포지토리 | deploy.yml 의 마이그레이션 | direct |
| `DATABASE_URL` (Vercel env, Production) | Vercel 프로젝트 | 앱 런타임 | pooled (`-pooler`) |
| `DATABASE_URL_UNPOOLED` (Vercel env) | Vercel 프로젝트 | 앱 안에서 세션 기능이 필요할 때 | direct |

마이그레이션 러너는 세션 단위 advisory lock 을 쓰므로 PgBouncer(transaction 모드)를 거치면 안 된다.
Vercel 의 preview/development 에는 프로덕션 값을 넣지 않는다 — PR 프리뷰는 Neon 브랜치 값을
배포 단위로 주입한다.

Neon 콘솔의 GitHub/Vercel 연동은 켜지 않는다. 같은 값을 두 곳에서 관리하게 된다.

### Neon API 키

Personal / Organization / Project-scoped 세 종류이고 **project-scoped 로는 프로젝트를 만들 수 없다**
(`project-scoped keys are not allowed to create projects`). 콘솔에서 먼저 눈에 띄는 것이
project-scoped 라 흔히 밟는다. `provision.mjs` 가 이 경우를 구분해 알려 준다.

## 3. 배포 순서는 워크플로가 쥔다

- Vercel 프로젝트를 **Git 에 연결하지 않는다.** 연결하면 merge 순간 Vercel 이 바로 배포해
  마이그레이션보다 앞설 수 있고, deploy.yml 과 합쳐 같은 커밋이 두 번 배포된다.
  `vercel.json` 의 `git.deploymentEnabled: false` 는 누가 나중에 연결해도 막는 안전장치.
- deploy.yml: main 의 CI(test) 실패 → 배포 안 함. 마이그레이션 실패 → 배포 안 함. 마이그레이션이 "건너뜀"(DB 미설정)이면 배포는 한다.
- **필요한 값이 없으면 실패가 아니라 건너뜀.** 프로비저닝 전에 merge 했다는 이유로 main 이
  빨간불이 되면 안 된다. 무엇이 없는지는 실행 요약에 남긴다.
- 새 Vercel 프로젝트는 `framework` 를 명시해서 만든다. 비워 두면 첫 배포에서
  `The projectSettings object is required for new projects` 로 실패한다. CLI 에는 `--yes`.
- 빌드는 Vercel 원격 빌드. Actions 사용 시간(비공개 리포 월 2,000분)을 아낀다.
- 헬스체크는 개별 배포 URL 이 아니라 프로덕션 도메인으로 한다. 개별 URL 은 Vercel 배포
  보호로 401 이 날 수 있다.

## 4. auto-fix

- `GITHUB_TOKEN` 으로 push 한 커밋은 워크플로를 트리거하지 않는다. auto-fix 의 push 가 CI 를
  다시 돌리려면 Claude GitHub App 토큰(App 설치 시 action 이 자동 사용) 또는 `BOT_PAT` 이 필요하다.
- 그래서 App 토큰으로 push 한 커밋의 CI 는 `claude[bot]` 이 시작한 실행이 된다. claude-code-action 은 bot 이 시작한 실행을
  기본으로 거부하므로(`Workflow initiated by non-human actor`) auto-fix 에 `allowed_bots: claude` 를 둔다.
  `@claude` 는 사람의 코멘트로만 시작하므로 두지 않는다.
- `actions/checkout` v6+ 는 토큰을 includeIf 파일에 둬서 action 이 지우지 못한다(그러면 push 가 GITHUB_TOKEN 으로 나간다).
  Claude job 들은 체크아웃 직후 "Hand checkout credentials" 스텝이 토큰을 로컬 설정으로 옮긴다(v5 에서는 그대로).
- 무한 루프 방지: PR 브랜치의 `[claude-autofix]` 커밋 수로 시도 횟수를 센다(기본 3).
- 프롬프트로 금지: 테스트 삭제/skip, lint 비활성화, main 의 마이그레이션 수정, 확신 없는 push.
- preview 실패(프로덕션 복제본에서의 마이그레이션 실패)도 auto-fix 대상이다. 이 경우는
  데이터를 보존하는 방향(기본값·백필)으로 고치게 한다.

## 4-1. 품질 점검은 push 전 세션에서

CI 에는 품질 리뷰가 없다(2026-10 에 `refine` job 을 없앴다). 리뷰 job(3~5분)에 더해 정리 커밋이 CI 를 한 번 더 돌려
PR 마다 Actions 시간이 거의 두 배가 됐고, 같은 기준(`.github/review/quality.md`)을 작성자 세션이 push 전에 이미 쓰고 있었다.
그래서 CLAUDE.md 4단계에서 세션이 이 기준으로 diff 를 다듬고 결과를 PR 본문 "어떻게 확인했나" 에 한 줄로 남긴다.
버그·보안·마이그레이션은 CI 뒤의 `claude-review.yml` 이 따로 본다.

## 4-2. Claude 리뷰는 CI 뒤에 PR 당 1회

`claude-review.yml` 은 CI 가 끝나면(`workflow_run`) CI 가 통과했을 때만 돈다. production-bootstrap 의 PR 리뷰와 같은 모양이다.

- CI 가 실패한 코드는 auto-fix 로 바뀔 것이라 리뷰하지 않는다(Actions 시간 절약). auto-fix·`@claude` 커밋도 CI 를 다시 거쳐 리뷰를 받는다.
- `workflow_run` 은 main 의 이 파일로 돈다. PR 의 코드는 `./pr` 작업 트리로 읽기만 하므로 PR 이 리뷰 방식을 바꿀 수 없다
  (그래서 "이 PR 은 claude-review.yml 을 바꿔서 건너뜀" 같은 예외도 없다).
- PR 당 1회: "✅ merge 해도 됨" 이면 `ai-reviewed` 라벨을 붙이고 그 뒤 push 는 job 이 바로 끝난다. "✋ 수정 필요" 면 라벨을 붙이지 않아
  고친 다음 push 에서 다시 본다. 다시 보려면 라벨을 떼고 push, 매 push 리뷰는 변수 `CLAUDE_REVIEW_EVERY_PUSH=true`.
- 통과 뒤의 커밋은 리뷰하지 않는다 — 비용과 맞바꾼 절충이다. 큰 변경을 더했으면 라벨을 떼고 push 한다.

## 5. CI 는 ubuntu 만

주 개발 환경이 Claude 클라우드(Linux)이고, 비공개 리포에서 Windows 러너는 사용 시간이 2배로
계산된다. 로컬 Windows 에서도 돌아가도록 `.gitattributes`(LF 고정), npm scripts 의 POSIX 문법
금지, `path.join` 규칙은 유지한다.

### Actions 사용 시간 가드레일

새 프로젝트는 기본이 private 이라 계정의 월 Actions 한도를 함께 쓴다. 필요할 때만 돌게:

- **모든 job 에 `timeout-minutes`.** 기본값 360분이면 멈춘 job 하나가 한도를 크게 깎는다. Claude 단계는 step 에도
  더 짧은 상한을 둬서, 멈춰도 뒤의 리포트·검사 step 은 돈다.
- **문서만 바뀐 PR·merge**(`scripts/ci-changes.mjs` — 세 템플릿 공통): `test` job 은 돌되 설치·빌드·테스트를 건너뛰고,
  preview 도 건너뛴다. deploy 는 **마지막 성공 배포** 이후가 문서뿐일 때 배포하지 않는다(앞선 배포가 실패했으면 그 코드까지 배포).
  `paths-ignore` 를 쓰지 않는 이유: 체크(`test`)가 아예 안 생겨 보호 규칙을 건 리포에서 merge 가 막힌다.
  판정이 불확실하면 전체를 돈다. 템플릿 리포지토리는 템플릿 테스트가 문서도 보므로 항상 전체를 돈다.
- **draft PR 은 프리뷰를 건너뛴다.** ready for review 로 바꾸면 CI 가 다시 돈다.
- **품질 리뷰는 CI 에서 하지 않는다**(4-1). auto-fix 는 PR 당 3회(`AUTOFIX_MAX_ATTEMPTS`).
- Next.js 빌드 캐시(`.next/cache`)를 `actions/cache` 로 남긴다. main push 의 CI 가 PR 들의 출발점 캐시를 만든다.
- **main push 의 test 는 일부러 쓰는 시간이다.** 브랜치 보호가 "최신 main 포함"(strict)을 요구하지 않아 merge 결과물은
  PR 에서 검사되지 않았다. 앞선 merge 의 CI 가 취소됐을 수 있어 문서만 바뀐 merge 도 전체를 돈다. deploy.yml 은 그 test 가 통과한 뒤 `workflow_run` 으로 시작한다. `workflow_run` 실행의 `head_sha` 는
  그 순간의 main 이라 배포한 커밋과 다를 수 있어, `run-name` 에 배포 커밋을 넣고 "마지막 성공 배포" 는 그 이름에서 읽는다.

## 6. 비공개 무료 리포의 한계

무료 요금제의 비공개 리포에는 브랜치 보호를 걸 수 없다. "merge 는 사람이 한다" 는
프로세스상 게이트(CLAUDE.md 규칙)일 뿐 기술적으로 강제되지는 않는다.
공개 리포나 유료 요금제라면 `test` 체크 필수 + 리뷰 1명 필수로 보호를 거는 것을 권장한다.
