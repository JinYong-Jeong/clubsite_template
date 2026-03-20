# YourClub Website - Changelog

## 2026-03-19

### [0.8.0]

- AdminSettings → 사이트 전역 반영 (Footer, Contact, Members 관심분야)
- 관심분야 태그 추가/삭제 UI
- Supabase bcrypt 비밀번호 해싱 (check_user_password RPC)
- Activity slug 라우팅 (/activities/숫자)
- Activity instagram_url, detail_content 필드
- 모집중 Navbar 배지 → 구글폼 연결
- 페이지네이션 footer 바로 위 위치
- ScrollToTop (메뉴 클릭 시 최상단 이동)
- Members 필터 sticky 제거
- Notion ContactPage 표시
- 관리자 페이지 전체 검색 기능
- Admin Members 테이블형 UI

---

## 2026-03-18 [0.7.0]

### CHANGELOG-260318

**날짜**: 2026-03-18  
**커밋**: feat: 260318 - 활동 페이지 개선, 운영진 페이지 추가, 커뮤니티 강화, 역할 기반 어드민

---

#### 변경 사항 요약

##### PART 1 — 활동 페이지 개선

###### 1A. Activity 타입 확장 (`src/lib/supabase.ts`)
- `Activity` 타입이 4가지 유형 지원: `study | project | competition | seminar`
- 새 선택 필드 추가: `detail_url`, `start_date`, `end_date`, `participants`, `result`, `image_url`
- `OpsTeamMember`, `ExOpsMember` 타입 추가

###### 1B. ActivitiesPage (`src/pages/ActivitiesPage.tsx`) — 전면 재작성
- 상단 **필터 바**: 전체 / 스터디 / 프로젝트 / 대회 / 세미나
- **4가지 카드 타입** (아이콘 및 색상 구분):
  - study → BookOpen, 파랑
  - project → Code2, 보라
  - competition → Trophy, 앰버/주황
  - seminar → Users, 초록
- **대회 카드 전용**: 일정 범위, 팀 인원(participants), 수상 배지(트로피 아이콘), "대회 보기" 앰버 버튼 (`detail_url` 사용)
- **수상 배지** (트로피 + 텍스트): `result` 값이 있으면 모든 카드 타입에 표시
- **Admin 인라인 편집**: `isAdmin`일 때 hover 시 연필·휴지통 아이콘 표시, CRUD 모달 오픈
- 폴백 더미 데이터에 `[TEST]` 접두사 추가
- 학기별 그룹핑 유지, 최신순 정렬
- 하단에 `/history` 링크

###### 1C. HistoryPage (`src/pages/HistoryPage.tsx`) — 신규 페이지
- 라우트: `/history`
- 활동 타입별 색상 점이 있는 수직 타임라인 레이아웃
- 학기 섹션 헤더 + 항목 수 표시
- 표시 항목: 타입 배지, 상태, 제목, 설명, 수상 배지, 태그, 일정 범위
- 타입 필터 (전체 / 스터디 / 프로젝트 / 대회 / 세미나)
- Supabase 조회 + 하드코딩 폴백

###### 1D. AdminActivities (`src/pages/admin/AdminActivities.tsx`)
- 타입 드롭다운에 `competition`, `seminar` 추가
- 새 입력 필드: `start_date`, `end_date`, `participants`, `result`, `detail_url`, `image_url`
- 헤더 영역에 "히스토리 보기" 링크 버튼 추가

###### 1E. 역할 기반 어드민 (`src/context/AuthContext.tsx`)
- `isAdmin` 조건: `user?.role === 'admin' || user?.role === 'ops'`
- `AuthUser.role` 타입에 `'ops'` 추가

---

##### PART 2 — About 페이지: 운영진 + 전 운영진

###### 2A. AboutOpsPage (`src/pages/AboutOpsPage.tsx`) — 신규 페이지
- 라우트: `/about/ops`
- 조직도 레이아웃: 회장 → 부회장 → 팀장 → 팀원 (연결선 포함)
- 각 카드: 이름 이니셜 아바타, 직책 배지(레벨별 색상), 담당 업무 텍스트
- 레벨 설정: president (앰버/왕관), vp (보라), lead (파랑), member (회색)
- Supabase `ops_members` 테이블 조회; 폴백 데모 데이터 3건
- Admin 인라인 추가/수정/삭제 버튼

###### 2B. ExOpsPage (`src/pages/ExOpsPage.tsx`) — 신규 페이지
- 라우트: `/about/ex-ops`
- 가로 행 레이아웃: 아바타 원, 이름, 직책 배지, 기수, 재임 기간, 소개
- Supabase `ex_ops_members` 테이블 조회; 폴백 데모 1건
- Admin 인라인 추가/수정/삭제 버튼

###### 2C. AboutPage 서브 네비게이션 (`src/pages/AboutPage.tsx`)
- 상단에 브레드크럼 형태 서브 내비 추가: 소개 | 운영진 | 전 운영진

---

##### PART 3 — 커뮤니티(게시판) 개선

###### 3A. BoardPage (`src/pages/BoardPage.tsx`)
- 게시글 행별 **좋아요 버튼** (하트); `localStorage`에 카운트 저장; 토글 방식
- 행별 **댓글 수** 표시 (Supabase comments 테이블 조회)
- **작성자 아바타**: 이름 첫 글자를 표시하는 그라디언트 원형 아이콘
- 헤더에 **"Study 내보내기" 버튼** (로그인 시 표시):
  - 본인의 Study 카테고리 게시글을 체크박스로 선택하는 모달 오픈
  - 전체 내용 + 댓글 포함 `.md` 파일 생성
  - MD 형식: `### 제목`, 메타데이터 블록, 본문, `#### 댓글` 섹션
  - 파일명: `aing-study-export-YYYY-MM-DD.md`

###### 3B. PostDetailPage (`src/pages/PostDetailPage.tsx`)
- 게시글 하단 **좋아요 버튼** (하트); `localStorage` 저장
- 로그인 시 Study 게시글에 **"Export MD" 버튼** (단일 게시글 + 댓글)
  - 파일명: `YYYYMMDD-제목-슬러그.md`
- 댓글 타임스탬프에 **HH:MM** 포함 (전체 날짜시간 표시)
- 로그인한 사용자의 이름이 작성자 필드에 자동 입력; `readOnly` 처리

###### 3C. NewPostPage (`src/pages/NewPostPage.tsx`)
- **마크다운 미리보기 토글** 버튼 (편집 / 미리보기)
  - 미리보기 렌더링: `**굵게**`, `#### 제목`, `- 목록`
  - 편집 모드: textarea 표시 / 미리보기 모드: 렌더링된 div 표시

---

##### PART 4 — Navbar 업데이트 (`src/components/Navbar.tsx`)

- **"히스토리"** 네비 링크 추가 → `/history`
- **"소개"** 드롭다운으로 변경:
  - 소개 → `/about`
  - 운영진 → `/about/ops`
  - 전 운영진 → `/about/ex-ops`
- 모바일 메뉴: 소개 항목을 접을 수 있는 서브 섹션으로 표시

---

##### PART 5 — Supabase 타입 (`src/lib/supabase.ts`)

- **`Activity` 타입**: `type` 필드를 `'study' | 'project' | 'competition' | 'seminar'`로 업데이트; 선택 필드 추가: `detail_url`, `start_date`, `end_date`, `participants`, `result`, `image_url`
- **`OpsTeamMember` 타입**: 신규 — `id, name, role, responsibilities, level, order, generation, avatar_url`
- **`ExOpsMember` 타입**: 신규 — `id, name, role, generation, term, description`

---

##### 대회/해커톤 데이터 모델 참고

`Activity` 타입과 대회 카드는 해커톤 지원을 고려해 설계:
- `start_date / end_date`: 대회 전체 일정 범위
- `participants`: 팀 인원 수
- `result`: 수상 내역 텍스트 (예: "대상", "1st place")
- `detail_url`: 전용 해커톤 대시보드 페이지로 연결 (향후 확장)
- 대회 카드에 앰버 색상의 "대회 보기" CTA 버튼 표시
- 향후 확장: 리더보드, 트랙 정보, 제출 제한, 점수 산정 등 — 모두 `detail_url`로 연결 가능

---

#### 변경된 파일

| 파일 | 변경 내용 |
|------|--------|
| `src/lib/supabase.ts` | Activity 타입 업데이트 + OpsTeamMember, ExOpsMember 타입 추가 |
| `src/context/AuthContext.tsx` | isAdmin에 'ops' 역할 포함 |
| `src/pages/ActivitiesPage.tsx` | 필터·4가지 카드 타입·대회 지원·Admin 인라인 편집으로 전면 재작성 |
| `src/pages/HistoryPage.tsx` | **신규** — 전체 활동 타임라인 뷰 |
| `src/pages/AboutOpsPage.tsx` | **신규** — 운영진 조직도 페이지 |
| `src/pages/ExOpsPage.tsx` | **신규** — 전 운영진 목록 페이지 |
| `src/pages/AboutPage.tsx` | 서브 네비게이션 추가 |
| `src/pages/BoardPage.tsx` | 좋아요, 댓글 수, 아바타, MD 내보내기 |
| `src/pages/PostDetailPage.tsx` | 좋아요 버튼, MD 내보내기, HH:MM 타임스탬프, 작성자 자동 입력 |
| `src/pages/NewPostPage.tsx` | 마크다운 미리보기 토글 |
| `src/pages/admin/AdminActivities.tsx` | competition/seminar 타입 + 확장 필드 |
| `src/components/Navbar.tsx` | 히스토리 링크 + 소개 드롭다운 |
| `src/App.tsx` | 신규 라우트: /history, /about/ops, /about/ex-ops |

---

## [0.6.0] - 2026-03-17
### Added
- 일반 부원 로그인 기능 (/login)
- 로그인 시 Navbar에 프로필 아바타 표시 (클릭 → 본인 프로필)
- 커뮤니티 글 작성자 이름 공개
- 프로필에 LinkedIn 필드 추가
- src/lib/constants.ts — 공통 상수 파일 (TRACK, STATUS, CATEGORY)

### Fixed
- Admin 로그인 AuthContext 연동 수정 (useAdmin → useAuth)
- 프로필 저장 완전 수정 (fallback 메시지 제거)
- 통합 인증: users 테이블 + members 테이블 동시 지원
- PostDetailPage useAdmin → useAuth 마이그레이션
- NewPostPage: 로그인 상태면 작성자 자동 입력

### Security
- 비밀번호 평문 저장 → 향후 해싱 필요 (현재 MVP 단계)
- sessionStorage 기반 세션 관리
- autocomplete 속성 추가 (username, current-password, new-password)

## [0.5.0] - 이전 작업
### Added
- Supabase 연동 (members, posts, comments 테이블)
- Admin 대시보드 및 관리 페이지
- 프로필 비밀번호 보호 편집
- 커뮤니티 게시판 (BoardPage, PostDetailPage, NewPostPage)
- 프로젝트 페이지 (ProjectsPage, ProjectDetailPage)
- Team 페이지
