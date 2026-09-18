import React from 'react';
import { CalendarDays, Users, Bus } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';

export const SidebarNav: React.FC = () => {
  const { activeNav, setActiveNav } = useScheduleStore();

  const navItems = [
    { id: 'schedule', label: '스케줄', icon: CalendarDays },
    { id: 'trips', label: '운행시간표', icon: Bus },
    { id: 'students', label: '학생 관리', icon: Users },
  ];

  return (
    <aside className="w-20 md:w-24 bg-[#1e293b] text-slate-300 flex flex-col items-center py-5 border-r border-slate-800 shrink-0 select-none z-30 shadow-lg">
      {/* 상단 아주더하이클래스 시그니처 엠블럼 심볼 로고 (남색 배경 위 순백색 심볼 단독 강조) */}
      <div className="flex flex-col items-center gap-6 w-full px-2">
        <button
          type="button"
          onClick={() => setActiveNav('schedule')}
          className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
          title="아주더하이클래스 통학버스 시스템"
        >
          <img
            src="/logo-symbol-white.png"
            alt="아주더하이클래스"
            className="w-12 h-12 md:w-14 md:h-14 object-contain filter drop-shadow-md group-hover:scale-105 transition-transform"
          />
        </button>

        {/* 메뉴 리스트 */}
        <nav className="flex flex-col gap-2.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`flex flex-col items-center justify-center py-3.5 px-1 rounded-xl transition-all w-full text-xs md:text-sm font-bold cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
