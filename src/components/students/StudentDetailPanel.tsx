import React, { useState } from 'react';
import { X, Eye, EyeOff, Phone, Home, GraduationCap, User, Calendar } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { formatMinute } from '@/lib/scheduling/time';
import { formatGradeDisplay } from '@/lib/constants/schools';

export const StudentDetailPanel: React.FC = () => {
  const {
    selectedStudentId,
    students,
    schools,
    currentRole,
    getPrivateInfo,
    isStudentPanelOpen,
    closeStudentPanel,
  } = useScheduleStore();

  const [showFullPhone, setShowFullPhone] = useState(false);

  if (!isStudentPanelOpen || !selectedStudentId) {
    return null;
  }

  const student = students.find((s) => s.id === selectedStudentId);
  if (!student) return null;

  const school = schools.find((sc) => sc.id === student.schoolId);
  const privateInfo = getPrivateInfo(student.id);
  const studentIndex = students.findIndex((s) => s.id === student.id) + 1;

  // 비상연락망 마스킹 처리
  const rawPhone = privateInfo?.emergencyContact || '010-3849-1234';
  const maskedPhone = '***-****-' + rawPhone.slice(-4);
  const displayPhone = currentRole === 'admin' && showFullPhone ? rawPhone : maskedPhone;

  return (
    <div
      onClick={closeStudentPanel}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-[540px] w-full p-6 flex flex-col gap-4 select-none animate-scaleIn"
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center shadow-xs">
              {studentIndex}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{student.name}</span>
                {student.gender && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {student.gender}
                  </span>
                )}
                {school && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${school.badgeBg}`}>
                    {school.shortName}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 mt-0.5">학생 정보 및 통학 프로필</span>
            </div>
          </div>

          <button
            onClick={closeStudentPanel}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 상세 정보 그리드 (라벨 폭을 충분히 확보하여 한 줄 표시) */}
        <div className="grid grid-cols-[110px_1fr] gap-y-3.5 text-sm py-1 items-center">
          <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Home className="w-4 h-4 text-slate-400 shrink-0" />
            동 · 호수
          </span>
          <span className="font-semibold text-slate-900">{student.building} {student.unit}</span>

          <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            학교 / 학년
          </span>
          <span className="font-semibold text-slate-900">
            {school?.name || student.schoolId} · {formatGradeDisplay(student.grade, student.schoolId)}
          </span>

          {student.gate && (
            <>
              <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Home className="w-4 h-4 text-slate-400 shrink-0" />
                정차 게이트
              </span>
              <span className="font-semibold text-slate-900">{student.gate}</span>
            </>
          )}

          <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 성함
          </span>
          <span className="font-semibold text-slate-900">{privateInfo?.guardianName || '-'}</span>

          <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 연락처
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-red-600 tracking-wider">
              {displayPhone}
            </span>
            {currentRole === 'admin' && (
              <button
                onClick={() => setShowFullPhone(!showFullPhone)}
                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title={showFullPhone ? '번호 가리기' : '전체 번호 확인 (관리자)'}
              >
                {showFullPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {privateInfo?.studentPhone && (
            <>
              <span className="text-slate-500 font-medium flex items-center gap-1.5 whitespace-nowrap">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                학생 연락처
              </span>
              <span className="font-mono font-semibold text-slate-800 tracking-wider">
                {currentRole === 'admin' && showFullPhone
                  ? privateInfo.studentPhone
                  : '***-****-' + privateInfo.studentPhone.slice(-4)}
              </span>
            </>
          )}

          {student.notes && (
            <>
              <span className="text-slate-500 font-medium whitespace-nowrap self-start pt-1">특이사항</span>
              <span className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed font-medium">
                {student.notes}
              </span>
            </>
          )}
        </div>

        {/* 요일별 등/하교 현황 요약 (등교/하교 구분 배지 명확화) */}
        {student.weeklySchedule && (
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                주간 요일별 등·하교 시간
              </span>
              <div className="flex items-center gap-2.5 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> 등교
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-600" /> 하교
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {[
                { day: 1, label: '월' },
                { day: 2, label: '화' },
                { day: 3, label: '수' },
                { day: 4, label: '목' },
                { day: 5, label: '금' },
              ].map(({ day, label }) => {
                const ws = student.weeklySchedule?.[day];
                return (
                  <div
                    key={day}
                    className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col gap-1.5 shadow-2xs"
                  >
                    <span className="font-extrabold text-xs text-slate-800 text-center pb-1 border-b border-slate-100">
                      {label}요일
                    </span>

                    {/* 등교 시간 / 미이용 */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200/60 shrink-0">
                        등교
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          ws?.morningActive ? 'text-blue-700' : 'text-slate-400 font-medium'
                        }`}
                      >
                        {ws?.morningActive ? formatMinute(ws.morningMinute) : '미이용'}
                      </span>
                    </div>

                    {/* 하교 시간 / 미이용 */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200/60 shrink-0">
                        하교
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          ws?.afternoonActive ? 'text-amber-700' : 'text-slate-400 font-medium'
                        }`}
                      >
                        {ws?.afternoonActive ? formatMinute(ws.afternoonMinute) : '미이용'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 모달 닫기 버튼 */}
        <button
          type="button"
          onClick={closeStudentPanel}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition cursor-pointer shadow-xs"
        >
          확인 (닫기)
        </button>
      </div>
    </div>
  );
};
