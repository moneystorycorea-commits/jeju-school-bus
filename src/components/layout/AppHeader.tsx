import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { UserRole } from '@/types';

export const AppHeader: React.FC = () => {
  const { currentRole, setCurrentRole, getConflicts, openConflictModal } = useScheduleStore();
  const conflicts = getConflicts();
  const conflictCount = conflicts.length;

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none shadow-2xs">
      {/* 좌측 타이틀 & 서브타이틀 */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight">
          국제학교 통학버스 운행시스템
        </h1>
      </div>

      {/* 우측 알림 & 프로필 / 역할 전환기 */}
      <div className="flex items-center gap-3">
        {/* 운행 시간 충돌 확인 삼각형 아이콘 버튼 */}
        <button
          type="button"
          onClick={openConflictModal}
          aria-label="운행 충돌 분석 확인"
          title={conflictCount > 0 ? `운행 충돌 ${conflictCount}건 감지 - 클릭하여 상세 내역 확인` : '충돌 없음 - 일정 정상'}
          className={`relative p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
            conflictCount > 0 ? 'text-red-600 hover:bg-red-50' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className={`w-4.5 h-4.5 ${conflictCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
          {conflictCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center ring-2 ring-white shadow-xs">
              {conflictCount}
            </span>
          )}
        </button>

        {/* 역할(Role) 스위처 - 테스트용 */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-600 px-0.5 font-bold flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            권한:
          </span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-white border border-slate-300 rounded px-2 py-0.5 font-bold text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="admin">관리자 (ADMIN)</option>
            <option value="guardian">학부모 (GUARDIAN)</option>
            <option value="student">학생 (STUDENT)</option>
          </select>
        </div>

        {/* 아주더하이클래스 관리자 프로필 & 로고 */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs overflow-hidden">
            <img
              src="/logo-highclass.png"
              alt="아주더하이클래스"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-black text-slate-900 tracking-tight">
              {currentRole === 'admin' ? '아주더하이클래스' : currentRole === 'guardian' ? '학부모' : '학생'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {currentRole === 'admin' ? '관리사무소' : '106동 301호'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
