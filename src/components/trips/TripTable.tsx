import React from 'react';
import { Bus, AlertCircle, ArrowRight } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';

export const TripTable: React.FC = () => {
  const {
    scheduleType,
    setScheduleType,
    tripTemplates,
    getTripInstances,
    setDetailDrawerTab,
  } = useScheduleStore();

  const tripInstances = getTripInstances();

  const formatWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 5) return '월~금';
    const dayMap: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
    return weekdays.map((d) => dayMap[d]).join('·');
  };

  const activeTemplates = tripTemplates.filter((t) => t.type === scheduleType);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4 select-none">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">차량 운행 시간표</h3>
            <span className="text-[11px] text-slate-400 font-normal">
              기준 운행표(Reference) & 자동계산(Calculated) 실시간 비교
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 등교/하교 미니 토글 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setScheduleType('MORNING')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                scheduleType === 'MORNING'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
            >
              등교
            </button>
            <button
              onClick={() => setScheduleType('AFTERNOON')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                scheduleType === 'AFTERNOON'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
            >
              하교
            </button>
          </div>

          <button
            onClick={() => setDetailDrawerTab('route')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>운행 설정 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
              <th className="py-2.5 px-3">호차</th>
              <th className="py-2.5 px-3">단지 출발</th>
              <th className="py-2.5 px-3">경유 순서</th>
              <th className="py-2.5 px-3">{scheduleType === 'MORNING' ? '학교 도착 (계산)' : '학교 픽업 (계산)'}</th>
              <th className="py-2.5 px-3">운행 요일</th>
              <th className="py-2.5 px-3">단지 도착 (기존 / 계산)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {activeTemplates.map((template) => {
              const vehicleName = template.vehicleId === 'v1' ? '1호차' : '2호차';
              const instance = tripInstances.find((inst) => inst.templateId === template.id);

              // 경유 순서 문자열
              const routeOrderStr = template.stops
                .map((s) => s.locationId.replace('_MAIN', '').replace('_GATE1', ' G1').replace('_GATE3', ' G3'))
                .join(' → ');

              // 학교 도착/픽업 시간 문자열
              let stopTimesStr = '';
              if (instance && instance.stops.length > 0) {
                stopTimesStr = instance.stops.map((s) => formatMinute(s.arrivalMinute)).join(' / ');
              } else {
                stopTimesStr = '-';
              }

              // 단지 도착 시간 (기존 기준 vs 엔진 계산)
              const refReturn = template.referenceReturnMinute;
              const calcReturn = instance?.calculatedReturnMinute;
              
              // 시간 역전 오류 검사 (2호차 16:25 오류)
              const hasInvalidSeq =
                refReturn !== undefined &&
                instance &&
                instance.stops.length > 0 &&
                refReturn < instance.stops[instance.stops.length - 1].arrivalMinute;

              // 기준시간 vs 계산시간 차이(Diff) 계산
              const diffMinutes = (calcReturn !== undefined && refReturn !== undefined) ? calcReturn - refReturn : 0;

              return (
                <tr key={template.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{vehicleName}</td>
                  <td className="py-3 px-3 font-semibold text-blue-600 font-mono">
                    {formatMinute(template.defaultDepartureMinute)}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{routeOrderStr}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 font-mono">{stopTimesStr}</td>
                  <td className="py-3 px-3 text-slate-600 font-semibold">
                    {formatWeekdays(template.weekdays)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {/* 기존 기준 시간 */}
                      <span className={`font-mono font-semibold ${hasInvalidSeq ? 'text-red-600 line-through' : 'text-slate-800'}`}>
                        {refReturn ? formatMinute(refReturn) : '-'}
                      </span>

                      {/* 계산된 복귀 시간 */}
                      {calcReturn && (
                        <span className="font-mono text-slate-500 text-[11px]" title="Route Engine 자동 계산 시간">
                          ({formatMinute(calcReturn)})
                        </span>
                      )}

                      {/* 차이(Diff) 뱃지 */}
                      {diffMinutes !== 0 && !hasInvalidSeq && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            diffMinutes > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                          title={`기존: ${refReturn ? formatMinute(refReturn) : ''} / 자동계산: ${calcReturn ? formatMinute(calcReturn) : ''} (${diffMinutes > 0 ? '+' : ''}${diffMinutes}분)`}
                        >
                          {diffMinutes > 0 ? `+${diffMinutes}분` : `${diffMinutes}분`}
                        </span>
                      )}

                      {/* 의도적 오류 뱃지 */}
                      {hasInvalidSeq && (
                        <span
                          className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-0.5"
                          title="오류 감지: 픽업 16:30 후 단지 도착 16:25로 시간 역전"
                        >
                          <AlertCircle className="w-3 h-3" />
                          역전 오류
                        </span>
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
  );
};
