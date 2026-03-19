# 기능 설명

## 📋 페이지 구성

### 공개 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 홈 | `/` | 히어로 섹션, 트랙 소개, 활동 하이라이트 |
| 소개 | `/about` | 동아리 소개, 트랙 설명 |
| 운영진 | `/about/ops` | 현 운영진 카드 (클릭 시 멤버 연결) |
| 전 운영진 | `/about/ex-ops` | 기수별 전 운영진 목록 |
| 활동 | `/activities` | 스터디/프로젝트/대회/세미나 목록 |
| 활동 상세 | `/activities/:id` | 활동 상세 (slug 또는 UUID) |
| 프로젝트 | `/projects` | 프로젝트 목록 |
| 멤버 | `/members` | 멤버 카드 (관심분야/트랙 필터) |
| 멤버 상세 | `/members/:id` | 개인 프로필 |
| 게시판 | `/board` | 공지/활동후기/스터디/프로젝트 게시글 |
| 게시글 | `/board/:id` | 게시글 상세 + 댓글 |
| 팀 모집 | `/team` | 팀원 모집 게시글 |
| 연락처 | `/contact` | 문의 폼 + SNS 링크 |

### 관리자 페이지 (`/admin/*`)

| 페이지 | 기능 |
|--------|------|
| Dashboard | 통계 현황 |
| Settings | 사이트 전역 설정 (SNS, 모집, 관심분야) |
| Members | 멤버 추가/수정/삭제/검색 |
| Activities | 활동 관리 (slug, instagram, detail_content) |
| Projects | 프로젝트 관리 |
| Posts | 게시글 관리 |
| Team Posts | 팀모집글 + 신청자 관리 |
| Comments | 댓글 관리 |
| Messages | 문의 메시지 읽기/삭제 |
| About Ops | 운영진 추가/수정/삭제 |
| Ex-Ops | 전 운영진 관리 |

---

## ⚙️ 주요 기능

### 1. 사이트 설정 (Admin → Settings)
- **사이트 기본 정보**: 동아리 소개 문구, 푸터 텍스트
- **연락처 & SNS**: 이메일, GitHub, Instagram, Notion, 위치
- **관심분야 목록**: 태그 추가(Enter)/삭제(×) → Members 필터에 실시간 반영
- **모집 설정**: 모집 중 토글 → Navbar 빨간 배지 표시 + 구글폼 연결

### 2. 활동 (Activities)
- 타입: 스터디 / 프로젝트 / 대회 / 세미나
- **slug** 필드: 숫자로 깔끔한 URL (`/activities/29`)
- **detail_content**: Markdown 본문 (상세페이지에 렌더링)
- **instagram_url**: 활동 Instagram 링크 버튼
- 외부 링크는 `https://` 자동 보정

### 3. 멤버 (Members)
- 트랙: Junior / Senior / Admin / OB
- 관심분야 필터 (Admin Settings에서 관리)
- 워크로드 표시 (●○○○○)
- 멤버 상세 페이지: 참여 프로젝트, 팀모집글, 수상내역

### 4. 인증 (Auth)
- `users` 테이블 기반 로그인
- 비밀번호: bcrypt 해싱 (`pgcrypto` + `check_user_password` RPC)
- role: admin / ops / member / ob

### 5. 팀 모집 (Team)
- 모집글 작성 / 신청 / 신청자 관리 (수락/거절)
- 페이지네이션

---

## 🛠️ 설정 방법

### 1. Supabase 설정
```bash
# Supabase SQL Editor에서 실행
schema_final.sql
```

### 2. 환경변수 설정
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Admin 계정 생성
```sql
insert into public.users (name, password_hash, role)
values ('admin', crypt('your_password', gen_salt('bf', 10)), 'admin');
```

### 4. 동아리 정보 변경 방법
Admin → Settings에서 다음 항목 설정:
- 동아리 소개 문구
- Instagram / GitHub / Notion URL
- 이메일, 위치
- 관심분야 목록
- 모집 구글폼 URL

---

## 📦 기술 스택

| 항목 | 내용 |
|------|------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| DB/Auth | Supabase (PostgreSQL) |
| Deploy | Vercel |
| Icons | Lucide React |

