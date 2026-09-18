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
import { formatKoreanDate, getTodayDateString } from '@/lib/scheduling/time';

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
    setServiceDate(getTodayDateString());
  };

  const isRouteDrawerActive = isDetailDrawerOpen;

  const handleCalendarToggle = () => {
    if (isDetailDrawerOpen && detailDrawerTab === 'info') {
      closeDetailDrawer();
    } else {
      setDetailDrawerTab('info', true);
    }
  };

  const handleRouteSettingsToggle = () => {
    if (isDetailDrawerOpen) {
      closeDetailDrawer();
    } else {
      setDetailDrawerTab('info', true);
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
          className="px-2.5 py-1 text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition cursor-pointer"
        >
          오늘
        </button>

        {/* Undo (되돌리기) 버튼: 마우스 호버 시 즉시 친절한 기능 설명 툴팁 노출 */}
        <div className="relative group/undo">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-bold rounded-lg border transition ${
              history.length > 0
                ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs'
                : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>되돌리기</span>
            {history.length > 0 && (
              <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-extrabold font-mono">
                {history.length}
              </span>
            )}
          </button>

          {/* 호버 시 즉시 나타나는 직관적인 메뉴 설명 툴팁 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl pointer-events-none opacity-0 group-hover/undo:opacity-100 transition-all duration-150 z-50 text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-black text-slate-100 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>작업 되돌리기 (Undo)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {history.length > 0 ? `${history.length}단계 기록` : '기록 없음'}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              {history.length > 0
                ? '학생 시간 변경, 슬라이더 드래그, 운행 코스 수정 등의 직전 작업을 취소하고 이전 상태로 되돌립니다.'
                : '현재 되돌릴 최근 작업 내역이 없습니다. (타임라인 슬라이더나 시간을 변경하면 활성화됩니다)'}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
          </div>
        </div>
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

      {/* 우측: 액션 버튼군 (학생관리 페이지와 동일한 text-sm font-bold) */}
      <div className="flex items-center gap-2">
        <button
          onClick={openStudentModal}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-2xs transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>학생 추가</span>
        </button>

        <button
          onClick={handleRouteSettingsToggle}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-bold shadow-2xs transition cursor-pointer ${
            isRouteDrawerActive
              ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-400/50'
              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
          }`}
          title="클릭하여 운행 설정(구간 소요시간 등) 창 열기/닫기"
        >
          <SlidersHorizontal className={`w-4 h-4 ${isRouteDrawerActive ? 'text-blue-600' : 'text-slate-600'}`} />
          <span>운행 설정</span>
        </button>

        <button
          onClick={saveChanges}
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-sm font-bold text-white shadow-sm transition cursor-pointer ${
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
              <Check className="w-4 h-4" />
              <span>저장됨</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
