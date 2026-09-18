import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Minus,
  RotateCcw,
  Calendar as CalendarIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarCheck2,
  Pin,
  PinOff,
  SlidersHorizontal,
} from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute, getWeekdayNumber } from '@/lib/scheduling/time';
import { RouteSegment } from '@/types';

export const ScheduleDetailDrawer: React.FC = () => {
  const {
    isDetailDrawerOpen,
    openDetailDrawer,
    closeDetailDrawer,
    detailDrawerTab,
    setDetailDrawerTab,
    selectedStudentId,
    students,
    schools,
    schedules,
    serviceDate,
    scheduleType,
    routeSegments,
    updateRouteSegmentTravelTime,
    resetRouteSegments,
    saveChanges,
    holidays,
    addHoliday,
    removeHoliday,
    updateStudentWeeklySchedule,
    setServiceDate,
  } = useScheduleStore();

  const currentWeekday = getWeekdayNumber(serviceDate);
  const [selectedWeekday, setSelectedWeekday] = useState<number>(currentWeekday > 5 ? 1 : currentWeekday);

  // 달력 뷰 상태 (연도 / 월 관리)
  const [viewYear, setViewYear] = useState<number>(() => {
    const d = new Date(serviceDate);
    return isNaN(d.getTime()) ? 2024 : d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    const d = new Date(serviceDate);
    return isNaN(d.getTime()) ? 9 : d.getMonth(); // 0-indexed (9 = 10월)
  });

  // 호버 및 고정(Pin) 상태 관리
  const [isPinned, setIsPinned] = useState(false);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDrawerMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleDrawerMouseLeave = () => {
    if (isPinned) return; // 고정된 상태에서는 자동 닫기 방지
    leaveTimerRef.current = setTimeout(() => {
      closeDetailDrawer();
    }, 600); // 600ms grace period
  };

  // serviceDate 변경 시 달력 뷰 동기화
  useEffect(() => {
    const d = new Date(serviceDate);
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      const wd = getWeekdayNumber(serviceDate);
      if (wd >= 1 && wd <= 5) {
        setSelectedWeekday(wd);
      }
    }
  }, [serviceDate]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
  }, []);

  // 방학 등록 폼 상태
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [newHolidaySchoolId, setNewHolidaySchoolId] = useState('BHA');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayStartDate, setNewHolidayStartDate] = useState(serviceDate);
  const [newHolidayEndDate, setNewHolidayEndDate] = useState(serviceDate);
  const [newHolidayType, setNewHolidayType] = useState<'vacation' | 'school_closed' | 'school_event' | 'other'>('vacation');

  // 기존 등록 학생 수가 많은 순서대로 학교 정렬 (동률일 경우 학교명 순)
  const sortedSchools = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.schoolId] = (counts[s.schoolId] || 0) + 1;
    });

    return [...schools].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      if (countB !== countA) return countB - countA;
      return a.shortName.localeCompare(b.shortName);
    });
  }, [schools, students]);

  // 구간 소요시간 필터: 'all' | 'today' | 'v1' | 'v2'
  const [routeFilter, setRouteFilter] = useState<'all' | 'today' | 'v1' | 'v2'>('all');

  const weekdayNames: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };

  // 현재 요일에 실제 탑승하는 학생들의 학교 ID
  const activeSchoolsToday = useMemo(() => {
    const active = new Set<string>();
    students.forEach((s) => {
      const ws = s.weeklySchedule?.[selectedWeekday];
      if (ws && (ws.morningActive || ws.afternoonActive)) {
        active.add(s.schoolId);
      }
    });
    return active;
  }, [students, selectedWeekday]);

  const getSegmentVehicle = (seg: RouteSegment): '1호차' | '2호차' => {
    const v1Locs = new Set(['NLCS_MAIN', 'NLCS_JUNIOR', 'CHEONG_MAIN', 'CHEONG_MID_MAIN']);
    if (v1Locs.has(seg.originLocationId) || v1Locs.has(seg.destinationLocationId)) {
      return '1호차';
    }
    return '2호차';
  };

  const getSegmentSchoolIds = (seg: RouteSegment): string[] => {
    const ids: string[] = [];
    if (seg.originLocationId.includes('NLCS') || seg.destinationLocationId.includes('NLCS')) ids.push('NLCS');
    if (seg.originLocationId.includes('CHEONG_MID') || seg.destinationLocationId.includes('CHEONG_MID')) ids.push('CHEONG_MID');
    else if (seg.originLocationId.includes('CHEONG') || seg.destinationLocationId.includes('CHEONG')) ids.push('CHEONG');
    if (seg.originLocationId.includes('BHA') || seg.destinationLocationId.includes('BHA')) ids.push('BHA');
    if (seg.originLocationId.includes('SJA') || seg.destinationLocationId.includes('SJA')) ids.push('SJA');
    if (seg.originLocationId.includes('KIS') || seg.destinationLocationId.includes('KIS')) ids.push('KIS');
    return ids;
  };

  const filteredRouteSegments = useMemo(() => {
    return routeSegments.filter((seg) => {
      if (routeFilter === 'all') return true;
      if (routeFilter === 'v1') return getSegmentVehicle(seg) === '1호차';
      if (routeFilter === 'v2') return getSegmentVehicle(seg) === '2호차';
      if (routeFilter === 'today') {
        const segSchools = getSegmentSchoolIds(seg);
        return segSchools.some((sch) => activeSchoolsToday.has(sch));
      }
      return true;
    });
  }, [routeSegments, routeFilter, activeSchoolsToday]);

  const formatLocationName = (locId: string): string => {
    return locId
      .replace('COMPLEX_MAIN', '아주더하이클래스')
      .replace('CHEONG_MID_MAIN', '저청중 정문')
      .replace('CHEONG_MAIN', '저청초 정문')
      .replace('NLCS_MAIN', 'NLCS 본관')
      .replace('NLCS_JUNIOR', 'NLCS 주니어')
      .replace('BHA_GATE1', 'BHA G1')
      .replace('SJA_GATE3', 'SJA G3')
      .replace('KIS_MAIN', 'KIS 본관');
  };

  // 드로어가 닫혀 있을 때: 오른쪽 구간 커서 감지 스트립 & 플로팅 탭 렌더링
  if (!isDetailDrawerOpen) {
    return (
      /* 오른쪽 가장자리 플로팅 탭 버튼 (클릭 시 열림) */
      <div
        onClick={openDetailDrawer}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-blue-50 border-l border-y border-slate-300 text-slate-700 hover:text-blue-600 px-1.5 py-4 rounded-l-xl shadow-md cursor-pointer transition-all flex flex-col items-center gap-1.5 group select-none no-print"
        title="클릭하여 학생 상세 일정 및 운행설정 창 열기"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-bold [writing-mode:vertical-lr] tracking-widest text-slate-700 group-hover:text-blue-600">
          운행설정
        </span>
        <ChevronLeft className="w-3 h-3 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
      </div>
    );
  }

  const student = students.find((s) => s.id === selectedStudentId);
  const school = student ? schools.find((sc) => sc.id === student.schoolId) : null;
  const studentIndex = student ? students.findIndex((s) => s.id === student.id) + 1 : 1;
  const currentSchedule = schedules.find(
    (s) => s.studentId === selectedStudentId && s.date === serviceDate && s.type === scheduleType
  );

  // 선택된 요일의 희망/배정 시간
  const weekdayData = student?.weeklySchedule?.[selectedWeekday];
  const morningMin = weekdayData ? weekdayData.morningMinute : (currentSchedule?.assignedMinute || 460);
  const afternoonMin = weekdayData ? weekdayData.afternoonMinute : 930;

  const handleMorningChange = (delta: number) => {
    if (!student) return;
    const newMin = Math.max(360, Math.min(600, morningMin + delta));
    updateStudentWeeklySchedule(student.id, selectedWeekday, newMin, afternoonMin);
  };

  const handleAfternoonChange = (delta: number) => {
    if (!student) return;
    const newMin = Math.max(780, Math.min(1110, afternoonMin + delta));
    updateStudentWeeklySchedule(student.id, selectedWeekday, morningMin, newMin);
  };

  // 달력 월 변경 핸들러
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y - 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // 달력 날짜 클릭 시: serviceDate 업데이트 -> 왼쪽 창 운행표 & 요일 탭 즉시 동기화
  const handleDateClick = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setServiceDate(dateStr);
    const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
    const wd = dayOfWeek === 0 ? 7 : dayOfWeek;
    if (wd >= 1 && wd <= 5) {
      setSelectedWeekday(wd);
    }
  };

  // 방학 등록 제출 핸들러
  const handleAddHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim()) return;
    addHoliday({
      schoolId: newHolidaySchoolId,
      startDate: newHolidayStartDate,
      endDate: newHolidayEndDate,
      name: newHolidayName.trim(),
      type: newHolidayType,
    });
    setNewHolidayName('');
    setIsAddingHoliday(false);
  };

  // 달력 날짜 계산 (첫째 날 요일 오프셋 및 해당 월 일수)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0(일) ~ 6(토)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  return (
    <div
      onMouseEnter={handleDrawerMouseEnter}
      onMouseLeave={handleDrawerMouseLeave}
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0 h-full overflow-y-auto select-none shadow-2xl z-40 animate-slideLeft transition-all duration-300 no-print"
    >
      {/* 1. 드로어 헤더 */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
            {studentIndex}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 tracking-tight">
              {student ? student.name : '스케줄 상세 설정'}
            </span>
            {school && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-md border shadow-2xs ${school.badgeBg}`}>
                {school.shortName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* 창 고정 토글 버튼 */}
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
              isPinned
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200 border border-transparent'
            }`}
            title={isPinned ? '창 고정 해제 (커서 벗어나면 자동 슬라이딩 닫힘)' : '창 고정 (커서 벗어나도 열려 있음)'}
          >
            {isPinned ? <PinOff className="w-3.5 h-3.5 text-blue-600" /> : <Pin className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isPinned ? '고정됨' : '고정'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPinned(false);
              closeDetailDrawer();
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer ml-0.5"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. 탭 네비게이션 */}
      <div className="px-4 pt-2.5 pb-1 border-b border-slate-200 flex gap-1.5 bg-slate-50/40">
        <button
          type="button"
          onClick={() => setDetailDrawerTab('info')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            detailDrawerTab === 'info'
              ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          운행일자 · 시간
        </button>
        <button
          type="button"
          onClick={() => setDetailDrawerTab('vacation')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer relative ${
            detailDrawerTab === 'vacation'
              ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>방학 · 학사일정</span>
          {holidays.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {holidays.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setDetailDrawerTab('route')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            detailDrawerTab === 'route'
              ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          구간 소요시간
        </button>
      </div>

      {/* 3. 본문 콘텐츠 */}
      <div className="p-4 flex flex-col gap-4.5 flex-1">
        {detailDrawerTab === 'info' && (
          <>
            {/* 3-A. 운행 일자 달력 (클릭 시 왼쪽 창 요일별 운행표 연동 + 학교별 방학 표시) */}
            <div className="flex flex-col gap-2 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">운행 일자 달력</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="이전 달"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 px-1 font-mono">
                    {viewYear}년 {viewMonth + 1}월
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 rounded-md hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="다음 달"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 py-1 border-b border-slate-200/60">
                <span className="text-red-400">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-blue-400">토</span>
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* 첫 날 이전 빈칸 */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 md:h-9" />
                ))}

                {/* 해당 월 날짜 */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = dateStr === serviceDate;
                  const dayOfWeek = (firstDayOfWeek + i) % 7;
                  const isSun = dayOfWeek === 0;
                  const isSat = dayOfWeek === 6;

                  // 해당 날짜에 걸쳐 있는 방학/휴일 목록
                  const dayHolidays = holidays.filter((h) => dateStr >= h.startDate && dateStr <= h.endDate);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateClick(day)}
                      className={`h-8 md:h-9 rounded-lg font-bold transition flex flex-col items-center justify-center cursor-pointer relative text-xs ${
                        isSelected
                          ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                          : dayHolidays.length > 0
                          ? 'bg-amber-50/90 text-amber-950 hover:bg-amber-100 border border-amber-200/80 font-bold'
                          : isSun
                          ? 'text-red-500 hover:bg-slate-100'
                          : isSat
                          ? 'text-blue-500 hover:bg-slate-100'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      title={
                        dayHolidays.length > 0
                          ? `${dateStr}: ${dayHolidays.map((h) => h.name).join(', ')}`
                          : dateStr
                      }
                    >
                      <span className="leading-none">{day}</span>
                      {/* 학교별 방학 표시 닷 */}
                      {dayHolidays.length > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {dayHolidays.slice(0, 3).map((dh) => {
                            const sc = schools.find((s) => s.id === dh.schoolId);
                            return (
                              <span
                                key={dh.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: isSelected ? '#ffffff' : (sc?.color || '#f59e0b'),
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 달력 하단 선택 정보 & 방학 범례 */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 text-slate-500">
                <span className="font-semibold text-slate-700">
                  선택: <strong className="text-blue-600">{serviceDate}</strong> ({['일', '월', '화', '수', '목', '금', '토'][new Date(serviceDate).getDay()]}요일)
                </span>
                <button
                  type="button"
                  onClick={() => setDetailDrawerTab('vacation')}
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>방학 기간 추가</span>
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 3-B. 요일별 등교 / 하교 시간 (5분 스냅 +/- 조절기) */}
            <div className="flex flex-col gap-2.5 border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {student?.name || '학생'} 요일별 등/하교 시간
                </span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  5분 단위 Snap
                </span>
              </div>

              {/* 요일 선택 버튼 */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                {[
                  { day: 1, label: '월' },
                  { day: 2, label: '화' },
                  { day: 3, label: '수' },
                  { day: 4, label: '목' },
                  { day: 5, label: '금' },
                ].map(({ day, label }) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedWeekday(day)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedWeekday === day
                        ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 선택된 요일의 등교/하교 시간 조절기 */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* 등교 시간 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    {['', '월', '화', '수', '목', '금'][selectedWeekday]}요일 등교 시간
                  </span>
                  <div className="flex items-center justify-between border border-slate-300 rounded-xl p-1 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleMorningChange(-5)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
                      title="5분 감소"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {formatMinute(morningMin)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleMorningChange(5)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
                      title="5분 증가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 하교 시간 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    {['', '월', '화', '수', '목', '금'][selectedWeekday]}요일 하교 시간
                  </span>
                  <div className="flex items-center justify-between border border-slate-300 rounded-xl p-1 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleAfternoonChange(-5)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
                      title="5분 감소"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {formatMinute(afternoonMin)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAfternoonChange(5)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
                      title="5분 증가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 3-C. 학교별 방학 및 학사일정 관리 탭 */}
        {detailDrawerTab === 'vacation' && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">학교별 방학 및 학사일정 관리</h3>
                <p className="text-[11px] text-slate-500">지정된 기간 동안 해당 학교 학생은 타임라인에서 방학 안내가 표시됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingHoliday(!isAddingHoliday)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>방학 등록</span>
              </button>
            </div>

            {/* 방학 추가 폼 */}
            {isAddingHoliday && (
              <form onSubmit={handleAddHolidaySubmit} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                  <span>새 방학 / 학사일정 지정</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">대상 학교</label>
                    <select
                      value={newHolidaySchoolId}
                      onChange={(e) => setNewHolidaySchoolId(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      {sortedSchools.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.shortName} ({sc.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">구분</label>
                    <select
                      value={newHolidayType}
                      onChange={(e) => setNewHolidayType(e.target.value as any)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value="vacation">정기 방학 (여름/가을/겨울/봄)</option>
                      <option value="school_closed">재량휴업일 / 개교기념일</option>
                      <option value="school_event">학교 공식 행사</option>
                      <option value="other">기타 휴일</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600">방학 / 일정 명칭</label>
                  <input
                    type="text"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    placeholder="예: BHA 가을방학 (Fall Break)"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">시작일</label>
                    <input
                      type="date"
                      value={newHolidayStartDate}
                      onChange={(e) => setNewHolidayStartDate(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600">종료일</label>
                    <input
                      type="date"
                      value={newHolidayEndDate}
                      onChange={(e) => setNewHolidayEndDate(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingHoliday(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-2xs"
                  >
                    달력에 등록
                  </button>
                </div>
              </form>
            )}

            {/* 등록된 방학 목록 */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700">
                등록된 방학 및 학사일정 ({holidays.length}건)
              </span>

              {holidays.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                  등록된 방학 일정이 없습니다.
                </div>
              ) : (
                holidays.map((h) => {
                  const sc = schools.find((s) => s.id === h.schoolId);
                  const isCurrentInThisHoliday = serviceDate >= h.startDate && serviceDate <= h.endDate;

                  return (
                    <div
                      key={h.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 shadow-2xs ${
                        isCurrentInThisHoliday
                          ? 'border-amber-400 bg-amber-50/60'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: sc?.color || '#3b82f6' }}
                        />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {h.name}
                            </span>
                            {sc && (
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border shadow-2xs ${sc.badgeBg}`}>
                                {sc.shortName}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {h.startDate} ~ {h.endDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setServiceDate(h.startDate);
                            setDetailDrawerTab('info');
                          }}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                          title="이 방학 기간 달력 및 운행표로 이동"
                        >
                          일정 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => removeHoliday(h.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="방학 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3-D. 구간별 이동 시간 설정 (운행 설정 탭 또는 기본 탭) */}
        {detailDrawerTab === 'route' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">구간별 이동 시간 (분)</span>
                <p className="text-[11px] text-slate-500">단지와 각 학교 게이트 간 차량 운행 소요시간을 조정합니다.</p>
              </div>
              <button
                type="button"
                onClick={resetRouteSegments}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>기본값 초기화</span>
              </button>
            </div>

            {/* 필터 탭: [전체], [오늘 운행 학교], [1호차], [2호차] */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setRouteFilter('all')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition cursor-pointer ${
                  routeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                전체 ({routeSegments.length})
              </button>
              <button
                type="button"
                onClick={() => setRouteFilter('today')}
                className={`flex-1 py-1 px-1.5 rounded-lg text-center transition cursor-pointer ${
                  routeFilter === 'today'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title={`현재 선택된 ${weekdayNames[selectedWeekday] || '월'}요일 운행 학교만 필터링`}
              >
                오늘({weekdayNames[selectedWeekday] || '월'}) 운행
              </button>
              <button
                type="button"
                onClick={() => setRouteFilter('v1')}
                className={`py-1 px-2 rounded-lg transition cursor-pointer ${
                  routeFilter === 'v1'
                    ? 'bg-blue-100 text-blue-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1호차
              </button>
              <button
                type="button"
                onClick={() => setRouteFilter('v2')}
                className={`py-1 px-2 rounded-lg transition cursor-pointer ${
                  routeFilter === 'v2'
                    ? 'bg-purple-100 text-purple-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2호차
              </button>
            </div>

            {/* 오늘 운행 모드 안내 배너 */}
            {routeFilter === 'today' && (
              <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 font-semibold flex items-center justify-between">
                <span>🗓️ {weekdayNames[selectedWeekday] || '월'}요일 실제 탑승 학교</span>
                <span className="font-bold text-blue-700 font-mono">
                  {Array.from(activeSchoolsToday).join(', ') || '운행 없음'}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 max-h-84 overflow-y-auto pr-1">
              {filteredRouteSegments.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  해당 조건에 일치하는 운행 구간이 없습니다.
                </div>
              ) : (
                filteredRouteSegments.map((seg) => {
                  const vehicle = getSegmentVehicle(seg);
                  const isV1 = vehicle === '1호차';

                  return (
                    <div
                      key={seg.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-slate-300 transition gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            isV1
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {vehicle}
                        </span>
                        <span className="font-bold text-slate-800 truncate" title={`${formatLocationName(seg.originLocationId)} → ${formatLocationName(seg.destinationLocationId)}`}>
                          {formatLocationName(seg.originLocationId)} → {formatLocationName(seg.destinationLocationId)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-8 text-center font-bold text-slate-900 font-mono text-xs">
                          {seg.travelMinutes}분
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRouteSegmentTravelTime(seg.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                          title="소요시간 1분 감소"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateRouteSegmentTravelTime(seg.id, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                          title="소요시간 1분 증가"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. 하단 액션 바 */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50 sticky bottom-0">
        <button
          type="button"
          onClick={() => {
            if (student && confirm(`${student.name} 학생의 일정을 삭제하시겠습니까?`)) {
              alert('일정이 삭제되었습니다.');
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer"
        >
          삭제
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={closeDetailDrawer}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              saveChanges();
              closeDetailDrawer();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
