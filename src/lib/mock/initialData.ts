import {
  Student,
  StudentPrivateInfo,
  School,
  Location,
  RouteSegment,
  Vehicle,
  TripTemplate,
  StudentSchedule,
  SchoolHoliday,
} from '@/types';

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'NLCS',
    name: 'North London Collegiate School Jeju',
    shortName: 'NLCS',
    color: '#132742', // Deep NLCS Oxford Navy (참고 이미지 #1D3B61 대비 딥 네이비로 심화 조색)
    badgeBg: 'bg-blue-50 text-blue-950 border-blue-300 font-extrabold',
    badgeText: 'text-blue-900',
    defaultLocationId: 'NLCS_MAIN',
    defaultDwellMinutes: 1,
  },
  {
    id: 'BHA',
    name: 'Branksome Hall Asia',
    shortName: 'BHA',
    color: '#581c87', // Branksome Tartan Purple (타탄체크 & 브랭섬 로열 퍼플)
    badgeBg: 'bg-purple-50 text-purple-950 border-purple-300 font-extrabold',
    badgeText: 'text-purple-900',
    defaultLocationId: 'BHA_GATE1',
    defaultDwellMinutes: 1,
  },
  {
    id: 'KIS',
    name: 'Korea International School Jeju',
    shortName: 'KIS',
    color: '#08327C', // KIS Royal Blue (CollegeBoard 공식 색상 #08327C)
    badgeBg: 'bg-blue-50 text-blue-950 border-blue-400 font-extrabold',
    badgeText: 'text-blue-900',
    defaultLocationId: 'KIS_MAIN',
    defaultDwellMinutes: 1,
  },
  {
    id: 'SJA',
    name: 'St. Johnsbury Academy Jeju',
    shortName: 'SJA',
    color: '#14532d', // SJA Forest Green (세인트존스베리 시그니처 딥 포레스트 그린)
    badgeBg: 'bg-emerald-50 text-emerald-950 border-emerald-400 font-extrabold',
    badgeText: 'text-emerald-900',
    defaultLocationId: 'SJA_GATE3',
    defaultDwellMinutes: 1,
  },
  {
    id: 'CHEONG',
    name: '저청초등학교',
    shortName: '저청초',
    color: '#0e7490',
    badgeBg: 'bg-teal-50 text-teal-950 border-teal-300 font-extrabold',
    badgeText: 'text-teal-900',
    defaultLocationId: 'CHEONG_MAIN',
    defaultDwellMinutes: 1,
  },
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'COMPLEX_MAIN',
    name: '아주더하이클래스',
    shortName: '단지',
    type: 'complex',
  },
  {
    id: 'NLCS_MAIN',
    name: 'NLCS Jeju 본관/게이트',
    shortName: 'NLCS',
    type: 'school_gate',
    schoolId: 'NLCS',
  },
  {
    id: 'NLCS_JUNIOR',
    name: 'NLCS Jeju 주니어게이트',
    shortName: 'NLCS 주니어',
    type: 'school_gate',
    schoolId: 'NLCS',
  },
  {
    id: 'BHA_GATE1',
    name: 'BHA GATE 1',
    shortName: 'BHA G1',
    type: 'school_gate',
    schoolId: 'BHA',
  },
  {
    id: 'KIS_MAIN',
    name: 'KIS Jeju 본관',
    shortName: 'KIS',
    type: 'school_gate',
    schoolId: 'KIS',
  },
  {
    id: 'SJA_GATE3',
    name: 'SJA Jeju GATE 3',
    shortName: 'SJA G3',
    type: 'school_gate',
    schoolId: 'SJA',
  },
  {
    id: 'CHEONG_MAIN',
    name: '저청초 정문',
    shortName: '저청초',
    type: 'school_gate',
    schoolId: 'CHEONG',
  },
];

export const INITIAL_ROUTE_SEGMENTS: RouteSegment[] = [
  // 등교 및 기본 경로
  { id: 'rs-comp-nlcs', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'NLCS_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-bha', originLocationId: 'NLCS_MAIN', destinationLocationId: 'BHA_GATE1', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-bha-kis', originLocationId: 'BHA_GATE1', destinationLocationId: 'KIS_MAIN', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-kis-sja', originLocationId: 'KIS_MAIN', destinationLocationId: 'SJA_GATE3', travelMinutes: 3, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-sja-comp', originLocationId: 'SJA_GATE3', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 15, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-kis-comp', originLocationId: 'KIS_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 14, bufferMinutes: 0, profile: 'normal' },
  
  // 저청
  { id: 'rs-comp-cheong', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'CHEONG_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-comp', originLocationId: 'CHEONG_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  
  // 건너뛰기 대체 경로
  { id: 'rs-bha-sja', originLocationId: 'BHA_GATE1', destinationLocationId: 'SJA_GATE3', travelMinutes: 6, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-kis', originLocationId: 'NLCS_MAIN', destinationLocationId: 'KIS_MAIN', travelMinutes: 7, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-sja', originLocationId: 'NLCS_MAIN', destinationLocationId: 'SJA_GATE3', travelMinutes: 9, bufferMinutes: 0, profile: 'normal' },

  // 하교 경로 (역방향)
  { id: 'rs-comp-bha', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'BHA_GATE1', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-bha-nlcs', originLocationId: 'BHA_GATE1', destinationLocationId: 'NLCS_MAIN', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-comp', originLocationId: 'NLCS_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', name: '1호차', active: true },
  { id: 'v2', name: '2호차', active: true },
];

// 실제 16명 학생 데이터
export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: '김이담',
    building: '115동',
    unit: '202호',
    schoolId: 'BHA',
    grade: '10학년',
    gender: '여',
    sortOrder: 1,
    active: true,
    notes: '하교는 학원 때문에 셔틀활용 안함',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 460, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      2: { weekday: 2, morningMinute: 460, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 510, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      4: { weekday: 4, morningMinute: 460, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 460, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
    },
  },
  {
    id: 's2',
    name: '김태경',
    building: '108동',
    unit: '101호',
    schoolId: 'BHA',
    grade: '9학년',
    gender: '여',
    sortOrder: 2,
    active: true,
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 480, afternoonMinute: 960, morningActive: true, afternoonActive: true, active: true }, // 월 4시
      2: { weekday: 2, morningMinute: 480, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true }, // 화 5시30분
      3: { weekday: 3, morningMinute: 530, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true }, // 수 등교 8시50분
      4: { weekday: 4, morningMinute: 480, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true },
      5: { weekday: 5, morningMinute: 480, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true },
    },
  },
  {
    id: 's3',
    name: '김태희',
    building: '108동',
    unit: '101호',
    schoolId: 'BHA',
    grade: '9학년',
    gender: '여',
    sortOrder: 3,
    active: true,
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 480, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true }, // 월 5시30분
      2: { weekday: 2, morningMinute: 480, afternoonMinute: 990, morningActive: true, afternoonActive: true, active: true }, // 화 4시30분
      3: { weekday: 3, morningMinute: 530, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true }, // 수 등교 8시50분, 하교 3시30분
      4: { weekday: 4, morningMinute: 480, afternoonMinute: 1050, morningActive: true, afternoonActive: true, active: true }, // 목 5시30분
      5: { weekday: 5, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true }, // 금 3시30분
    },
  },
  {
    id: 's4',
    name: '길민서',
    building: '101동',
    unit: '402호',
    schoolId: 'BHA',
    grade: '7학년',
    gender: '여',
    sortOrder: 4,
    active: true,
    notes: '등교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 480, afternoonMinute: 960, morningActive: false, afternoonActive: true, active: true }, // 월 4시
      2: { weekday: 2, morningMinute: 480, afternoonMinute: 1020, morningActive: false, afternoonActive: true, active: true }, // 화 5시
      3: { weekday: 3, morningMinute: 530, afternoonMinute: 1020, morningActive: false, afternoonActive: true, active: true }, // 수 5시
      4: { weekday: 4, morningMinute: 480, afternoonMinute: 960, morningActive: false, afternoonActive: true, active: true }, // 목 4시
      5: { weekday: 5, morningMinute: 480, afternoonMinute: 1020, morningActive: false, afternoonActive: true, active: true }, // 금 5시
    },
  },
  {
    id: 's5',
    name: '이라임',
    building: '117동',
    unit: '404호',
    schoolId: 'BHA',
    grade: '7학년',
    gender: '여',
    sortOrder: 5,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 470, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 7시50분 희망
      2: { weekday: 2, morningMinute: 470, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 470, afternoonMinute: 930, morningActive: false, afternoonActive: false, active: false }, // 수 미이용
      4: { weekday: 4, morningMinute: 470, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 470, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
    },
  },
  {
    id: 's6',
    name: '박지아',
    building: '113동',
    unit: '301호',
    schoolId: 'NLCS',
    grade: '10학년',
    gender: '여',
    sortOrder: 6,
    active: true,
    notes: '월요일 하교 4시 또는 5시15분',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 480, afternoonMinute: 1035, morningActive: true, afternoonActive: true, active: true, alternateMinutes: [960, 1035], selectedAlternateIndex: 1, notes: '월 4시(16:00) 또는 5시15분(17:15) 선택 가능' },
      2: { weekday: 2, morningMinute: 480, afternoonMinute: 1035, morningActive: true, afternoonActive: true, active: true }, // 화 5시15분
      3: { weekday: 3, morningMinute: 480, afternoonMinute: 1035, morningActive: true, afternoonActive: true, active: true }, // 수 5시15분
      4: { weekday: 4, morningMinute: 480, afternoonMinute: 960, morningActive: true, afternoonActive: true, active: true },  // 목 4시
      5: { weekday: 5, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true },  // 금 3시30분
    },
  },
  {
    id: 's7',
    name: '김성현',
    building: '108동',
    unit: '401호',
    schoolId: 'NLCS',
    grade: '9학년',
    gender: '여',
    sortOrder: 7,
    active: true,
    notes: '수요일 하교 격주 4시 / 5시15분',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 490, afternoonMinute: 960, morningActive: true, afternoonActive: true, active: true }, // 월 4시
      2: { weekday: 2, morningMinute: 490, afternoonMinute: 960, morningActive: true, afternoonActive: true, active: true }, // 화 4시
      3: { weekday: 3, morningMinute: 490, afternoonMinute: 1035, morningActive: true, afternoonActive: true, active: true, alternateMinutes: [960, 1035], selectedAlternateIndex: 1, notes: '격주 4시(16:00) / 5시15분(17:15) 선택 가능' },
      4: { weekday: 4, morningMinute: 490, afternoonMinute: 1035, morningActive: true, afternoonActive: true, active: true }, // 목 5시15분
      5: { weekday: 5, morningMinute: 490, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true },  // 금 3시30분
    },
  },
  {
    id: 's8',
    name: '김태경',
    building: '113동',
    unit: '403호',
    schoolId: 'NLCS',
    grade: '5학년',
    gender: '남',
    sortOrder: 8,
    active: true,
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 460, afternoonMinute: 975, morningActive: true, afternoonActive: true, active: true }, // 월~목 4시15분
      2: { weekday: 2, morningMinute: 460, afternoonMinute: 975, morningActive: true, afternoonActive: true, active: true },
      3: { weekday: 3, morningMinute: 460, afternoonMinute: 975, morningActive: true, afternoonActive: true, active: true },
      4: { weekday: 4, morningMinute: 460, afternoonMinute: 975, morningActive: true, afternoonActive: true, active: true },
      5: { weekday: 5, morningMinute: 460, afternoonMinute: 920, morningActive: true, afternoonActive: true, active: true }, // 금 3시20분
    },
  },
  {
    id: 's9',
    name: '이다율',
    building: '114동',
    unit: '401호',
    schoolId: 'NLCS',
    grade: '5학년',
    gender: '여',
    sortOrder: 9,
    active: true,
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 460, afternoonMinute: 980, morningActive: true, afternoonActive: true, active: true }, // 월~목 4시20분
      2: { weekday: 2, morningMinute: 460, afternoonMinute: 980, morningActive: true, afternoonActive: true, active: true },
      3: { weekday: 3, morningMinute: 460, afternoonMinute: 980, morningActive: true, afternoonActive: true, active: true },
      4: { weekday: 4, morningMinute: 460, afternoonMinute: 980, morningActive: true, afternoonActive: true, active: true },
      5: { weekday: 5, morningMinute: 460, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true }, // 금 3시30분
    },
  },
  {
    id: 's10',
    name: '김동하',
    building: '117동',
    unit: '304호',
    schoolId: 'NLCS',
    grade: '4학년',
    gender: '남',
    sortOrder: 10,
    active: true,
    gate: '주니어게이트',
    notes: '주니어게이트 (목/금 하교 미이용)',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 510, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true }, // 등교 8시30분, 하교 3시30분
      2: { weekday: 2, morningMinute: 510, afternoonMinute: 990, morningActive: true, afternoonActive: true, active: true }, // 화 4시30분
      3: { weekday: 3, morningMinute: 510, afternoonMinute: 930, morningActive: true, afternoonActive: true, active: true }, // 수 3시30분
      4: { weekday: 4, morningMinute: 510, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 목 하교 미이용
      5: { weekday: 5, morningMinute: 510, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 금 하교 미이용
    },
  },
  {
    id: 's11',
    name: '정준희',
    building: '108동',
    unit: '102호',
    schoolId: 'NLCS',
    grade: '2학년',
    gender: '남',
    sortOrder: 11,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 465, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 7시45분
      2: { weekday: 2, morningMinute: 465, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 465, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      4: { weekday: 4, morningMinute: 465, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 465, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
    },
  },
  {
    id: 's12',
    name: '방시우',
    building: '112동',
    unit: '304호',
    schoolId: 'CHEONG',
    grade: '3학년',
    gender: '남',
    sortOrder: 12,
    active: true,
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 510, afternoonMinute: 825, morningActive: true, afternoonActive: true, active: true }, // 8시30분, 하교 1시45분(13:45)
      2: { weekday: 2, morningMinute: 510, afternoonMinute: 825, morningActive: true, afternoonActive: true, active: true },
      3: { weekday: 3, morningMinute: 510, afternoonMinute: 825, morningActive: true, afternoonActive: true, active: true },
      4: { weekday: 4, morningMinute: 510, afternoonMinute: 825, morningActive: true, afternoonActive: true, active: true },
      5: { weekday: 5, morningMinute: 510, afternoonMinute: 920, morningActive: true, afternoonActive: true, active: true }, // 금 3시20분(15:20)
    },
  },
  {
    id: 's13',
    name: '전지원',
    building: '106동',
    unit: '301호',
    schoolId: 'SJA',
    grade: '?',
    sortOrder: 13,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 485, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 8시05분
      2: { weekday: 2, morningMinute: 485, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 600, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 수 10시 도착
      4: { weekday: 4, morningMinute: 485, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 485, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
    },
  },
  {
    id: 's14',
    name: '전지민',
    building: '106동',
    unit: '301호',
    schoolId: 'KIS',
    grade: '?',
    sortOrder: 14,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 8시20분
      2: { weekday: 2, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      4: { weekday: 4, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 530, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 금 8시50분
    },
  },
  {
    id: 's15',
    name: '전현우',
    building: '106동',
    unit: '301호',
    schoolId: 'KIS',
    grade: '?',
    sortOrder: 15,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 8시20분
      2: { weekday: 2, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      4: { weekday: 4, morningMinute: 500, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 530, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 금 8시50분
    },
  },
  {
    id: 's16',
    name: '성라희',
    building: '108동',
    unit: '301호',
    schoolId: 'BHA',
    grade: '4학년',
    gender: '여',
    sortOrder: 16,
    active: true,
    notes: '하교시 셔틀 미이용',
    weeklySchedule: {
      1: { weekday: 1, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 8시
      2: { weekday: 2, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      3: { weekday: 3, morningMinute: 540, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true }, // 수 9시
      4: { weekday: 4, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
      5: { weekday: 5, morningMinute: 480, afternoonMinute: 930, morningActive: true, afternoonActive: false, active: true },
    },
  },
];

// 학생 민감 정보 (전화번호 및 보호자)
export const INITIAL_STUDENT_PRIVATE_INFO: Record<string, StudentPrivateInfo> = {
  s1: { studentId: 's1', studentPhone: '010-4815-8415', emergencyContact: '010-2601-8533', guardianName: '김문정', guardianContact: '010-2601-8533' },
  s2: { studentId: 's2', studentPhone: '010-9129-9374', emergencyContact: '010-4711-9374', guardianName: '이가은', guardianContact: '010-4711-9374' },
  s3: { studentId: 's3', studentPhone: '010-9130-9374', emergencyContact: '010-4711-9374', guardianName: '이가은', guardianContact: '010-4711-9374' },
  s4: { studentId: 's4', studentPhone: '010-2060-1096', emergencyContact: '010-2701-1096', guardianName: '김지연', guardianContact: '010-2701-1096' },
  s5: { studentId: 's5', emergencyContact: '010-5478-7078', guardianContact: '010-5478-7078' },
  s6: { studentId: 's6', studentPhone: '010-8588-4719', emergencyContact: '010-9723-2396', guardianContact: '010-9723-2396' },
  s7: { studentId: 's7', studentPhone: '010-9168-1011', emergencyContact: '010-4736-0717', guardianName: '정주나', guardianContact: '010-4736-0717' },
  s8: { studentId: 's8', emergencyContact: '010-2517-7943', guardianName: '김동빈', guardianContact: '010-2517-7943' },
  s9: { studentId: 's9', studentPhone: '010-9453-0271', emergencyContact: '010-3909-0271', guardianName: '이초롱', guardianContact: '010-3909-0271' },
  s10: { studentId: 's10', emergencyContact: '010-8778-2296', guardianName: '이선', guardianContact: '010-8778-2296' },
  s11: { studentId: 's11', emergencyContact: '010-7655-6501', guardianName: '이지영', guardianContact: '010-7655-6501' },
  s12: { studentId: 's12', emergencyContact: '010-8721-7272', guardianContact: '010-8721-7272' },
  s13: { studentId: 's13', emergencyContact: '010-2517-7943', guardianContact: '010-2517-7943' },
  s14: { studentId: 's14', emergencyContact: '010-2517-7943', guardianContact: '010-2517-7943' },
  s15: { studentId: 's15', emergencyContact: '010-2517-7943', guardianContact: '010-2517-7943' },
  s16: { studentId: 's16', studentPhone: '010-6777-1001', emergencyContact: '010-8644-1001', guardianName: '박현정', guardianContact: '010-8644-1001' },
};

// 1호차 / 2호차 공식 운행 템플릿
export const INITIAL_TRIP_TEMPLATES: TripTemplate[] = [
  // [등교]
  {
    id: 't-m-1',
    vehicleId: 'v1',
    type: 'MORNING',
    weekdays: [1, 2, 4], // 월, 화, 목
    defaultDepartureMinute: 450, // 07:30
    referenceReturnMinute: 490,  // 08:10
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'BHA_GATE1', stopOrder: 2, dwellMinutesOverride: 1 },
      { locationId: 'KIS_MAIN', stopOrder: 3, dwellMinutesOverride: 1 },
      { locationId: 'SJA_GATE3', stopOrder: 4, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-2',
    vehicleId: 'v1',
    type: 'MORNING',
    weekdays: [3], // 수
    defaultDepartureMinute: 450, // 07:30
    referenceReturnMinute: 485,  // 08:05
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'BHA_GATE1', stopOrder: 2, dwellMinutesOverride: 1 },
      { locationId: 'KIS_MAIN', stopOrder: 3, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-3',
    vehicleId: 'v1',
    type: 'MORNING',
    weekdays: [5], // 금
    defaultDepartureMinute: 450, // 07:30
    referenceReturnMinute: 485,  // 08:05
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'BHA_GATE1', stopOrder: 2, dwellMinutesOverride: 1 },
      { locationId: 'SJA_GATE3', stopOrder: 3, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-4',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 500, // 08:20
    referenceReturnMinute: 510,  // 08:30
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-5',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [3], // 수
    defaultDepartureMinute: 520, // 08:40
    referenceReturnMinute: 540,  // 09:00
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-6',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [5], // 금
    defaultDepartureMinute: 520, // 08:40
    referenceReturnMinute: 540,  // 09:00
    stops: [
      { locationId: 'KIS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-7',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [3], // 수
    defaultDepartureMinute: 580, // 09:40
    referenceReturnMinute: 600,  // 10:00
    stops: [
      { locationId: 'SJA_GATE3', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },

  // [하교 - 월/화/목]
  {
    id: 't-a-1',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 4],
    defaultDepartureMinute: 825, // 13:45
    referenceReturnMinute: 840,  // 14:00
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-2',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 4],
    defaultDepartureMinute: 920, // 15:20
    referenceReturnMinute: 940,  // 15:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-3',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [1, 2, 4],
    defaultDepartureMinute: 975, // 16:15
    referenceReturnMinute: 985,  // 16:25 (의도적 시간 역전 보존)
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'NLCS_MAIN', stopOrder: 2, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-4',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [1, 2, 4],
    defaultDepartureMinute: 1035, // 17:15
    referenceReturnMinute: 1060,  // 17:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'BHA_GATE1', stopOrder: 2, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },

  // [하교 - 수/금]
  {
    id: 't-a-5',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [3], // 수
    defaultDepartureMinute: 825, // 13:45
    referenceReturnMinute: 840,  // 14:00
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-6',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [5], // 금
    defaultDepartureMinute: 915, // 15:15
    referenceReturnMinute: 925,  // 15:25
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-7',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [3, 5], // 수, 금
    defaultDepartureMinute: 915, // 15:15
    referenceReturnMinute: 945,  // 15:45
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'NLCS_MAIN', stopOrder: 2, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-8',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [3, 5], // 수, 금
    defaultDepartureMinute: 980, // 16:20
    referenceReturnMinute: 1000, // 16:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-9',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [3, 5], // 수, 금
    defaultDepartureMinute: 1035, // 17:15
    referenceReturnMinute: 1060,  // 17:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 },
      { locationId: 'BHA_GATE1', stopOrder: 2, dwellMinutesOverride: 1 },
    ],
    effectiveFrom: '2024-03-01',
  },
];

// 일자별 학생 스케줄 동적 생성 헬퍼
export function generateStudentSchedulesForDate(
  students: Student[],
  dateStr: string
): StudentSchedule[] {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  let weekday = dateObj.getDay();
  if (weekday === 0) weekday = 7; // 1:월 ~ 7:일

  const result: StudentSchedule[] = [];
  students.forEach((st) => {
    const ws = st.weeklySchedule?.[weekday];
    if (!ws || !ws.active) return;

    if (ws.morningActive) {
      let assignedMinute = ws.morningMinute;
      // 1호차 기본 등교(07:30 단지 출발) 및 2호차(08:20 단지 출발) 차량 도착시간 자동 연동
      if (ws.morningMinute <= 490) { // 08:10 이하 정규 등교
        if (st.schoolId === 'NLCS') assignedMinute = 460; // 07:40
        else if (st.schoolId === 'BHA') assignedMinute = 465; // 07:45
        else if (st.schoolId === 'KIS') assignedMinute = 470; // 07:50
        else if (st.schoolId === 'SJA') assignedMinute = 474; // 07:54
        else if (st.schoolId === 'CHEONG') assignedMinute = 505; // 08:25 (2호차)
      }

      result.push({
        id: `sc-${st.id}-${dateStr}-m`,
        studentId: st.id,
        schoolId: st.schoolId,
        date: dateStr,
        type: 'MORNING',
        requestedMinute: ws.morningMinute, // 학부모 희망 도착시간 (예: 07:50)
        assignedMinute: assignedMinute,    // 실제 차량 배정 도착시간 (예: BHA 07:45, NLCS 07:40)
        calculatedMinute: assignedMinute,
        dwellMinutes: 1,
        alternateMinutes: undefined,
        selectedAlternateIndex: ws.selectedAlternateIndex,
        notes: ws.notes || st.notes,
      });
    }

    if (ws.afternoonActive) {
      result.push({
        id: `sc-${st.id}-${dateStr}-a`,
        studentId: st.id,
        schoolId: st.schoolId,
        date: dateStr,
        type: 'AFTERNOON',
        requestedMinute: ws.afternoonMinute,
        assignedMinute: ws.afternoonMinute,
        calculatedMinute: ws.afternoonMinute,
        dwellMinutes: 1,
        alternateMinutes: ws.alternateMinutes,
        selectedAlternateIndex: ws.selectedAlternateIndex,
        notes: ws.notes || st.notes,
      });
    }
  });

  return result;
}

// 초기 일별 스케줄 자동 생성 (기준 주간: 2024-10-28(월) ~ 2024-11-01(금))
export const INITIAL_STUDENT_SCHEDULES: StudentSchedule[] = [
  ...generateStudentSchedulesForDate(INITIAL_STUDENTS, '2024-10-28'),
  ...generateStudentSchedulesForDate(INITIAL_STUDENTS, '2024-10-29'),
  ...generateStudentSchedulesForDate(INITIAL_STUDENTS, '2024-10-30'),
  ...generateStudentSchedulesForDate(INITIAL_STUDENTS, '2024-10-31'),
  ...generateStudentSchedulesForDate(INITIAL_STUDENTS, '2024-11-01'),
];

export const INITIAL_HOLIDAYS: SchoolHoliday[] = [
  {
    id: 'h-1',
    schoolId: 'BHA',
    startDate: '2024-10-21',
    endDate: '2024-10-25',
    name: 'BHA 가을방학 (Fall Break)',
    type: 'vacation',
  },
  {
    id: 'h-2',
    schoolId: 'NLCS',
    startDate: '2024-12-20',
    endDate: '2025-01-10',
    name: 'NLCS 겨울방학',
    type: 'vacation',
  },
  {
    id: 'h-3',
    schoolId: 'SJA',
    startDate: '2024-11-18',
    endDate: '2024-11-22',
    name: 'SJA 추수감사 방학',
    type: 'vacation',
  },
];
