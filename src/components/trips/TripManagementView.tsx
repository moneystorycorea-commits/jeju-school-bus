import React from 'react';
import { Bus, Printer, FileDown } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';
import { calculateTripInstance } from '@/lib/scheduling/routeCalculator';
import { TripTemplate } from '@/types';
import {
  downloadWeeklyRoutineWord,
  downloadWeeklyRoutineHml,
  formatStudentWeeklySummary,
  getVehicleStudents,
} from '@/lib/scheduling/weeklyRoutineExport';
import { formatGradeDisplay } from '@/lib/constants/schools';

export const TripManagementView: React.FC = () => {
  const {
    scheduleType,
    setScheduleType,
    tripTemplates,
    routeSegments,
    locations,
    schools,
    serviceDate,
    students,
    privateInfoMap,
    getPrivateInfo,
  } = useScheduleStore();

  const { v1Students, v2Students } = getVehicleStudents(students);

  const morningTemplates = tripTemplates.filter((t) => t.type === 'MORNING');
  const afternoonTemplates = tripTemplates.filter((t) => t.type === 'AFTERNOON');

  // 출발시간별 오름차순 정렬 (동일 시간 시 1호차, 2호차 순)
  const sortedMorningTemplates = [...morningTemplates].sort((a, b) => {
    if (a.defaultDepartureMinute !== b.defaultDepartureMinute) {
      return a.defaultDepartureMinute - b.defaultDepartureMinute;
    }
    return a.vehicleId.localeCompare(b.vehicleId);
  });

  const sortedAfternoonTemplates = [...afternoonTemplates].sort((a, b) => {
    if (a.defaultDepartureMinute !== b.defaultDepartureMinute) {
      return a.defaultDepartureMinute - b.defaultDepartureMinute;
    }
    return a.vehicleId.localeCompare(b.vehicleId);
  });

  const activeTemplates = scheduleType === 'MORNING' ? sortedMorningTemplates : sortedAfternoonTemplates;

  const formatWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 5) return '월~금';
    const sorted = [...weekdays].sort((a, b) => a - b);
    if (sorted.length === 4 && sorted[0] === 1 && sorted[3] === 4) return '월~목';
    const dayMap: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
    return sorted.map((d) => dayMap[d]).join('·');
  };

  const handlePrint = () => {
    window.print();
  };

  // 워드(.doc) 편집용 파일 다운로드 핸들러
  const handleExportWord = () => {
    downloadWeeklyRoutineWord(
      tripTemplates,
      routeSegments,
      locations,
      schools,
      students,
      privateInfoMap
    );
  };

  // 한컴 2020 호환 한글(.hml) 다운로드 핸들러
  const handleExportHml = () => {
    downloadWeeklyRoutineHml(
      tripTemplates,
      routeSegments,
      locations,
      schools,
      students,
      privateInfoMap
    );
  };

  // 템플릿 데이터 추출 헬퍼 (모든 요일 및 등/하교 템플릿의 실제 계산 시간을 완벽 산출)
  const getTemplateData = (template: TripTemplate) => {
    const vehicleName = template.vehicleId === 'v1' ? '1호차' : '2호차';
    const isMorning = template.type === 'MORNING';

    // 특정 템플릿의 전체 경로 이동시간 자동 계산 (요일과 무관하게 전체 정규 노선 시간 계산)
    const { instance } = calculateTripInstance(
      template,
      serviceDate,
      routeSegments,
      locations
    );

    const refReturn = template.referenceReturnMinute;
    const calcReturn = instance?.calculatedReturnMinute;
    const hasInvalidSeq =
      refReturn !== undefined &&
      instance &&
      instance.stops.length > 0 &&
      refReturn < instance.stops[instance.stops.length - 1].arrivalMinute;

    const stopsList = template.stops.map((stop) => {
      const schoolCode = stop.locationId.split('_')[0];
      const gateSuffix = stop.locationId.includes('GATE')
        ? ` G${stop.locationId.split('GATE')[1]}`
        : '';
      const sc = schools.find((s) => s.id === schoolCode);
      const displayName = schoolCode === 'CHEONG' ? '저청초' : (sc?.shortName || schoolCode);
      return displayName + gateSuffix;
    });

    const routeStopsText = isMorning
      ? ['단지', ...stopsList].join(' → ')
      : [...stopsList, '단지'].join(' → ');

    // 학교별 계산된 도착/픽업 시간
    const arrivalTimesText = instance && instance.stops.length > 0
      ? instance.stops.map((s) => {
          const schoolCode = s.locationId.split('_')[0];
          const sc = schools.find((sch) => sch.id === schoolCode);
          const displayName = schoolCode === 'CHEONG' ? '저청' : (sc?.shortName || schoolCode);
          return `${displayName} ${formatMinute(s.arrivalMinute)}`;
        }).join(' · ')
      : '-';

    // 단지출발 + 경유순서 + 학교도착을 하나로 결합한 단계별 코스 (combinedSteps)
    const combinedSteps: { name: string; time: string; isStart?: boolean }[] = [];

    if (isMorning) {
      // 1. 단지 출발
      combinedSteps.push({
        name: '단지',
        time: formatMinute(template.defaultDepartureMinute),
        isStart: true,
      });

      // 2. 경유 학교들 및 각 학교 도착 시간
      template.stops.forEach((stop) => {
        const schoolCode = stop.locationId.split('_')[0];
        const gateSuffix = stop.locationId.includes('GATE')
          ? ` G${stop.locationId.split('GATE')[1]}`
          : '';
        const sc = schools.find((s) => s.id === schoolCode);
        const displayName = (schoolCode === 'CHEONG' ? '저청초' : (sc?.shortName || schoolCode)) + gateSuffix;
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : '';

        combinedSteps.push({
          name: displayName,
          time,
        });
      });
    } else {
      // 하교: 경유 학교들 픽업 시간 -> 단지
      template.stops.forEach((stop, idx) => {
        const schoolCode = stop.locationId.split('_')[0];
        const gateSuffix = stop.locationId.includes('GATE')
          ? ` G${stop.locationId.split('GATE')[1]}`
          : '';
        const sc = schools.find((s) => s.id === schoolCode);
        const displayName = (schoolCode === 'CHEONG' ? '저청초' : (sc?.shortName || schoolCode)) + gateSuffix;
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : formatMinute(template.defaultDepartureMinute);

        combinedSteps.push({
          name: displayName,
          time,
          isStart: idx === 0,
        });
      });

      // 단지 도착 (귀원 시간 함께 표시)
      const returnTime = refReturn !== undefined ? formatMinute(refReturn) : (calcReturn ? formatMinute(calcReturn) : '');
      combinedSteps.push({
        name: '단지',
        time: returnTime,
      });
    }

    const combinedRouteText = combinedSteps
      .map((s) => (s.time ? `${s.name} ${s.time}` : s.name))
      .join(' → ');

    return {
      vehicleName,
      departureTime: formatMinute(template.defaultDepartureMinute),
      routeStopsText,
      arrivalTimesText,
      combinedSteps,
      combinedRouteText,
      weekdaysText: formatWeekdays(template.weekdays),
      refReturn,
      calcReturn,
      hasInvalidSeq,
    };
  };

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn print-container max-w-5xl w-full print:mx-auto print:bg-white">
      {/* ========================================================================= */}
      {/* 1. [인쇄 전용] 그대로 게시 가능한 수준의 여백과 균형성을 갖춘 A4 공고문   */}
      {/* ========================================================================= */}
      <div
        className="hidden print:flex flex-col justify-between w-full bg-white text-slate-900 select-none min-h-[268mm] pt-5 pb-2 px-1 m-0"
        style={{ fontFamily: "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif" }}
      >
        <div>
          {/* A4 최상단: 단정한 공고문 헤더 (글자 군더더기 없이 딱 제목만 표시) */}
          <div className="text-center pb-2.5 mb-5 border-b-2 border-slate-900 bg-white">
            <h1 className="text-2xl font-black text-slate-900 tracking-wider py-1">
              통학차량 운행 시간표
            </h1>
          </div>

          {/* 1-A. 등교(오전) 운행시간표 섹션 */}
          <div className="mb-5 bg-white">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-4 bg-blue-700 inline-block rounded-xs"></span>
                <span>1. 등교(오전) 운행시간표 (출발시간순 정렬)</span>
              </h2>
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2.5 rounded-xs bg-[#f0f6fd] border border-blue-300 inline-block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span>
                  <span className="text-blue-900 font-black">1호차</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2.5 rounded-xs bg-white border border-slate-400 inline-block"></span>
                  <span className="text-slate-800 font-black">2호차</span>
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[11.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-2.5 px-1.5 w-[8%] text-center border-r border-slate-400">호차</th>
                  <th className="py-2.5 px-2.5 w-[74%] border-r border-slate-400">운행 코스 및 시간</th>
                  <th className="py-2.5 px-1.5 w-[9%] text-center border-r border-slate-400">운행 요일</th>
                  <th className="py-2.5 px-1.5 w-[9%] text-center">단지 복귀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900">
                {sortedMorningTemplates.map((tpl) => {
                  const data = getTemplateData(tpl);
                  const isV1 = tpl.vehicleId === 'v1';
                  return (
                    <tr
                      key={tpl.id}
                      style={{
                        backgroundColor: isV1 ? '#f0f6fd' : '#ffffff',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                      className={isV1 ? 'bg-[#f0f6fd]' : 'bg-white'}
                    >
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${
                            isV1 ? 'bg-blue-700 text-white' : 'bg-slate-700 text-white'
                          }`}
                          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                        >
                          {data.vehicleName}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 leading-tight">
                        <div className="flex items-center text-[10.5px]">
                          {data.combinedSteps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-slate-400 font-bold w-3 text-center shrink-0 text-[9px]">
                                  →
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center whitespace-nowrap ${
                                  idx === 0
                                    ? 'w-[68px] shrink-0'
                                    : idx === 1
                                    ? 'w-[74px] shrink-0'
                                    : idx === 2
                                    ? 'w-[78px] shrink-0'
                                    : idx === 3
                                    ? 'w-[72px] shrink-0'
                                    : 'shrink-0'
                                }`}
                              >
                                <span
                                  className={
                                    step.name.includes('저청')
                                      ? "font-black text-slate-950 [-webkit-text-stroke:0.35px_currentColor] tracking-tight"
                                      : "font-black text-slate-900"
                                  }
                                >
                                  {step.name}
                                </span>
                                {step.time && (
                                  <span className="font-mono font-bold text-[10.5px] text-slate-800 ml-1">
                                    {step.time}
                                  </span>
                                )}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        {data.weekdaysText}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono font-bold text-slate-800">
                        {data.refReturn ? formatMinute(data.refReturn) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 1-B. 하교(오후) 운행시간표 섹션 */}
          <div className="mb-5 bg-white">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-4 bg-amber-700 inline-block rounded-xs"></span>
                <span>2. 하교(오후) 운행시간표 (출발시간순 정렬)</span>
              </h2>
              <div className="text-[10px] text-slate-500 font-bold flex items-center gap-2.5">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2.5 rounded-xs bg-[#f0f6fd] border border-blue-300 inline-block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}></span>
                  <span className="text-blue-900 font-black">1호차</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-2.5 rounded-xs bg-white border border-slate-400 inline-block"></span>
                  <span className="text-slate-800 font-black">2호차</span>
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[11.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-2.5 px-1.5 w-[8%] text-center border-r border-slate-400">호차</th>
                  <th className="py-2.5 px-2.5 w-[74%] border-r border-slate-400">운행 코스 및 시간</th>
                  <th className="py-2.5 px-1.5 w-[9%] text-center border-r border-slate-400">운행 요일</th>
                  <th className="py-2.5 px-1.5 w-[9%] text-center">단지 복귀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900">
                {sortedAfternoonTemplates.map((tpl) => {
                  const data = getTemplateData(tpl);
                  const isV1 = tpl.vehicleId === 'v1';
                  return (
                    <tr
                      key={tpl.id}
                      style={{
                        backgroundColor: isV1 ? '#f0f6fd' : '#ffffff',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                      }}
                      className={isV1 ? 'bg-[#f0f6fd]' : 'bg-white'}
                    >
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${
                            isV1 ? 'bg-blue-700 text-white' : 'bg-slate-700 text-white'
                          }`}
                          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                        >
                          {data.vehicleName}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 leading-tight">
                        <div className="flex items-center text-[11.5px]">
                          {data.combinedSteps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-slate-400 font-bold w-3 text-center shrink-0 text-[9px]">
                                  →
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center whitespace-nowrap ${
                                  step.time
                                    ? 'w-[82px] shrink-0'
                                    : 'shrink-0'
                                }`}
                              >
                                <span
                                  className={
                                    step.name.includes('저청')
                                      ? "font-black text-slate-950 [-webkit-text-stroke:0.35px_currentColor] tracking-tight"
                                      : "font-black text-slate-900"
                                  }
                                >
                                  {step.name}
                                </span>
                                {step.time && (
                                  <span className="font-mono font-bold text-[11px] text-slate-800 ml-1">
                                    {step.time}
                                  </span>
                                )}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        {data.weekdaysText}
                      </td>
                      <td className="py-2 px-1.5 text-center font-mono font-bold text-slate-800">
                        {data.refReturn ? formatMinute(data.refReturn) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1-C. 공고문 하단: 입주민 유의사항 및 관리사무소 직인/서명란 (어르신 시인성을 위한 폰트 확대 및 강조) */}
        <div className="border-2 border-slate-700 rounded-xl p-3.5 bg-slate-50 mt-1">
          <div className="text-sm font-black text-slate-950 mb-1.5 flex items-center gap-1.5">
            <span className="text-amber-700 text-base">📌</span>
            <span>[ 통학버스 이용 입주민 유의사항 ]</span>
          </div>
          <ul className="text-[11.5px] text-slate-900 font-bold space-y-1 list-disc list-inside leading-relaxed">
            <li>학생 안전을 위해 <strong className="font-black text-blue-950 underline decoration-blue-500">출발 5분 전까지</strong> 단지 내 지정 탑승 위치에 대기하여 주시기 바랍니다.</li>
            <li>학교 학사일정(단축수업, 시험, 방학 등) 변경이나 미이용 시 <strong className="font-black text-blue-950 underline decoration-blue-500">관리사무소로 사전 연락</strong> 부탁드립니다.</li>
            <li>기상 악화(폭설, 태풍 등) 및 제주 도로 교통상황에 따라 일부 운행 시간이 탄력적으로 조정될 수 있습니다.</li>
          </ul>
          <div className="text-center font-black text-sm text-slate-950 tracking-[0.3em] mt-2.5 pt-2 border-t-2 border-slate-400">
            아 주 더 하 이 클 래 스  관 리 사 무 소
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1-B. [인쇄 전용] Page 2: 차량별 주간 정규 탑승 배정 학생 명단 (총 16명)     */}
      {/* ========================================================================= */}
      <div
        className="hidden print:flex flex-col justify-between w-full bg-white text-slate-900 select-none min-h-[268mm] pt-5 pb-2 px-1 m-0"
        style={{
          fontFamily: "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
          pageBreakBefore: 'always',
          breakBefore: 'page',
        }}
      >
        <div>
          {/* A4 최상단: 단정한 공고문 헤더 */}
          <div className="text-center pb-2.5 mb-4 border-b-2 border-slate-900 bg-white">
            <h1 className="text-2xl font-black text-slate-900 tracking-wider py-1">
              통학차량 탑승 배정 학생 명단
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              아주 더 하이클래스 제주 2026-2027학년도 정상 운행 주간 루틴 기준 (총 {students.length}명)
            </p>
          </div>

          {/* 1호차 학생 테이블 */}
          <div className="mb-4 bg-white">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-4 bg-blue-700 inline-block rounded-xs"></span>
                <span>1. 1호차 탑승 학생 (NLCS · 저청초/중 - {v1Students.length}명)</span>
              </h2>
            </div>
            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500 text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-1 px-1 w-[5%] border-r border-slate-400">No.</th>
                  <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">성명(성별)</th>
                  <th className="py-1 px-1 w-[10%] border-r border-slate-400">동·호수</th>
                  <th className="py-1 px-1.5 w-[12%] border-r border-slate-400">학교/학년</th>
                  <th className="py-1 px-1 w-[10%] border-r border-slate-400">정차 게이트</th>
                  <th className="py-1 px-1.5 w-[14%] border-r border-slate-400">보호자(연락처)</th>
                  <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">학생 연락처</th>
                  <th className="py-1 px-1.5 w-[18%] border-r border-slate-400">주간 등·하교 루틴</th>
                  <th className="py-1 px-1 w-[9%]">특이사항</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900">
                {v1Students.map((st, idx) => {
                  const sc = schools.find((s) => s.id === st.schoolId);
                  const priv = getPrivateInfo(st.id);
                  const contact = priv?.emergencyContact || '010-3849-1234';
                  const guardian = priv?.guardianName ? `${priv.guardianName}` : '-';
                  const studentPhone = priv?.studentPhone || '-';
                  const summary = formatStudentWeeklySummary(st);
                  return (
                    <tr
                      key={st.id}
                      className={idx % 2 === 1 ? 'bg-[#f0f6fd]' : 'bg-white'}
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                      <td className="py-1 px-1 text-center font-black text-slate-700 border-r border-slate-300">{idx + 1}</td>
                      <td className="py-1 px-1.5 font-black text-slate-950 border-r border-slate-300 whitespace-nowrap">{st.name} ({st.gender || '-'})</td>
                      <td className="py-1 px-1 font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">{st.building} {st.unit}</td>
                      <td className="py-1 px-1.5 border-r border-slate-300 whitespace-nowrap">
                        <span className="font-black text-slate-900">{sc?.shortName || st.schoolId}</span>
                        <span className="text-blue-900 font-bold ml-1">({formatGradeDisplay(st.grade, st.schoolId)})</span>
                      </td>
                      <td className="py-1 px-1 text-center font-bold text-slate-800 border-r border-slate-300 text-[10px]">{st.gate || '-'}</td>
                      <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 text-[10px] whitespace-nowrap">
                        {guardian} ({contact.slice(-4)})
                      </td>
                      <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 text-[10px] whitespace-nowrap">{studentPhone}</td>
                      <td className="py-1 px-1.5 font-mono text-slate-900 border-r border-slate-300 text-[9.5px] leading-tight whitespace-nowrap">
                        등 {summary.morningText} / 하 {summary.afternoonText}
                      </td>
                      <td className="py-1 px-1 text-slate-600 text-[9.5px] truncate max-w-[80px]">{st.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2호차 학생 테이블 */}
          <div className="mb-4 bg-white">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-4 bg-slate-800 inline-block rounded-xs"></span>
                <span>2. 2호차 탑승 학생 (BHA · SJA · KIS - {v2Students.length}명)</span>
              </h2>
            </div>
            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[10.5px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500 text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-1 px-1 w-[5%] border-r border-slate-400">No.</th>
                  <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">성명(성별)</th>
                  <th className="py-1 px-1 w-[10%] border-r border-slate-400">동·호수</th>
                  <th className="py-1 px-1.5 w-[12%] border-r border-slate-400">학교/학년</th>
                  <th className="py-1 px-1 w-[10%] border-r border-slate-400">정차 게이트</th>
                  <th className="py-1 px-1.5 w-[14%] border-r border-slate-400">보호자(연락처)</th>
                  <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">학생 연락처</th>
                  <th className="py-1 px-1.5 w-[18%] border-r border-slate-400">주간 등·하교 루틴</th>
                  <th className="py-1 px-1 w-[9%]">특이사항</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900">
                {v2Students.map((st, idx) => {
                  const sc = schools.find((s) => s.id === st.schoolId);
                  const priv = getPrivateInfo(st.id);
                  const contact = priv?.emergencyContact || '010-3849-1234';
                  const guardian = priv?.guardianName ? `${priv.guardianName}` : '-';
                  const studentPhone = priv?.studentPhone || '-';
                  const summary = formatStudentWeeklySummary(st);
                  return (
                    <tr
                      key={st.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}
                      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                    >
                      <td className="py-1 px-1 text-center font-black text-slate-700 border-r border-slate-300">{idx + 1}</td>
                      <td className="py-1 px-1.5 font-black text-slate-950 border-r border-slate-300 whitespace-nowrap">{st.name} ({st.gender || '-'})</td>
                      <td className="py-1 px-1 font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">{st.building} {st.unit}</td>
                      <td className="py-1 px-1.5 border-r border-slate-300 whitespace-nowrap">
                        <span className="font-black text-slate-900">{sc?.shortName || st.schoolId}</span>
                        <span className="text-blue-900 font-bold ml-1">({formatGradeDisplay(st.grade, st.schoolId)})</span>
                      </td>
                      <td className="py-1 px-1 text-center font-bold text-slate-800 border-r border-slate-300 text-[10px]">{st.gate || '-'}</td>
                      <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 text-[10px] whitespace-nowrap">
                        {guardian} ({contact.slice(-4)})
                      </td>
                      <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 text-[10px] whitespace-nowrap">{studentPhone}</td>
                      <td className="py-1 px-1.5 font-mono text-slate-900 border-r border-slate-300 text-[9.5px] leading-tight whitespace-nowrap">
                        등 {summary.morningText} / 하 {summary.afternoonText}
                      </td>
                      <td className="py-1 px-1 text-slate-600 text-[9.5px] truncate max-w-[80px]">{st.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 공고문 하단 관리사무소 서명 */}
        <div className="border-t-2 border-slate-400 pt-2 text-center bg-white">
          <div className="text-center font-black text-xs text-slate-900 tracking-[0.3em]">
            아 주 더 하 이 클 래 스  관 리 사 무 소
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. [화면 전용] 탭 전환형 차량 운행시간표 (인쇄 시 숨김: no-print)         */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-5 no-print">
        {/* 상단 요약 배너 및 컨트롤 (학생관리 페이지와 동일한 text-xl 및 text-sm 폰트 체계) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Bus className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">차량 운행시간표</h2>
                <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  1호차 · 2호차 실운행표
                </span>
              </div>
            </div>
          </div>

          {/* 등교 / 하교 전환 탭 및 바로 인쇄/다운로드 버튼 */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setScheduleType('MORNING')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  scheduleType === 'MORNING'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                등교 운행표
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('AFTERNOON')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  scheduleType === 'AFTERNOON'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                하교 운행표
              </button>
            </div>

            {/* 1. PDF 인쇄 / 다운로드 버튼 (어도비 빨강 대표 아이콘) */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#e02b20] hover:bg-[#c42319] text-white text-sm font-black transition cursor-pointer shadow-md shadow-red-500/20 active:scale-95"
              title="주간 통합 시간표 및 탑승 배정표 A4 인쇄 / PDF 다운로드"
            >
              <span className="px-1.5 py-0.5 rounded bg-white text-[#e02b20] text-[10px] font-black tracking-tight leading-none shadow-2xs">PDF</span>
              <FileDown className="w-4 h-4" />
              <span>PDF 다운로드 / 인쇄</span>
            </button>

            {/* 2. MS Word 워드 다운로드 버튼 (MS 오피스 워드의 파랑 대표 아이콘) */}
            <button
              type="button"
              onClick={handleExportWord}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#185abd] hover:bg-[#104a9e] text-white text-sm font-black transition cursor-pointer shadow-md shadow-blue-700/20 active:scale-95"
              title="편집 가능한 MS Word(.doc) 문서 다운로드"
            >
              <span className="px-1.5 py-0.5 rounded bg-white text-[#185abd] text-[10px] font-black tracking-tight leading-none shadow-2xs">DOC</span>
              <FileDown className="w-4 h-4" />
              <span>워드 다운로드 (.doc)</span>
            </button>

            {/* 3. 한컴 2020 호환 한글 다운로드 버튼 (한컴 청록/하늘 대표 아이콘) */}
            <button
              type="button"
              onClick={handleExportHml}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0090c9] hover:bg-[#007ba8] text-white text-sm font-black transition cursor-pointer shadow-md shadow-cyan-600/20 active:scale-95"
              title="한컴오피스 한글 2020 완벽 호환 문서(.hml) 다운로드"
            >
              <span className="px-1.5 py-0.5 rounded bg-white text-[#0090c9] text-[10px] font-black tracking-tight leading-none shadow-2xs">HWP</span>
              <FileDown className="w-4 h-4" />
              <span>한글 다운로드 (.hml)</span>
            </button>
          </div>
        </div>

        {/* 화면용 테이블 (학생관리 페이지와 동일한 14px text-sm 폰트 규격 적용) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900">
                {scheduleType === 'MORNING' ? '등교 운행시간표' : '하교 운행시간표'}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                텍스트 요약형
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>등/하교 통합 출력</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold">
                  <th className="py-2.5 px-3 w-16 whitespace-nowrap">호차</th>
                  <th className="py-2.5 px-3.5 min-w-[340px]">운행 코스 및 시간</th>
                  <th className="py-2.5 px-3 w-20 text-center whitespace-nowrap">운행 요일</th>
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">단지 복귀</th>
                  <th className="py-2.5 px-3 text-center w-16 whitespace-nowrap print:hidden">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {activeTemplates.map((template) => {
                  const data = getTemplateData(template);
                  const isV1 = template.vehicleId === 'v1';

                  return (
                    <tr
                      key={template.id}
                      className={`transition ${
                        isV1 ? 'bg-[#f0f6fd]/80 hover:bg-[#e4effc]' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-sm whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-black ${
                            isV1 ? 'bg-blue-700 text-white shadow-2xs' : 'bg-slate-700 text-white shadow-2xs'
                          }`}
                        >
                          {data.vehicleName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-sm">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {data.combinedSteps.map((step, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5">
                              {idx > 0 && <span className="text-slate-400 font-bold text-xs mx-0.5">→</span>}
                              <span className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-2 py-1 shadow-2xs transition">
                                <span className={`text-xs ${step.isStart ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                                  {step.name}
                                </span>
                                {step.time && (
                                  <span className="font-mono font-bold text-xs text-slate-700 ml-0.5">
                                    {step.time}
                                  </span>
                                )}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800 text-sm text-center whitespace-nowrap">
                        {data.weekdaysText}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sm whitespace-nowrap">
                        <span className={`font-bold ${data.hasInvalidSeq ? 'text-red-600 line-through' : 'text-slate-900'}`}>
                          {data.refReturn ? formatMinute(data.refReturn) : '-'}
                        </span>
                        {data.calcReturn && data.calcReturn !== data.refReturn && (
                          <span className="text-slate-500 ml-1 text-xs">
                            ({formatMinute(data.calcReturn)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-sm whitespace-nowrap print:hidden">
                        <div className="flex items-center justify-center">
                          {data.hasInvalidSeq ? (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-200 animate-pulse shadow-xs inline-block"
                              title="운행 충돌 / 시간 오류 발생"
                            />
                          ) : (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shadow-xs inline-block"
                              title="정상 운행 가능"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};