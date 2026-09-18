import React, { useState, useMemo, useEffect } from 'react';
import { X, UserPlus, Check, Copy, Clock } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { parseTimeToMinute } from '@/lib/scheduling/time';
import { StudentWeeklySchedule } from '@/types';
import { COMPLEX_BUILDINGS, getUnitsForBuilding } from '@/lib/constants/buildingUnits';

export const StudentFormModal: React.FC = () => {
  const { isStudentModalOpen, closeStudentModal, addStudent, schools, students } = useScheduleStore();

  // 기존 등록 학생 수가 많은 순서대로 학교 정렬 (동률일 경우 학교명 순)
  const sortedSchools = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.schoolId] = (counts[s.schoolId] || 0) + 1;
    });

    return [...schools].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      if (countB !== countA) return countB - countA; // 많은 순 내림차순
      return a.shortName.localeCompare(b.shortName);
    });
  }, [schools, students]);

  const defaultSchoolId = sortedSchools[0]?.id || 'NLCS';

  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [unit, setUnit] = useState('');
  const [schoolId, setSchoolId] = useState(defaultSchoolId);
  const [grade, setGrade] = useState('G1');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [gender, setGender] = useState<'남' | '여'>('남');
  const [gate, setGate] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

  // 동 선택에 따른 유효 호수 목록
  const availableUnits = getUnitsForBuilding(building);

  const handleBuildingChange = (newBuilding: string) => {
    setBuilding(newBuilding);
    const validUnits = getUnitsForBuilding(newBuilding);
    if (!validUnits.includes(unit)) {
      setUnit('');
    }
  };

  // 학교별 학년 선택 옵션: 저청중은 1~3학년, 저청초는 1~6학년, 다른 국제학교는 G1~12
  const getGradeOptions = (sId: string) => {
    if (sId === 'CHEONG_MID') {
      return ['1학년', '2학년', '3학년'];
    }
    if (sId === 'CHEONG') {
      return ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
    }
    return Array.from({ length: 12 }, (_, i) => `G${i + 1}`);
  };

  const handleSchoolChange = (newSchoolId: string) => {
    setSchoolId(newSchoolId);
    const validGrades = getGradeOptions(newSchoolId);
    if (!validGrades.includes(grade)) {
      setGrade(validGrades[0]);
    }
  };

  // 모달이 열릴 때 재학생 수가 가장 많은 최상위 학교(NLCS 등)로 자동 초기화
  useEffect(() => {
    if (isStudentModalOpen) {
      const topSchoolId = sortedSchools[0]?.id || 'NLCS';
      setSchoolId(topSchoolId);
      const validGrades = getGradeOptions(topSchoolId);
      setGrade(validGrades[0] || 'G1');
    }
  }, [isStudentModalOpen, sortedSchools]);

  // 요일별 등/하교 희망시간 상태 (1:월, 2:화, 3:수, 4:목, 5:금)
  const weekdays = [
    { day: 1, label: '월' },
    { day: 2, label: '화' },
    { day: 3, label: '수' },
    { day: 4, label: '목' },
    { day: 5, label: '금' },
  ];

  const [morningTimes, setMorningTimes] = useState<Record<number, string>>({
    1: '07:40',
    2: '07:40',
    3: '08:40', // 수요일 등교 시간 차이 예시
    4: '07:40',
    5: '07:40',
  });

  const [afternoonTimes, setAfternoonTimes] = useState<Record<number, string>>({
    1: '15:30',
    2: '15:30',
    3: '16:30',
    4: '15:30',
    5: '15:30',
  });

  const [morningActive, setMorningActive] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const [afternoonActive, setAfternoonActive] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  if (!isStudentModalOpen) return null;

  // 월요일 시간으로 화~금 일괄 복사
  const handleCopyMondayToAll = () => {
    const mondayM = morningTimes[1];
    const mondayA = afternoonTimes[1];
    const mondayMAct = morningActive[1];
    const mondayAAct = afternoonActive[1];
    const newM = { ...morningTimes };
    const newA = { ...afternoonTimes };
    const newMAct = { ...morningActive };
    const newAAct = { ...afternoonActive };
    for (let i = 2; i <= 5; i++) {
      newM[i] = mondayM;
      newA[i] = mondayA;
      newMAct[i] = mondayMAct;
      newAAct[i] = mondayAAct;
    }
    setMorningTimes(newM);
    setAfternoonTimes(newA);
    setMorningActive(newMAct);
    setAfternoonActive(newAAct);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('학생 성명을 입력해 주세요.');
      return;
    }

    // 동 & 호수 선택값 검증
    if (!building) {
      alert('동을 선택해 주세요.');
      return;
    }
    if (!unit) {
      alert('호수를 선택해 주세요.');
      return;
    }
    const validUnits = getUnitsForBuilding(building);
    if (!validUnits.includes(unit)) {
      alert(`${building}에는 ${unit}가 존재하지 않습니다. 목록에서 올바른 호수를 선택해 주세요.`);
      return;
    }
    const finalBuilding = building;
    const finalUnit = unit;

    if (!emergencyContact.trim()) {
      alert('보호자 연락처를 입력해 주세요.');
      return;
    }

    // 주간 요일별 스케줄 구성
    const weeklySchedule: StudentWeeklySchedule = {};
    weekdays.forEach(({ day }) => {
      weeklySchedule[day] = {
        weekday: day,
        morningMinute: parseTimeToMinute(morningTimes[day] || '07:40'),
        afternoonMinute: parseTimeToMinute(afternoonTimes[day] || '15:30'),
        morningActive: morningActive[day] ?? true,
        afternoonActive: afternoonActive[day] ?? true,
        active: true,
      };
    });

    addStudent({
      name: name.trim(),
      building: finalBuilding,
      unit: finalUnit,
      schoolId,
      grade: grade.trim(),
      gender,
      gate: gate.trim() || undefined,
      notes: notes.trim() || undefined,
      emergencyContact: emergencyContact.trim(),
      studentPhone: studentPhone.trim() || undefined,
      guardianName: guardianName.trim() || undefined,
      guardianContact: emergencyContact.trim(),
      defaultMorningMinute: parseTimeToMinute(morningTimes[1] || '07:40'),
      weeklySchedule,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn select-none overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-[720px] w-full overflow-hidden my-6">
        {/* 모달 헤더 */}
        <div className="px-7 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">새 학생 등록</h3>
          </div>
          <button
            onClick={closeStudentModal}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-4.5 text-xs">
          {/* 1. 학생 기본 정보 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 text-sm">학생 성명 *</label>
              <input
                type="text"
                required
                placeholder="예: 김이담"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">성별</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as '남' | '여')}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white cursor-pointer"
              >
                <option value="남">남</option>
                <option value="여">여</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">동 *</label>
              <select
                value={building}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white cursor-pointer"
                required
              >
                <option value="">동 선택 (101동~117동)</option>
                {COMPLEX_BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">호수 *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={!building}
                className={`px-3 py-2 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer transition ${
                  !building
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
                required
              >
                <option value="">
                  {building ? '호수 선택' : '동을 먼저 선택해 주세요'}
                </option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학교 *</label>
              <select
                value={schoolId}
                onChange={(e) => handleSchoolChange(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white cursor-pointer"
              >
                {sortedSchools.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.shortName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학년 *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white cursor-pointer"
              >
                {getGradeOptions(schoolId).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">정차 게이트</label>
              <input
                type="text"
                placeholder="예: 주니어게이트"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">보호자 성함</label>
              <input
                type="text"
                placeholder="예: 김문정"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">보호자 연락처 *</label>
              <input
                type="tel"
                placeholder="예: 010-9988-7766"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium font-mono placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학생 연락처</label>
              <input
                type="tel"
                placeholder="예: 010-4815-8415"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium font-mono placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700">특이사항 / 비고</label>
            <input
              type="text"
              placeholder="예: 하교는 학원 때문에 셔틀 미활용, 월 4시 또는 5시15분"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* 2. 요일별 등/하교 희망시간 구분 입력 섹션 */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <label className="font-bold text-slate-900 text-sm">등/하교 희망시간 (요일별 설정)</label>
              </div>

              <button
                type="button"
                onClick={handleCopyMondayToAll}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition cursor-pointer"
                title="월요일에 입력한 시간을 화~금요일에 동일하게 복사합니다."
              >
                <Copy className="w-3 h-3" />
                <span>월요일 설정으로 일괄 적용</span>
              </button>
            </div>

            {/* 요일별 테이블 입력 카드 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-bold text-slate-700">
                    <th className="py-2.5 px-3 text-left w-20 font-bold">구분</th>
                    {weekdays.map(({ day, label }) => (
                      <th key={day} className="py-2.5 px-2">
                        <span className="font-extrabold text-sm text-slate-800">
                          {label}요일
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* 등교 희망시간 행 */}
                  <tr>
                    <td className="py-3 px-3 text-left font-bold text-blue-700 bg-blue-50/30 text-xs">
                      등교
                    </td>
                    {weekdays.map(({ day }) => (
                      <td key={day} className="py-2.5 px-1.5">
                        <div className="flex flex-col items-center gap-1.5">
                          <input
                            type="text"
                            disabled={!morningActive[day]}
                            value={morningTimes[day]}
                            onChange={(e) =>
                              setMorningTimes({ ...morningTimes, [day]: e.target.value })
                            }
                            placeholder="07:40"
                            className={`w-full text-center py-1.5 px-1 font-mono text-sm font-black border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                              morningActive[day]
                                ? 'border-slate-300 bg-white text-blue-700'
                                : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setMorningActive({ ...morningActive, [day]: !morningActive[day] })
                            }
                            className={`text-xs px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                              morningActive[day]
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {morningActive[day] ? '탑승' : '미이용'}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 하교 희망시간 행 */}
                  <tr>
                    <td className="py-3 px-3 text-left font-bold text-slate-700 bg-slate-50 text-xs">
                      하교
                    </td>
                    {weekdays.map(({ day }) => (
                      <td key={day} className="py-2.5 px-1.5">
                        <div className="flex flex-col items-center gap-1.5">
                          <input
                            type="text"
                            disabled={!afternoonActive[day]}
                            value={afternoonTimes[day]}
                            onChange={(e) =>
                              setAfternoonTimes({ ...afternoonTimes, [day]: e.target.value })
                            }
                            placeholder="15:30"
                            className={`w-full text-center py-1.5 px-1 font-mono text-sm font-black border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-500 ${
                              afternoonActive[day]
                                ? 'border-slate-300 bg-white text-slate-900'
                                : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAfternoonActive({ ...afternoonActive, [day]: !afternoonActive[day] })
                            }
                            className={`text-xs px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                              afternoonActive[day]
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {afternoonActive[day] ? '탑승' : '미이용'}
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              * 각 요일별 탑승 여부와 희망 시간을 설정할 수 있습니다 (미이용 시 차량 배치 제외).
            </span>
          </div>

          {/* 모달 버튼 */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={closeStudentModal}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>학생 등록 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
