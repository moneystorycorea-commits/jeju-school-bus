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
    id: 'CHEONG',
    name: '저청초등학교',
    shortName: '저청초',
    color: '#0e7490',
    badgeBg: 'bg-teal-50 text-teal-950 border-teal-300 font-extrabold',
    badgeText: 'text-teal-900',
    defaultLocationId: 'CHEONG_MAIN',
    defaultDwellMinutes: 1,
  },
  {
    id: 'CHEONG_MID',
    name: '저청중학교',
    shortName: '저청중',
    color: '#0369a1',
    badgeBg: 'bg-cyan-50 text-cyan-950 border-cyan-300 font-extrabold',
    badgeText: 'text-cyan-900',
    defaultLocationId: 'CHEONG_MAIN',
    defaultDwellMinutes: 1,
  },
  {
    id: 'NLCS',
    name: 'North London Collegiate School Jeju',
    shortName: 'NLCS',
    color: '#2E5880', // NLCS 첨부 이미지 정확한 하늘/슬레이트 블루 (#2E5880)
    badgeBg: 'bg-sky-50 text-[#1E3A56] border-[#2E5880]/40 font-extrabold',
    badgeText: 'text-[#2E5880]',
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
  {
    id: 'CHEONG_MID_MAIN',
    name: '저청중 정문',
    shortName: '저청중',
    type: 'school_gate',
    schoolId: 'CHEONG_MID',
  },
];

export const INITIAL_ROUTE_SEGMENTS: RouteSegment[] = [
  // [1호차 전담 구간 - NLCS, 저청초, 저청중]
  { id: 'rs-comp-nlcs', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'NLCS_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-comp', originLocationId: 'NLCS_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-comp-cheong', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'CHEONG_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-comp', originLocationId: 'CHEONG_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-comp-cheong-mid', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'CHEONG_MID_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-mid-comp', originLocationId: 'CHEONG_MID_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 5, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-cheong-mid', originLocationId: 'CHEONG_MAIN', destinationLocationId: 'CHEONG_MID_MAIN', travelMinutes: 2, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-mid-cheong', originLocationId: 'CHEONG_MID_MAIN', destinationLocationId: 'CHEONG_MAIN', travelMinutes: 2, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-nlcs-cheong', originLocationId: 'NLCS_MAIN', destinationLocationId: 'CHEONG_MAIN', travelMinutes: 7, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-cheong-nlcs', originLocationId: 'CHEONG_MAIN', destinationLocationId: 'NLCS_MAIN', travelMinutes: 7, bufferMinutes: 0, profile: 'normal' },

  // [2호차 전담 구간 - BHA, SJA, KIS]
  { id: 'rs-comp-bha', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'BHA_GATE1', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-bha-sja', originLocationId: 'BHA_GATE1', destinationLocationId: 'SJA_GATE3', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-sja-kis', originLocationId: 'SJA_GATE3', destinationLocationId: 'KIS_MAIN', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-kis-comp', originLocationId: 'KIS_MAIN', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 15, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-bha-comp', originLocationId: 'BHA_GATE1', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-sja-comp', originLocationId: 'SJA_GATE3', destinationLocationId: 'COMPLEX_MAIN', travelMinutes: 15, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-bha-kis', originLocationId: 'BHA_GATE1', destinationLocationId: 'KIS_MAIN', travelMinutes: 6, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-kis-bha', originLocationId: 'KIS_MAIN', destinationLocationId: 'BHA_GATE1', travelMinutes: 6, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-sja-bha', originLocationId: 'SJA_GATE3', destinationLocationId: 'BHA_GATE1', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-kis-sja', originLocationId: 'KIS_MAIN', destinationLocationId: 'SJA_GATE3', travelMinutes: 4, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-comp-sja', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'SJA_GATE3', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
  { id: 'rs-comp-kis', originLocationId: 'COMPLEX_MAIN', destinationLocationId: 'KIS_MAIN', travelMinutes: 10, bufferMinutes: 0, profile: 'normal' },
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
    grade: 'G10',
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
    grade: 'G9',
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
    grade: 'G9',
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
    grade: 'G7',
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
    grade: 'G7',
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
    grade: 'G10',
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
    grade: 'G9',
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
    grade: 'G5',
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
    grade: 'G5',
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
    grade: 'G4',
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
    grade: 'G2',
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
    grade: 'G4',
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

// 1호차 / 2호차 공식 운행 템플릿 (잠정 시간표 반영)
// 1호차 전담: NLCS, 저청초, 저청중
// 2호차 전담: BHA, SJA, KIS
export const INITIAL_TRIP_TEMPLATES: TripTemplate[] = [
  // [등교 - 1호차: NLCS & 저청]
  {
    id: 't-m-1',
    vehicleId: 'v1',
    type: 'MORNING',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 460, // 07:40
    referenceReturnMinute: 480,  // 08:00
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 07:50 도착
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-2',
    vehicleId: 'v1',
    type: 'MORNING',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 500, // 08:20
    referenceReturnMinute: 510,  // 08:30
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 08:25 도착
    ],
    effectiveFrom: '2024-03-01',
  },

  // [등교 - 2호차: BHA, SJA, KIS]
  {
    id: 't-m-3',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 460, // 07:40
    referenceReturnMinute: 495,  // 08:15 (KIS 08:00 + 15분 복귀)
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 07:50 도착
      { locationId: 'SJA_GATE3', stopOrder: 2, dwellMinutesOverride: 1 }, // 07:55 도착
      { locationId: 'KIS_MAIN', stopOrder: 3, dwellMinutesOverride: 1 },  // 08:00 도착
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-4',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [3], // 수요일
    defaultDepartureMinute: 520, // 08:40
    referenceReturnMinute: 540,  // 09:00
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 08:50 도착
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-5',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [5], // 금요일
    defaultDepartureMinute: 520, // 08:40
    referenceReturnMinute: 540,  // 09:00
    stops: [
      { locationId: 'KIS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 08:50 도착
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-m-6',
    vehicleId: 'v2',
    type: 'MORNING',
    weekdays: [3], // 수요일
    defaultDepartureMinute: 590, // 09:50
    referenceReturnMinute: 610,  // 10:10
    stops: [
      { locationId: 'SJA_GATE3', stopOrder: 1, dwellMinutesOverride: 1 }, // 10:00 도착
    ],
    effectiveFrom: '2024-03-01',
  },

  // [하교 - 1호차: 저청 & NLCS]
  {
    id: 't-a-1',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 3, 4], // 월~목 (금요일은 2호차 t-a-5 15:20 귀원으로 분리)
    defaultDepartureMinute: 825, // 13:45
    referenceReturnMinute: 835,  // 13:55
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 13:50 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-2',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 920, // 15:20
    referenceReturnMinute: 940,  // 15:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 15:30 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-3',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 980, // 16:20
    referenceReturnMinute: 1000, // 16:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 16:30 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-4',
    vehicleId: 'v1',
    type: 'AFTERNOON',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 1040, // 17:20
    referenceReturnMinute: 1060,  // 17:40
    stops: [
      { locationId: 'NLCS_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 17:30 픽업
    ],
    effectiveFrom: '2024-03-01',
  },

  // [하교 - 2호차: BHA & 저청(금)]
  {
    id: 't-a-5',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [5], // 금
    defaultDepartureMinute: 910, // 15:10
    referenceReturnMinute: 920,  // 15:20
    stops: [
      { locationId: 'CHEONG_MAIN', stopOrder: 1, dwellMinutesOverride: 1 }, // 15:15 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-6',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [3, 5], // 수, 금
    defaultDepartureMinute: 920, // 15:20
    referenceReturnMinute: 940,  // 15:40
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 15:30 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-7',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [1, 4], // 월, 목
    defaultDepartureMinute: 950, // 15:50
    referenceReturnMinute: 970,  // 16:10
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 16:00 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-8',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [2], // 화
    defaultDepartureMinute: 980, // 16:20
    referenceReturnMinute: 1000, // 16:40
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 16:30 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-9',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [2, 3, 5], // 화, 수, 금
    defaultDepartureMinute: 1010, // 16:50
    referenceReturnMinute: 1030,  // 17:10
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 17:00 픽업
    ],
    effectiveFrom: '2024-03-01',
  },
  {
    id: 't-a-10',
    vehicleId: 'v2',
    type: 'AFTERNOON',
    weekdays: [1, 2, 3, 4, 5], // 월~금
    defaultDepartureMinute: 1040, // 17:20
    referenceReturnMinute: 1060,  // 17:40
    stops: [
      { locationId: 'BHA_GATE1', stopOrder: 1, dwellMinutesOverride: 1 }, // 17:30 픽업
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
      // 1호차: NLCS (07:40 단지출발 -> 07:50 도착), 저청 (08:20 단지출발 -> 08:25 도착)
      // 2호차: 단지 07:40 출발 -> BHA 07:50, SJA 07:55, KIS 08:00 도착
      if (ws.morningMinute <= 510) { // 정규 등교
        if (st.schoolId === 'NLCS') assignedMinute = 470; // 07:50 (1호차)
        else if (st.schoolId === 'BHA') assignedMinute = 470; // 07:50 (2호차)
        else if (st.schoolId === 'SJA') assignedMinute = 475; // 07:55 (2호차)
        else if (st.schoolId === 'KIS') assignedMinute = 480; // 08:00 (2호차)
        else if (st.schoolId === 'CHEONG' || st.schoolId === 'CHEONG_MID') assignedMinute = 505; // 08:25 (1호차)
      }

      result.push({
        id: `sc-${st.id}-${dateStr}-m`,
        studentId: st.id,
        schoolId: st.schoolId,
        date: dateStr,
        type: 'MORNING',
        requestedMinute: ws.morningMinute, // 학부모 희망 도착시간 (예: 08:00)
        assignedMinute: assignedMinute,    // 실제 차량 배정 도착시간 (예: BHA 07:50, NLCS 07:50)
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
  // ==========================================
  // [2026-2027 NLCS Jeju 공식 학사일정]
  // ==========================================
  {
    id: 'nlcs-26-01',
    schoolId: 'NLCS',
    startDate: '2026-08-17',
    endDate: '2026-08-18',
    name: 'NLCS 교사연수 휴교 (INSET Day)',
    type: 'school_closed',
    category: 'inset',
    notes: 'School closed for teacher training',
  },
  {
    id: 'nlcs-26-02',
    schoolId: 'NLCS',
    startDate: '2026-08-20',
    endDate: '2026-08-20',
    name: 'NLCS 1학기 개학일 (Start of Academic Year)',
    type: 'school_event',
    category: 'term_date',
    notes: '신입생 인덕션 8/19, 전교생 개학 8/20',
  },
  {
    id: 'nlcs-26-03',
    schoolId: 'NLCS',
    startDate: '2026-09-19',
    endDate: '2026-09-27',
    name: 'NLCS 추석 방학 (Chuseok Break)',
    type: 'vacation',
    category: 'break',
    notes: '추석 연휴 전교 휴교',
  },
  {
    id: 'nlcs-26-04',
    schoolId: 'NLCS',
    startDate: '2026-10-24',
    endDate: '2026-11-01',
    name: 'NLCS 가을방학 (Fall Half-Term Break)',
    type: 'vacation',
    category: 'break',
    notes: '하프텀 가을 방학',
  },
  {
    id: 'nlcs-26-05',
    schoolId: 'NLCS',
    startDate: '2026-11-09',
    endDate: '2026-11-09',
    name: 'NLCS 교사연수 휴교 (INSET Day)',
    type: 'school_closed',
    category: 'inset',
    notes: '교사 연수로 인한 학생 휴교',
  },
  {
    id: 'nlcs-26-06',
    schoolId: 'NLCS',
    startDate: '2026-12-12',
    endDate: '2027-01-10',
    name: 'NLCS 겨울방학 (Winter Break)',
    type: 'vacation',
    category: 'break',
    notes: '겨울 정규 방학',
  },
  {
    id: 'nlcs-26-07',
    schoolId: 'NLCS',
    startDate: '2027-01-11',
    endDate: '2027-01-11',
    name: 'NLCS 2학기 개학 (Term 2 Resumes)',
    type: 'school_event',
    category: 'term_date',
    notes: '겨울방학 종료 및 2학기 수업 시작',
  },
  {
    id: 'nlcs-26-08',
    schoolId: 'NLCS',
    startDate: '2027-02-05',
    endDate: '2027-02-05',
    name: 'NLCS 교사연수 휴교 (INSET Day)',
    type: 'school_closed',
    category: 'inset',
    notes: '설날 연휴 직전 교사 연수 휴교',
  },
  {
    id: 'nlcs-26-09',
    schoolId: 'NLCS',
    startDate: '2027-02-06',
    endDate: '2027-02-14',
    name: 'NLCS 설날 방학 (Seollal Break)',
    type: 'vacation',
    category: 'break',
    notes: '구정 설 연휴 방학',
  },
  {
    id: 'nlcs-26-10',
    schoolId: 'NLCS',
    startDate: '2027-03-19',
    endDate: '2027-03-19',
    name: 'NLCS 개교기념일 (Founders Day)',
    type: 'school_event',
    category: 'term_date',
    notes: '개교기념 행사',
  },
  {
    id: 'nlcs-26-11',
    schoolId: 'NLCS',
    startDate: '2027-03-20',
    endDate: '2027-04-04',
    name: 'NLCS 봄방학 (Spring Break)',
    type: 'vacation',
    category: 'break',
    notes: '봄 정규 방학 (3주간)',
  },
  {
    id: 'nlcs-26-12',
    schoolId: 'NLCS',
    startDate: '2027-04-05',
    endDate: '2027-04-05',
    name: 'NLCS 3학기 개학 (Term 3 Resumes)',
    type: 'school_event',
    category: 'term_date',
    notes: '봄방학 종료 및 3학기 수업 시작',
  },
  {
    id: 'nlcs-26-13',
    schoolId: 'NLCS',
    startDate: '2027-06-18',
    endDate: '2027-06-18',
    name: 'NLCS 종업식 (Last Day of School)',
    type: 'school_event',
    category: 'term_date',
    notes: '2026-2027 학년도 종업식 및 여름방학 돌입',
  },

  // ==========================================
  // [2026-2027 BHA (Branksome Hall Asia) 공식 학사일정]
  // ==========================================
  {
    id: 'bha-26-01',
    schoolId: 'BHA',
    startDate: '2026-08-04',
    endDate: '2026-08-04',
    name: 'BHA 1학기 개학일 (First Day of School)',
    type: 'school_event',
    category: 'term_date',
    notes: '8/2 신입 기숙사, 8/3 재학생 기숙사, 8/4 첫 수업일',
  },
  {
    id: 'bha-26-02',
    schoolId: 'BHA',
    startDate: '2026-08-17',
    endDate: '2026-08-17',
    name: 'BHA 광복절 대체휴일 휴교',
    type: 'school_closed',
    category: 'holiday',
    notes: '광복절(8/15 토) 대체공휴일 휴교',
  },
  {
    id: 'bha-26-03',
    schoolId: 'BHA',
    startDate: '2026-09-19',
    endDate: '2026-09-29',
    name: 'BHA 추석 방학 (Chuseok Break)',
    type: 'vacation',
    category: 'break',
    notes: '9/19~9/29 방학 (9/29 기숙사 복귀, 9/30 수업 재개)',
  },
  {
    id: 'bha-26-04',
    schoolId: 'BHA',
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    name: 'BHA 한글날 휴교 (Hangul Day)',
    type: 'school_closed',
    category: 'holiday',
    notes: '공휴일 휴교',
  },
  {
    id: 'bha-26-05',
    schoolId: 'BHA',
    startDate: '2026-10-31',
    endDate: '2026-11-08',
    name: 'BHA 가을방학 (Fall Break)',
    type: 'vacation',
    category: 'break',
    notes: '가을 정규 방학 (11/8 기숙사 복귀, 11/9 등교)',
  },
  {
    id: 'bha-26-06',
    schoolId: 'BHA',
    startDate: '2026-12-12',
    endDate: '2027-01-03',
    name: 'BHA 12월/겨울방학 (December Break)',
    type: 'vacation',
    category: 'break',
    notes: '12/12~1/3 방학 (1/3 기숙사 복귀, 1/4 수업 재개)',
  },
  {
    id: 'bha-26-07',
    schoolId: 'BHA',
    startDate: '2027-01-18',
    endDate: '2027-01-18',
    name: 'BHA 2학기 시작 (Semester 2 Starts)',
    type: 'school_event',
    category: 'term_date',
    notes: '2학기 정식 시작일',
  },
  {
    id: 'bha-26-08',
    schoolId: 'BHA',
    startDate: '2027-02-04',
    endDate: '2027-02-14',
    name: 'BHA 설날 방학 (Lunar New Year Break)',
    type: 'vacation',
    category: 'break',
    notes: '2/4~2/14 방학 (2/14 기숙사 복귀, 2/15 등교)',
  },
  {
    id: 'bha-26-09',
    schoolId: 'BHA',
    startDate: '2027-03-01',
    endDate: '2027-03-01',
    name: 'BHA 3·1절 휴교 (Independence Movement Day)',
    type: 'school_closed',
    category: 'holiday',
    notes: '법정 공휴일 휴교',
  },
  {
    id: 'bha-26-10',
    schoolId: 'BHA',
    startDate: '2027-04-03',
    endDate: '2027-04-11',
    name: 'BHA 봄방학 (Spring Break)',
    type: 'vacation',
    category: 'break',
    notes: '봄 정규 방학 (4/11 기숙사 복귀, 4/12 등교)',
  },
  {
    id: 'bha-26-11',
    schoolId: 'BHA',
    startDate: '2027-05-05',
    endDate: '2027-05-05',
    name: 'BHA 어린이날 휴교 (Children’s Day)',
    type: 'school_closed',
    category: 'holiday',
    notes: '공휴일 휴교',
  },
  {
    id: 'bha-26-12',
    schoolId: 'BHA',
    startDate: '2027-05-13',
    endDate: '2027-05-13',
    name: 'BHA 부처님오신날 휴교 (Buddha’s Birthday)',
    type: 'school_closed',
    category: 'holiday',
    notes: '공휴일 휴교',
  },
  {
    id: 'bha-26-13',
    schoolId: 'BHA',
    startDate: '2027-05-22',
    endDate: '2027-05-22',
    name: 'BHA 졸업식 (Graduation)',
    type: 'school_event',
    category: 'term_date',
    notes: '졸업식 행사',
  },
  {
    id: 'bha-26-14',
    schoolId: 'BHA',
    startDate: '2027-06-04',
    endDate: '2027-06-04',
    name: 'BHA 종업식 (Student Last Day)',
    type: 'school_event',
    category: 'term_date',
    notes: '2026-2027 학년도 마지막 수업일 / 여름방학 돌입',
  },

  // ==========================================
  // [2026-2027 KIS Jeju 공식 학사일정]
  // ==========================================
  {
    id: 'kis-26-01',
    schoolId: 'KIS',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    name: 'KIS 1학기 개학일 (First Day of School)',
    type: 'school_event',
    category: 'term_date',
    notes: '8/9 기숙사 입소, 8/10 첫 등교일',
  },
  {
    id: 'kis-26-02',
    schoolId: 'KIS',
    startDate: '2026-08-17',
    endDate: '2026-08-17',
    name: 'KIS 광복절 대체휴일 휴교 (Liberation Day Observed)',
    type: 'school_closed',
    category: 'holiday',
    notes: 'No School',
  },
  {
    id: 'kis-26-03',
    schoolId: 'KIS',
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교 (교사 연수)',
  },
  {
    id: 'kis-26-04',
    schoolId: 'KIS',
    startDate: '2026-09-19',
    endDate: '2026-09-28',
    name: 'KIS 추석 연휴 및 PD Day (Chuseok & PD Day)',
    type: 'vacation',
    category: 'break',
    notes: '9/19~9/27 추석연휴 + 9/28 교사연수 휴교 (9/29 등교)',
  },
  {
    id: 'kis-26-05',
    schoolId: 'KIS',
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    name: 'KIS 한글날 휴교 (Hangul Day)',
    type: 'school_closed',
    category: 'holiday',
    notes: 'No School',
  },
  {
    id: 'kis-26-06',
    schoolId: 'KIS',
    startDate: '2026-10-16',
    endDate: '2026-10-16',
    name: 'KIS 1분기 조기하교 (End of Q1 Early Dismissal)',
    type: 'school_event',
    category: 'term_date',
    notes: '1분기 종료 학생 조기 하교',
  },
  {
    id: 'kis-26-07',
    schoolId: 'KIS',
    startDate: '2026-10-30',
    endDate: '2026-10-30',
    name: 'KIS 가을축제 및 10시 등교 (Fall Festival / Late Start)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교 / 교사연수',
  },
  {
    id: 'kis-26-08',
    schoolId: 'KIS',
    startDate: '2026-10-31',
    endDate: '2026-11-09',
    name: 'KIS 가을방학 및 PD Day (Fall Break & PD Day)',
    type: 'vacation',
    category: 'break',
    notes: '10/31~11/8 가을방학 + 11/9 교사연수 휴교 (11/10 등교)',
  },
  {
    id: 'kis-26-09',
    schoolId: 'KIS',
    startDate: '2026-11-27',
    endDate: '2026-11-27',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-10',
    schoolId: 'KIS',
    startDate: '2026-12-18',
    endDate: '2026-12-18',
    name: 'KIS 1학기 종강 조기하교 (Last Day of Sem 1)',
    type: 'school_event',
    category: 'term_date',
    notes: '1학기 마지막 날 조기 하교',
  },
  {
    id: 'kis-26-11',
    schoolId: 'KIS',
    startDate: '2026-12-19',
    endDate: '2027-01-10',
    name: 'KIS 겨울방학 (Winter Break)',
    type: 'vacation',
    category: 'break',
    notes: '겨울 정규 방학 (No School)',
  },
  {
    id: 'kis-26-12',
    schoolId: 'KIS',
    startDate: '2027-01-11',
    endDate: '2027-01-11',
    name: 'KIS 2학기 개학 (Start of Sem 2 - Late Start 10AM)',
    type: 'school_event',
    category: 'term_date',
    notes: '2학기 첫날 10시 늦은 등교',
  },
  {
    id: 'kis-26-13',
    schoolId: 'KIS',
    startDate: '2027-01-18',
    endDate: '2027-01-18',
    name: 'KIS 마틴 루터 킹의 날 휴교 (MLK Day Observed)',
    type: 'school_closed',
    category: 'holiday',
    notes: 'No School',
  },
  {
    id: 'kis-26-14',
    schoolId: 'KIS',
    startDate: '2027-01-29',
    endDate: '2027-01-29',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-15',
    schoolId: 'KIS',
    startDate: '2027-02-06',
    endDate: '2027-02-14',
    name: 'KIS 설날 방학 (Lunar New Year Break)',
    type: 'vacation',
    category: 'break',
    notes: '구정 설 연휴 방학 (No School)',
  },
  {
    id: 'kis-26-16',
    schoolId: 'KIS',
    startDate: '2027-02-26',
    endDate: '2027-02-26',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-17',
    schoolId: 'KIS',
    startDate: '2027-03-01',
    endDate: '2027-03-01',
    name: 'KIS 3·1절 휴교 (Independence Day)',
    type: 'school_closed',
    category: 'holiday',
    notes: 'No School',
  },
  {
    id: 'kis-26-18',
    schoolId: 'KIS',
    startDate: '2027-03-02',
    endDate: '2027-03-02',
    name: 'KIS 교사연수일 휴교 (PD Day - No Students)',
    type: 'school_closed',
    category: 'inset',
    notes: '학생 휴교',
  },
  {
    id: 'kis-26-19',
    schoolId: 'KIS',
    startDate: '2027-03-19',
    endDate: '2027-03-19',
    name: 'KIS 3분기 조기하교 (End of Q3 Early Dismissal)',
    type: 'school_event',
    category: 'term_date',
    notes: '학생 조기 하교',
  },
  {
    id: 'kis-26-20',
    schoolId: 'KIS',
    startDate: '2027-03-26',
    endDate: '2027-03-26',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-21',
    schoolId: 'KIS',
    startDate: '2027-04-03',
    endDate: '2027-04-11',
    name: 'KIS 봄방학 (Spring Break)',
    type: 'vacation',
    category: 'break',
    notes: '봄 정규 방학 (No School)',
  },
  {
    id: 'kis-26-22',
    schoolId: 'KIS',
    startDate: '2027-04-30',
    endDate: '2027-04-30',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-23',
    schoolId: 'KIS',
    startDate: '2027-05-03',
    endDate: '2027-05-03',
    name: 'KIS 근로자의 날 대체휴교 (Labor Day Observed)',
    type: 'school_closed',
    category: 'holiday',
    notes: 'No School except AP testing students',
  },
  {
    id: 'kis-26-24',
    schoolId: 'KIS',
    startDate: '2027-05-22',
    endDate: '2027-05-22',
    name: 'KIS 고교 졸업식 (High School Graduation)',
    type: 'school_event',
    category: 'term_date',
    notes: '교원 근무일',
  },
  {
    id: 'kis-26-25',
    schoolId: 'KIS',
    startDate: '2027-05-28',
    endDate: '2027-05-28',
    name: 'KIS 10시 늦은 등교 (Late Start 10AM / Faculty PD)',
    type: 'school_event',
    category: 'inset',
    notes: '오전 10시 등교',
  },
  {
    id: 'kis-26-26',
    schoolId: 'KIS',
    startDate: '2027-06-11',
    endDate: '2027-06-11',
    name: 'KIS 종업식 (Last Day of School - Early Dismissal)',
    type: 'school_event',
    category: 'term_date',
    notes: '종업식 조기하교 및 여름방학 돌입',
  },

  // ==========================================
  // [2026-2027 SJA (St. Johnsbury Academy Jeju) 공식 학사일정]
  // ==========================================
  {
    id: 'sja-26-01',
    schoolId: 'SJA',
    startDate: '2026-08-05',
    endDate: '2026-08-08',
    name: 'SJA 교사 직무연수 (All Faculty In-Service PD)',
    type: 'school_closed',
    category: 'inset',
    notes: '개학 준비 교사 직무연수',
  },
  {
    id: 'sja-26-02',
    schoolId: 'SJA',
    startDate: '2026-08-10',
    endDate: '2026-08-10',
    name: 'SJA 1학기 개학일 (First Day of School)',
    type: 'school_event',
    category: 'term_date',
    notes: 'Special Schedule 1학기 수업 시작',
  },
  {
    id: 'sja-26-03',
    schoolId: 'SJA',
    startDate: '2026-08-12',
    endDate: '2026-08-12',
    name: 'SJA 수요일 10:15 늦은 등교 시작 (Late Start Begins)',
    type: 'school_event',
    category: 'term_date',
    notes: '매주 수요일 10:15 등교 시작',
  },
  {
    id: 'sja-26-04',
    schoolId: 'SJA',
    startDate: '2026-09-19',
    endDate: '2026-09-27',
    name: 'SJA 추석 연휴 방학 (Chuseok Holiday)',
    type: 'vacation',
    category: 'break',
    notes: '추석 명절 전교 휴교',
  },
  {
    id: 'sja-26-05',
    schoolId: 'SJA',
    startDate: '2026-10-19',
    endDate: '2026-10-19',
    name: 'SJA 가을 학부모 상담일 휴교 (Parent Teacher Conf)',
    type: 'school_closed',
    category: 'inset',
    notes: '초/중/고 학부모 상담 학생 휴교',
  },
  {
    id: 'sja-26-06',
    schoolId: 'SJA',
    startDate: '2026-10-31',
    endDate: '2026-11-08',
    name: 'SJA 가을방학 (Fall Break)',
    type: 'vacation',
    category: 'break',
    notes: '가을 정규 방학',
  },
  {
    id: 'sja-26-07',
    schoolId: 'SJA',
    startDate: '2026-12-19',
    endDate: '2027-01-10',
    name: 'SJA 겨울방학 (Winter Break)',
    type: 'vacation',
    category: 'break',
    notes: '겨울 정규 방학',
  },
  {
    id: 'sja-26-08',
    schoolId: 'SJA',
    startDate: '2027-01-15',
    endDate: '2027-01-15',
    name: 'SJA 1학기 종료 (End of Semester 1)',
    type: 'school_event',
    category: 'term_date',
    notes: '1학기 학사 마감',
  },
  {
    id: 'sja-26-09',
    schoolId: 'SJA',
    startDate: '2027-01-18',
    endDate: '2027-01-18',
    name: 'SJA 2학기 개학 (Start of Semester 2)',
    type: 'school_event',
    category: 'term_date',
    notes: '2학기 수업 시작',
  },
  {
    id: 'sja-26-10',
    schoolId: 'SJA',
    startDate: '2027-02-06',
    endDate: '2027-02-14',
    name: 'SJA 설날 방학 (Seollal Break)',
    type: 'vacation',
    category: 'break',
    notes: '설 명절 방학',
  },
  {
    id: 'sja-26-11',
    schoolId: 'SJA',
    startDate: '2027-03-20',
    endDate: '2027-03-28',
    name: 'SJA 3월 봄방학 (March Break)',
    type: 'vacation',
    category: 'break',
    notes: '3월 봄방학',
  },
  {
    id: 'sja-26-12',
    schoolId: 'SJA',
    startDate: '2027-04-09',
    endDate: '2027-04-09',
    name: 'SJA 봄 학부모 상담일 휴교 (Parent Teacher Conf)',
    type: 'school_closed',
    category: 'inset',
    notes: '학부모 상담 학생 휴교',
  },
  {
    id: 'sja-26-13',
    schoolId: 'SJA',
    startDate: '2027-04-24',
    endDate: '2027-05-01',
    name: 'SJA 스프링 브레이크 (Spring Break)',
    type: 'vacation',
    category: 'break',
    notes: '4월 말 스프링 브레이크',
  },
  {
    id: 'sja-26-14',
    schoolId: 'SJA',
    startDate: '2027-05-29',
    endDate: '2027-05-29',
    name: 'SJA 졸업식 (Graduation Day)',
    type: 'school_event',
    category: 'term_date',
    notes: '졸업식 행사',
  },
  {
    id: 'sja-26-15',
    schoolId: 'SJA',
    startDate: '2027-06-11',
    endDate: '2027-06-11',
    name: 'SJA 종업식 (Last Day of School - Half Day)',
    type: 'school_event',
    category: 'term_date',
    notes: '반일 수업 후 여름방학 돌입',
  },
];

