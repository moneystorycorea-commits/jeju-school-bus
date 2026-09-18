import React, { useRef, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TimeAxis } from './TimeAxis';
import { StudentRow } from './StudentRow';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { AlertTriangle, CheckCircle2, ArrowUpDown } from 'lucide-react';

export const ScheduleBoard: React.FC = () => {
  const {
    students,
    schedules,
    schools,
    scheduleType,
    serviceDate,
    getConflicts,
    reorderStudents,
    holidays,
    openConflictModal,
  } = useScheduleStore();

  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState<'manual' | 'grade' | 'school' | 'name'>('manual');

  // 등교: 07:00 (420) ~ 10:30 (630)
  // 하교: 13:00 (780) ~ 18:30 (1110) - 13시 이전 불필요한 공백 제거
  const startMinute = scheduleType === 'MORNING' ? 420 : 780;
  const endMinute = scheduleType === 'MORNING' ? 630 : 1110;

  const conflicts = getConflicts();

  // 요일별 실제 탑승 학생 수 계산
  const currentWeekday = new Date(serviceDate).getDay() === 0 ? 7 : new Date(serviceDate).getDay();

  const activeCount = students.filter((s) => {
    const ws = s.weeklySchedule?.[currentWeekday];
    if (!ws || !ws.active) return false;
    return scheduleType === 'MORNING' ? ws.morningActive : ws.afternoonActive;
  }).length;
  const inactiveCount = students.length - activeCount;

  // 오늘 날짜에 걸쳐 있는 방학
  const todayHoliday = holidays.find(
    (h) => serviceDate >= h.startDate && serviceDate <= h.endDate
  );

  // 학교 정렬 우선순위: NLCS -> BHA -> KIS -> SJA -> CHEONG (저청초)
  const SCHOOL_PRIORITY: Record<string, number> = {
    NLCS: 1,
    BHA: 2,
    KIS: 3,
    SJA: 4,
    CHEONG: 5,
  };

  // 학년, 학교, 이름 정렬 로직 (기본 보기에서도 NLCS-BHA-KIS-SJA 자동 정렬)
  const sortedStudents = useMemo(() => {
    const list = [...students];
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
    if (sortBy === 'grade') {
      return list.sort((a, b) => {
        const parseGrade = (g?: string) => {
          if (!g) return -1;
          const match = g.match(/\d+/);
          return match ? parseInt(match[0], 10) : -1;
        };
        const diff = parseGrade(b.grade) - parseGrade(a.grade); // 고학년 -> 저학년 -> ?
        return diff !== 0 ? diff : a.name.localeCompare(b.name, 'ko');
      });
    }

    // 기본 보기('manual') 및 'school' 정렬:
    // 학생 추가 시에도 학교별로 NLCS-BHA-KIS-SJA 순으로 자동 정렬하고, 같은 학교 내에서는 학년 높은 순 -> 이름순
    return list.sort((a, b) => {
      const pA = SCHOOL_PRIORITY[a.schoolId] ?? 99;
      const pB = SCHOOL_PRIORITY[b.schoolId] ?? 99;
      if (pA !== pB) return pA - pB;

      const parseGrade = (g?: string) => {
        if (!g) return -1;
        const match = g.match(/\d+/);
        return match ? parseInt(match[0], 10) : -1;
      };
      const gradeDiff = parseGrade(b.grade) - parseGrade(a.grade);
      if (gradeDiff !== 0) return gradeDiff;

      return a.name.localeCompare(b.name, 'ko');
    });
  }, [students, sortBy]);

  // dnd-kit 센서 설정 (Row 정렬용)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = students.findIndex((s) => s.id === active.id);
      const newIndex = students.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderStudents(oldIndex, newIndex);
        setSortBy('manual');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. 상단 헤더 (학생관리 기준 폰트 크기 동기화: text-base 제목, text-xs/sm 배지 및 범례) */}
      <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {scheduleType === 'MORNING' ? '학생별 등교 스케줄' : '학생별 하교 스케줄'}
          </h2>
          <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            운행: <span className="text-blue-600 font-bold">{activeCount}명</span>
            {inactiveCount > 0 && (
              <span className="text-slate-400 font-normal ml-1">
                (미이용 {inactiveCount}명)
              </span>
            )}
          </span>

          {todayHoliday && (
            <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-semibold border border-amber-200">
              🌴 {todayHoliday.name}
            </span>
          )}

          {/* 시간 충돌 상태 버튼 */}
          {conflicts.length > 0 ? (
            <button
              type="button"
              onClick={openConflictModal}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs sm:text-sm font-bold cursor-pointer transition shadow-2xs animate-pulse"
              title="시간 충돌 세부 내역 보기"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>충돌 {conflicts.length}건</span>
              <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.2 rounded font-bold">확인</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>일정 정상</span>
            </span>
          )}
        </div>

        {/* 학교 컬러 공식 범례 (Linear 미니멀 닷, text-xs font-bold) */}
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#132742]" />
            <span>NLCS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#581c87]" />
            <span>BHA</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#08327C]" />
            <span>KIS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#14532d]" />
            <span>SJA</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0e7490]" />
            <span>저청초</span>
          </div>
        </div>
      </div>

      {/* 2. 16명 학생 타임라인 보드 */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[850px] flex flex-col">
          {/* 시간축 헤더 행 (sticky top-0 z-30) */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 sticky top-0 z-30 shadow-2xs">
            {/* 좌측 고정 열 헤더 (학생관리 테이블 헤더와 동일한 text-sm font-bold 정렬) */}
            <div className="w-[230px] px-2.5 py-1.5 border-r border-slate-200 sticky top-0 left-0 z-40 bg-slate-100 text-sm font-bold text-slate-700 flex items-center shrink-0 shadow-2xs">
              <div className="w-5 shrink-0" /> {/* Grip 핸들 정렬용 빈 공간 */}

              {/* 1. 이름 정렬 버튼 */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'name' ? 'manual' : 'name')}
                className={`flex-1 min-w-0 flex items-center justify-start gap-1 px-1 py-0.5 rounded text-sm transition cursor-pointer ${
                  sortBy === 'name'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200 font-bold'
                }`}
                title="이름 가나다순 정렬"
              >
                <span>이름</span>
                <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'name' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* 2. 학교 정렬 버튼 */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'school' ? 'manual' : 'school')}
                className={`w-14 shrink-0 flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-sm transition cursor-pointer ${
                  sortBy === 'school'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200 font-bold'
                }`}
                title="학교별 정렬"
              >
                <span>학교</span>
                <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'school' ? 'text-white' : 'text-slate-400'}`} />
              </button>

              {/* 3. 학년 정렬 버튼 */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'grade' ? 'manual' : 'grade')}
                className={`w-11 shrink-0 flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-sm transition cursor-pointer ${
                  sortBy === 'grade'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200 font-bold'
                }`}
                title="학년순 정렬"
              >
                <span>학년</span>
                <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'grade' ? 'text-white' : 'text-slate-400'}`} />
              </button>
            </div>
            {/* 우측 시간축 */}
            <div ref={timelineContainerRef} className="flex-1 relative bg-slate-50">
              <TimeAxis startMinute={startMinute} endMinute={endMinute} />
            </div>
          </div>

          {/* 16명 학생 행 리스트 (정렬 지원, 각 행 34px 높이) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedStudents.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedStudents.map((student, idx) => {
                const schedule = schedules.find(
                  (s) =>
                    s.studentId === student.id &&
                    s.date === serviceDate &&
                    s.type === scheduleType
                );
                const school = schools.find((sc) => sc.id === student.schoolId);
                const conflict = conflicts.find((c) => c.studentId === student.id);
                const isNewSchoolGroup =
                  (sortBy === 'manual' || sortBy === 'school') &&
                  idx > 0 &&
                  sortedStudents[idx - 1].schoolId !== student.schoolId;

                return (
                  <StudentRow
                    key={student.id}
                    student={student}
                    schedule={schedule}
                    school={school}
                    index={idx}
                    startMinute={startMinute}
                    endMinute={endMinute}
                    timelineContainerRef={timelineContainerRef}
                    hasConflict={!!conflict}
                    conflictMessage={conflict?.message}
                    isNewSchoolGroup={isNewSchoolGroup}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
