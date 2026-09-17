import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  UserPlus,
  SlidersHorizontal,
  Check,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatKoreanDate } from '@/lib/scheduling/time';

export const TopToolbar: React.FC = () => {
  const {
    serviceDate,
    nextDate,
    prevDate,
    setServiceDate,
    scheduleType,
    setScheduleType,
    saveStatus,
    saveChanges,
    undo,
    isDetailDrawerOpen,
    detailDrawerTab,
    closeDetailDrawer,
    setDetailDrawerTab,
    openStudentModal,
  } = useScheduleStore();

  const handleToday = () => {
    setServiceDate('2024-10-28'); // 기준 Mock Date
  };

  const handleCalendarToggle = () => {
    if (isDetailDrawerOpen && detailDrawerTab === 'vacation') {
      closeDetailDrawer();
    } else {
      setDetailDrawerTab('vacation');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0 select-none shadow-2xs">
      {/* 좌측: 날짜 네비게이션 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
          <button
            onClick={prevDate}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="이전 날짜"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleCalendarToggle}
            className="flex items-center gap-1.5 px-3 py-1 font-bold text-sm md:text-base text-slate-900 hover:text-blue-700 hover:bg-slate-100/90 min-w-[170px] justify-center tracking-tight transition cursor-pointer group"
            title="달력 클릭 시 오른쪽 방학 일정 및 운행 설정 활성화"
          >
            <span>{formatKoreanDate(serviceDate)}</span>
            <span className="p-0.5 rounded bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            onClick={nextDate}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="다음 날짜"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleToday}
          className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          오늘
        </button>

        {/* Undo 버튼 */}
        <button
          onClick={undo}
          disabled={history.length === 0}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
            history.length > 0
              ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs'
              : 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed'
          }`}
          title="마지막 변경 취소 (Undo)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>되돌리기</span>
        </button>
      </div>

      {/* 중앙: 등교 / 하교 Segmented Toggle */}
      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
        <button
          onClick={() => setScheduleType('MORNING')}
          className={`px-4 py-1 rounded-md text-sm font-black transition-all cursor-pointer ${
            scheduleType === 'MORNING'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          등교
        </button>
        <button
          onClick={() => setScheduleType('AFTERNOON')}
          className={`px-4 py-1 rounded-md text-sm font-black transition-all cursor-pointer ${
            scheduleType === 'AFTERNOON'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          하교
        </button>
      </div>

      {/* 우측: 액션 버튼군 */}
      <div className="flex items-center gap-2">
        <button
          onClick={openStudentModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-600" />
          <span>학생 추가</span>
        </button>

        <button
          onClick={() => setDetailDrawerTab('route')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
          <span>운행 설정</span>
        </button>

        <button
          onClick={saveChanges}
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm transition cursor-pointer ${
            saveStatus === 'saving'
              ? 'bg-blue-400'
              : saveStatus === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>저장 중...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>저장됨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
