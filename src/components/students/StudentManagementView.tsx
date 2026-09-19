import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Eye, EyeOff, ArrowUpDown, ArrowUp, ArrowDown, Printer } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatGradeDisplay } from '@/lib/constants/schools';
import { formatStudentWeeklySummary } from '@/lib/scheduling/weeklyRoutineExport';

type SortField = 'index' | 'name' | 'gender' | 'address' | 'school' | 'grade' | 'gate' | 'guardian' | 'time';
type SortDirection = 'asc' | 'desc';

export const StudentManagementView: React.FC = () => {
  const {
    students,
    schools,
    currentRole,
    getPrivateInfo,
    openStudentModal,
    selectStudent,
  } = useScheduleStore();

  const [showPhoneMap, setShowPhoneMap] = useState<Record<string, boolean>>({});
  const [showStudentPhoneMap, setShowStudentPhoneMap] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handlePrint = () => {
    window.print();
  };

  const togglePhone = (id: string) => {
    setShowPhoneMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStudentPhone = (id: string) => {
    setShowStudentPhoneMap((prev) => ({ ...prev, [id]: !prev[id] }));
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
        case 'gate': {
          const gA = a.gate || '';
          const gB = b.gate || '';
          cmp = gA.localeCompare(gB, 'ko');
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
    <div className="flex flex-col gap-3 select-none animate-fadeIn max-w-5xl w-full">
      {/* ========================================================================= */}
      {/* [인쇄/PDF 전용] A4 1페이지 최적화 등록학생 명단 공고문 (hidden print:flex) */}
      {/* ========================================================================= */}
      <div
        className="hidden print:flex flex-col justify-between w-full bg-white text-slate-900 select-none min-h-[268mm] pt-5 pb-2 px-1 m-0"
        style={{
          fontFamily: "'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif",
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div>
          {/* 상단 공고문 타이틀 */}
          <div className="text-center pb-2 mb-4 border-b-2 border-slate-900 bg-white">
            <h1 className="text-2xl font-black text-slate-900 tracking-wider py-0.5">
              통학차량 등록학생 명단
            </h1>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              아주 더 하이클래스 제주 단지 내 통학버스 정규 이용 학생 현황 (총 {students.length}명)
            </p>
          </div>

          {/* 인쇄용 학생 명단 테이블 (학생추가 기준 11개 항목 일관성 반영) */}
          <table className="w-full text-left border-collapse border border-slate-700 table-fixed text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-500 text-center" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <th className="py-1 px-1 w-[5%] border-r border-slate-400">No.</th>
                <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">성명(성별)</th>
                <th className="py-1 px-1 w-[10%] border-r border-slate-400">동·호수</th>
                <th className="py-1 px-1.5 w-[12%] border-r border-slate-400">학교/학년</th>
                <th className="py-1 px-1 w-[10%] border-r border-slate-400">정차 게이트</th>
                <th className="py-1 px-1.5 w-[14%] border-r border-slate-400">보호자(연락처)</th>
                <th className="py-1 px-1.5 w-[11%] border-r border-slate-400">학생 연락처</th>
                <th className="py-1 px-1.5 w-[18%] border-r border-slate-400">주간 등·하교 루틴</th>
                <th className="py-1 px-1 w-[9%]">특이사항</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-900">
              {students.map((st, idx) => {
                const sc = schools.find((s) => s.id === st.schoolId);
                const priv = getPrivateInfo(st.id);
                const contact = priv?.emergencyContact || '010-3849-1234';
                const guardian = priv?.guardianName ? `${priv.guardianName}` : '-';
                const studentPhone = priv?.studentPhone || '-';
                const summary = formatStudentWeeklySummary(st);

                return (
                  <tr
                    key={st.id}
                    className={idx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}
                    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                  >
                    <td className="py-1 px-1 text-center font-black text-slate-700 border-r border-slate-300">
                      {idx + 1}
                    </td>
                    <td className="py-1 px-1.5 font-black text-slate-950 border-r border-slate-300 whitespace-nowrap">
                      {st.name} ({st.gender || '-'})
                    </td>
                    <td className="py-1 px-1 font-bold text-slate-800 border-r border-slate-300 whitespace-nowrap">
                      {st.building} {st.unit}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-300 whitespace-nowrap">
                      <span className="font-black text-slate-900">{sc?.shortName || st.schoolId}</span>
                      <span className="text-blue-900 font-bold ml-1">({formatGradeDisplay(st.grade, st.schoolId)})</span>
                    </td>
                    <td className="py-1 px-1 text-center font-bold text-slate-800 border-r border-slate-300 text-[10px]">
                      {st.gate || '-'}
                    </td>
                    <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 whitespace-nowrap text-[10px]">
                      {guardian} ({contact.slice(-4)})
                    </td>
                    <td className="py-1 px-1.5 font-mono text-slate-800 border-r border-slate-300 whitespace-nowrap text-[10px]">
                      {studentPhone}
                    </td>
                    <td className="py-1 px-1.5 font-mono text-slate-900 border-r border-slate-300 whitespace-nowrap text-[9.5px]">
                      등 {summary.morningText} / 하 {summary.afternoonText}
                    </td>
                    <td className="py-1 px-1 text-slate-600 text-[9.5px] truncate max-w-[80px]">
                      {st.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 공고문 하단 관리사무소 서명 */}
        <div className="border-t-2 border-slate-400 pt-2 mt-3 text-center bg-white">
          <div className="font-black text-xs text-slate-900 tracking-[0.3em]">
            아 주 더 하 이 클 래 스  관 리 사 무 소
          </div>
        </div>
      </div>

      {/* 1. 상단 타이틀 배너 (화면 전용: no-print) */}
      <div className="bg-white rounded-xl border border-slate-200 py-2.5 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">학생 관리</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              총 {students.length}명 등록
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 학생 명단 인쇄 / PDF 버튼 */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-2xs transition cursor-pointer"
            title="A4 1페이지 최적화 등록학생 명단 인쇄 / PDF 저장"
          >
            <Printer className="w-4 h-4" />
            <span>학생 명단 인쇄 / PDF</span>
          </button>

          <button
            type="button"
            onClick={openStudentModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 shadow-2xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>새 학생 추가</span>
          </button>
        </div>
      </div>

      {/* 학교별 학생 분포 칩 (화면 전용: no-print) */}
      <div className="flex items-center gap-2 flex-wrap no-print">
        {schools.map((sc) => {
          const count = students.filter((s) => s.schoolId === sc.id).length;
          return (
            <div
              key={sc.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs sm:text-sm font-black ${sc.badgeBg} shadow-2xs`}
            >
              <span>{sc.shortName}</span>
              <span className="font-extrabold opacity-90">
                {count}명
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. 등록 학생 명단 테이블 (화면 전용: no-print) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden w-full no-print">
        <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">등록 학생 명단</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              열 제목 클릭 시 즉시 정렬
            </span>
          </div>
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
                {renderSortHeader('정차 게이트', 'gate', true, 'w-24')}
                {renderSortHeader('보호자', 'guardian', false, 'w-20')}
                <th className="py-2.5 px-3 text-sm font-bold text-slate-700 whitespace-nowrap w-36">보호자 연락처</th>
                <th className="py-2.5 px-3 text-sm font-bold text-slate-700 whitespace-nowrap w-36">학생 연락처</th>
                {renderSortHeader('주간 등·하교 루틴', 'time', false, 'w-48')}
                <th className="py-2.5 px-3 text-sm font-bold text-slate-700 whitespace-nowrap w-44">특이사항 / 비고</th>
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

                const rawStudentPhone = privateInfo?.studentPhone;
                const isStudentRevealed = currentRole === 'admin' && showStudentPhoneMap[st.id];
                const displayStudentPhone = rawStudentPhone
                  ? (isStudentRevealed ? rawStudentPhone : '***-****-' + rawStudentPhone.slice(-4))
                  : '-';

                const summary = formatStudentWeeklySummary(st);
                const gradeDisplay = formatGradeDisplay(st.grade, st.schoolId);

                return (
                  <tr
                    key={st.id}
                    onClick={() => {
                      selectStudent(st.id, false, true);
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
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {st.gate ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {st.gate}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
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
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-sm ${rawStudentPhone ? 'font-bold text-slate-800' : 'text-slate-400 font-normal'}`}>
                          {displayStudentPhone}
                        </span>
                        {currentRole === 'admin' && rawStudentPhone ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudentPhone(st.id);
                            }}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer transition"
                            title={isStudentRevealed ? '번호 가리기' : '전체 번호 확인 (관리자)'}
                          >
                            {isStudentRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex flex-col text-xs leading-snug">
                        <span className="font-bold text-blue-700">등 {summary.morningText}</span>
                        <span className="font-medium text-slate-600">하 {summary.afternoonText}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {st.notes ? (
                        <span className="text-xs text-slate-700 truncate max-w-[140px] block font-medium" title={st.notes}>
                          {st.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
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
