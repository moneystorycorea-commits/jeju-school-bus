import React, { useState, useEffect, useMemo } from 'react';
import { School, SchoolHoliday } from '@/types';
import {
  formatKoreanDate,
  getDaysDifference,
  getTodayDateString,
  cleanHolidayName,
  formatCompactHolidayRange,
} from '@/lib/scheduling/time';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Info,
  Layers,
} from 'lucide-react';

interface MobileAcademicCalendarProps {
  holidays: SchoolHoliday[];
  schools: School[];
  currentDate: string; // serviceDate
  activeHoliday: SchoolHoliday | null;
  onSelectHoliday: (holiday: SchoolHoliday | null) => void;
  onSelectDate: (date: string) => void;
  onGoToSchedule: (date: string) => void;
}

// 4대 국제학교 식별 및 시각화용 색상/메타데이터
const MAJOR_SCHOOLS = [
  { id: 'NLCS', name: 'NLCS', hex: '#2563eb', bg: 'bg-blue-600', dot: 'bg-blue-600' },
  { id: 'BHA', name: 'BHA', hex: '#ea580c', bg: 'bg-orange-500', dot: 'bg-orange-500' },
  { id: 'KIS', name: 'KIS', hex: '#4f46e5', bg: 'bg-indigo-600', dot: 'bg-indigo-600' },
  { id: 'SJA', name: 'SJA', hex: '#059669', bg: 'bg-emerald-600', dot: 'bg-emerald-600' },
];

export const MobileAcademicCalendar: React.FC<MobileAcademicCalendarProps> = ({
  holidays,
  schools,
  currentDate,
  activeHoliday,
  onSelectHoliday,
  onSelectDate,
  onGoToSchedule,
}) => {
  // 달력 연/월 상태 (기본값: activeHoliday의 startDate 또는 2026-2027 학사연도 기준)
  const [viewYear, setViewYear] = useState<number>(() => {
    const baseDate = activeHoliday ? activeHoliday.startDate : currentDate;
    const y = parseInt(baseDate.split('-')[0], 10);
    return y >= 2026 && y <= 2027 ? y : 2026;
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    const baseDate = activeHoliday ? activeHoliday.startDate : currentDate;
    const y = parseInt(baseDate.split('-')[0], 10);
    const m = parseInt(baseDate.split('-')[1], 10);
    if (y >= 2026 && y <= 2027 && !isNaN(m)) {
      return m - 1;
    }
    return 7; // 기본 8월 (2026-08 학사 시작월)
  });

  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [selectedDayDate, setSelectedDayDate] = useState<string>(() => {
    if (activeHoliday) return activeHoliday.startDate;
    const y = parseInt(currentDate.split('-')[0], 10);
    if (y >= 2026 && y <= 2027) return currentDate;
    return '2026-08-17';
  });

  // activeHoliday 변경 시 달력 연/월 및 선택 날짜 자동 동기화
  useEffect(() => {
    if (activeHoliday && activeHoliday.startDate) {
      const [y, m] = activeHoliday.startDate.split('-').map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
      setSelectedDayDate(activeHoliday.startDate);
    }
  }, [activeHoliday]);

  // 이전/다음 월 이동
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // 오늘 월로 이동
  const handleTodayMonth = () => {
    const today = getTodayDateString();
    const [y, m] = today.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setSelectedDayDate(today);
  };

  // 월간 날짜 계산
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = getTodayDateString();

  // 빠른 학사일정 바로가기 목록
  const quickJumpEvents = [
    { label: '🎒 8월 개학', year: 2026, month: 7, date: '2026-08-20', school: 'NLCS' },
    { label: '🌕 9월 추석방학', year: 2026, month: 8, date: '2026-09-19', school: 'NLCS' },
    { label: '🍁 10월 가을방학', year: 2026, month: 9, date: '2026-10-24', school: 'NLCS' },
    { label: '❄️ 12월 겨울방학', year: 2026, month: 11, date: '2026-12-12', school: 'NLCS' },
    { label: '🧧 2월 설날방학', year: 2027, month: 1, date: '2027-02-06', school: 'NLCS' },
    { label: '🌸 3-4월 봄방학', year: 2027, month: 2, date: '2027-03-20', school: 'NLCS' },
    { label: '🎓 6월 종업식', year: 2027, month: 5, date: '2027-06-18', school: 'NLCS' },
  ];

  const handleQuickJump = (item: (typeof quickJumpEvents)[0]) => {
    setViewYear(item.year);
    setViewMonth(item.month);
    setSelectedDayDate(item.date);

    // 해당 날짜에 걸쳐 있는 휴교 이벤트 자동 탐색
    const matchedHoliday = holidays.find(
      (h) =>
        item.date >= h.startDate &&
        item.date <= h.endDate &&
        (item.school === 'ALL' || h.schoolId === item.school)
    );

    if (matchedHoliday) {
      onSelectHoliday(matchedHoliday);
    }
  };

  // 현재 학교 필터가 적용된 정렬된 학사일정 목록 (시작일 오름차순)
  const currentFilteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => schoolFilter === 'ALL' || h.schoolId === schoolFilter || h.schoolId === 'ALL')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [holidays, schoolFilter]);

  // 현재 활성화된 이벤트의 인덱스
  const currentEventIndex = useMemo(() => {
    if (!activeHoliday) return -1;
    return currentFilteredHolidays.findIndex((h) => h.id === activeHoliday.id);
  }, [currentFilteredHolidays, activeHoliday]);

  // 학교 필터 칩 클릭 시: 현재 조회 중인 일정(또는 월)과 동일한 유형의 일정을 지능적으로 매칭
  const handleSchoolFilterClick = (targetSchoolId: string) => {
    setSchoolFilter(targetSchoolId);

    const targetHolidays = holidays
      .filter((h) => targetSchoolId === 'ALL' || h.schoolId === targetSchoolId || h.schoolId === 'ALL')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (targetHolidays.length === 0) {
      onSelectHoliday(null);
      return;
    }

    if (activeHoliday) {
      // 1. 핵심 키워드 매칭 (추석, 개학, 가을, 겨울, 설날, 봄, 종업, 연수 등)
      const keywords = [
        '추석', 'Chuseok',
        '개학', '개학일', 'Academic Year',
        '가을', 'Fall', 'Half-Term',
        '겨울', 'Winter',
        '설날', 'Seollal',
        '봄', 'Spring',
        '종업', 'Last Day',
        '연수', '교사연수', 'INSET', 'PD',
        '현충일', '어린이날', '한글날', '광복절'
      ];

      const currentKw = keywords.find((kw) =>
        activeHoliday.name.toLowerCase().includes(kw.toLowerCase())
      );

      if (currentKw) {
        const kwMatch = targetHolidays.find((h) =>
          h.name.toLowerCase().includes(currentKw.toLowerCase())
        );
        if (kwMatch) {
          onSelectHoliday(kwMatch);
          return;
        }
      }

      // 2. 동일 시기(날짜 중복) 매칭
      const overlapMatch = targetHolidays.find(
        (h) => h.startDate <= activeHoliday.endDate && h.endDate >= activeHoliday.startDate
      );
      if (overlapMatch) {
        onSelectHoliday(overlapMatch);
        return;
      }

      // 3. activeHoliday와 동일한 월 매칭
      const activeMonthPrefix = activeHoliday.startDate.substring(0, 7);
      const sameMonthMatch = targetHolidays.find(
        (h) => h.startDate.startsWith(activeMonthPrefix) || h.endDate.startsWith(activeMonthPrefix)
      );
      if (sameMonthMatch) {
        onSelectHoliday(sameMonthMatch);
        return;
      }
    }

    // 4. 현재 달력에서 보고 있는 viewYear, viewMonth와 동일한 월 매칭
    const currentViewMonthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const viewMonthMatch = targetHolidays.find(
      (h) => h.startDate.startsWith(currentViewMonthPrefix) || h.endDate.startsWith(currentViewMonthPrefix)
    );
    if (viewMonthMatch) {
      onSelectHoliday(viewMonthMatch);
      return;
    }

    // 5. 만약 현재 월에 일정이 없다면 달력 화면을 강제 리셋하지 않고 첫 번째 일정 선택
    onSelectHoliday(targetHolidays[0]);
  };

  // 이전 이벤트로 넘기기
  const handlePrevEvent = () => {
    if (currentFilteredHolidays.length === 0) return;
    let nextIdx = currentEventIndex - 1;
    if (nextIdx < 0) {
      nextIdx = currentFilteredHolidays.length - 1; // 루프
    }
    const prevH = currentFilteredHolidays[nextIdx];
    onSelectHoliday(prevH);
  };

  // 다음 이벤트로 넘기기
  const handleNextEvent = () => {
    if (currentFilteredHolidays.length === 0) return;
    let nextIdx = currentEventIndex + 1;
    if (nextIdx >= currentFilteredHolidays.length) {
      nextIdx = 0; // 루프
    }
    const nextH = currentFilteredHolidays[nextIdx];
    onSelectHoliday(nextH);
  };

  // 터치 스와이프 제스처 핸들러
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40; // 픽셀 기준
    if (distance > minSwipeDistance) {
      // 손가락을 왼쪽으로 밂 (Next)
      handleNextEvent();
    } else if (distance < -minSwipeDistance) {
      // 손가락을 오른쪽으로 밂 (Prev)
      handlePrevEvent();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // 선택된 날짜에 걸쳐 있는 모든 학사일정
  const holidaysOnSelectedDay = useMemo(() => {
    if (!selectedDayDate) return [];
    return holidays.filter((h) => {
      if (schoolFilter !== 'ALL' && h.schoolId !== schoolFilter && h.schoolId !== 'ALL') {
        return false;
      }
      return selectedDayDate >= h.startDate && selectedDayDate <= h.endDate;
    });
  }, [selectedDayDate, holidays, schoolFilter]);

  // 활성 이벤트 학교 정보
  const activeSchool = schools.find((s) => s.id === activeHoliday?.schoolId);
  const activeDaysCount = activeHoliday
    ? getDaysDifference(activeHoliday.startDate, activeHoliday.endDate)
    : 0;

  // 현재 보고 있는 월/이벤트에 대한 4대 학교 겹침 및 차이 분석 데이터
  const majorOverlapAnalysis = useMemo(() => {
    const targetKeywords = ['추석', '개학', '가을', '겨울', '설날', '봄', '종업'];
    let matchedKw = '';
    if (activeHoliday) {
      matchedKw = targetKeywords.find((kw) =>
        activeHoliday.name.toLowerCase().includes(kw.toLowerCase())
      ) || '';
    }

    if (!matchedKw) {
      if (viewMonth === 7) matchedKw = '개학'; // 8월
      else if (viewMonth === 8) matchedKw = '추석'; // 9월
      else if (viewMonth === 9 || viewMonth === 10) matchedKw = '가을'; // 10-11월
      else if (viewMonth === 11 || viewMonth === 0) matchedKw = '겨울'; // 12-1월
      else if (viewMonth === 1) matchedKw = '설날'; // 2월
      else if (viewMonth === 2 || viewMonth === 3) matchedKw = '봄'; // 3-4월
      else if (viewMonth === 5) matchedKw = '종업'; // 6월
    }

    if (!matchedKw) return null;

    const schoolResults = MAJOR_SCHOOLS.map((s) => {
      const match = holidays.find(
        (h) =>
          h.schoolId === s.id &&
          h.name.toLowerCase().includes(matchedKw.toLowerCase())
      );
      return {
        school: s,
        holiday: match || null,
        dates: match ? formatCompactHolidayRange(match.startDate, match.endDate) : '일정 없음',
        days: match ? getDaysDifference(match.startDate, match.endDate) : 0,
        fullStartDate: match?.startDate,
        fullEndDate: match?.endDate,
      };
    });

    return {
      keyword: matchedKw,
      results: schoolResults,
    };
  }, [activeHoliday, viewMonth, holidays]);

  return (
    <div className="flex flex-col gap-3">
      {/* 1. 활성화된 이벤트 기간 안내 배너 (좌우 넘기기 제스처 및 이전/다음 버튼 연동) */}
      {activeHoliday ? (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-100/40 border-2 border-amber-300 rounded-2xl flex flex-col gap-2.5 shadow-xs transition select-none touch-pan-y animate-in fade-in duration-150"
        >
          {/* 이전 / 다음 이벤트 내비게이션 바 */}
          <div className="flex items-center justify-between pb-1 border-b border-amber-200/80">
            <button
              type="button"
              onClick={handlePrevEvent}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-black shadow-2xs border border-amber-200 transition cursor-pointer active:scale-95"
              title="이전 학사일정으로 이동"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>이전</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-full border border-amber-300">
                {currentEventIndex >= 0 ? `${currentEventIndex + 1} / ${currentFilteredHolidays.length}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextEvent}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-black shadow-2xs border border-amber-200 transition cursor-pointer active:scale-95"
                title="다음 학사일정으로 이동"
              >
                <span>다음</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onSelectHoliday(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-200/50 transition cursor-pointer shrink-0 ml-1"
                title="기간 강조 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 이벤트 본문 정보 (행사명, 학교, 카테고리) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-base leading-none">🌴</span>
              <span className="text-xs font-black text-amber-950">
                {cleanHolidayName(activeHoliday.name)}
              </span>
              {activeSchool && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.2 rounded"
                  style={{ backgroundColor: activeSchool.badgeBg, color: activeSchool.color }}
                >
                  {activeSchool.shortName}
                </span>
              )}
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                통학버스 미운행
              </span>
            </div>
          </div>

          {/* 지정 기간 & 총 기간 */}
          <div className="flex items-center justify-between text-xs bg-white/85 p-2 rounded-xl border border-amber-200/70 shadow-2xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500">지정 기간</span>
              <span className="font-mono text-xs font-extrabold text-amber-950">
                {formatCompactHolidayRange(activeHoliday.startDate, activeHoliday.endDate)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500">총 기간</span>
              <span className="font-mono text-xs font-black text-blue-700 block">
                {activeDaysCount}일간
              </span>
            </div>
          </div>

          {/* 운행표 바로가기 액션 버튼 */}
          <button
            type="button"
            onClick={() => onGoToSchedule(activeHoliday.startDate)}
            className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-[0.99] cursor-pointer"
          >
            <span>
              이 기간 첫날({formatCompactHolidayRange(activeHoliday.startDate, activeHoliday.startDate)}) 운행표 화면으로 이동
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* 이벤트 박스가 닫혔을 때 다시 열 수 있는 바로가기 카드 */
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌴</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-amber-950">학사일정 둘러보기</span>
              <span className="text-[10px] text-amber-800">좌우로 넘기며 캘린더 기간을 확인할 수 있습니다</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (currentFilteredHolidays.length > 0) {
                onSelectHoliday(currentFilteredHolidays[0]);
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-2xs transition active:scale-95 cursor-pointer"
          >
            일정 카드 열기 ➔
          </button>
        </div>
      )}

      {/* 2. 캘린더 네비게이션 헤더 & 학교 필터 & 학교별 컬러 선 범례 */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-black text-slate-900">학사일정 월간 캘린더</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="이전 달"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-black text-slate-900 px-1.5">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="다음 달"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleTodayMonth}
              className="ml-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10.5px] font-bold text-slate-700 border border-slate-300 transition cursor-pointer"
            >
              오늘
            </button>
          </div>
        </div>

        {/* 학교별 컬러 선 범례 (4개교 겹침 알아보기 쉬운 가이드) */}
        <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-600 py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex-wrap">
          <span className="text-slate-400 shrink-0 text-[10px] font-semibold">학교별 컬러 선:</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-full bg-blue-600" />NLCS</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-full bg-orange-500" />BHA</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-full bg-indigo-600" />KIS</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-1 rounded-full bg-emerald-600" />SJA</span>
          <span className="text-[9.5px] text-amber-900 bg-amber-200/90 px-1.5 py-0.2 rounded border border-amber-300 font-black ml-auto">
            4개교 공통
          </span>
        </div>

        {/* 빠른 학사일정 바로가기 칩 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10.5px] font-bold scrollbar-none">
          <span className="text-slate-400 shrink-0 text-[10px]">빠른 이동:</span>
          {quickJumpEvents.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickJump(item)}
              className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition cursor-pointer shrink-0 border border-slate-200/80 active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 학교 필터 칩 (클릭 시 동일 이벤트/월 유지 지능형 탐색) */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[10.5px] font-bold pt-0.5 scrollbar-none">
          <span className="text-slate-400 shrink-0 text-[10px]">학교 필터:</span>
          {['ALL', 'NLCS', 'BHA', 'KIS', 'SJA'].map((schId) => {
            const sc = schools.find((s) => s.id === schId);
            const isSelected = schoolFilter === schId;
            return (
              <button
                key={schId}
                type="button"
                onClick={() => handleSchoolFilterClick(schId)}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-black shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {schId === 'ALL' ? '전체 학교' : sc?.shortName || schId}
              </button>
            );
          })}
        </div>

        {/* 3. 캘린더 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-extrabold text-slate-400 pt-2 pb-1 border-t border-slate-100">
          <span className="text-rose-500">일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span className="text-blue-500">토</span>
        </div>

        {/* 4. 날짜 그리드 (반투명 레이어 및 4개 학교별 컬러 선 시각화) */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
          {/* 이전 달 빈 칸 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-13" />
          ))}

          {/* 해당 월 날짜들 */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfWeek = (firstDayOfWeek + i) % 7;
            const isSun = dayOfWeek === 0;
            const isSat = dayOfWeek === 6;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDayDate;

            // 활성 이벤트 기간 내 여부
            const isInActiveRange =
              activeHoliday &&
              dateStr >= activeHoliday.startDate &&
              dateStr <= activeHoliday.endDate;

            const isRangeStart = activeHoliday && dateStr === activeHoliday.startDate;
            const isRangeEnd = activeHoliday && dateStr === activeHoliday.endDate;
            const isSingleDayRange = isRangeStart && isRangeEnd;

            // 행(주) 경계 처리: 토요일(행 끝)은 우측 둥글게, 일요일(행 시작)은 좌측 둥글게
            const roundedLeft = isRangeStart || isSun || isSingleDayRange;
            const roundedRight = isRangeEnd || isSat || isSingleDayRange;

            // 4대 학교 중 해당 날짜에 휴교 중인 학교 목록
            const schoolsOffToday = MAJOR_SCHOOLS.filter((s) => {
              return holidays.some(
                (h) =>
                  (h.schoolId === s.id || h.schoolId === 'ALL') &&
                  dateStr >= h.startDate &&
                  dateStr <= h.endDate
              );
            });

            const countOff = schoolsOffToday.length;
            const isAllFourOff = countOff === 4;

            // 현재 선택된 학교 필터 기준 휴교 여부
            const dayHolidays = holidays.filter((h) => {
              if (schoolFilter !== 'ALL' && h.schoolId !== schoolFilter && h.schoolId !== 'ALL') {
                return false;
              }
              return dateStr >= h.startDate && dateStr <= h.endDate;
            });

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDayDate(dateStr);
                  onSelectDate(dateStr);
                  if (dayHolidays.length > 0 && !isInActiveRange) {
                    onSelectHoliday(dayHolidays[0]);
                  }
                }}
                className={`h-12 sm:h-13 flex flex-col items-center justify-between py-1 relative transition cursor-pointer text-xs ${
                  isInActiveRange
                    ? roundedLeft && roundedRight
                      ? 'rounded-xl'
                      : roundedLeft
                      ? 'rounded-l-xl'
                      : roundedRight
                      ? 'rounded-r-xl'
                      : 'rounded-none'
                    : 'rounded-xl'
                } ${
                  isInActiveRange
                    ? isRangeStart || isRangeEnd
                      ? 'bg-amber-500 text-white font-black shadow-xs ring-1 ring-amber-400 z-10'
                      : 'bg-amber-100/95 text-amber-950 font-bold border-y border-amber-300'
                    : isSelected
                    ? 'bg-blue-600 text-white font-black shadow-sm ring-2 ring-blue-300 z-10'
                    : isAllFourOff
                    ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 border border-amber-300 font-extrabold shadow-2xs'
                    : countOff > 0
                    ? 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border border-amber-200/70 font-bold'
                    : isSun
                    ? 'text-rose-500 hover:bg-slate-100 font-semibold'
                    : isSat
                    ? 'text-blue-500 hover:bg-slate-100 font-semibold'
                    : 'text-slate-800 hover:bg-slate-100 font-medium'
                } ${isToday && !isInActiveRange && !isSelected ? 'ring-2 ring-blue-500 font-black' : ''}`}
                title={
                  countOff > 0
                    ? `${dateStr}: ${schoolsOffToday.map((s) => s.name).join(', ')} 휴교`
                    : dateStr
                }
              >
                {/* 1행: 날짜 숫자 */}
                <span className="leading-none text-[12px] font-black">{day}</span>

                {/* 2행: 기간 상태 라벨 또는 겹침 배지 */}
                {isInActiveRange ? (
                  <span className="text-[8px] leading-none font-black opacity-95">
                    {isSingleDayRange
                      ? '휴교'
                      : isRangeStart
                      ? '시작'
                      : isRangeEnd
                      ? '종료'
                      : isAllFourOff
                      ? '4개교'
                      : '휴교'}
                  </span>
                ) : isAllFourOff ? (
                  <span className="text-[7.5px] leading-none font-black text-amber-900 bg-amber-200/90 px-1 py-0.2 rounded-sm shadow-2xs">
                    4개교
                  </span>
                ) : countOff > 0 ? (
                  <span className="text-[7.5px] leading-none font-bold text-slate-700 bg-white/80 px-1 py-0.2 rounded-sm border border-slate-200/60">
                    {countOff}개교
                  </span>
                ) : (
                  <span className="text-[7px] leading-none text-transparent select-none">.</span>
                )}

                {/* 3행: 4대 학교별 컬러 선 (Horizontal Color Strips) */}
                <div className="w-full px-1 flex items-center justify-center gap-0.5">
                  {MAJOR_SCHOOLS.map((s) => {
                    const isOff = schoolsOffToday.some((so) => so.id === s.id);
                    return (
                      <div
                        key={s.id}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          isOff ? 'opacity-100 shadow-2xs' : 'opacity-15 bg-slate-300'
                        }`}
                        style={{
                          backgroundColor: isOff ? s.hex : undefined,
                        }}
                        title={`${s.name}: ${isOff ? '휴교' : '정상운행'}`}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* 5. 4대 학교 일정 겹침 및 차이 분석 요약 카드 (전체 학교 보기 또는 주요 방학 선택 시) */}
        {majorOverlapAnalysis && (
          <div className="mt-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col gap-2 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-black text-slate-900">
                  4대 학교 [{majorOverlapAnalysis.keyword}] 일정
                </span>
              </div>
            </div>

            {/* 학교별 일정 현황 행 */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
              {majorOverlapAnalysis.results.map((item) => {
                const isSelectedSchool = schoolFilter === item.school.id;

                return (
                  <div
                    key={item.school.id}
                    onClick={() => {
                      if (item.holiday) {
                        setSchoolFilter(item.school.id);
                        onSelectHoliday(item.holiday);
                      }
                    }}
                    className={`p-2 rounded-xl border transition cursor-pointer flex flex-col gap-1 ${
                      isSelectedSchool
                        ? 'bg-blue-50/90 border-blue-300 ring-1 ring-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.school.hex }}
                        />
                        <span className="font-extrabold text-xs text-slate-900">
                          {item.school.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-600 font-bold">{item.dates}</span>
                      <span className="font-black text-blue-700">{item.days}일간</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. 선택된 날짜 상세 카드 */}
        <div className="mt-1 pt-2 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>{formatKoreanDate(selectedDayDate)}</span>
            </div>

            <button
              type="button"
              onClick={() => onGoToSchedule(selectedDayDate)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <span>이 날짜 운행표 보기</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {holidaysOnSelectedDay.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {holidaysOnSelectedDay.map((h) => {
                const sc = schools.find((s) => s.id === h.schoolId);
                const isThisActive = activeHoliday?.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => onSelectHoliday(h)}
                    className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isThisActive
                        ? 'bg-amber-100 border-amber-300 ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🌴</span>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-900">
                            {cleanHolidayName(h.name)}
                          </span>
                          {sc && (
                            <span
                              className="text-[9.5px] font-black px-1.5 py-0.2 rounded"
                              style={{ backgroundColor: sc.badgeBg, color: sc.color }}
                            >
                              {sc.shortName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-slate-500">
                          <span className="font-bold text-slate-700">
                            {formatCompactHolidayRange(h.startDate, h.endDate)}
                          </span>
                          <span className="font-black text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 text-[9.5px]">
                            {getDaysDifference(h.startDate, h.endDate)}일간
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.5 rounded">
                      {isThisActive ? '기간 표시 중 ✓' : '기간 보기 ➔'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 font-medium">
              등록된 휴교/방학 일정이 없는 정상 통학 운행일입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
