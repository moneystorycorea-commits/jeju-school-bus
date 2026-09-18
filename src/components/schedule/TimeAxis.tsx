import React from 'react';
import { MinuteOfDay } from '@/types';
import { formatMinute, getTimelinePositionPercent } from '@/lib/scheduling/time';
import { useScheduleStore } from '@/lib/store/useScheduleStore';

interface TimeAxisProps {
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
}

export const TimeAxis: React.FC<TimeAxisProps> = ({ startMinute, endMinute }) => {
  const { draggingMinute } = useScheduleStore();
  const duration = endMinute - startMinute;

  // 10분 단위 틱 생성 (시간 사이 6칸 구분)
  const ticks: { minute: MinuteOfDay; isHour: boolean; isHalfHour: boolean; minuteInHour: number }[] = [];
  for (let m = startMinute; m <= endMinute; m += 10) {
    const minuteInHour = m % 60;
    ticks.push({
      minute: m,
      isHour: minuteInHour === 0,
      isHalfHour: minuteInHour === 30,
      minuteInHour,
    });
  }

  // 드래그 중인 10분 구간 계산
  const active10MinStart = draggingMinute !== null ? Math.floor(draggingMinute / 10) * 10 : null;
  const activePercent = draggingMinute !== null ? getTimelinePositionPercent(draggingMinute, startMinute, endMinute) : null;
  const activeSlotStartPercent = active10MinStart !== null ? getTimelinePositionPercent(active10MinStart, startMinute, endMinute) : null;
  const slotWidthPercent = (10 / duration) * 100;

  return (
    <div className="relative w-full h-7.5 border-b border-slate-200 bg-slate-50 select-none overflow-visible">
      {/* 드래그 중 10분 단위 실시간 강조 배경 밴드 (연한 블루 틴트) */}
      {activeSlotStartPercent !== null && (
        <div
          className="absolute top-0 bottom-0 bg-blue-50/80 border-x border-blue-200/80 transition-all duration-75 pointer-events-none"
          style={{
            left: `${activeSlotStartPercent}%`,
            width: `${slotWidthPercent}%`,
          }}
        />
      )}

      {/* 10분 단위 눈금 및 라벨 (시간 사이 6칸 얇게 구분) */}
      {ticks.map(({ minute, isHour, isHalfHour, minuteInHour }) => {
        const percent = ((minute - startMinute) / duration) * 100;
        const isCurrentActiveSlot = active10MinStart !== null && minute >= active10MinStart && minute < active10MinStart + 10;
        const isStart = minute === startMinute;
        const isEnd = minute === endMinute;

        return (
          <div
            key={minute}
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{ left: `${percent}%` }}
          >
            {/* 시간 라벨: 시작점은 왼쪽 잘림 방지(translate-x-1), 끝점은 오른쪽 넘침 방지(-translate-x-full), 중간은 -translate-x-1/2 */}
            <div
              className={`flex flex-col ${
                isStart
                  ? 'translate-x-1 items-start'
                  : isEnd
                  ? '-translate-x-full items-end -mr-1'
                  : '-translate-x-1/2 items-center'
              }`}
            >
              {isHour || isStart ? (
                <span className={`text-xs font-black pt-0.5 font-mono tracking-tight ${isCurrentActiveSlot ? 'text-blue-700' : 'text-slate-800'}`}>
                  {formatMinute(minute)}
                </span>
              ) : isHalfHour ? (
                <span className={`text-[11px] font-bold pt-0.5 font-mono tracking-tight ${isCurrentActiveSlot ? 'text-blue-600 font-black' : 'text-slate-600'}`}>
                  :{String(minuteInHour).padStart(2, '0')}
                </span>
              ) : (
                <span className={`hidden md:inline-block text-[9.5px] font-semibold pt-1 font-mono ${isCurrentActiveSlot ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                  :{String(minuteInHour).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* 눈금 바 (시간: 약간 긴 선, 30분: 중간 선, 10분: 짧고 얇은 선) */}
            <div
              className={`absolute bottom-0 -translate-x-1/2 ${
                isHour || isStart
                  ? 'w-px h-2 bg-slate-400'
                  : isHalfHour
                  ? 'w-px h-1.5 bg-slate-300'
                  : 'w-px h-1 bg-slate-200'
              }`}
            />
          </div>
        );
      })}

      {/* 드래그 중인 출발 시간 기준 좌측 가이드 선 & 상단 시간 플로팅 뱃지 */}
      {draggingMinute !== null && activePercent !== null && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-30"
          style={{ left: `${activePercent}%` }}
        >
          <div className="absolute -top-1 -translate-x-1/2 bg-blue-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm flex items-center gap-1 border border-white">
            <span>{formatMinute(draggingMinute)}</span>
          </div>
          {/* 얇고 연한 가이드 선 (1px) */}
          <div className="w-px h-full bg-blue-400/50 mx-auto" />
        </div>
      )}
    </div>
  );
};
