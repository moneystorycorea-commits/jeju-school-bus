// 분 단위 정수 (00:00 = 0, 07:30 = 450, 24:00 = 1440)
export type MinuteOfDay = number;

export type UserRole = 'admin' | 'guardian' | 'student';

export type ScheduleType = 'MORNING' | 'AFTERNOON';

export type ConflictLevel = 'error' | 'warning' | 'info';

export type ConflictType =
  | 'ROUTE_INFEASIBLE'
  | 'VEHICLE_OVERLAP'
  | 'NEXT_TRIP_CONFLICT'
  | 'INVALID_TIME_SEQUENCE'
  | 'SCHOOL_HOLIDAY'
  | 'STUDENT_DUPLICATE'
  | 'MISSING_ROUTE_SEGMENT';

export interface Conflict {
  id: string;
  type: ConflictType;
  level: ConflictLevel;
  message: string;
  tripId?: string;
  studentId?: string;
  schoolId?: string;
  details?: {
    requiredMinutes?: number;
    availableMinutes?: number;
    diffMinutes?: number;
  };
}

// 요일별 등/하교 희망시간 (1:월 ~ 5:금)
export interface WeekdayTimeSchedule {
  weekday: number; // 1:월, 2:화, 3:수, 4:목, 5:금
  morningMinute: MinuteOfDay;   // 등교 희망시간 (기본 07:40 = 460)
  afternoonMinute: MinuteOfDay; // 하교 희망시간 (기본 15:30 = 930)
  morningActive: boolean;       // 등교 셔틀 이용 여부 (false시 등교 미이용)
  afternoonActive: boolean;     // 하교 셔틀 이용 여부 (false시 하교 미이용)
  active: boolean;              // 통학 여부
  notes?: string;               // 요일별 비고 (예: '격주 4시, 5시15분')
  alternateMinutes?: MinuteOfDay[]; // 예: [960, 1035] (4시 또는 5시15분 옵션)
  selectedAlternateIndex?: number; // 선택된 옵션 인덱스 (0: 4시, 1: 5시15분)
}

export type StudentWeeklySchedule = Record<number, WeekdayTimeSchedule>;

// 학생 기본 정보 (공개 가능 범위)
export interface Student {
  id: string;
  name: string;
  building: string;           // 예: '106동'
  unit: string;               // 예: '301호'
  schoolId: string;           // 'NLCS' | 'BHA' | 'KIS' | 'SJA' | 'CHEONG'
  grade: string;              // 예: '중학교 2학년'
  sortOrder: number;          // 학생 순서 드래그 정렬용
  active: boolean;
  gender?: '여' | '남' | '';
  notes?: string;             // 비고 (예: '하교는 학원 때문에 셔틀 미활용')
  gate?: string;              // 정차 게이트 (예: '주니어게이트', 'GATE 1')
  weeklySchedule?: StudentWeeklySchedule; // 요일별 등/하교 희망시간 맵
}

// 학생 민감 정보 (Admin만 열람 가능, Supabase RLS 연계)
export interface StudentPrivateInfo {
  studentId: string;
  emergencyContact: string;   // 비상연락망
  studentPhone?: string;      // 학생 본인 연락처
  guardianName?: string;      // 보호자 성함
  guardianContact?: string;   // 보호자 연락처
}

// 학교 정보
export interface School {
  id: string;
  name: string;
  shortName: string;
  color: string;              // Primary badge color
  badgeBg: string;            // Tailwind bg class
  badgeText: string;          // Tailwind text class
  defaultLocationId: string;
  defaultDwellMinutes: number;
}

// 정차 위치 (출발지 복합단지 + 학교 게이트 분리)
export type LocationType = 'complex' | 'school_gate';

export interface Location {
  id: string;
  name: string;
  shortName: string;
  type: LocationType;
  schoolId?: string;
}

// 구간 이동 정보 (방향별 독립 소요시간)
export interface RouteSegment {
  id: string;
  originLocationId: string;
  destinationLocationId: string;
  travelMinutes: number;      // 기본 소요시간
  bufferMinutes: number;      // 버퍼 시간 (0분 이상)
  profile: 'normal' | 'rush_hour' | 'rain';
}

// 차량
export interface Vehicle {
  id: string;
  name: string;               // '1호차', '2호차'
  active: boolean;
}

// 운행 템플릿 (반복 운행 규칙 - weekdays는 여기에만 존재)
export interface TripTemplateStop {
  locationId: string;
  stopOrder: number;
  dwellMinutesOverride?: number;
}

export interface TripTemplate {
  id: string;
  vehicleId: string;
  type: ScheduleType;
  weekdays: number[];         // 1:월, 2:화, 3:수, 4:목, 5:금
  defaultDepartureMinute: MinuteOfDay;
  referenceReturnMinute?: MinuteOfDay;
  stops: TripTemplateStop[];
  effectiveFrom: string;      // YYYY-MM-DD
  effectiveTo?: string;
}

// 실제 운행 인스턴스 (특정 일자)
export interface TripStop {
  locationId: string;
  locationName: string;
  arrivalMinute: MinuteOfDay;
  departureMinute: MinuteOfDay;
  dwellMinutes: number;
  order: number;
  referenceArrivalMinute?: MinuteOfDay;
}

export interface TripInstance {
  id: string;
  vehicleId: string;
  templateId: string;
  serviceDate: string;        // YYYY-MM-DD
  type: ScheduleType;
  assignedDepartureMinute: MinuteOfDay;
  referenceDepartureMinute?: MinuteOfDay;
  referenceReturnMinute?: MinuteOfDay;  // 원본의 16:25 의도적 오류 보존
  calculatedReturnMinute?: MinuteOfDay; // 계산 엔진이 산출한 복귀시간
  stops: TripStop[];
  status: 'scheduled' | 'in_transit' | 'completed';
}

// 학생 희망시간 신청 (TimeRequest)
export type TimeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TimeRequest {
  id: string;
  studentId: string;
  serviceDate: string;        // YYYY-MM-DD
  type: ScheduleType;
  requestedMinute: MinuteOfDay;
  status: TimeRequestStatus;
  createdAt: string;
}

// 학생 개별 일별 스케줄 (3종류 시간 분리)
export interface StudentSchedule {
  id: string;
  studentId: string;
  schoolId: string;
  date: string;               // YYYY-MM-DD
  type: ScheduleType;
  requestedMinute: MinuteOfDay;   // 학생/학부모 희망
  assignedMinute: MinuteOfDay;    // 관리자 최종 배정
  calculatedMinute?: MinuteOfDay; // 차량 엔진 계산 가능시간
  tripInstanceId?: string;
  dwellMinutes: number;
  alternateMinutes?: MinuteOfDay[];
  selectedAlternateIndex?: number;
  notes?: string;
}

// 학교 휴일
export interface SchoolHoliday {
  id: string;
  schoolId: string;
  startDate: string;          // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  name: string;
  type: 'vacation' | 'school_closed' | 'school_event' | 'other';
}
