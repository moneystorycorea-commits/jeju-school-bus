# 🚌 제주국제학교 통학 차량 운행 및 스케줄 관리 시스템
> **Jeju International School Shuttle Dispatch & Schedule Management System**  
> 서귀포 대정읍 제주영어교육도시 인근 주거단지(아주더하이클래스 등) 입주민 자녀 통학 셔틀 차량의 효율적이고 안전한 배차 및 학사일정 스케줄 관리를 위한 올인원 솔루션입니다.

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

---

## 📖 목차 (Table of Contents)
1. [프로젝트 소개 (Overview)](#-프로젝트-소개-overview)
2. [핵심 기능 (Key Features)](#-핵심-기능-key-features)
3. [학교별 고유 브랜딩 컬러 (Official School Identity)](#-학교별-고유-브랜딩-컬러)
4. [시스템 아키텍처 및 충돌 감지 엔진 (Engine & Architecture)](#-시스템-아키텍처-및-충돌-감지-엔진)
5. [디렉터리 구조 (Directory Structure)](#-디렉터리-구조-directory-structure)
6. [시작하기 (Getting Started)](#-시작하기-getting-started)
7. [GitHub & Vercel 배포 파이프라인 (CI/CD)](#-github--vercel-배포-파이프라인-cicd)

---

## 🌟 프로젝트 소개 (Overview)

제주영어교육도시에는 **NLCS, BHA, KIS, SJA** 등 유수의 국제학교와 인근 저청초등학교가 자리잡고 있습니다. 학교마다 등교 시간과 하교 시간(방과후 활동, 요일별 단축수업, 학년별 시차 등)이 모두 상이하여, 입주민 전용 셔틀버스를 효율적으로 배차하고 충돌 없이 운영하는 데 고도의 관리가 요구됩니다.

본 시스템은 관리사무소 및 셔틀 운행 담당자가:
1. **16명 전체 학생의 등·하교 스케줄을 스크롤 없이 한 화면에서 직관적으로 조망**하고,
2. **5분 단위 마우스 드래그만으로 즉시 시간을 조정**하며,
3. **학교 간 이동시간 및 탑승 정원 초과 여부를 실시간 7대 알고리즘으로 자동 검증**하고,
4. **아파트 엘리베이터 및 게시판에 즉시 부착 가능한 고품격 A4 시간표 공고문을 원클릭으로 출력**할 수 있도록 설계되었습니다.

---

## 🚀 핵심 기능 (Key Features)

### 1. 직관적인 16명 무스크롤 타임라인 보드 (Schedule Board)
- **Zero-Scroll 완벽 레이아웃**: 상단 헤더(48px), 툴바, 38px 행 높이의 세밀한 수직 여백 압축을 통해 일반 모니터 및 노트북 화면에서도 16명 전체 학생의 운행표가 **아래 스크롤 없이 한눈에** 들어옵니다.
- **학교 도착시간 기준 우측 정렬**: 등교(오전) 모드는 버스 출발이 아닌 **'학교 도착 목표 시간(Arrival Time)'**이 기준이므로, 타임라인 상에서 스케줄 블록의 **우측 끝(Right Edge)**이 07:40, 08:00 등 눈금선과 파란색 가이드라인에 완벽히 정렬됩니다.
- **스마트 수직 격자 정렬 (이름 ➔ 학교 ➔ 학년)**: 헤더 정렬 버튼과 학생 행의 데이터 너비를 1:1로 일치시켜 완벽한 수직 격자 정렬을 제공하며, 각 열 클릭 시 오름차순/내림차순으로 즉시 정렬됩니다.
- **5분 단위 스냅 드래그 앤 드롭**: 마우스로 블록을 잡고 좌우로 끌면 5분 단위로 부드럽게 스냅되며 실시간 도착/출발 툴팁이 가이드라인과 함께 연동됩니다.

### 2. 7대 실시간 충돌 감지 엔진 (Conflict Detector Engine)
운행 담당자의 실수를 원천 방지하기 위해 순수 함수 기반의 고성능 충돌 감지 엔진이 백그라운드에서 상시 작동합니다:
- **시간 역전 검사 (Invalid Sequence)**: 단지 도착/복귀 시간이 이전 정차지보다 이른 비정상 시간 배정 감지
- **학교 간 최소 이동시간 미확보 검사**: NLCS ➔ BHA(4분), BHA ➔ KIS(7분), KIS ➔ SJA(9분) 등 실제 제주 도로 구간 소요시간 미달 감지
- **차량 탑승 정원 초과 검사**: 1호차·2호차 정원(각 11인승) 대비 동시 탑승 인원 초과 감지
- **방학 및 휴일 운행 여부 검사**: 학교별 방학 기간 중 불필요한 배차 자동 안내
- **충돌 분석 모달 (Schedule Conflict Modal)**: 상단 헤더의 노란색 경고 삼각형(⚠️)을 클릭하면 1024px 와이드 모달창에서 충돌 원인과 추천 해결책을 가로 스크롤 없이 쾌적하게 열람할 수 있습니다.

### 3. 그대로 게시 가능한 A4 단일 통합 시간표 인쇄 (One-Page Official Print)
- **등교 & 하교 1장 통합**: 오전 등교(7개 노선)와 오후 하교(9개 노선) 전체 16개 운행표가 A4 1장(297mm)에 황금 비율로 알맞게 배치됩니다.
- **학교 도착/픽업 시간 100% 자동 산출**: 대시(`-`) 누락 없이 모든 정차지의 예정 시간이 구간 소요시간 계산 엔진을 거쳐 빠짐없이 표기됩니다.
- **공식 공고문 레이아웃**:
  - `[ 아주더하이클래스 입주민 통학 안내문 ]` 대제목 헤더
  - 호차(8%), 출발(12%), 경유순서(34%), 도착/픽업(26%), 운행요일(10%), 복귀(10%) 최적 열 너비
  - 하단 `📌 통학버스 이용 입주민 유의사항` (출발 5분 전 대기, 사전 연락 등)
  - `아 주 더 하 이 클 래 스  관 리 사 무 소` 공식 발신처 명기

### 4. 학생 관리 및 개인정보 보호 (Student Management & Privacy)
- 학생별 성명, 성별, 동·호수, 재학 학교, 학년, 보호자 정보 완벽 관리
- **비상연락망 마스킹 보안**: 기본적으로 `***-****-1234`로 마스킹되어 개인정보를 보호하며, 관리자 모드에서 눈 아이콘(👁️) 클릭 시에만 안전하게 전체 번호를 확인
- **가독성 최적화**: 폰트 크기를 전체적으로 2pt 확대(14px)하고, 불필요한 편집 버튼을 없애 행 어디를 클릭해도 즉시 상세 정보 및 시간표를 편집할 수 있습니다.

### 5. 캘린더 연동 상세 설정창 (Schedule Detail Drawer)
- 기본 상태에서는 스케줄 타임라인을 가리지 않도록 **닫힌 상태로 시작**하며, 학생 행이나 우측 가장자리의 슬림 플로팅 탭(`[운행설정]`)을 클릭할 때만 부드럽게 슬라이딩 오픈됩니다.
- 연간/월간 달력 연동, 학사일정 및 방학 등록, 요일별 희망 시간 원클릭 스냅 조정을 지원합니다.

---

## 🎨 학교별 고유 브랜딩 컬러

각 국제학교의 공식 고유 상징 색상을 충실히 계승하여 타임라인 블록 및 배지에 일관 적용하였습니다:

| 학교명 | 공식 명칭 | 컬러 코드 | 테두리 코드 | 디자인 콘셉트 |
| :--- | :--- | :--- | :--- | :--- |
| **NLCS** | North London Collegiate School Jeju | `#132742` | `#0A1626` | 영국 정통 딥 옥스퍼드 미드나잇 네이비 |
| **BHA** | Branksome Hall Asia | `#581C87` | `#4C1D95` | 캐나다 브랭섬홀 로열 타탄 퍼플 |
| **KIS** | Korea International School Jeju | `#08327C` | `#05245A` | CollegeBoard & 한국국제학교 공식 로열 블루 |
| **SJA** | St. Johnsbury Academy Jeju | `#166534` | `#14532D` | 미국 버몬트 힐파인 포레스트 딥 그린 |
| **저청초** | 저청초등학교 | `#0F766E` | `#115E59` | 제주 곶자왈 오션 딥 틸 |

> 블록 배경색은 높은 채도와 깊이감을 지니며, 내부 텍스트는 선명한 순백색(`text-white font-black`)을 채택하여 **13:1 이상의 높은 명도 대비(WCAG AAA 규격)**를 보장합니다.

---

## ⚙️ 시스템 아키텍처 및 충돌 감지 엔진

```
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Global Store                    │
│    (Students, Schedules, Routes, Trips, Holidays, Roles)     │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Route Calculator Engine    │ │   Conflict Detector Engine │
│  - 구간별 이동 소요시간 합산 │ │  - 7대 유효성 검사         │
│  - 실시간 도착 예정시간 산출 │ │  - 시간 역전/정원 초과 감지│
└───────────────┬──────────────┘ └─────────────┬──────────────┘
                │                             │
                ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│  - ScheduleBoard (Zero-Scroll 16인 타임라인)                │
│  - TripManagementView (A4 1장 통합 공고문 인쇄)             │
│  - StudentManagementView (학생 명부 & 개인정보 마스킹)      │
│  - ScheduleDetailDrawer (캘린더 연동 상세 설정)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 디렉터리 구조 (Directory Structure)

```bash
jeju-school-bus/
├── public/                     # 정적 에셋 (로고, 파비콘, PWA 매니페스트)
│   ├── logo-highclass.png      # 아주더하이클래스 공식 심볼 로고
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── drawer/             # 우측 슬라이딩 상세 설정 드로어
│   │   │   └── ScheduleDetailDrawer.tsx
│   │   ├── layout/             # 공통 헤더, 상단 툴바, 사이드 네비게이션
│   │   │   ├── AppHeader.tsx
│   │   │   ├── SidebarNav.tsx
│   │   │   └── TopToolbar.tsx
│   │   ├── schedule/           # 메인 스케줄 보드 및 타임라인 컴포넌트
│   │   │   ├── ScheduleBlock.tsx         # 도착시간 기준 우측 정렬 블록
│   │   │   ├── ScheduleBoard.tsx         # 16인 무스크롤 타임라인 메인 보드
│   │   │   ├── ScheduleConflictModal.tsx # 와이드 충돌 상세 모달
│   │   │   ├── StudentRow.tsx            # 학생 행 (이름-학교-학년 정밀 정렬)
│   │   │   └── TimeAxis.tsx              # 상단 시간 눈금 및 가이드라인
│   │   ├── students/           # 학생 관리 및 등록 모달
│   │   │   ├── StudentDetailPanel.tsx
│   │   │   ├── StudentFormModal.tsx
│   │   │   └── StudentManagementView.tsx # 좌측 정렬 학생 명부
│   │   └── trips/              # 운행시간표 및 A4 인쇄
│   │       ├── TripManagementView.tsx    # 게시용 A4 통합 인쇄 뷰
│   │       └── TripTable.tsx
│   ├── lib/
│   │   ├── mock/
│   │   │   └── initialData.ts  # 학생, 학교, 노선 구간, 초기 운행 템플릿
│   │   ├── scheduling/         # 비즈니스 로직 및 계산 알고리즘
│   │   │   ├── conflictDetector.ts # 7대 유효성 검사 충돌 감지기
│   │   │   ├── routeCalculator.ts  # 이동 소요시간 및 경유지 시간 계산기
│   │   │   └── time.ts             # 5분 스냅, 분 단위 변환, 타임라인 % 계산
│   │   └── store/
│   │       └── useScheduleStore.ts # Zustand 전역 상태 관리
│   ├── types/
│   │   └── index.ts            # TypeScript 핵심 데이터 모델 타입 정의
│   ├── App.tsx                 # 메인 라우팅 및 탭 뷰 전환
│   ├── index.css               # Tailwind CSS v4 스타일시트
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vercel.json                 # Vercel SPA 라우팅 및 빌드 설정
└── vite.config.ts              # Vite 빌드 설정
```

---

## 💻 시작하기 (Getting Started)

### 1. 요구 사항 (Prerequisites)
- **Node.js**: v20.18.0 이상 권장
- **패키지 매니저**: npm

### 2. 설치 및 실행 (Installation & Run)
```bash
# 1. 저장소 클론
git clone https://github.com/moneystorycorea-commits/jeju-school-bus.git
cd jeju-school-bus

# 2. 의존성 패키지 설치
npm install

# 3. 로컬 개발 서버 시작 (http://localhost:5173/)
npm run dev

# 4. 프로덕션 빌드 검증
npm run build
```

---

## 🌐 GitHub & Vercel 배포 파이프라인 (CI/CD)

본 프로젝트는 **GitHub 저장소와 Vercel 클라우드가 연동**되어 운영되도록 구성되어 있습니다:

1. **GitHub 저장소**:  
   👉 [https://github.com/moneystorycorea-commits/jeju-school-bus](https://github.com/moneystorycorea-commits/jeju-school-bus)
2. **Vercel 원클릭 연동 방법**:
   - [https://vercel.com/new](https://vercel.com/new) 에 접속합니다.
   - `moneystorycorea-commits/jeju-school-bus` 저장소를 선택하고 **[Deploy]**를 누릅니다.
3. **자동 업데이트 반영 (Continuous Deployment)**:
   - 코드를 수정하고 `main` 브랜치에 `git push`를 실행하면, **Vercel이 30초 내에 자동으로 감지하여 빌드 및 실시간 웹 배포를 완료**합니다.
   - `vercel.json`에 SPA 리라이트(`rewrites`)가 사전 구성되어 있어, 새로고침 시 404 에러 없이 완벽하게 동작합니다.

---

## 📄 라이선스 (License)

본 소프트웨어는 아주더하이클래스 입주민 통학 차량 전용 운행 관리 시스템으로 제작되었습니다.