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
- deploy.yml: 마이그레이션 실패 → 배포 안 함. 마이그레이션이 "건너뜀"(DB 미설정)이면 배포는 한다.
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
- 무한 루프 방지: PR 브랜치의 `[claude-autofix]` 커밋 수로 시도 횟수를 센다(기본 3).
- 프롬프트로 금지: 테스트 삭제/skip, lint 비활성화, main 의 마이그레이션 수정, 확신 없는 push.
- preview 실패(프로덕션 복제본에서의 마이그레이션 실패)도 auto-fix 대상이다. 이 경우는
  데이터를 보존하는 방향(기본값·백필)으로 고치게 한다.

## 4-1. 품질 리뷰 (refine)

CI 가 통과하면 Claude 가 `.github/review/quality.md` 기준(덧붙임·재사용·단순화·일관성·빈틈)으로 PR 을 한 번 더 본다.
버그를 찾는 `claude-review.yml` 과 목적이 다르다 — "동작하는 코드를 얼마나 깔끔하게 짰나".

- **동작이 바뀌지 않는 국소적 정리만** 자동 반영한다(`npm run check` 통과 필수, 실패하면 되돌리고 제안으로).
  여러 파일·공개 인터페이스·테스트 추가는 제안 코멘트로만 남기고 사람이 `@claude` 로 지시한다.
- 반복 방지: HEAD 가 이미 `[claude-refine]` 커밋이면 건너뛴다(`REFINE_MAX_ROUNDS`, 기본 1).
  작성자가 push 할 때마다 한 번. 같은 모델이 취향을 서로 고치며 도는 것을 막는다.
- 지적에는 "왜 더 나은지" 한 문장을 요구해 취향 지적을 줄인다.
- `migrations/`, `.github/` 는 네 겹으로 막는다: 프롬프트, 편집 도구(Edit·Write) 차단, pre-push 훅,
  사후 검사(`[claude-refine]` 커밋이 건드렸으면 🧹 코멘트에 경고. 그 push 가 실행을 취소하므로
  job 은 '실패' 가 아니라 '취소됨' 으로 보일 수 있다 — 신호는 코멘트 경고다).
  pre-push 훅은 커밋 제목의 `[claude-refine]` 도 강제한다(빠지면 반복 방지가 안 된다).
  완전한 차단은 아니다: `npm run check` 가 PR 코드를 실행하는 이상 의도적 우회는 가능하다.
  마지막 방어선은 그 커밋도 다시 거치는 CI · 리뷰와 사람의 merge 다.
- push 는 마지막에 한 번. `ci.yml` 의 concurrency 가 push 직후 이 실행을 취소하므로 리포트를 먼저 쓰고,
  리포트 게시는 `always()` 라 취소돼도 올라간다.
- `ci.yml` 을 바꾸는 PR 에서는 건너뛴다 — claude-code-action 은 App 토큰을 받을 때 실행 중인 워크플로가
  기본 브랜치와 같은지 검사한다(`BOT_PAT` 을 쓰면 검사가 없어 그대로 돈다).
- 세션에서 PR 을 올리기 전 같은 기준으로 스스로 다듬게 한다(CLAUDE.md). CI 쪽은 안전망.

## 5. CI 는 ubuntu 만

주 개발 환경이 Claude 클라우드(Linux)이고, 비공개 리포에서 Windows 러너는 사용 시간이 2배로
계산된다. 로컬 Windows 에서도 돌아가도록 `.gitattributes`(LF 고정), npm scripts 의 POSIX 문법
금지, `path.join` 규칙은 유지한다.

## 6. 비공개 무료 리포의 한계

무료 요금제의 비공개 리포에는 브랜치 보호를 걸 수 없다. "merge 는 사람이 한다" 는
프로세스상 게이트(CLAUDE.md 규칙)일 뿐 기술적으로 강제되지는 않는다.
공개 리포나 유료 요금제라면 `test` 체크 필수 + 리뷰 1명 필수로 보호를 거는 것을 권장한다.
