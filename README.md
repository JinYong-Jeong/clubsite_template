# clubsite_template

🎓 **대학 동아리/학회 웹사이트 템플릿**

React + TypeScript + Supabase 기반의 완성형 동아리 웹사이트 템플릿입니다.

## ✨ 주요 기능

- 멤버 관리, 활동/프로젝트 소개
- 팀원 모집 게시판
- 공지/스터디/활동 게시판 + 댓글
- Admin 대시보드 (사이트 설정, 멤버/콘텐츠 관리)
- 관리자 비밀번호 bcrypt 해싱
- 모집 중 Navbar 배지 + 구글폼 연결

## 🚀 시작하기

```bash
git clone https://github.com/JinYong-Jeong/clubsite_template
cd clubsite_template
npm install
cp .env.example .env  # Supabase 키 입력
npm start
```

자세한 설정 방법은 [FEATURES.md](./FEATURES.md)를 참고하세요.

## ⚠️ 실서비스 전 필수 체크리스트

템플릿을 실제 서비스에 배포하기 전에 반드시 아래 항목을 처리하세요.

### 1. 임시 admin 계정 제거 🔴

`src/context/AuthContext.tsx`에 테스트용 하드코딩 admin 계정이 있습니다.

```
// ⚠️  TODO (TEMPLATE SETUP) ~ ⚠️  TODO END
```

해당 블록을 **반드시 삭제**하세요. 삭제하지 않으면 누구나 `admin / admin`으로 관리자 페이지에 접근할 수 있습니다.

삭제 후에는 Supabase DB의 `users` 또는 `members` 테이블에 등록된 계정으로만 로그인 가능합니다.

### 2. Supabase 환경변수 설정 🔴

`.env` 파일에 **본인의 Supabase 프로젝트** URL과 anon key를 입력하세요.  
절대 다른 프로젝트의 키를 그대로 사용하지 마세요.

### 3. `.env` 파일 git 미포함 확인

`.gitignore`에 `.env`가 포함되어 있는지 확인하세요.  
`.env.example`에는 실제 키 값을 절대 넣지 마세요.

---

## 📄 라이센스

MIT
