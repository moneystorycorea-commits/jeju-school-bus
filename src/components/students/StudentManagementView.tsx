import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';

type SortField = 'index' | 'name' | 'gender' | 'address' | 'school' | 'grade' | 'guardian' | 'time';
type SortDirection = 'asc' | 'desc';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    schools,
    currentRole,
    getPrivateInfo,
    openStudentModal,
    selectStudent,
    setActiveNav,
  } = useScheduleStore();

  const [showPhoneMap, setShowPhoneMap] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const togglePhone = (id: string) => {
    setShowPhoneMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 열별 정렬 적용된 학생 목록
  const sortedStudents = useMemo(() => {
    const list = [...students];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'index': {
          const idxA = a.sortOrder ?? 0;
          const idxB = b.sortOrder ?? 0;
          cmp = idxA - idxB;
          break;
        }
        case 'name':
          cmp = a.name.localeCompare(b.name, 'ko');
          break;
        case 'gender':
          cmp = (a.gender || '').localeCompare(b.gender || '', 'ko');
          break;
        case 'address': {
          const addrA = `${a.building || ''} ${a.unit || ''}`;
          const addrB = `${b.building || ''} ${b.unit || ''}`;
          cmp = addrA.localeCompare(addrB, 'ko');
          break;
        }
        case 'school': {
          const scA = schools.find((s) => s.id === a.schoolId)?.shortName || a.schoolId;
          const scB = schools.find((s) => s.id === b.schoolId)?.shortName || b.schoolId;
          cmp = scA.localeCompare(scB, 'ko');
          break;
        }
        case 'grade': {
          const parseGrade = (g?: string) => {
            if (!g) return -1;
            const match = g.match(/\d+/);
            return match ? parseInt(match[0], 10) : -1;
          };
          cmp = parseGrade(a.grade) - parseGrade(b.grade);
          break;
        }
        case 'guardian': {
          const gA = getPrivateInfo(a.id)?.guardianName || '';
          const gB = getPrivateInfo(b.id)?.guardianName || '';
          cmp = gA.localeCompare(gB, 'ko');
          break;
        }
        case 'time': {
          const tA = a.weeklySchedule?.[1]?.morningMinute || 0;
          const tB = b.weeklySchedule?.[1]?.morningMinute || 0;
          cmp = tA - tB;
          break;
        }
        default:
          cmp = 0;
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [students, sortField, sortDirection, schools, getPrivateInfo]);

  const renderSortHeader = (label: string, field: SortField, center = false, widthClass = '') => {
    const isCurrent = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-2.5 px-3 font-bold text-slate-700 text-sm cursor-pointer select-none hover:bg-slate-200/80 transition group/th whitespace-nowrap ${
          center ? 'text-center' : 'text-left'
        } ${widthClass}`}
        title={`${label} 클릭 시 오름차순/내림차순 정렬`}
      >
        <div className={`flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
          <span>{label}</span>
          <span className="shrink-0">
            {isCurrent ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-black" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-black" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover/th:opacity-100 transition" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="flex flex-col gap-5 select-none animate-fadeIn max-w-5xl w-full">
      {/* 1. 상단 타이틀 배너 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">학생 관리</h2>
              <span className="text-xs sm:text-sm px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                총 {students.length}명 등록
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              학생별 학교, 동호수, 비상연락망 및 요일별 등·하교 희망 일정을 관리합니다.
            </p>
          </div>
        </div>

        <button
          onClick={openStudentModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>새 학생 추가</span>
        </button>
      </div>

      {/* 학교별 학생 분포 칩 (가독성을 위해 폰트 2pt 확대) */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {schools.map((sc) => {
          const count = students.filter((s) => s.schoolId === sc.id).length;
          return (
            <div
              key={sc.id}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-black ${sc.badgeBg} shadow-2xs`}
            >
              <span>{sc.shortName}</span>
              <span className="font-extrabold text-sm opacity-90">
                {count}명
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. 등록 학생 명단 테이블 (행 클릭 시 상세 편집 연동 - [편집] 버튼 불필요하여 제거 & 폰트 2pt 확대) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">등록 학생 명단</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              열 제목 클릭 시 즉시 정렬
            </span>
          </div>
          <span className="text-sm text-slate-600 font-medium">
            * 학생 행 클릭 시 상세 일정 편집
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold">
                {renderSortHeader('순번', 'index', true, 'w-12')}
                {renderSortHeader('학생 성명', 'name', false, 'w-24')}
                {renderSortHeader('성별', 'gender', true, 'w-14')}
                {renderSortHeader('동 · 호수', 'address', false, 'w-28')}
                {renderSortHeader('재학 학교', 'school', true, 'w-20')}
                {renderSortHeader('학년', 'grade', true, 'w-16')}
                {renderSortHeader('보호자', 'guardian', false, 'w-20')}
                <th className="py-2.5 px-3 text-sm font-bold text-slate-700 whitespace-nowrap w-36">비상연락망</th>
                {renderSortHeader('기본 등교 (월/수)', 'time', false, 'w-40')}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {sortedStudents.map((st, idx) => {
                const school = schools.find((sc) => sc.id === st.schoolId);
                const privateInfo = getPrivateInfo(st.id);
                const rawPhone = privateInfo?.emergencyContact || '010-3849-1234';
                const isRevealed = currentRole === 'admin' && showPhoneMap[st.id];
                const displayPhone = isRevealed ? rawPhone : '***-****-' + rawPhone.slice(-4);
                const guardian = privateInfo?.guardianName || '-';

                const monM = st.weeklySchedule?.[1]?.morningMinute || 460;
                const wedM = st.weeklySchedule?.[3]?.morningMinute || monM;

                const gradeDisplay = (() => {
                  if (!st.grade || st.grade === '?' || st.grade.includes('재학')) return '?';
                  const match = st.grade.match(/\d+/);
                  return match ? `${match[0]}학년` : '?';
                })();

                return (
                  <tr
                    key={st.id}
                    onClick={() => {
                      selectStudent(st.id, true, true);
                      setActiveNav('schedule');
                    }}
                    className="hover:bg-blue-50/50 cursor-pointer transition select-none group"
                    title="클릭하여 학생 상세 정보 및 일정 편집"
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 text-sm whitespace-nowrap">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 text-sm whitespace-nowrap">
                      <span className="group-hover:text-blue-600 transition">
                        {st.name}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-sm font-medium text-slate-600 whitespace-nowrap">
                      {st.gender || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 text-sm whitespace-nowrap">
                      {st.building} {st.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {school && (
                        <span className={`text-xs font-black px-2 py-0.5 rounded border shadow-2xs ${school.badgeBg}`}>
                          {school.shortName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800 text-sm whitespace-nowrap">
                      {gradeDisplay}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 text-sm whitespace-nowrap">
                      {guardian}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-red-600">
                          {displayPhone}
                        </span>
                        {currentRole === 'admin' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePhone(st.id);
                            }}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer transition"
                            title={isRevealed ? '번호 가리기' : '전체 번호 확인 (관리자)'}
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">(보호)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-sm whitespace-nowrap">
                      월 {formatMinute(monM)} / 수 {formatMinute(wedM)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
