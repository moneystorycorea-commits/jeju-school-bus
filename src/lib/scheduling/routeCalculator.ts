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
