import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Student, StudentSchedule, School, MinuteOfDay } from '@/types';
import { getTimelinePositionPercent, formatMinute } from '@/lib/scheduling/time';
import { ScheduleBlock } from './ScheduleBlock';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { getSchoolTravelMinutes } from '@/lib/scheduling/routeCalculator';

interface StudentRowProps {
  student: Student;
  schedule?: StudentSchedule;
  school?: School;
  index: number;
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
  timelineContainerRef: React.RefObject<HTMLDivElement | null>;
  hasConflict?: boolean;
  conflictMessage?: string;
  isNewSchoolGroup?: boolean;
}

export const StudentRow: React.FC<StudentRowProps> = ({
  student,
  schedule,
  school,
  index: _index,
  startMinute,
  endMinute,
  timelineContainerRef,
  hasConflict,
  conflictMessage,
  isNewSchoolGroup,
}) => {
  const { selectStudent, selectedStudentId, serviceDate, scheduleType, holidays, draggingMinute, routeSegments } = useScheduleStore();
  const isSelected = selectedStudentId === student.id;
  const isMorning = scheduleType === 'MORNING';

  const currentWeekday = new Date(serviceDate).getDay() === 0 ? 7 : new Date(serviceDate).getDay();
  const ws = student.weeklySchedule?.[currentWeekday];
  const isInactive = !schedule || (ws && (scheduleType === 'MORNING' ? !ws.morningActive : !ws.afternoonActive));
  const schoolHoliday = holidays.find(
    (h) => h.schoolId === student.schoolId && serviceDate >= h.startDate && serviceDate <= h.endDate
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  // 10분 단위 배경 그리드 선 계산 (시간 사이 6칸 얇게 구분)
  const gridTicks: { minute: MinuteOfDay; isHour: boolean; isHalfHour: boolean }[] = [];
  for (let m = startMinute; m <= endMinute; m += 10) {
    const minInHour = m % 60;
    gridTicks.push({
      minute: m,
      isHour: minInHour === 0,
      isHalfHour: minInHour === 30,
    });
  }
  const duration = endMinute - startMinute;
  const dragPercent = draggingMinute !== null ? getTimelinePositionPercent(draggingMinute, startMinute, endMinute) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center h-9.5 border-b border-slate-100 transition-colors ${
        isNewSchoolGroup ? 'border-t-2 border-t-slate-400' : ''
      } ${
        isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'
      }`}
    >
      {/* 1. 좌측 학생 정보 고정 영역 (이름, 학교, 학년 순 정렬 및 헤더와 열 정렬 일치) */}
      <div
        onClick={() => selectStudent(student.id, true, true)}
        className="w-[230px] px-2.5 py-1 border-r border-slate-200 bg-white sticky left-0 z-20 flex items-center cursor-pointer select-none shrink-0 h-full"
      >
        {/* Row 드래그 정렬 핸들 */}
        <button
          {...attributes}
          {...listeners}
          className="w-5 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-0.5 shrink-0"
          title="위아래로 드래그하여 학생 순서 변경"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* 1. 이름 (학생관리 테이블과 동일한 text-sm font-bold) */}
        <div className="flex-1 min-w-0 pl-1 pr-1 flex items-center">
          <span className="text-sm font-bold text-slate-900 tracking-tight truncate hover:text-blue-600 transition">
            {student.name}
          </span>
        </div>

        {/* 2. 학교 뱃지 (학생관리 테이블과 동일한 text-xs font-black px-2 py-0.5) */}
        <div className="w-14 shrink-0 flex items-center justify-center">
          {school && (
            <span className={`text-xs font-black px-2 py-0.5 rounded border shadow-2xs ${school.badgeBg}`}>
              {school.shortName}
            </span>
          )}
        </div>

        {/* 3. 학년 원형 배지 (text-xs font-black font-mono) */}
        <div className="w-11 shrink-0 flex items-center justify-center">
          <div
            className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-black text-[10.5px] flex items-center justify-center border border-slate-300 font-mono shadow-2xs"
            title={student.grade && student.grade !== '?' ? `재학 학년: ${student.grade}` : '학년 미등록 (?)'}
          >
            {(() => {
              if (!student.grade || student.grade === '?') return '?';
              return student.grade.replace('학년', '');
            })()}
          </div>
        </div>
      </div>

      {/* 2. 우측 타임라인 트랙 영역 */}
      <div className="relative flex-1 h-full flex items-center">
        {/* 10분 단위 배경 세로 그리드 라인 (시간 사이 6칸 얇게 구분) */}
        {gridTicks.map(({ minute, isHour, isHalfHour }) => {
          const percent = ((minute - startMinute) / duration) * 100;
          return (
            <div
              key={minute}
              className={`absolute top-0 bottom-0 pointer-events-none ${
                isHour
                  ? 'w-px bg-slate-200/90 z-0'
                  : isHalfHour
                  ? 'w-px bg-slate-200/40 z-0'
                  : 'w-px bg-slate-100/60 z-0'
              }`}
              style={{ left: `${percent}%` }}
            />
          );
        })}

        {/* [출발시간 점선 활성화] 등교 시 선택되거나 드래그 중일 때: 단지 출발시간(학교별 누적소요시간 전) 수직 점선 및 배지 표시 */}
        {(() => {
          if (!isMorning || !schedule || isInactive || (!isSelected && !isDragging)) return null;
          const travelMinutes = school ? getSchoolTravelMinutes(school.id, routeSegments) : 10;
          const currentMinute = (isDragging && draggingMinute !== null) ? draggingMinute : schedule.assignedMinute;
          const departureMinute = (currentMinute - travelMinutes) as MinuteOfDay;
          const departurePercent = getTimelinePositionPercent(departureMinute, startMinute, endMinute);

          return (
            <>
              {/* 단지 출발 위치 수직 점선 & 출발시간 플로팅 배지 (단지 출발 시점에 정밀 센터링) */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${departurePercent}%` }}
              >
                {/* 상단 단지 출발 시간 칩 */}
                <div className="absolute -top-6 px-2 py-0.5 rounded bg-blue-600 text-white text-[10.5px] font-black font-mono whitespace-nowrap shadow-md flex items-center gap-1.5 z-30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>단지 {formatMinute(departureMinute)} 출발</span>
                  <span className="text-[9.5px] text-blue-200 font-normal">({travelMinutes}분 소요)</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600" />
                </div>

                {/* 수직 점선 (상단 타임라인 축부터 슬라이더 좌측 모서리까지 연결) */}
                <div className="w-0.5 h-full border-l-2 border-dashed border-blue-500 shadow-xs" />
              </div>
            </>
          );
        })()}

        {/* 희망시간 고스트 타깃 마커 (Ghost Target Pin): 운용시간과 희망시간의 차이를 즉시 식별 */}
        {isMorning && schedule && !isInactive && schedule.requestedMinute && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-5 flex flex-col items-center justify-center -translate-x-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
            style={{ left: `${getTimelinePositionPercent(schedule.requestedMinute, startMinute, endMinute)}%` }}
            title={`희망 도착 시각: ${formatMinute(schedule.requestedMinute)}`}
          >
            {/* 세로 미세 점선 */}
            <div className="w-px h-full border-l border-dashed border-slate-400/80" />
            {/* 고스트 타겟 다이아몬드 마커 */}
            <div className="w-2 h-2 rotate-45 border border-slate-500 bg-white/95 shadow-2xs" />
          </div>
        )}

        {/* 드래그 중인 출발 시간 기준 좌측 가이드 선 (얇고 연한 소프트 블루) */}
        {dragPercent !== null && (
          <div
            className="absolute top-0 bottom-0 w-px bg-blue-400/50 pointer-events-none z-10"
            style={{ left: `${dragPercent}%` }}
          />
        )}

        {/* 스케줄 블록 또는 미이용 안내 / 방학 안내 */}
        {schoolHoliday ? (
          <div className="h-7.5 flex items-center gap-1.5 px-3 rounded-md bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs font-semibold ml-4 shadow-2xs">
            <span>🌴 {schoolHoliday.name} (방학 기간)</span>
          </div>
        ) : isInactive ? (
          <div className="h-7.5 flex items-center gap-2 px-3 rounded-md bg-slate-100/90 border border-dashed border-slate-300 text-slate-500 text-xs ml-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span className="font-bold text-slate-700 text-xs sm:text-sm">
              {scheduleType === 'MORNING' ? '등교 셔틀 미이용' : '하교 셔틀 미이용'}
            </span>
            {(ws?.notes || student.notes) && (
              <span className="text-xs text-slate-400 max-w-[280px] truncate font-medium">
                ({ws?.notes || student.notes})
              </span>
            )}
          </div>
        ) : (
          schedule && school && (
            <ScheduleBlock
              student={student}
              schedule={schedule}
              school={school}
              startMinute={startMinute}
              endMinute={endMinute}
              timelineContainerRef={timelineContainerRef}
              hasConflict={hasConflict}
              conflictMessage={conflictMessage}
            />
          )
        )}
      </div>
    </div>
  );
};
