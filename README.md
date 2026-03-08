# D&D Closet (Wardrobe) 👗👕

![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5-purple.svg)
![Render](https://img.shields.io/badge/Deploy-Render-black.svg)

> 나만의 옷장을 관리하고, 원하는 대로 옷을 배치해볼 수 있는 커스텀 코디 스크랩보드 플랫폼입니다. 사진을 올리기만 하면 AI가 배경을 자동으로 제거해주어 간편하게 나만의 룩북을 만들 수 있습니다.

<img width="1367" height="895" alt="image" src="https://github.com/user-attachments/assets/13f95483-3f1a-4209-aa9e-8d2cdf39cb69" />

---
## 🌟 주요 기능 (Key Features)

### 1. 스타일 커뮤니티 (Community Feed)
*   다른 사용자들이 공유한 코디와 스크랩보드를 구경하고 영감을 얻을 수 있습니다.
*   반응형 그리드와 필터(All, Trending, Popular) 기능을 통해 원하는 코디들을 빠르게 탐색합니다.

### 2. 코디 상세 및 소통 (Post Details & Comments)
*   상세 페이지에서 해당 코디에 사용된 **모든 개별 아이템 리스트와 총 합계 금액**을 한눈에 파악할 수 있습니다.
*   댓글은 물론 **대댓글(답글)** 작성이 가능하며, **댓글 좋아요** 버튼으로 자유로운 소통이 가능합니다.

### 3. 인터랙티브 스크랩보드 (Scrapboard)
*   초대형 캔버스(Canvas) 위에서 옷장(Assets)의 아이템들을 자유롭게 드래그 앤 드롭으로 배치합니다.
*   개별 아이템의 크기 조절, 회전, 위치 이동 및 순서 변경(Z-index 위/아래 이동)이 가능합니다.

### 4. 핵심 편의 기능
*   **AI 배경 제거**: 옷 사진 업로드 시 딥러닝(`@imgly/background-removal`)이 피사체의 배경을 자동 제거(누끼)합니다.
*   **개인 옷장 관리 (Assets)**: '아우터', '상의' 등 직접 카테고리를 만들고 각 옷마다 가격, 상품명, 구매 링크(URL)를 기록해둘 수 있습니다.
*   **코디 저장 및 대시보드**: 완성된 캔버스 룩북은 썸네일과 함께 저장되며, 대시보드에서 스크랩 리스트를 한눈에 모아볼 수 있습니다.
*   **사용자 인증 (Auth)**: JWT와 bcrypt 암호화를 거친 회원가입 및 로그인으로 안전하게 코디 데이터를 보존합니다.

---

## 💡 사용 방법 (How to use)

프로젝트에 처음 접속하신 분들을 위한 간단한 튜토리얼입니다. (우측 상단의 '?' 튜토리얼 가이드 버튼을 통해서도 확인 가능합니다)

1. **카테고리 생성하기:** 우측 사이드바(Properties) 패널 하단의 입력창에 `아우터`, `신발` 등 원하는 이름을 적고 `+` 버튼을 눌러 옷을 담을 빈 폴더를 만듭니다.
2. **옷 이미지 업로드 및 정보 입력:** 방금 만든 카테고리에 마우스를 올리면 생기는 **`업로드(구름 모양)` 아이콘**을 클릭합니다. 내 컴퓨터에서 옷 사진을 고르면 배경이 싹 지워진 상태로 옷장에 추가됩니다. (업로드 후 이름/가격/링크를 적을 수 있는 창이 뜹니다.)
3. **코디하기 (드래그 앤 드롭):** 옷장에 등록된 옷 이미지를 마우스로 꾹 누른 채 왼쪽의 넓은 캔버스 위로 끌어다 놓습니다. 
4. **저장하기:** 코디가 마음에 든다면 가장 아래쪽의 `Saved Scraps` 영역에 이름을 적고 디스켓 버튼을 눌러 룩북을 저장하세요!

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
*   **Framework:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, PostCSS, Lucide React (Icons)
*   **State Management:** Zustand
*   **Canvas & Graphics:** Konva, React Konva, `use-image`
*   **Image Processing:** `@imgly/background-removal`
*   **Routing:** React Router DOM

### Backend
*   **Runtime:** Node.js, Express
*   **Database:** PostgreSQL (`pg` library 탑재) + Supabase
*   **Security:** bcryptjs, jsonwebtoken (JWT), CORS

---

## 🚀 로컬 실행 방법 (Local Development)

본 프로젝트는 Frontend(`src`)와 Backend(`server`)가 하나의 레포지토리에 통합된 형태(Monorepo 느낌)를 가지고 있습니다.

### 1. 클론 및 의존성 설치
```bash
git clone <repository-url>
cd dnd-closet

# 루트(Front) 및 서버(Back) 의존성 동시 설치
npm install
npm run postinstall 
```

### 2. 환경 변수 설정
`server` 폴더 내에 `.env` 파일을 복사/생성하고 다음 환경 변수를 설정합니다. 

```env
PORT=5000
JWT_SECRET=supersecretkey_change_me_in_production

# PostgreSQL 데이터베이스 연결 주소 (필수)
# 로컬 개발 시에도 클라우드 데이터베이스를 이용하거나 로컬 Postgres 주소를 입력합니다.
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3. 프로젝트 동시 실행
백엔드와 프론트엔드 터미널을 각각 열어 실행합니다.

**서버 (Backend) 실행:**
```bash
# 터미널 창 1 (루트 폴더에서)
npm start 
# (이는 `cd server && npm start` 와 동일하게 작동합니다)
```

**클라이언트 (Frontend) 실행:**
```bash
# 터미널 창 2 (루트 폴더에서)
npm run dev
```

- 클라이언트는 기본적으로 `http://localhost:5173` 에서 실행됩니다.
- Vite 설정(`vite.config.ts`)에 Proxy가 설정되어 있어, 프론트에서 `/api`로 보내는 요청은 자동으로 `http://localhost:5000` 백엔드로 포워딩됩니다.

---

## ☁️ 배포 안내 (Deployment)

이 프로젝트는 **Render.com(웹 서버)** 과 **Supabase(무료 PostgreSQL DB)** 를 결합하여 데이터 유실 없는 완벽한 무료 배포 구조를 갖추고 있습니다.

1. **Supabase 설정:** 새 프로젝트를 생성하고, `Database` 탭에서 **Connection Pooler (IPv4)** 용 주소를 복사합니다. (포트 6543 사용 권장)
2. **Render 배포:** Github 레포지토리를 Web Service로 연동합니다.
   * Build Command: `npm install && npm run build`
   * Start Command: `npm start`
3. **환경 변수 세팅:** Render의 `Environment` 탭에 들어가서 `DATABASE_URL` (Supabase 연결 주소)과 `JWT_SECRET` (임의의 비밀번호 키)을 등록해줍니다.
4. **완료!** Render가 스스로 백/프론트엔드를 빌드하고 통합 서버를 띄웁니다.
