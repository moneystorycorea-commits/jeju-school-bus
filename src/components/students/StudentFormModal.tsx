import React, { useState } from 'react';
import { X, UserPlus, Check, Copy, Clock } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { parseTimeToMinute } from '@/lib/scheduling/time';
import { StudentWeeklySchedule } from '@/types';

export const StudentFormModal: React.FC = () => {
  const { isStudentModalOpen, closeStudentModal, addStudent, schools } = useScheduleStore();

  const [name, setName] = useState('');
  const [building, setBuilding] = useState('108동');
  const [unit, setUnit] = useState('1202호');
  const [schoolId, setSchoolId] = useState('NLCS');
  const [grade, setGrade] = useState('중학교 1학년');
  const [emergencyContact, setEmergencyContact] = useState('010-9988-7766');

  const [gender, setGender] = useState<'여' | '남' | ''>('여');
  const [gate, setGate] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');

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
      alert('학생 이름을 입력해 주세요.');
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
      building: building.trim(),
      unit: unit.trim(),
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* 모달 헤더 */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">새 학생 등록</h3>
          </div>
          <button
            onClick={closeStudentModal}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
          {/* 1. 학생 기본 정보 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학생 성명 *</label>
              <input
                type="text"
                required
                placeholder="예: 김이담"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">성별</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as '여' | '남' | '')}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              >
                <option value="여">여</option>
                <option value="남">남</option>
                <option value="">기타</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">동 *</label>
              <input
                type="text"
                placeholder="108동"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">호수 *</label>
              <input
                type="text"
                placeholder="1202호"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학교 *</label>
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              >
                {schools.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.shortName} ({sc.name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학년</label>
              <input
                type="text"
                placeholder="예: 10학년"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">정차 게이트</label>
              <input
                type="text"
                placeholder="예: 주니어게이트"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
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
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">비상연락망 (보호자) *</label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700">학생 본인 연락처</label>
              <input
                type="tel"
                placeholder="010-4815-8415"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium font-mono"
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
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <th className="py-2 px-2 text-left w-16">구분</th>
                    {weekdays.map(({ day, label }) => (
                      <th key={day} className="py-2 px-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded ${day === 3 ? 'bg-amber-100 text-amber-800 font-extrabold' : ''}`}>
                          {label}요일
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* 등교 희망시간 행 */}
                  <tr>
                    <td className="py-2.5 px-2 text-left font-bold text-blue-700 bg-blue-50/40 text-[11px]">
                      등교
                    </td>
                    {weekdays.map(({ day }) => (
                      <td key={day} className="py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="text"
                            disabled={!morningActive[day]}
                            value={morningTimes[day]}
                            onChange={(e) =>
                              setMorningTimes({ ...morningTimes, [day]: e.target.value })
                            }
                            placeholder="07:40"
                            className={`w-full text-center py-1 px-0.5 font-mono text-xs font-bold border rounded-md focus:outline-hidden focus:border-blue-500 ${
                              morningActive[day]
                                ? 'border-slate-200 bg-white text-slate-900'
                                : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setMorningActive({ ...morningActive, [day]: !morningActive[day] })
                            }
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                              morningActive[day]
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-200 text-slate-500'
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
                    <td className="py-2.5 px-2 text-left font-bold text-indigo-700 bg-indigo-50/40 text-[11px]">
                      하교
                    </td>
                    {weekdays.map(({ day }) => (
                      <td key={day} className="py-2 px-1">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="text"
                            disabled={!afternoonActive[day]}
                            value={afternoonTimes[day]}
                            onChange={(e) =>
                              setAfternoonTimes({ ...afternoonTimes, [day]: e.target.value })
                            }
                            placeholder="15:30"
                            className={`w-full text-center py-1 px-0.5 font-mono text-xs font-bold border rounded-md focus:outline-hidden focus:border-indigo-500 ${
                              afternoonActive[day]
                                ? 'border-slate-200 bg-white text-slate-900'
                                : 'border-slate-200 bg-slate-100 text-slate-400 line-through'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAfternoonActive({ ...afternoonActive, [day]: !afternoonActive[day] })
                            }
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition cursor-pointer ${
                              afternoonActive[day]
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-200 text-slate-500'
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
            <span className="text-[10px] text-slate-400">
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
