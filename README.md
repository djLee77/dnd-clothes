# D&D Clothes 👗👕

![D&D Clothes Deploy Status](https://img.shields.io/badge/Deploy-Success-brightgreen)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)

> 나만의 옷장을 관리하고, 원하는 대로 옷을 배치해볼 수 있는 커스텀 코디 스크랩보드 플랫폼입니다.

🔗 **배포 URL:** [https://dnd-clothes.onrender.com/](https://dnd-clothes.onrender.com/)

---

## 🌟 주요 기능 (Features)

*   **인터랙티브 스크랩보드 (Scrapboard)**
    *   캔버스(Canvas) 기반의 스크랩보드 위에서 옷들을 자유롭게 배치할 수 있습니다.
    *   개별 아이템의 크기 조절, 회전, 위치 이동 및 순서 변경(Z-index)이 가능합니다.
*   **AI 배경 제거 (Background Removal)**
    *   업로드한 옷 이미지의 배경을 자동으로 제거하여 깔끔한 누끼 이미지만 스크랩보드에 사용할 수 있습니다. (`@imgly/background-removal` 활용)
*   **코디 저장 및 불러오기**
    *   완성된 스크랩보드 상태를 저장할 수 있습니다.
    *   저장 과정에서 자동으로 썸네일이 생성되어 대시보드에서 내가 만든 코디를 한눈에 확인할 수 있습니다.
*   **다이내믹 UI 및 애니메이션**
    *   에셋 툴바를 사이드바 혹은 하단 태스크바 형태로 자유롭게 전환 가능한 유연한 UI를 제공합니다.
    *   부드러운 애니메이션과 스포트라이트 마우스 효과 등을 통해 사용자 경험(UX)을 극대화했습니다.
*   **사용자 인증 (Authentication)**
    *   회원가입 및 로그인을 통해 본인만의 보드와 아이템 목록을 안전하게 관리합니다. (JWT + bcrypt 암호화 적용)

## 🛠 기술 스택 (Tech Stack)

### Frontend
*   **Framework:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, PostCSS, Lucide React
*   **State Management:** Zustand, React Query
*   **Canvas & Graphics:** Konva, React Konva
*   **Image Processing:** `@imgly/background-removal`
*   **Routing:** React Router DOM

### Backend
*   **Runtime:** Node.js, Express
*   **Database:** PostgreSQL / SQLite (`pg`)
*   **Security:** bcryptjs, jsonwebtoken (JWT), CORS
*   **Deployment:** Render

## 🚀 로컬 실행 방법 (Getting Started)

본 프로젝트는 Frontend(`src`)와 Backend(`server`)가 통합된 형태를 가지고 있습니다.

### 1. 클론 및 의존성 설치
```bash
git clone <repository-url>
cd dnd-closet

# 루트 및 클라이언트 의존성 설치
npm install

# 서버 의존성 설치
cd server
npm install
cd ..
```

### 2. 환경 변수 설정
`server` 폴더 내에 `.env` 파일을 생성하고 다음 환경 변수를 설정합니다. (`server/.env.example` 또는 설정 파일 참고)

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
# 데이터베이스 설정 (SQLite 혹은 Postgres URL)
DB_PATH=./database.sqlite
# DATABASE_URL=postgres://user:password@localhost:5432/dndcloset
```

### 3. 프로젝트 실행 (개발 환경)

클라이언트(Vite 서버)와 백엔드(Express 서버)를 각각 실행해주어야 합니다.

**백엔드 서버 실행:**
```bash
# 터미널 창 1
cd server
npm run dev
```

**프론트엔드 서버 실행:**
```bash
# 터미널 창 2 (루트 경로)
npm run dev
```

- 클라이언트는 기본적으로 `http://localhost:5173` 에서 실행됩니다.
- 테스트 및 코디 스크랩 기능을 자유롭게 사용해볼 수 있습니다.

---

> 이 프로젝트는 CI/CD가 구축되어 있어 GitHub 메인 브랜치 업데이트 시 Render를 통해 자동으로 배포됩니다.
