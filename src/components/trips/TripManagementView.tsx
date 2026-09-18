import React from 'react';
import { Bus, Printer } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';
import { calculateTripInstance } from '@/lib/scheduling/routeCalculator';
import { TripTemplate } from '@/types';

export const TripManagementView: React.FC = () => {
  const {
    scheduleType,
    setScheduleType,
    tripTemplates,
    routeSegments,
    locations,
    schools,
    serviceDate,
  } = useScheduleStore();

  const activeTemplates = tripTemplates.filter((t) => t.type === scheduleType);
  const morningTemplates = tripTemplates.filter((t) => t.type === 'MORNING');
  const afternoonTemplates = tripTemplates.filter((t) => t.type === 'AFTERNOON');

  const formatWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 5) return '월~금';
    const dayMap: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
    return weekdays.map((d) => dayMap[d]).join('·');
  };

  const handlePrint = () => {
    window.print();
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

      // 단지 도착
      combinedSteps.push({
        name: '단지',
        time: '',
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
      <div className="hidden print:flex flex-col justify-between w-full bg-white text-slate-900 select-none min-h-[268mm] pt-6 pb-2 px-1 m-0">
        <div>
          {/* A4 최상단: 단정한 공고문 헤더 (글자 군더더기 없이 딱 제목만 표시) */}
          <div className="text-center pb-3 mb-6 border-b-2 border-slate-900 bg-white">
            <h1 className="text-2xl font-black text-slate-900 tracking-wider py-1">
              통학차량 운행 시간표
            </h1>
          </div>

          {/* 1-A. 등교(오전) 운행시간표 섹션 */}
          <div className="mb-6 bg-white">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-3.5 bg-blue-700 inline-block rounded-xs"></span>
                <span>1. 등교(오전) 운행시간표</span>
              </h2>
            </div>

            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[10.5px] bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500">
                  <th className="py-2 px-1.5 w-[7%] text-center border-r border-slate-400">호차</th>
                  <th className="py-2 px-2.5 w-[75%] border-r border-slate-400">운행 코스 및 시간</th>
                  <th className="py-2 px-1.5 w-[9%] text-center border-r border-slate-400">운행 요일</th>
                  <th className="py-2 px-1.5 w-[9%] text-center">단지 복귀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900 bg-white">
                {morningTemplates.map((tpl) => {
                  const data = getTemplateData(tpl);
                  return (
                    <tr key={tpl.id} className="bg-white">
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        {data.vehicleName}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 leading-tight">
                        <div className="flex items-center text-[10.5px]">
                          {data.combinedSteps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-slate-300 font-bold w-3 text-center shrink-0 text-[9px]">
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
          <div className="mb-6 bg-white">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-3.5 bg-amber-700 inline-block rounded-xs"></span>
                <span>2. 하교(오후) 운행시간표</span>
              </h2>
            </div>

            <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[10.5px] bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500">
                  <th className="py-2 px-1.5 w-[7%] text-center border-r border-slate-400">호차</th>
                  <th className="py-2 px-2.5 w-[75%] border-r border-slate-400">운행 코스 및 시간</th>
                  <th className="py-2 px-1.5 w-[9%] text-center border-r border-slate-400">운행 요일</th>
                  <th className="py-2 px-1.5 w-[9%] text-center">단지 복귀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900 bg-white">
                {afternoonTemplates.map((tpl) => {
                  const data = getTemplateData(tpl);
                  return (
                    <tr key={tpl.id} className="bg-white">
                      <td className="py-2 px-1.5 text-center font-bold border-r border-slate-300">
                        {data.vehicleName}
                      </td>
                      <td className="py-2 px-2.5 border-r border-slate-300 leading-tight">
                        <div className="flex items-center text-[10.5px]">
                          {data.combinedSteps.map((step, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-slate-300 font-bold w-3 text-center shrink-0 text-[9px]">
                                  →
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center whitespace-nowrap ${
                                  step.time
                                    ? 'w-[76px] shrink-0'
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
        </div>

        {/* 1-C. 공고문 하단: 입주민 유의사항 및 관리사무소 직인/서명란 */}
        <div className="border border-slate-400 rounded-lg p-3 bg-white mt-1">
          <div className="text-[11px] font-bold text-slate-900 mb-1 flex items-center gap-1">
            <span>📌 [ 통학버스 이용 입주민 유의사항 ]</span>
          </div>
          <ul className="text-[9.5px] text-slate-700 space-y-0.5 list-disc list-inside leading-relaxed">
            <li>학생 안전을 위해 <strong>출발 5분 전까지</strong> 단지 내 지정 탑승 위치에 대기하여 주시기 바랍니다.</li>
            <li>학교 학사일정(단축수업, 시험, 방학 등) 변경이나 미이용 시 <strong>관리사무소로 사전 연락</strong> 부탁드립니다.</li>
            <li>기상 악화(폭설, 태풍 등) 및 제주 도로 교통상황에 따라 일부 운행 시간이 탄력적으로 조정될 수 있습니다.</li>
          </ul>
          <div className="text-center font-black text-xs text-slate-900 tracking-[0.25em] mt-2 pt-1.5 border-t border-slate-300">
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
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                박스 없는 간결한 텍스트 시간표이며, [시간표 인쇄] 클릭 시 등/하교가 한 페이지에 완벽한 비율로 출력됩니다.
              </p>
            </div>
          </div>

          {/* 등교 / 하교 전환 탭 및 바로 인쇄 버튼 */}
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

            {/* 바로 인쇄 / PDF 출력 버튼 */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition cursor-pointer shadow-xs"
              title="등·하교 통합 시간표를 한 페이지에 인쇄하거나 PDF로 저장"
            >
              <Printer className="w-4 h-4" />
              <span>시간표 인쇄 / PDF</span>
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

                  return (
                    <tr key={template.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 text-sm whitespace-nowrap">
                        {data.vehicleName}
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