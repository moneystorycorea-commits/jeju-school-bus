import React from 'react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { Calendar, ExternalLink } from 'lucide-react';

interface MatrixRow {
  title: string;
  category: string;
  nlcs: string;
  bha: string;
  kis: string;
  sja: string;
  jumpDate: string;
}

const COMPARISON_ROWS: MatrixRow[] = [
  {
    title: '🎒 1학기 개학',
    category: '개학/종업',
    nlcs: '08.20 (목)',
    bha: '08.04 (화)',
    kis: '08.10 (월)',
    sja: '08.10 (월)',
    jumpDate: '2026-08-10',
  },
  {
    title: '🌕 추석 방학',
    category: '정규방학',
    nlcs: '09.19 ~ 09.27',
    bha: '09.19 ~ 09.29',
    kis: '09.19 ~ 09.28',
    sja: '09.19 ~ 09.27',
    jumpDate: '2026-09-21',
  },
  {
    title: '🍁 가을 방학 (Fall Break)',
    category: '정규방학',
    nlcs: '10.24 ~ 11.01',
    bha: '10.31 ~ 11.08',
    kis: '10.31 ~ 11.09',
    sja: '10.31 ~ 11.08',
    jumpDate: '2026-10-31',
  },
  {
    title: '❄️ 겨울 방학 (Winter Break)',
    category: '정규방학',
    nlcs: '12.12 ~ 01.10',
    bha: '12.12 ~ 01.03',
    kis: '12.19 ~ 01.10',
    sja: '12.19 ~ 01.10',
    jumpDate: '2026-12-21',
  },
  {
    title: '🧧 설날 방학 (Seollal)',
    category: '정규방학',
    nlcs: '02.06 ~ 02.14',
    bha: '02.04 ~ 02.14',
    kis: '02.06 ~ 02.14',
    sja: '02.06 ~ 02.14',
    jumpDate: '2027-02-08',
  },
  {
    title: '🌸 봄 방학 (Spring Break)',
    category: '정규방학',
    nlcs: '03.20 ~ 04.04',
    bha: '04.03 ~ 04.11',
    kis: '04.03 ~ 04.11',
    sja: '03.20~28 / 04.24~05.01',
    jumpDate: '2027-04-05',
  },
  {
    title: '🎓 종업식 (Last Day)',
    category: '개학/종업',
    nlcs: '06.18 (금)',
    bha: '06.04 (금)',
    kis: '06.11 (금)',
    sja: '06.11 (금)',
    jumpDate: '2027-06-11',
  },
];

export const SchoolCalendarMatrix: React.FC = () => {
  const { setServiceDate, setDetailDrawerTab } = useScheduleStore();

  const handleJump = (date: string) => {
    setServiceDate(date);
    setDetailDrawerTab('info');
  };

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-extrabold text-slate-900">
            2026-2027 4대 학교 학사일정 비교 매트릭스
          </span>
        </div>
        <span className="text-[10px] text-slate-400">행 클릭 시 해당 일자로 이동</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
              <th className="py-2.5 px-3 min-w-[140px]">학사 일정</th>
              <th className="py-2 px-2 text-center">
                <span className="px-2 py-0.5 rounded bg-blue-100/70 text-blue-700 font-black text-[11px]">NLCS</span>
              </th>
              <th className="py-2 px-2 text-center">
                <span className="px-2 py-0.5 rounded bg-orange-100/70 text-orange-700 font-black text-[11px]">BHA</span>
              </th>
              <th className="py-2 px-2 text-center">
                <span className="px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-700 font-black text-[11px]">KIS</span>
              </th>
              <th className="py-2 px-2.5 text-center">
                <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-700 font-black text-[11px]">SJA</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => handleJump(row.jumpDate)}
                className="hover:bg-blue-50/70 transition cursor-pointer group"
                title={`클릭하면 ${row.jumpDate} 운행표 및 달력으로 이동합니다.`}
              >
                <td className="py-2 px-3 font-bold text-slate-800 flex items-center justify-between gap-1.5">
                  <span className="truncate">{row.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-600 shrink-0" />
                </td>
                <td className="py-2 px-2 font-mono text-[10.5px] text-slate-700 text-center whitespace-nowrap">
                  {row.nlcs}
                </td>
                <td className="py-2 px-2 font-mono text-[10.5px] text-slate-700 text-center whitespace-nowrap">
                  {row.bha}
                </td>
                <td className="py-2 px-2 font-mono text-[10.5px] text-slate-700 text-center whitespace-nowrap">
                  {row.kis}
                </td>
                <td className="py-2 px-2.5 font-mono text-[10.5px] text-slate-700 text-center whitespace-nowrap">
                  {row.sja}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
