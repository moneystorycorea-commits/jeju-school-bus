import React from 'react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';
import { Bus, GitFork, Sparkles, AlertTriangle, X, Check } from 'lucide-react';

export const SplitTripModal: React.FC = () => {
  const { splitTripProposal, setSplitTripProposal, executeSplitTrip, updateAssignedTime, schools } =
    useScheduleStore();

  if (!splitTripProposal) return null;

  const targetSchool = schools.find((s) => s.id === splitTripProposal.schoolId);
  const vehicleLabel = splitTripProposal.vehicleId === 'v1' ? '1호차' : '2호차';

  const handleCancel = () => {
    setSplitTripProposal(null);
  };

  const handleSeparateRun = () => {
    executeSplitTrip(splitTripProposal);
  };

  const handleMoveTogether = () => {
    updateAssignedTime(splitTripProposal.studentId, splitTripProposal.newMinute, true);
    setSplitTripProposal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-scaleUp">
        {/* 모달 헤더 */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <GitFork className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-snug">
                  새로운 2회차 운행으로 분리하시겠습니까?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  {vehicleLabel} 운행 분리
                </span>
              </div>
              <p className="text-xs text-blue-100">
                15분 이상의 등교 시간 차이가 감지되었습니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 */}
        <div className="p-5 flex flex-col gap-4">
          {/* 현황 요약 배너 */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 flex flex-col gap-1">
              <span className="font-bold text-amber-900">
                <span
                  className="inline-block px-1.5 py-0.2 mr-1 rounded text-[11px] font-black"
                  style={{
                    backgroundColor: targetSchool?.badgeBg || '#e0e7ff',
                    color: targetSchool?.color || '#1e3a8a',
                  }}
                >
                  {targetSchool?.shortName || splitTripProposal.schoolId}
                </span>
                {splitTripProposal.studentName} 학생을 {formatMinute(splitTripProposal.oldMinute)} ➔{' '}
                <strong className="text-blue-700 font-extrabold">
                  {formatMinute(splitTripProposal.newMinute)}
                </strong>
                로{' '}
                <strong className="text-amber-800">
                  ({splitTripProposal.delta > 0 ? `+${splitTripProposal.delta}` : splitTripProposal.delta}분)
                </strong>{' '}
                조정하셨습니다.
              </span>
              <span className="text-amber-800/90 text-[11px] leading-relaxed">
                현재 같은 {vehicleLabel}에 배정된 다른 학교 학생들과 15분 이상 차이가 발생합니다.
                어떻게 운행 일정을 편성할까요?
              </span>
            </div>
          </div>

          {/* 옵션 비교 카드 2개 */}
          <div className="flex flex-col gap-3">
            {/* 옵션 1: 2회차 운행으로 분리 (권장) */}
            <div
              onClick={handleSeparateRun}
              className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/60 hover:bg-blue-50 transition cursor-pointer flex flex-col gap-2 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-blue-950">
                    선택 1. 2회차 운행으로 자동 분리 (추천)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-2xs">
                  권장
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                기존 학생들의 시간표를 흔들지 않고, {vehicleLabel}를{' '}
                <strong className="text-slate-900 font-bold">1회차</strong>와{' '}
                <strong className="text-blue-700 font-bold">2회차</strong> 2회 운행으로 나누어
                편성합니다.
              </p>

              {/* 회차별 시간표 미리보기 */}
              <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-blue-200/70 text-[11px]">
                <div className="p-2 rounded-lg bg-white border border-blue-100 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Bus className="w-3.5 h-3.5 text-slate-500" />
                    <span>1회차 운행 (기존 유지)</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {splitTripProposal.otherStudents.map((s) => s.name).join(', ')}
                  </span>
                  <span className="font-mono font-bold text-slate-700 mt-0.5">
                    {formatMinute(splitTripProposal.oldDepartureMinute)} 단지 출발
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white border border-blue-200 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 font-bold text-blue-900">
                    <Bus className="w-3.5 h-3.5 text-blue-600" />
                    <span>2회차 운행 (신규 신설)</span>
                  </div>
                  <span className="text-blue-700 font-bold text-[10px]">
                    {splitTripProposal.studentName} ({targetSchool?.shortName})
                  </span>
                  <span className="font-mono font-bold text-blue-600 mt-0.5">
                    {formatMinute(splitTripProposal.newDepartureMinute)} 단지 출발 ➔ {formatMinute(splitTripProposal.newMinute)} 도착
                  </span>
                </div>
              </div>
            </div>

            {/* 옵션 2: 전체 동시 이동 (기존 합승 유지) */}
            <div
              onClick={handleMoveTogether}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition cursor-pointer flex flex-col gap-1.5 text-xs"
            >
              <span className="font-bold text-slate-800">
                선택 2. 전체 학생 동시 이동 (기존 1회 운행 유지)
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                현재 탑승 학생들(
                {splitTripProposal.otherStudents.map((s) => `${s.name}(${s.schoolName})`).join(', ')}
                )도 함께 {Math.abs(splitTripProposal.delta)}분{' '}
                {splitTripProposal.delta > 0 ? '늦춰집니다' : '당겨집니다'}.
              </p>
            </div>
          </div>
        </div>

        {/* 모달 하단 버튼 바 */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            취소 (원래대로 복구)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMoveTogether}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              전체 함께 이동
            </button>
            <button
              type="button"
              onClick={handleSeparateRun}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>2회차 운행으로 분리</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
