import {
  TripTemplate,
  TripInstance,
  TripStop,
  RouteSegment,
  Location,
  MinuteOfDay,
  Conflict,
} from '@/types';

export interface RouteCalcResult {
  instance: TripInstance;
  conflicts: Conflict[];
}

/**
 * Route 계산 엔진 (Pure Function)
 * TripTemplate과 특정 날짜, RouteSegment, 정차 위치 정보, 활성화된 학교 목록을 바탕으로
 * 실제 도착시간, 출발시간 및 단지 복귀시간을 계산합니다.
 */
export function calculateTripInstance(
  template: TripTemplate,
  serviceDate: string,
  segments: RouteSegment[],
  locations: Location[],
  activeSchoolIds?: Set<string>,
  assignedDeparture?: MinuteOfDay
): RouteCalcResult {
  const conflicts: Conflict[] = [];
  const departureMinute = assignedDeparture ?? template.defaultDepartureMinute;

  // 1. 활성 학생 필터링 (학생이 없는 학교 자동 Skip)
  const filteredStops = template.stops.filter((stop) => {
    if (!activeSchoolIds) return true;
    const loc = locations.find((l) => l.id === stop.locationId);
    if (!loc || !loc.schoolId) return true; // COMPLEX 등은 유지
    return activeSchoolIds.has(loc.schoolId);
  });

  const tripStops: TripStop[] = [];
  let currentLocId = 'COMPLEX_MAIN';
  let currentDepartureMinute = departureMinute;

  for (let i = 0; i < filteredStops.length; i++) {
    const templateStop = filteredStops[i];
    const loc = locations.find((l) => l.id === templateStop.locationId);
    const locName = loc ? loc.shortName : templateStop.locationId;

    // 구간 조회
    const segment = segments.find(
      (s) => s.originLocationId === currentLocId && s.destinationLocationId === templateStop.locationId
    );

    let travelTime = 0;
    if (segment) {
      travelTime = segment.travelMinutes + (segment.bufferMinutes || 0);
    } else {
      conflicts.push({
        id: `missing-segment-${currentLocId}-${templateStop.locationId}`,
        type: 'MISSING_ROUTE_SEGMENT',
        level: 'warning',
        message: `경로 이동시간이 등록되어 있지 않습니다: ${currentLocId} -> ${templateStop.locationId}`,
        tripId: template.id,
      });
      // 임의 추정치 대신 최소 기본값 5분(임시) 또는 0
      travelTime = 5;
    }

    const arrivalMinute = currentDepartureMinute + travelTime;
    const dwell = templateStop.dwellMinutesOverride ?? 1;
    const stopDeparture = arrivalMinute + dwell;

    tripStops.push({
      locationId: templateStop.locationId,
      locationName: locName,
      arrivalMinute,
      departureMinute: stopDeparture,
      dwellMinutes: dwell,
      order: i + 1,
    });

    currentLocId = templateStop.locationId;
    currentDepartureMinute = stopDeparture;
  }

  // 복귀 구간 계산 (마지막 Stop -> COMPLEX_MAIN)
  let calculatedReturnMinute: MinuteOfDay | undefined = undefined;
  if (tripStops.length > 0) {
    const lastLocId = tripStops[tripStops.length - 1].locationId;
    const returnSegment = segments.find(
      (s) => s.originLocationId === lastLocId && s.destinationLocationId === 'COMPLEX_MAIN'
    );
    if (returnSegment) {
      calculatedReturnMinute = currentDepartureMinute + returnSegment.travelMinutes + (returnSegment.bufferMinutes || 0);
    } else {
      // 복귀 구간 기본값 (예: 15분)
      calculatedReturnMinute = currentDepartureMinute + 15;
    }
  } else {
    calculatedReturnMinute = departureMinute;
  }

  const instance: TripInstance = {
    id: `inst-${template.id}-${serviceDate}`,
    vehicleId: template.vehicleId,
    templateId: template.id,
    serviceDate,
    type: template.type,
    assignedDepartureMinute: departureMinute,
    referenceDepartureMinute: template.defaultDepartureMinute,
    referenceReturnMinute: template.referenceReturnMinute,
    calculatedReturnMinute,
    stops: tripStops,
    status: 'scheduled',
  };

  return { instance, conflicts };
}

/**
 * 단지(COMPLEX_MAIN)에서 특정 학교까지의 누적 등교 소요시간(경유지 하차 1분 포함)을 계산합니다.
 * NLCS: 단지 -> NLCS (10분)
 * BHA: 단지 -> NLCS (10분) + 하차 (1분) + NLCS -> BHA (4분) = 15분
 * KIS: BHA 도착(15분) + 하차 (1분) + BHA -> KIS (4분) = 20분
 * SJA: KIS 도착(20분) + 하차 (1분) + KIS -> SJA (3분) = 24분
 * 저청초: 단지 -> 저청초 (5분)
 */
export function getSchoolTravelMinutes(
  schoolId: string,
  segments: RouteSegment[]
): number {
  // 1호차: 저청초/저청중 (단지 -> 저청 5분)
  if (schoolId === 'CHEONG' || schoolId === 'CHEONG_MID') {
    const seg = segments.find(
      (s) => s.originLocationId === 'COMPLEX_MAIN' && s.destinationLocationId === 'CHEONG_MAIN'
    );
    return seg ? seg.travelMinutes + (seg.bufferMinutes || 0) : 5;
  }

  // 1호차: NLCS (단지 -> NLCS 10분)
  if (schoolId === 'NLCS') {
    const seg = segments.find(
      (s) => s.originLocationId === 'COMPLEX_MAIN' && s.destinationLocationId === 'NLCS_MAIN'
    );
    return seg ? seg.travelMinutes + (seg.bufferMinutes || 0) : 10;
  }

  // 2호차: BHA (단지 -> BHA 10분: 07:40 -> 07:50)
  const segBha = segments.find(
    (s) => s.originLocationId === 'COMPLEX_MAIN' && s.destinationLocationId === 'BHA_GATE1'
  );
  const timeBha = segBha ? segBha.travelMinutes + (segBha.bufferMinutes || 0) : 10;
  if (schoolId === 'BHA') return timeBha;

  // 2호차: SJA (단지 -> BHA 10분 + 하차 1분 + BHA -> SJA 4분 = 15분: 07:40 -> 07:55)
  const segSja = segments.find(
    (s) => s.originLocationId === 'BHA_GATE1' && s.destinationLocationId === 'SJA_GATE3'
  );
  const timeSja = timeBha + 1 + (segSja ? segSja.travelMinutes + (segSja.bufferMinutes || 0) : 4);
  if (schoolId === 'SJA') return timeSja;

  // 2호차: KIS (SJA 도착 15분 + 하차 1분 + SJA -> KIS 4분 = 20분: 07:40 -> 08:00)
  const segKis = segments.find(
    (s) => s.originLocationId === 'SJA_GATE3' && s.destinationLocationId === 'KIS_MAIN'
  );
  const timeKis = timeSja + 1 + (segKis ? segKis.travelMinutes + (segKis.bufferMinutes || 0) : 4);
  if (schoolId === 'KIS') return timeKis;

  return 10;
}

