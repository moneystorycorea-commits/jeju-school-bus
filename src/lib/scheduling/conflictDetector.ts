import {
  TripInstance,
  StudentSchedule,
  Student,
  SchoolHoliday,
  Conflict,
  RouteSegment,
} from '@/types';
import { formatMinute } from './time';

/**
 * 7대 유효성 검사 충돌 감지 엔진 (Pure Function)
 */
export function detectAllConflicts(params: {
  tripInstances: TripInstance[];
  schedules: StudentSchedule[];
  students: Student[];
  holidays: SchoolHoliday[];
  segments: RouteSegment[];
  serviceDate: string;
}): Conflict[] {
  const { tripInstances, schedules, students, holidays, segments, serviceDate } = params;
  const conflicts: Conflict[] = [];

  // 1. INVALID_TIME_SEQUENCE 검사
  // 원본 시간표의 단지 도착시간(referenceReturnMinute) 또는 다음 정차지 시간이 이전 정차지 시간보다 이른 경우
  tripInstances.forEach((trip) => {
    // 1-A. 단지 도착 vs 마지막 정차시간 역전 검사 (요구사항 28 & 11번 2호차 16:25 에러)
    if (trip.referenceReturnMinute !== undefined && trip.stops.length > 0) {
      const lastStop = trip.stops[trip.stops.length - 1];
      if (trip.referenceReturnMinute < lastStop.arrivalMinute) {
        conflicts.push({
          id: `invalid-seq-${trip.id}-return`,
          type: 'INVALID_TIME_SEQUENCE',
          level: 'error',
          message: `${trip.vehicleId === 'v1' ? '1호차' : '2호차'} 운행표 오류: 단지 도착(${formatMinute(
            trip.referenceReturnMinute
          )})이 이전 경유지 ${lastStop.locationName} 도착/픽업(${formatMinute(
            lastStop.arrivalMinute
          )})보다 빠릅니다.`,
          tripId: trip.id,
        });
      }
    }

    // 1-B. 정차지 간 시간 역전 검사
    for (let i = 0; i < trip.stops.length - 1; i++) {
      const curr = trip.stops[i];
      const next = trip.stops[i + 1];
      if (next.arrivalMinute < curr.departureMinute) {
        conflicts.push({
          id: `invalid-seq-${trip.id}-${i}`,
          type: 'INVALID_TIME_SEQUENCE',
          level: 'error',
          message: `${trip.vehicleId} 정차지 시간 역전: ${next.locationName}(${formatMinute(
            next.arrivalMinute
          )})이 ${curr.locationName}(${formatMinute(curr.departureMinute)})보다 빠릅니다.`,
          tripId: trip.id,
        });
      }
    }
  });

  // 2. ROUTE_INFEASIBLE 검사 (학생 배정 시간 간 물리적 이동시간 부족 검사)
  // 예: NLCS 07:40 도착(하차1분->07:41 출발), BHA 07:45 도착.
  // 만약 BHA를 07:45보다 일찍(예: 07:43) 설정하거나 최소 이동시간(4분+1분=5분)이 부족할 때 발생
  const sortedSchedules = [...schedules].sort((a, b) => a.assignedMinute - b.assignedMinute);
  for (let i = 0; i < sortedSchedules.length - 1; i++) {
    const s1 = sortedSchedules[i];
    const s2 = sortedSchedules[i + 1];
    
    // 같은 모드(등교/하교)에서 순서가 다른 두 학교
    if (s1.schoolId !== s2.schoolId && s1.type === s2.type) {
      // 학교 간 구간 소요시간 조회 (NLCS_MAIN -> BHA_GATE1 등)
      // 위치 ID 매핑
      const s1LocId = s1.schoolId === 'NLCS' ? 'NLCS_MAIN' : s1.schoolId === 'BHA' ? 'BHA_GATE1' : s1.schoolId === 'KIS' ? 'KIS_MAIN' : 'SJA_GATE3';
      const s2LocId = s2.schoolId === 'NLCS' ? 'NLCS_MAIN' : s2.schoolId === 'BHA' ? 'BHA_GATE1' : s2.schoolId === 'KIS' ? 'KIS_MAIN' : 'SJA_GATE3';
      
      const segment = segments.find(s => s.originLocationId === s1LocId && s.destinationLocationId === s2LocId);
      const minRequiredTravel = segment ? segment.travelMinutes + (segment.bufferMinutes || 0) : 4;
      const minRequiredTotal = minRequiredTravel + s1.dwellMinutes; // 정차 + 이동시간 (예: 1 + 4 = 5분)

      const actualDiff = s2.assignedMinute - s1.assignedMinute;
      if (actualDiff <= minRequiredTotal) {
        conflicts.push({
          id: `infeasible-${s1.studentId}-${s2.studentId}`,
          type: 'ROUTE_INFEASIBLE',
          level: 'error',
          message: `시간 충돌: ${s2.schoolId} 일정이 ${s1.schoolId} 이후 최소 이동시간과 겹칩니다. (최소 ${minRequiredTotal}분 필요)`,
          studentId: s2.studentId,
          schoolId: s2.schoolId,
          details: {
            requiredMinutes: minRequiredTotal,
            availableMinutes: actualDiff,
            diffMinutes: actualDiff - minRequiredTotal,
          }
        });
      }
    }
  }

  // 3. NEXT_TRIP_CONFLICT 및 VEHICLE_OVERLAP 검사
  // 동일 차량의 연속된 Trip 간 시간 충돌 검사
  const tripsByVehicle: Record<string, TripInstance[]> = {};
  tripInstances.forEach((t) => {
    if (!tripsByVehicle[t.vehicleId]) tripsByVehicle[t.vehicleId] = [];
    tripsByVehicle[t.vehicleId].push(t);
  });

  Object.entries(tripsByVehicle).forEach(([vehicleId, vTrips]) => {
    const sorted = [...vTrips].sort((a, b) => a.assignedDepartureMinute - b.assignedDepartureMinute);
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = sorted[i];
      const next = sorted[i + 1];
      const currReturn = curr.calculatedReturnMinute ?? curr.referenceReturnMinute ?? curr.assignedDepartureMinute + 30;

      if (currReturn > next.assignedDepartureMinute) {
        const overlapDiff = currReturn - next.assignedDepartureMinute;
        conflicts.push({
          id: `next-trip-conflict-${curr.id}-${next.id}`,
          type: 'NEXT_TRIP_CONFLICT',
          level: 'warning',
          message: `${vehicleId === 'v1' ? '1호차' : '2호차'} 운행 복귀 지연: 현재 운행 예상 복귀(${formatMinute(
            currReturn
          )})가 다음 운행 출발(${formatMinute(next.assignedDepartureMinute)})보다 ${overlapDiff}분 늦습니다.`,
          tripId: curr.id,
        });
      }
    }
  });

  // 4. SCHOOL_HOLIDAY 검사
  // 해당 날짜가 휴일인 학교 학생의 스케줄이 존재하는지 확인
  schedules.forEach((sch) => {
    const holiday = holidays.find(
      (h) =>
        h.schoolId === sch.schoolId &&
        serviceDate >= h.startDate &&
        serviceDate <= h.endDate
    );
    if (holiday) {
      conflicts.push({
        id: `holiday-${sch.studentId}-${holiday.id}`,
        type: 'SCHOOL_HOLIDAY',
        level: 'warning',
        message: `${sch.schoolId} 휴일 알림: 해당 일자는 ${holiday.name} 기간입니다.`,
        studentId: sch.studentId,
        schoolId: sch.schoolId,
      });
    }
  });

  // 5. STUDENT_DUPLICATE 검사
  // 한 학생이 동일 시간대에 서로 다른 Trip에 중복 배정되었는지
  const studentScheduleCounts: Record<string, number> = {};
  schedules.forEach((s) => {
    const key = `${s.studentId}-${s.date}-${s.type}`;
    studentScheduleCounts[key] = (studentScheduleCounts[key] || 0) + 1;
    if (studentScheduleCounts[key] > 1) {
      const student = students.find((st) => st.id === s.studentId);
      conflicts.push({
        id: `duplicate-${key}`,
        type: 'STUDENT_DUPLICATE',
        level: 'error',
        message: `학생 중복 배정: ${student ? student.name : s.studentId} 학생의 동일 시간대 일정이 중복 배정되었습니다.`,
        studentId: s.studentId,
      });
    }
  });

  return conflicts;
}
