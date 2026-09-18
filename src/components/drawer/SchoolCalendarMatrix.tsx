import React, { useState } from 'react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { Calendar, ExternalLink, School as SchoolIcon, Layers } from 'lucide-react';

interface MatrixRow {
  title: string;
  category: string;
  nlcs: string;
  bha: string;
  kis: string;
  sja: string;
  jumpDates: {
    all: string;
    nlcs: string;
    bha: string;
    kis: string;
    sja: string;
  };
}

interface SchoolCalendarMatrixProps {
  onJump?: (date: string) => void;
}

const COMPARISON_ROWS: MatrixRow[] = [
  {
    title: '🎒 1학기 개학',
    category: '개학/종업',
    nlcs: '08.20 (목)',
    bha: '08.04 (화)',
    kis: '08.10 (월)',
    sja: '08.10 (월)',
    jumpDates: {
      all: '2026-08-10',
      nlcs: '2026-08-20',
      bha: '2026-08-04',
      kis: '2026-08-10',
      sja: '2026-08-10',
    },
  },
  {
    title: '🌕 추석 방학',
    category: '정규방학',
    nlcs: '09.19 ~ 09.27',
    bha: '09.19 ~ 09.29',
    kis: '09.19 ~ 09.28',
    sja: '09.19 ~ 09.27',
    jumpDates: {
      all: '2026-09-21',
      nlcs: '2026-09-19',
      bha: '2026-09-19',
      kis: '2026-09-19',
      sja: '2026-09-19',
    },
  },
  {
    title: '🍁 가을 방학',
    category: '정규방학',
    nlcs: '10.24 ~ 11.01',
    bha: '10.31 ~ 11.08',
    kis: '10.31 ~ 11.09',
    sja: '10.31 ~ 11.08',
    jumpDates: {
      all: '2026-10-31',
      nlcs: '2026-10-24',
      bha: '2026-10-31',
      kis: '2026-10-31',
      sja: '2026-10-31',
    },
  },
  {
    title: '❄️ 겨울 방학',
    category: '정규방학',
    nlcs: '12.12 ~ 01.10',
    bha: '12.12 ~ 01.03',
    kis: '12.19 ~ 01.10',
    sja: '12.19 ~ 01.10',
    jumpDates: {
      all: '2026-12-21',
      nlcs: '2026-12-12',
      bha: '2026-12-12',
      kis: '2026-12-19',
      sja: '2026-12-19',
    },
  },
  {
    title: '🧧 설날 방학',
    category: '정규방학',
    nlcs: '02.06 ~ 02.14',
    bha: '02.04 ~ 02.14',
    kis: '02.06 ~ 02.14',
    sja: '02.06 ~ 02.14',
    jumpDates: {
      all: '2027-02-08',
      nlcs: '2027-02-06',
      bha: '2027-02-04',
      kis: '2027-02-06',
      sja: '2027-02-06',
    },
  },
  {
    title: '🌸 봄 방학',
    category: '정규방학',
    nlcs: '03.20 ~ 04.04',
    bha: '04.03 ~ 04.11',
    kis: '04.03 ~ 04.11',
    sja: '03.20~28 / 04.24~05.01',
    jumpDates: {
      all: '2027-04-05',
      nlcs: '2027-03-20',
      bha: '2027-04-03',
      kis: '2027-04-03',
      sja: '2027-03-20',
    },
  },
  {
    title: '🎓 종업식',
    category: '개학/종업',
    nlcs: '06.18 (금)',
    bha: '06.04 (금)',
    kis: '06.11 (금)',
    sja: '06.11 (금)',
    jumpDates: {
      all: '2027-06-11',
      nlcs: '2027-06-18',
      bha: '2027-06-04',
      kis: '2027-06-11',
      sja: '2027-06-11',
    },
  },
];

type SchoolTab = 'ALL' | 'NLCS' | 'BHA' | 'KIS' | 'SJA';

export const SchoolCalendarMatrix: React.FC<SchoolCalendarMatrixProps> = ({ onJump }) => {
  const { setServiceDate, setDetailDrawerTab } = useScheduleStore();
  const [activeTab, setActiveTab] = useState<SchoolTab>('ALL');

  const handleJump = (date: string) => {
    setServiceDate(date);
    setDetailDrawerTab('info');
    onJump?.(date);
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
      {/* 헤더: 모바일에서 줄바꿈 충돌 방지 및 가이드 문구 제공 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-0.5 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-black text-slate-900">
            2026-2027 4대 학교 학사일정 비교 매트릭스
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 text-[10.5px]">
          <span className="text-blue-600 font-bold sm:hidden flex items-center gap-1">
            👉 <span>좌우로 밀어서 4개교 비교</span>
          </span>
          <span className="text-slate-400">행 클릭 시 해당 일자 이동</span>
        </div>
      </div>

      {/* 탭 바: 4개교 비교 표 & 개별 학교 빠른 보기 */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>전체 4개교 비교 표</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NLCS')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'NLCS'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          NLCS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BHA')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'BHA'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
          }`}
        >
          BHA
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('KIS')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'KIS'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          KIS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SJA')}
          className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 ${
            activeTab === 'SJA'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          SJA
        </button>
      </div>

      {activeTab === 'ALL' ? (
        /* 전체 4개교 비교 매트릭스 (min-w 부여로 텍스트 겹침 100% 방지 및 sticky 열 적용) */
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          <table className="min-w-[590px] w-full text-left border-collapse text-[11px]">
            <colgroup>
              <col className="w-[140px]" />
              <col className="w-[110px]" />
              <col className="w-[110px]" />
              <col className="w-[110px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-bold">
                <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 font-black text-slate-800 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  학사 일정
                </th>
                <th className="py-2 px-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100/90 text-blue-800 font-black text-xs">
                    NLCS
                  </span>
                </th>
                <th className="py-2 px-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-100/90 text-orange-800 font-black text-xs">
                    BHA
                  </span>
                </th>
                <th className="py-2 px-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100/90 text-indigo-800 font-black text-xs">
                    KIS
                  </span>
                </th>
                <th className="py-2 px-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 font-black text-xs">
                    SJA
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleJump(row.jumpDates.all)}
                  className="hover:bg-blue-50/70 transition cursor-pointer group"
                  title={`클릭하면 ${row.jumpDates.all} 운행표 및 달력으로 이동합니다.`}
                >
                  <td className="py-2.5 px-3 sticky left-0 bg-white group-hover:bg-blue-50/70 transition border-r border-slate-100 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-between gap-1.5 font-bold text-slate-900 text-xs">
                      <span className="whitespace-nowrap">{row.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-600 shrink-0" />
                    </div>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] font-bold text-slate-700 text-center whitespace-nowrap">
                    {row.nlcs}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] font-bold text-slate-700 text-center whitespace-nowrap">
                    {row.bha}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] font-bold text-slate-700 text-center whitespace-nowrap">
                    {row.kis}
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[11px] font-bold text-slate-700 text-center">
                    {row.sja.includes('/') ? (
                      <div className="flex flex-col items-center leading-tight py-0.5">
                        <span className="whitespace-nowrap text-slate-800">{row.sja.split('/')[0].trim()}</span>
                        <span className="whitespace-nowrap text-[10px] text-slate-500 font-normal">
                          {row.sja.split('/')[1].trim()}
                        </span>
                      </div>
                    ) : (
                      <span className="whitespace-nowrap">{row.sja}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sm:hidden text-center py-1.5 text-[10.5px] text-slate-500 bg-slate-50 border-t border-slate-200/80 font-semibold">
            ↔ 표를 좌우로 스크롤하여 4개 학교 전체 일정을 확인하세요
          </div>
        </div>
      ) : (
        /* 단일 학교 뷰: 100% 모바일 맞춤 세로 카드 레이아웃 (스크롤 불필요) */
        <div className="flex flex-col gap-1.5 border border-slate-200/80 rounded-xl p-2 bg-slate-50/50">
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <SchoolIcon className="w-3.5 h-3.5 text-blue-600" />
              {activeTab} 2026-2027 학사일정
            </span>
            <span className="text-[10px] text-slate-400">클릭 시 해당 일자로 이동</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {COMPARISON_ROWS.map((row, idx) => {
              const schoolKey = activeTab.toLowerCase() as 'nlcs' | 'bha' | 'kis' | 'sja';
              const dateText = row[schoolKey];
              const jumpDate = row.jumpDates[schoolKey];

              return (
                <div
                  key={idx}
                  onClick={() => handleJump(jumpDate)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer flex items-center justify-between shadow-2xs active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{row.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dateText.includes('/') ? (
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                          {dateText.split('/')[0].trim()}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-600 mt-0.5">
                          {dateText.split('/')[1].trim()}
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        {dateText}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 shrink-0">
                      이동 ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
