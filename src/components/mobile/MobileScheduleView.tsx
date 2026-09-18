import React, { useState, useMemo } from 'react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute, getWeekdayNumber } from '@/lib/scheduling/time';
import { formatGradeDisplay } from '@/lib/constants/schools';
import { getSchoolTravelMinutes } from '@/lib/scheduling/routeCalculator';
import { SchoolCalendarMatrix } from '@/components/drawer/SchoolCalendarMatrix';
import {
  Bus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Clock,
  X,
  Plus,
} from 'lucide-react';
import { UserRole } from '@/types';

export const MobileScheduleView: React.FC = () => {
  const {
    serviceDate,
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
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 font-sans pb-20">
      {/* 1. 상단 모바일 앱 헤더 */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-4 py-3 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <Bus className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">제주 아주더하이클래스</h1>
            <p className="text-[10px] text-blue-200">통학버스 실시간 스케줄</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 권한 선택기 */}
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="text-[11px] font-bold bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white"
          >
            <option value="admin" className="text-slate-900">관리자</option>
            <option value="guardian" className="text-slate-900">학부모</option>
            <option value="student" className="text-slate-900">학생</option>
          </select>

          {/* PC 모드로 전환 버튼 */}
          <button
            onClick={() => setForceDesktopView(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition border border-white/20"
            title="넓은 PC 타임라인 슬라이더 화면으로 전환"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC버전</span>
          </button>
        </div>
      </header>

      {/* 2. 날짜 선택기 & 등하교 토글 */}
      <div className="bg-white border-b border-slate-200 p-3 shadow-2xs flex flex-col gap-2.5 sticky top-[53px] z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={prevDate}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCalendarSheetOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{serviceDate} ({weekdayLabel})</span>
            </button>
            <button
              onClick={nextDate}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 등교 / 하교 토글 */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setScheduleType('MORNING')}
              className={`px-3 py-1 rounded-lg transition ${
                scheduleType === 'MORNING'
                  ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              등교
            </button>
            <button
              onClick={() => setScheduleType('AFTERNOON')}
              className={`px-3 py-1 rounded-lg transition ${
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
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedVehicle('v1')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              selectedVehicle === 'v1'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>1호차 (NLCS · 저청)</span>
          </button>
          <button
            onClick={() => setSelectedVehicle('v2')}
            className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 ${
              selectedVehicle === 'v2'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>2호차 (BHA · SJA · KIS)</span>
          </button>
        </div>
      </div>

      {/* 3. 모바일 본문: 차량 운행 흐름 요약 카드 */}
      <div className="p-3 flex flex-col gap-3">
        {activeTrips.map((trip, idx) => (
          <div
            key={trip.id}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                {activeTrips.length > 1 ? `${idx + 1}회차 운행` : '정규 운행 코스'}
              </span>
              <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {formatMinute(trip.defaultDepartureMinute)} 단지 출발
              </span>
            </div>

            {/* 정차 정류장 흐름 */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600 pt-1 pb-0.5 no-scrollbar">
              <span className="font-bold text-slate-900 shrink-0">아주더하이클래스</span>
              {trip.stops.map((st, sIdx) => {
                const school = schools.find((sc) => st.locationId.includes(sc.id));
                return (
                  <React.Fragment key={sIdx}>
                    <span className="text-slate-300">➔</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-black shrink-0 text-[10px]"
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
                  <span className="text-slate-400 font-mono shrink-0">
                    {formatMinute(trip.referenceReturnMinute)} 복귀
                  </span>
                </>
              )}
            </div>
          </div>
        ))}

        {/* 4. 탑승 학생 명단 카드 목록 */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-xs font-extrabold text-slate-800">
            {selectedVehicle === 'v1' ? '1호차' : '2호차'} 탑승 학생 ({vehicleStudents.length}명)
          </h2>
          {currentRole === 'admin' && (
            <button
              onClick={openStudentModal}
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>학생 추가</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
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
                className={`p-3.5 rounded-2xl border transition shadow-2xs flex flex-col gap-2 cursor-pointer ${
                  holiday
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-lg text-xs font-black text-white"
                      style={{ backgroundColor: school?.color || '#3b82f6' }}
                    >
                      {school?.shortName}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {student.name}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {formatGradeDisplay(student.grade, student.schoolId, false)}
                    </span>
                  </div>

                  {/* 동호수 표기 */}
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {student.building.includes('동') ? student.building : `${student.building}동`}{' '}
                    {student.unit.includes('호') ? student.unit : `${student.unit}호`}
                  </span>
                </div>

                {/* 시간 및 방학 안내 */}
                {holiday ? (
                  <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-950 text-xs font-bold flex items-center justify-between">
                    <span>🌴 {holiday.name}</span>
                    <span className="text-[10px] text-amber-800">통학 미운행</span>
                  </div>
                ) : schedule ? (
                  <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono text-slate-600">
                        {departureMin ? `${formatMinute(departureMin)} 출발` : ''} ➔{' '}
                        <strong className="text-blue-700 font-bold">
                          {formatMinute(schedule.assignedMinute)} 도착
                        </strong>
                      </span>
                    </div>

                    {/* 희망시간 차이 라벨 */}
                    {diff === 0 ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        희망 일치
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
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
                  <div className="text-xs text-slate-400">배정된 스케줄 없음</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 하단 고정 액션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsCalendarSheetOpen(true)}
          className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition"
        >
          <Calendar className="w-4 h-4" />
          <span>2026-2027 4대 학교 학사일정 보기</span>
        </button>
      </div>

      {/* 6. 모바일 학사일정 바텀시트 (Bottom Sheet) */}
      {isCalendarSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl animate-slideUp">
            {/* 시트 상단 바 */}
            <div className="sticky top-0 bg-white p-4 border-b border-slate-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  2026-2027 4대 학교 학사일정 및 방학 매트릭스
                </h3>
              </div>
              <button
                onClick={() => setIsCalendarSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* 4대 학교 학사일정 비교 매트릭스 */}
              <SchoolCalendarMatrix />

              {/* 등록된 방학/휴교 전체 목록 */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-700">
                  전체 학사일정 ({holidays.length}건)
                </span>
                <div className="flex flex-col gap-2">
                  {holidays.map((h) => {
                    const sc = schools.find((s) => s.id === h.schoolId);
                    return (
                      <div
                        key={h.id}
                        onClick={() => {
                          useScheduleStore.getState().setServiceDate(h.startDate);
                          setIsCalendarSheetOpen(false);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{h.name}</span>
                            {sc && (
                              <span
                                className="text-[10px] font-black px-1.5 py-0.2 rounded"
                                style={{
                                  backgroundColor: sc.badgeBg,
                                  color: sc.color,
                                }}
                              >
                                {sc.shortName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {h.startDate} ~ {h.endDate}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600">이동 ➔</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
