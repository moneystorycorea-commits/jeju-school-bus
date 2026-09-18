import React, { useState, useMemo } from 'react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import {
  formatMinute,
  getWeekdayNumber,
  getTodayDateString,
  getDaysDifference,
  cleanHolidayName,
  formatCompactHolidayRange,
} from '@/lib/scheduling/time';
import { formatGradeDisplay } from '@/lib/constants/schools';
import { getSchoolTravelMinutes } from '@/lib/scheduling/routeCalculator';
import { SchoolCalendarMatrix } from '@/components/drawer/SchoolCalendarMatrix';
import { MobileAcademicCalendar } from './MobileAcademicCalendar';
import {
  Bus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Clock,
  X,
  Plus,
  ListFilter,
  Layers,
} from 'lucide-react';
import { UserRole, SchoolHoliday } from '@/types';

export const MobileScheduleView: React.FC = () => {
  const {
    serviceDate,
    setServiceDate,
    nextDate,
    prevDate,
    scheduleType,
    setScheduleType,
    currentRole,
    setCurrentRole,
    setForceDesktopView,
    students,
    schools,
    schedules,
    routeSegments,
    holidays,
    selectStudent,
    openStudentModal,
    tripTemplates,
  } = useScheduleStore();

  const [selectedVehicle, setSelectedVehicle] = useState<'v1' | 'v2'>('v1');
  const [isCalendarSheetOpen, setIsCalendarSheetOpen] = useState(false);
  const [calendarTab, setCalendarTab] = useState<'calendar' | 'list' | 'matrix'>('calendar');
  const [activeHoliday, setActiveHoliday] = useState<SchoolHoliday | null>(null);

  const handleOpenCalendarSheet = () => {
    // 현재 serviceDate에 해당하는 휴교/방학이 있다면 자동 활성화
    const currentHoliday = holidays.find(
      (h) => serviceDate >= h.startDate && serviceDate <= h.endDate
    );
    if (currentHoliday) {
      setActiveHoliday(currentHoliday);
    }
    setCalendarTab('calendar');
    setIsCalendarSheetOpen(true);
  };

  const todayStr = getTodayDateString();
  const isToday = serviceDate === todayStr;

  const handleToday = () => {
    setServiceDate(todayStr);
  };

  const currentWeekday = getWeekdayNumber(serviceDate);
  const weekdayLabel = ['일', '월', '화', '수', '목', '금', '토'][new Date(serviceDate).getDay()];

  // 선택된 호차에 해당하는 학생 목록 필터링
  const vehicleStudents = useMemo(() => {
    return students.filter((student) => {
      const isV1 =
        student.schoolId === 'NLCS' ||
        student.schoolId === 'CHEONG' ||
        student.schoolId === 'CHEONG_MID';
      return selectedVehicle === 'v1' ? isV1 : !isV1;
    });
  }, [students, selectedVehicle]);

  // 선택된 호차의 운행 정보 조회
  const activeTrips = useMemo(() => {
    return tripTemplates.filter(
      (tpl) =>
        tpl.vehicleId === selectedVehicle &&
        tpl.type === scheduleType &&
        tpl.weekdays.includes(currentWeekday)
    );
  }, [tripTemplates, selectedVehicle, scheduleType, currentWeekday]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 font-sans pb-14">
      {/* 1. 상단 모바일 앱 헤더 (컴팩트 높이) */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-3.5 py-2 shadow-sm sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <Bus className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight leading-tight">제주 아주더하이클래스</h1>
            <p className="text-[9.5px] text-blue-200 leading-tight">통학버스 실시간 스케줄</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* 권한 선택기 */}
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="text-[10px] font-bold bg-white/20 border border-white/30 rounded-md px-1.5 py-0.5 text-white"
          >
            <option value="admin" className="text-slate-900">관리자</option>
            <option value="guardian" className="text-slate-900">학부모</option>
            <option value="student" className="text-slate-900">학생</option>
          </select>

          {/* PC 모드로 전환 버튼 */}
          <button
            onClick={() => setForceDesktopView(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold transition border border-white/20 cursor-pointer"
            title="넓은 PC 타임라인 슬라이더 화면으로 전환"
          >
            <Monitor className="w-3 h-3" />
            <span>PC버전</span>
          </button>
        </div>
      </header>

      {/* 2. 날짜 선택기 & 등하교 토글 & 호차 탭 (컴팩트 마진 및 높이 최적화) */}
      <div className="bg-white border-b border-slate-200 p-2 px-3 shadow-2xs flex flex-col gap-1.5 sticky top-[41px] z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={prevDate}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="이전 날짜"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleOpenCalendarSheet}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{serviceDate} ({weekdayLabel})</span>
            </button>
            <button
              onClick={nextDate}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="다음 날짜"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className={`px-1.5 py-1 rounded-md text-xs font-black transition cursor-pointer border ${
                isToday
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title="오늘 날짜로 바로 이동"
            >
              오늘
            </button>
          </div>

          {/* 등교 / 하교 토글 */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
            <button
              onClick={() => setScheduleType('MORNING')}
              className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                scheduleType === 'MORNING'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              등교
            </button>
            <button
              onClick={() => setScheduleType('AFTERNOON')}
              className={`px-2.5 py-0.5 rounded-md transition cursor-pointer ${
                scheduleType === 'AFTERNOON'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              하교
            </button>
          </div>
        </div>

        {/* 차량 1호차 / 2호차 선택 탭 */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => setSelectedVehicle('v1')}
            className={`py-1.5 px-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedVehicle === 'v1'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>1호차 (NLCS · 저청)</span>
          </button>
          <button
            onClick={() => setSelectedVehicle('v2')}
            className={`py-1.5 px-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedVehicle === 'v2'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            <span>2호차 (BHA · SJA · KIS)</span>
          </button>
        </div>
      </div>

      {/* 3. 모바일 본문: 차량 운행 흐름 요약 카드 (컴팩트 리본) */}
      <div className="p-2 sm:p-2.5 flex flex-col gap-2">
        {activeTrips.map((trip, idx) => (
          <div
            key={trip.id}
            className="p-2 px-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-950 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {activeTrips.length > 1 ? `${idx + 1}회차 운행` : '정규 운행 코스'}
              </span>
              <span className="text-[11px] font-mono font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {formatMinute(trip.defaultDepartureMinute)} 단지 출발
              </span>
            </div>

            {/* 정차 정류장 흐름 */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[10.5px] text-slate-600 py-0.5 no-scrollbar">
              <span className="font-bold text-slate-900 shrink-0">아주더하이클래스</span>
              {trip.stops.map((st, sIdx) => {
                const school = schools.find((sc) => st.locationId.includes(sc.id));
                return (
                  <React.Fragment key={sIdx}>
                    <span className="text-slate-300">➔</span>
                    <span
                      className="px-1.5 py-0.2 rounded font-black shrink-0 text-[10px]"
                      style={{
                        backgroundColor: school?.badgeBg || '#e2e8f0',
                        color: school?.color || '#1e3a8a',
                      }}
                    >
                      {school?.shortName || st.locationId}
                    </span>
                  </React.Fragment>
                );
              })}
              {trip.referenceReturnMinute && (
                <>
                  <span className="text-slate-300">➔</span>
                  <span className="text-slate-500 font-mono font-bold shrink-0">
                    {formatMinute(trip.referenceReturnMinute)} 복귀
                  </span>
                </>
              )}
            </div>
          </div>
        ))}

        {/* 4. 탑승 학생 명단 카드 목록 (헤더) */}
        <div className="flex items-center justify-between pt-0.5 px-0.5">
          <h2 className="text-xs font-black text-slate-800">
            {selectedVehicle === 'v1' ? '1호차' : '2호차'} 탑승 학생 ({vehicleStudents.length}명)
          </h2>
          {currentRole === 'admin' && (
            <button
              onClick={openStudentModal}
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>학생 추가</span>
            </button>
          )}
        </div>

        {/* 학생 카드 목록 (컴팩트 높이 & 여백 최적화: 한 화면에 더 많은 학생 표시) */}
        <div className="flex flex-col gap-1.5">
          {vehicleStudents.map((student) => {
            const school = schools.find((s) => s.id === student.schoolId);
            const schedule = schedules.find(
              (s) =>
                s.studentId === student.id &&
                s.date === serviceDate &&
                s.type === scheduleType
            );
            const holiday = holidays.find(
              (h) =>
                (h.schoolId === student.schoolId || h.schoolId === 'ALL') &&
                serviceDate >= h.startDate &&
                serviceDate <= h.endDate
            );

            const travelMinutes = scheduleType === 'MORNING' && school
              ? getSchoolTravelMinutes(school.id, routeSegments)
              : 10;

            const departureMin = schedule
              ? ((schedule.assignedMinute - travelMinutes) as any)
              : null;

            const diff =
              schedule && schedule.requestedMinute
                ? schedule.assignedMinute - schedule.requestedMinute
                : 0;

            return (
              <div
                key={student.id}
                onClick={() => selectStudent(student.id, false, true)}
                className={`px-3 py-2 rounded-xl border transition shadow-2xs flex flex-col gap-1.5 cursor-pointer active:scale-[0.99] ${
                  holiday
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* 1행: 학교배지 + 학생이름 + 학년 + 동호수 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="px-1.5 py-0.2 rounded-md text-[10.5px] font-black text-white"
                      style={{ backgroundColor: school?.color || '#3b82f6' }}
                    >
                      {school?.shortName}
                    </span>
                    <span className="font-black text-[13.5px] text-slate-950 tracking-tight">
                      {student.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {formatGradeDisplay(student.grade, student.schoolId, false)}
                    </span>
                  </div>

                  {/* 동호수 표기 */}
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-200/60">
                    {student.building.includes('동') ? student.building : `${student.building}동`}{' '}
                    {student.unit.includes('호') ? student.unit : `${student.unit}호`}
                  </span>
                </div>

                {/* 2행: 시간 안내 및 상태 배지 (슬림 바) */}
                {holiday ? (
                  <div className="py-1 px-2 rounded-lg bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs font-bold flex items-center justify-between">
                    <span>🌴 {cleanHolidayName(holiday.name)}</span>
                    <span className="text-[10px] text-amber-800">통학 미운행</span>
                  </div>
                ) : schedule ? (
                  <div className="flex items-center justify-between bg-slate-50/90 py-1 px-2 rounded-lg border border-slate-200/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="font-mono text-[11.5px] text-slate-700">
                        {departureMin ? (
                          <>
                            <strong className="text-slate-800 font-bold">{formatMinute(departureMin)}</strong> 출발{' '}
                            <span className="text-slate-300 text-[10px]">➔</span>{' '}
                          </>
                        ) : ''}
                        <strong className="text-blue-700 font-black">
                          {formatMinute(schedule.assignedMinute)} 도착
                        </strong>
                      </span>
                    </div>

                    {/* 희망시간 차이 라벨 */}
                    {diff === 0 ? (
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        희망 일치
                      </span>
                    ) : (
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                          diff < 0
                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                            : 'text-amber-700 bg-amber-50 border-amber-200'
                        }`}
                      >
                        {Math.abs(diff)}분 {diff < 0 ? '빠름' : '늦음'}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-semibold py-0.5 px-1">
                    {scheduleType === 'AFTERNOON' ? '하교시 이용 안함' : '등교시 이용 안함'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 하단 고정 액션 바 (슬림 컴팩트) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-between">
        <button
          onClick={handleOpenCalendarSheet}
          className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>2026-2027 4대 학교 학사일정 및 캘린더 보기</span>
        </button>
      </div>

      {/* 6. 모바일 학사일정 바텀시트 (Bottom Sheet) */}
      {isCalendarSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl animate-slideUp overflow-hidden">
            {/* 시트 상단 바 */}
            <div className="sticky top-0 bg-white p-3.5 px-4 border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900 truncate">
                  2026-2027 4대 학교 학사일정 및 캘린더
                </h3>
              </div>
              <button
                onClick={() => setIsCalendarSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer shrink-0"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 시트 탭 바 (달력 / 전체 일정 목록 / 4개교 비교 표) */}
            <div className="flex items-center gap-1 p-2 bg-slate-100/90 border-b border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setCalendarTab('calendar')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  calendarTab === 'calendar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>달력</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarTab('list')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  calendarTab === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 shrink-0" />
                <span>전체 일정 ({holidays.length}건)</span>
              </button>
              <button
                type="button"
                onClick={() => setCalendarTab('matrix')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  calendarTab === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>4개교 비교 표</span>
              </button>
            </div>

            {/* 시트 본문 콘텐츠 */}
            <div className="p-3.5 sm:p-4 flex flex-col gap-4 overflow-y-auto flex-1 overscroll-contain">
              {calendarTab === 'calendar' && (
                <MobileAcademicCalendar
                  holidays={holidays}
                  schools={schools}
                  currentDate={serviceDate}
                  activeHoliday={activeHoliday}
                  onSelectHoliday={(h) => setActiveHoliday(h)}
                  onSelectDate={(date) => {
                    const matched = holidays.find(
                      (h) => date >= h.startDate && date <= h.endDate
                    );
                    if (matched) {
                      setActiveHoliday(matched);
                    }
                  }}
                  onGoToSchedule={(date) => {
                    setServiceDate(date);
                    setIsCalendarSheetOpen(false);
                  }}
                />
              )}

              {calendarTab === 'list' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-700">
                      전체 등록된 방학/휴교 일정 ({holidays.length}건)
                    </span>
                    <span className="text-[10.5px] text-blue-600 font-bold">
                      터치 시 캘린더 상 기간 표시 ➔
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {holidays.map((h) => {
                      const sc = schools.find((s) => s.id === h.schoolId);
                      const daysCount = getDaysDifference(h.startDate, h.endDate);
                      const isThisActive = activeHoliday?.id === h.id;
                      const cleanName = cleanHolidayName(h.name);
                      const compactRange = formatCompactHolidayRange(h.startDate, h.endDate);

                      return (
                        <div
                          key={h.id}
                          onClick={() => {
                            setActiveHoliday(h);
                            setCalendarTab('calendar');
                          }}
                          className={`px-3 py-2 rounded-xl border transition cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.99] group ${
                            isThisActive
                              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-300'
                              : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/60'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs">🌴</span>
                              <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-900">
                                {cleanName}
                              </span>
                              {sc && (
                                <span
                                  className="text-[9.5px] font-black px-1.5 py-0.2 rounded"
                                  style={{
                                    backgroundColor: sc.badgeBg,
                                    color: sc.color,
                                  }}
                                >
                                  {sc.shortName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                              <span className="font-bold text-slate-700">
                                {compactRange}
                              </span>
                              <span className="font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 text-[10px]">
                                {daysCount}일간
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {calendarTab === 'matrix' && (
                <div className="flex flex-col gap-3">
                  <SchoolCalendarMatrix
                    onJump={(date) => {
                      const matched = holidays.find(
                        (h) => date >= h.startDate && date <= h.endDate
                      );
                      if (matched) {
                        setActiveHoliday(matched);
                      }
                      setCalendarTab('calendar');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
