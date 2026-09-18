import React, { useRef, useState, useMemo, useEffect } from 'react';
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
import { Student, School, SchoolHoliday } from '@/types';
import { AlertTriangle, CheckCircle2, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cleanHolidayName } from '@/lib/scheduling/time';

interface SchoolGroup {
  schoolId: string;
  school?: School;
  students: Student[];
  isOperating: boolean;
  holiday?: SchoolHoliday;
  activeCount: number;
}

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

  // 미운행 학교 아코디언 펼침 상태 (학교 ID -> boolean)
  const [expandedSchoolIds, setExpandedSchoolIds] = useState<Record<string, boolean>>({});

  // 날짜나 스케줄 타입이 바뀌면 아코디언 접힘 상태로 리셋 (모바일과 동일 동작)
  useEffect(() => {
    setExpandedSchoolIds({});
  }, [serviceDate, scheduleType]);

  const toggleSchoolExpand = (schoolId: string) => {
    setExpandedSchoolIds((prev) => ({
      ...prev,
      [schoolId]: !prev[schoolId],
    }));
  };

  // 등교: 07:00 (420) ~ 10:30 (630)
  // 하교: 13:30 (810) ~ 18:30 (1110) - 저청초 하교(13:45)에 최대한 밀착
  const startMinute = scheduleType === 'MORNING' ? 420 : 810;
  const endMinute = scheduleType === 'MORNING' ? 630 : 1110;

  const conflicts = getConflicts();

  // 요일별 실제 탑승 학생 수 계산
  const currentWeekday = new Date(serviceDate).getDay() === 0 ? 7 : new Date(serviceDate).getDay();

  // 학생별 실제 탑승 여부 판정 (학교 휴일이 아니며, 오늘 요일의 스케줄이 활성화되어 배정된 학생)
  const isStudentOperating = (student: Student) => {
    const holiday = holidays.find(
      (h) =>
        (h.schoolId === student.schoolId || h.schoolId === 'ALL') &&
        serviceDate >= h.startDate &&
        serviceDate <= h.endDate
    );
    if (holiday) return false;
    const ws = student.weeklySchedule?.[currentWeekday];
    if (!ws || !ws.active) return false;
    const isTimeActive = scheduleType === 'MORNING' ? ws.morningActive : ws.afternoonActive;
    if (!isTimeActive) return false;
    const schedule = schedules.find(
      (s) => s.studentId === student.id && s.date === serviceDate && s.type === scheduleType
    );
    return !!schedule;
  };

  const activeCount = students.filter(isStudentOperating).length;
  const inactiveCount = students.length - activeCount;

  // 오늘 날짜에 걸쳐 있는 방학
  const todayHoliday = holidays.find(
    (h) => serviceDate >= h.startDate && serviceDate <= h.endDate
  );

  // 1호차 및 2호차 전담 학교 분류
  // 1호차: NLCS, 저청초, 저청중
  // 2호차: BHA, SJA, KIS
  const V1_SCHOOL_PRIORITY: Record<string, number> = {
    NLCS: 1,
    CHEONG: 2,
    CHEONG_MID: 3,
  };

  const V2_SCHOOL_PRIORITY: Record<string, number> = {
    BHA: 1,
    SJA: 2,
    KIS: 3,
  };

  // 학교별 그룹 구성 및 "운행 있는 학교 최상단 정렬" 함수
  const buildSchoolGroups = (schoolIds: string[], priorityMap: Record<string, number>): SchoolGroup[] => {
    const groups: SchoolGroup[] = [];

    schoolIds.forEach((schId) => {
      const schStudents = students.filter((s) => s.schoolId === schId);
      if (schStudents.length === 0) return;

      const school = schools.find((sc) => sc.id === schId);
      const holiday = holidays.find(
        (h) =>
          (h.schoolId === schId || h.schoolId === 'ALL') &&
          serviceDate >= h.startDate &&
          serviceDate <= h.endDate
      );

      const activeStudents = schStudents.filter(isStudentOperating);
      const isOperating = !holiday && activeStudents.length > 0;

      // 학생 정렬 (학년순/이름순)
      const sortedStudents = [...schStudents].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name, 'ko');
        }
        const parseGrade = (g?: string) => {
          if (!g) return -1;
          const match = g.match(/\d+/);
          return match ? parseInt(match[0], 10) : -1;
        };
        const diff = parseGrade(b.grade) - parseGrade(a.grade);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, 'ko');
      });

      groups.push({
        schoolId: schId,
        school,
        students: sortedStudents,
        isOperating,
        holiday,
        activeCount: activeStudents.length,
      });
    });

    // 💡 핵심: 운행 있는 학교(isOperating === true)를 최우선 정렬하고,
    // 운행 없는 학교는 아래로 배치한 뒤 아코디언 적용!
    return groups.sort((a, b) => {
      if (a.isOperating !== b.isOperating) {
        return a.isOperating ? -1 : 1;
      }
      const pA = priorityMap[a.schoolId] ?? 99;
      const pB = priorityMap[b.schoolId] ?? 99;
      return pA - pB;
    });
  };

  const v1SchoolGroups = useMemo(() => {
    return buildSchoolGroups(['NLCS', 'CHEONG', 'CHEONG_MID'], V1_SCHOOL_PRIORITY);
  }, [students, schools, holidays, schedules, serviceDate, scheduleType, currentWeekday, sortBy]);

  const v2SchoolGroups = useMemo(() => {
    return buildSchoolGroups(['BHA', 'SJA', 'KIS'], V2_SCHOOL_PRIORITY);
  }, [students, schools, holidays, schedules, serviceDate, scheduleType, currentWeekday, sortBy]);

  const v1Students = useMemo(() => v1SchoolGroups.flatMap((g) => g.students), [v1SchoolGroups]);
  const v2Students = useMemo(() => v2SchoolGroups.flatMap((g) => g.students), [v2SchoolGroups]);

  const v1ActiveCount = useMemo(() => v1Students.filter(isStudentOperating).length, [v1Students, serviceDate, scheduleType, currentWeekday, holidays, schedules]);
  const v2ActiveCount = useMemo(() => v2Students.filter(isStudentOperating).length, [v2Students, serviceDate, scheduleType, currentWeekday, holidays, schedules]);

  // dnd-kit 용 보이는 학생 ID 목록
  const visibleStudentIds = useMemo(() => {
    const ids: string[] = [];
    v1SchoolGroups.forEach((g) => {
      if (g.isOperating || expandedSchoolIds[g.schoolId]) {
        g.students.forEach((s) => ids.push(s.id));
      }
    });
    v2SchoolGroups.forEach((g) => {
      if (g.isOperating || expandedSchoolIds[g.schoolId]) {
        g.students.forEach((s) => ids.push(s.id));
      }
    });
    return ids;
  }, [v1SchoolGroups, v2SchoolGroups, expandedSchoolIds]);

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

        {/* 호차별 전담 학교 공식 범례 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1호차 전담 */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold shadow-2xs">
            <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[10px] font-black">1호차</span>
            <div className="flex items-center gap-1 text-indigo-950">
              <span className="w-2 h-2 rounded-full bg-[#132742]" />
              <span>NLCS</span>
              <span className="text-indigo-300">·</span>
              <span className="w-2 h-2 rounded-full bg-[#0e7490]" />
              <span>저청(초/중)</span>
            </div>
          </div>

          {/* 2호차 전담 */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-bold shadow-2xs">
            <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[10px] font-black">2호차</span>
            <div className="flex items-center gap-1 text-purple-950">
              <span className="w-2 h-2 rounded-full bg-[#581c87]" />
              <span>BHA</span>
              <span className="text-purple-300">·</span>
              <span className="w-2 h-2 rounded-full bg-[#14532d]" />
              <span>SJA</span>
              <span className="text-purple-300">·</span>
              <span className="w-2 h-2 rounded-full bg-[#08327C]" />
              <span>KIS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 16명 학생 타임라인 보드 (1호차 / 2호차 2개 그룹 분리 렌더링) */}
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

          {/* 1호차 & 2호차 2개 그룹 학생 행 리스트 */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleStudentIds}
              strategy={verticalListSortingStrategy}
            >
              {/* ===== [그룹 1: 1호차 전담 운행 - NLCS & 저청] ===== */}
              <div className="flex items-stretch border-b border-indigo-200/90 bg-indigo-50/90 select-none">
                {/* 좌측 1호차 배너 */}
                <div className="w-[230px] px-3 py-1.5 border-r border-indigo-200 bg-indigo-50/95 sticky left-0 z-20 flex items-center justify-between shrink-0 shadow-2xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-black tracking-wide shadow-2xs">
                    1호차
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded border border-indigo-200">
                    {v1ActiveCount}명
                  </span>
                </div>
                {/* 우측 1호차 타임라인 요약 */}
                <div className="flex-1 px-3 py-1.5 flex items-center justify-between text-xs text-indigo-900 font-semibold bg-indigo-50/60 overflow-hidden border-y border-indigo-100">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[11px] text-indigo-600 font-bold shrink-0">운행 노선:</span>
                    <span className="text-[11px] text-slate-700 font-medium truncate">
                      {scheduleType === 'MORNING' ? (
                        <>
                          <span className="font-bold text-indigo-950">07:40</span> 단지출발 ➔ <span className="font-bold text-[#132742]">07:50 NLCS</span>
                          <span className="mx-2 text-indigo-300">|</span>
                          <span className="font-bold text-indigo-950">08:20</span> 단지출발 ➔ <span className="font-bold text-[#0e7490]">08:25 저청</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#0e7490]">13:50 저청</span>
                          <span className="mx-2 text-indigo-300">|</span>
                          <span className="font-bold text-[#132742]">15:30 / 16:30 / 17:30 NLCS</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-indigo-500 font-medium shrink-0 ml-2">
                    {scheduleType === 'MORNING' ? '2회 분리 운행 (복귀 후 저청 출발)' : '저청 1회 + NLCS 3회 전담'}
                  </span>
                </div>
              </div>

              {/* 1호차 학교 그룹 및 학생 목록 (운행 있는 학교 우선 렌더링 + 미운행 학교 아코디언) */}
              {v1SchoolGroups.map((group, groupIdx) => {
                const isExpanded = !!expandedSchoolIds[group.schoolId];

                return (
                  <React.Fragment key={group.schoolId}>
                    {/* 운행이 없는 학교인 경우: 아코디언 헤더 바 */}
                    {!group.isOperating && (
                      <div
                        onClick={() => toggleSchoolExpand(group.schoolId)}
                        className="flex items-center h-9.5 border-b border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/70 transition-colors select-none cursor-pointer"
                      >
                        {/* 좌측 230px 고정 정보 */}
                        <div className="w-[230px] px-2.5 py-1 border-r border-amber-200 bg-amber-50/95 sticky left-0 z-20 flex items-center shrink-0 h-full shadow-2xs">
                          <div className="w-5 flex items-center justify-center shrink-0">
                            <span className="text-amber-500 text-xs">🌴</span>
                          </div>
                          <div className="w-14 shrink-0 flex items-center justify-center">
                            <span
                              className="text-xs font-black px-2 py-0.5 rounded border shadow-2xs text-white"
                              style={{ backgroundColor: group.school?.color || '#f59e0b' }}
                            >
                              {group.school?.shortName || group.schoolId}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pl-1.5 flex items-center">
                            <span className="text-xs font-extrabold text-amber-900 tracking-tight">
                              미운행 ({group.students.length}명)
                            </span>
                          </div>
                          <div className="w-6 shrink-0 flex items-center justify-center text-amber-700">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* 우측 타임라인 영역: 휴일명 및 펼치기/접기 버튼 */}
                        <div className="relative flex-1 h-full flex items-center justify-between px-3">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs font-bold text-amber-950 truncate">
                              🌴 {group.holiday ? cleanHolidayName(group.holiday.name) : (scheduleType === 'MORNING' ? '등교 셔틀 미이용' : '하교 셔틀 미이용')}
                            </span>
                            {group.holiday?.notes && (
                              <span className="text-[11px] text-amber-700/80 truncate font-normal">
                                ({group.holiday.notes})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[11px] font-black text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs transition flex items-center gap-1">
                              <span>{isExpanded ? '목록 접기' : '명단 보기'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 운행이 있는 학교이거나, 아코디언이 펼쳐진 경우 학생 행 렌더링 */}
                    {(group.isOperating || isExpanded) &&
                      group.students.map((student, sIdx) => {
                        const schedule = schedules.find(
                          (s) =>
                            s.studentId === student.id &&
                            s.date === serviceDate &&
                            s.type === scheduleType
                        );
                        const conflict = conflicts.find((c) => c.studentId === student.id);
                        const isNewSchoolGroup = groupIdx > 0 && sIdx === 0;

                        return (
                          <StudentRow
                            key={student.id}
                            student={student}
                            schedule={schedule}
                            school={group.school}
                            index={sIdx}
                            startMinute={startMinute}
                            endMinute={endMinute}
                            timelineContainerRef={timelineContainerRef}
                            hasConflict={!!conflict}
                            conflictMessage={conflict?.message}
                            isNewSchoolGroup={isNewSchoolGroup}
                          />
                        );
                      })}
                  </React.Fragment>
                );
              })}

              {/* ===== [그룹 2: 2호차 전담 운행 - BHA · SJA · KIS] ===== */}
              <div className="flex items-stretch border-b border-purple-200/90 bg-purple-50/90 select-none">
                {/* 좌측 2호차 배너 */}
                <div className="w-[230px] px-3 py-1.5 border-r border-purple-200 bg-purple-50/95 sticky left-0 z-20 flex items-center justify-between shrink-0 shadow-2xs">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-xs font-black tracking-wide shadow-2xs">
                    2호차
                  </span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded border border-purple-200">
                    {v2ActiveCount}명
                  </span>
                </div>
                {/* 우측 2호차 타임라인 요약 */}
                <div className="flex-1 px-3 py-1.5 flex items-center justify-between text-xs text-purple-900 font-semibold bg-purple-50/60 overflow-hidden border-y border-purple-100">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[11px] text-purple-600 font-bold shrink-0">운행 노선:</span>
                    <span className="text-[11px] text-slate-700 font-medium truncate">
                      {scheduleType === 'MORNING' ? (
                        <>
                          <span className="font-bold text-purple-950">07:40</span> 단지출발 ➔ <span className="font-bold text-[#581c87]">07:50 BHA</span> ➔ <span className="font-bold text-[#14532d]">07:55 SJA</span> ➔ <span className="font-bold text-[#08327C]">08:00 KIS</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-[#581c87]">15:30 / 16:00 / 16:30 / 17:00 / 17:30 BHA</span>
                          <span className="mx-2 text-purple-300">|</span>
                          <span className="text-slate-500 font-normal">15:15 저청(금)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-purple-500 font-medium shrink-0 ml-2">
                    {scheduleType === 'MORNING' ? '순환 경유 운행 (단지 복귀 08:15)' : 'BHA 하교 집중 배차'}
                  </span>
                </div>
              </div>

              {/* 2호차 학교 그룹 및 학생 목록 (운행 있는 학교 우선 렌더링 + 미운행 학교 아코디언) */}
              {v2SchoolGroups.map((group, groupIdx) => {
                const isExpanded = !!expandedSchoolIds[group.schoolId];

                return (
                  <React.Fragment key={group.schoolId}>
                    {/* 운행이 없는 학교인 경우: 아코디언 헤더 바 */}
                    {!group.isOperating && (
                      <div
                        onClick={() => toggleSchoolExpand(group.schoolId)}
                        className="flex items-center h-9.5 border-b border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/70 transition-colors select-none cursor-pointer"
                      >
                        {/* 좌측 230px 고정 정보 */}
                        <div className="w-[230px] px-2.5 py-1 border-r border-amber-200 bg-amber-50/95 sticky left-0 z-20 flex items-center shrink-0 h-full shadow-2xs">
                          <div className="w-5 flex items-center justify-center shrink-0">
                            <span className="text-amber-500 text-xs">🌴</span>
                          </div>
                          <div className="w-14 shrink-0 flex items-center justify-center">
                            <span
                              className="text-xs font-black px-2 py-0.5 rounded border shadow-2xs text-white"
                              style={{ backgroundColor: group.school?.color || '#f59e0b' }}
                            >
                              {group.school?.shortName || group.schoolId}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pl-1.5 flex items-center">
                            <span className="text-xs font-extrabold text-amber-900 tracking-tight">
                              미운행 ({group.students.length}명)
                            </span>
                          </div>
                          <div className="w-6 shrink-0 flex items-center justify-center text-amber-700">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* 우측 타임라인 영역: 휴일명 및 펼치기/접기 버튼 */}
                        <div className="relative flex-1 h-full flex items-center justify-between px-3">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs font-bold text-amber-950 truncate">
                              🌴 {group.holiday ? cleanHolidayName(group.holiday.name) : (scheduleType === 'MORNING' ? '등교 셔틀 미이용' : '하교 셔틀 미이용')}
                            </span>
                            {group.holiday?.notes && (
                              <span className="text-[11px] text-amber-700/80 truncate font-normal">
                                ({group.holiday.notes})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-[11px] font-black text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs transition flex items-center gap-1">
                              <span>{isExpanded ? '목록 접기' : '명단 보기'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 운행이 있는 학교이거나, 아코디언이 펼쳐진 경우 학생 행 렌더링 */}
                    {(group.isOperating || isExpanded) &&
                      group.students.map((student, sIdx) => {
                        const schedule = schedules.find(
                          (s) =>
                            s.studentId === student.id &&
                            s.date === serviceDate &&
                            s.type === scheduleType
                        );
                        const conflict = conflicts.find((c) => c.studentId === student.id);
                        const isNewSchoolGroup = groupIdx > 0 && sIdx === 0;

                        return (
                          <StudentRow
                            key={student.id}
                            student={student}
                            schedule={schedule}
                            school={group.school}
                            index={v1Students.length + sIdx}
                            startMinute={startMinute}
                            endMinute={endMinute}
                            timelineContainerRef={timelineContainerRef}
                            hasConflict={!!conflict}
                            conflictMessage={conflict?.message}
                            isNewSchoolGroup={isNewSchoolGroup}
                          />
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
