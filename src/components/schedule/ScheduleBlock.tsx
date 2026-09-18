import React, { useState, useEffect, useRef } from 'react';
import { GripVertical, ArrowRightLeft } from 'lucide-react';
import { Student, StudentSchedule, School, MinuteOfDay } from '@/types';
import { formatMinute, getTimelinePositionPercent } from '@/lib/scheduling/time';
import { useScheduleStore } from '@/lib/store/useScheduleStore';

interface ScheduleBlockProps {
  student: Student;
  schedule: StudentSchedule;
  school: School;
  startMinute: MinuteOfDay;
  endMinute: MinuteOfDay;
  timelineContainerRef: React.RefObject<HTMLDivElement | null>;
  hasConflict?: boolean;
  conflictMessage?: string;
}

export const ScheduleBlock: React.FC<ScheduleBlockProps> = ({
  student,
  schedule,
  school,
  startMinute,
  endMinute,
  timelineContainerRef,
  hasConflict,
  conflictMessage,
}) => {
  const {
    selectStudent,
    selectedStudentId,
    updateAssignedTime,
    toggleAlternateSchedule,
    setDraggingMinute,
  } = useScheduleStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragMinute, setDragMinute] = useState<MinuteOfDay>(schedule.assignedMinute);
  const isSelected = selectedStudentId === student.id;

  const dragStartXRef = useRef<number>(0);
  const startMinuteRef = useRef<number>(schedule.assignedMinute);
  const currentDragMinuteRef = useRef<number>(schedule.assignedMinute);

  // 스케줄 변경 시 로컬 dragMinute 동기화
  useEffect(() => {
    if (!isDragging) {
      setDragMinute(schedule.assignedMinute);
      currentDragMinuteRef.current = schedule.assignedMinute;
    }
  }, [schedule.assignedMinute, isDragging]);

  // 마우스 및 터치 드래그 시작 핸들러
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartXRef.current = clientX;
    startMinuteRef.current = schedule.assignedMinute;
    currentDragMinuteRef.current = schedule.assignedMinute;
    setIsDragging(true);
    setDragMinute(schedule.assignedMinute);
    setDraggingMinute(schedule.assignedMinute);
  };

  useEffect(() => {
    if (!isDragging) return;

    const isMorning = schedule.type === 'MORNING';

    const handleMove = (clientX: number) => {
      if (!timelineContainerRef.current) return;
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const totalDuration = endMinute - startMinute;
      const deltaPx = clientX - dragStartXRef.current;
      const deltaMinutes = (deltaPx / rect.width) * totalDuration;

      // 5분 단위 실시간 스냅
      const rawMinute = startMinuteRef.current + deltaMinutes;
      const snappedMinute = (Math.round(rawMinute / 5) * 5) as MinuteOfDay;
      const clampedMinute = isMorning
        ? (Math.max(startMinute + 20, Math.min(endMinute, snappedMinute)) as MinuteOfDay)
        : (Math.max(startMinute, Math.min(endMinute - 20, snappedMinute)) as MinuteOfDay);

      if (clampedMinute !== currentDragMinuteRef.current) {
        currentDragMinuteRef.current = clampedMinute;
        setDragMinute(clampedMinute);
        setDraggingMinute(clampedMinute);
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    const onEnd = () => {
      setIsDragging(false);
      setDraggingMinute(null);
      updateAssignedTime(student.id, currentDragMinuteRef.current);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      setDraggingMinute(null);
    };
  }, [isDragging, student.id, startMinute, endMinute, timelineContainerRef, updateAssignedTime, setDraggingMinute, schedule.type]);

  const isMorning = schedule.type === 'MORNING';
  const isCheong = school.shortName === '저청초' || school.id === 'CHEONG';
  const travelMinutes = isCheong ? 5 : 10;
  const travelWidthPercent = (travelMinutes / (endMinute - startMinute)) * 100;

  const displayMinute = isDragging ? dragMinute : schedule.assignedMinute;
  const leftPercent = getTimelinePositionPercent(displayMinute, startMinute, endMinute);

  // 학교 대표 색상의 진한 배경 스타일 (흰색 글씨와 완벽한 대비 및 높은 가독성)
  const getSchoolPastelStyle = () => {
    switch (school.shortName) {
      case 'BHA':
        return {
          backgroundColor: '#581c87', // Rich Deep Violet
          borderColor: '#4c1d95',
        };
      case 'NLCS':
        return {
          backgroundColor: '#132742', // Deep NLCS Oxford Navy (참고 이미지 #1D3B61 대비 좀 더 진하고 품격있는 딥 네이비)
          borderColor: '#0a1626',
        };
      case 'KIS':
        return {
          backgroundColor: '#08327C', // KIS Royal Blue (CollegeBoard 공식 색상 #08327C)
          borderColor: '#05245a',
        };
      case 'SJA':
        return {
          backgroundColor: '#166534', // Rich Forest Green
          borderColor: '#14532d',
        };
      case '저청초':
      case '저청초교':
      case 'CHEONG':
        return {
          backgroundColor: '#0f766e', // Rich Ocean Teal
          borderColor: '#115e59',
        };
      default:
        return {
          backgroundColor: '#334155',
          borderColor: '#1e293b',
        };
    }
  };

  const pastelStyle = getSchoolPastelStyle();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectStudent(student.id, true, false);
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className={`absolute top-1/2 h-7.5 px-2 rounded-md border text-white flex items-center gap-1 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md transition-all select-none group z-10 ${
        isMorning
          ? 'border-r-[4px] border-r-white rounded-r-xs shadow-[2px_0_8px_rgba(255,255,255,0.7)]'
          : ''
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md z-20' : ''} ${
        hasConflict ? 'ring-2 ring-red-400 border-red-300' : ''
      }`}
      style={{
        left: `${leftPercent}%`,
        transform: isMorning ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
        minWidth: isMorning ? (isCheong ? '58px' : '78px') : '104px',
        width: isMorning ? `${travelWidthPercent}%` : undefined,
        backgroundColor: pastelStyle.backgroundColor,
        borderColor: pastelStyle.borderColor,
      }}
      title={`${student.name} (${school.shortName}): ${isMorning ? '도착' : '출발'} ${formatMinute(displayMinute)} (단지 소요: ${travelMinutes}분) / 5분 단위 드래그 조정 가능${conflictMessage ? ` - [충돌: ${conflictMessage}]` : ''}`}
    >
      {/* 플로팅 실시간 시간 툴팁 (드래그 중) */}
      {isDragging && (
        <div
          className={`absolute -top-7 ${isMorning ? 'right-0' : 'left-0'} px-2 py-0.5 bg-slate-900 text-white text-xs font-black rounded shadow-md pointer-events-none whitespace-nowrap font-mono z-30`}
        >
          {isMorning ? '도착' : '출발'} {formatMinute(displayMinute)}
          <div
            className={`absolute top-full ${isMorning ? 'right-2' : 'left-2'} border-4 border-transparent border-t-slate-900`}
          />
        </div>
      )}

      {/* 내부 콘텐츠 (등교: 학교명 | 도착시간 + 미니 타겟링, 하교: 출발시간 | 학교명) */}
      {isMorning ? (
        <>
          {/* 학교 라벨 (저청초는 '저청'으로 콤팩트 표기) */}
          <span className="text-[11.5px] font-black text-white leading-none shrink-0 tracking-tight">
            {isCheong ? '저청' : school.shortName}
          </span>

          {/* 미니 구분선 */}
          <span className="w-px h-3 bg-white/35 shrink-0" />

          {/* 학교 도착 시간 (오른쪽 가이드라인에 맞닿는 배치) */}
          <span className="text-xs sm:text-[13px] font-black text-white font-mono tracking-tight shrink-0 drop-shadow-xs">
            {formatMinute(displayMinute)}
          </span>

          {/* [아이디어 4] 미니 타겟 링 (정밀 학교 도착 목표점 인디케이터) */}
          <div
            className="relative flex items-center justify-center w-3 h-3 shrink-0 ml-0.5"
            title={`학교 도착 목표 시각: ${formatMinute(displayMinute)}`}
          >
            <span className="absolute inset-0 rounded-full border border-white/70 animate-ping opacity-40" />
            <span className="w-3 h-3 rounded-full border-[1.5px] border-white flex items-center justify-center bg-white/20 shadow-xs">
              <span className="w-1 h-1 rounded-full bg-white shadow-xs" />
            </span>
          </div>
        </>
      ) : (
        <>
          {/* 하교: 출발 시간 */}
          <span className="text-sm font-black text-white font-mono tracking-tight shrink-0">
            {formatMinute(displayMinute)}
          </span>

          {/* 미니 구분선 */}
          <span className="w-px h-3.5 bg-white/35 shrink-0" />

          {/* 학교 라벨 */}
          <span className="text-xs font-black text-white leading-none shrink-0 tracking-wide">
            {school.shortName}
          </span>
        </>
      )}

      {/* 대체 희망시간 전환 버튼 (예: 4시 ⇄ 5시15분) */}
      {schedule.alternateMinutes && schedule.alternateMinutes.length > 1 && !isDragging && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleAlternateSchedule(student.id, schedule.date, schedule.type);
          }}
          className="p-0.5 rounded bg-white/20 hover:bg-white/35 text-white transition cursor-pointer shrink-0 ml-0.5"
          title="대체 희망시간 전환"
        >
          <ArrowRightLeft className="w-3 h-3" />
        </button>
      )}

      {/* 충돌 표시 닷 */}
      {hasConflict && (
        <span
          className="w-2 h-2 rounded-full bg-red-400 ring-1.5 ring-white animate-pulse ml-0.5 shrink-0 shadow-xs"
          title={conflictMessage}
        />
      )}

      {/* 우측 그립 아이콘 (하교 시 또는 여유 있을 때) */}
      {!isMorning && (
        <GripVertical className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition ml-auto shrink-0" />
      )}
    </div>
  );
};
