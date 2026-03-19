# A.ing Website

가천대학교 AI 학술동아리 A.ing 공식 웹사이트

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + RLS)
- **Deploy**: Vercel

## 📁 Project Structure

```
src/
├── components/      # 공통 컴포넌트 (Navbar, Footer, AnimatedSection)
├── context/         # Context (Auth, SiteSettings)
├── lib/             # Supabase 클라이언트 & 타입
├── pages/
│   ├── admin/       # 관리자 페이지
│   └── ...          # 일반 페이지
└── App.tsx
```

## 🗄️ Database Setup

`schema_final.sql` 파일을 Supabase SQL Editor에서 실행합니다.

## 🔑 Admin Setup

1. `schema_final.sql` 실행
2. Supabase에서 `users` 테이블에 admin 계정 추가:
```sql
insert into public.users (name, password_hash, role)
values ('admin이름', crypt('비밀번호', gen_salt('bf', 10)), 'admin');
```

## ⚙️ Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📋 Admin Features

| 메뉴 | 기능 |
|------|------|
| Settings | 사이트 정보, SNS, 관심분야, 모집 설정 |
| Members | 멤버 추가/수정/삭제 |
| Activities | 활동 추가/수정/삭제 |
| Projects | 프로젝트 관리 |
| Posts | 게시글 관리 |
| Team Posts | 팀원 모집글 관리 |
| Messages | 문의 메시지 확인 |
| About Ops | 운영진 관리 |
| Ex-Ops | 전 운영진 관리 |
