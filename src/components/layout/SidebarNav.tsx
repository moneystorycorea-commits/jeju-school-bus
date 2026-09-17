import React from 'react';
import { CalendarDays, Users, Bus, HelpCircle } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';

export const SidebarNav: React.FC = () => {
  const { activeNav, setActiveNav } = useScheduleStore();

  const navItems = [
    { id: 'schedule', label: '스케줄', icon: CalendarDays },
    { id: 'trips', label: '운행시간표', icon: Bus },
    { id: 'students', label: '학생 관리', icon: Users },
  ];

  return (
    <aside className="w-20 md:w-24 bg-[#1e293b] text-slate-300 flex flex-col justify-between items-center py-5 border-r border-slate-800 shrink-0 select-none z-30 shadow-lg">
      {/* 상단 아주더하이클래스 로고 */}
      <div className="flex flex-col items-center gap-7 w-full">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-md shadow-black/20 overflow-hidden">
          <img
            src="/logo-highclass.png"
            alt="아주더하이클래스"
            className="w-full h-full object-contain"
          />
        </div>

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

      {/* 하단 도움말 */}
      <div className="w-full px-2">
        <button
          onClick={() => alert('제주국제학교 통학 스케줄 시스템 v1.0.0\n\n1. 학생 행을 드래그하여 순서를 변경할 수 있습니다.\n2. 타임라인 블록을 드래그하여 시간을 5분 단위로 변경할 수 있습니다.\n3. 학교 블록을 클릭하면 우측에서 상세 설정을 할 수 있습니다.')}
          className="flex flex-col items-center justify-center py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 w-full text-xs md:text-sm font-semibold transition cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 mb-1 text-slate-400" />
          <span>도움말</span>
        </button>
      </div>
    </aside>
  );
};
