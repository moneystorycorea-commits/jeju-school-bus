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
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-[740px] w-full p-7 md:p-8 flex flex-col gap-5 select-none animate-scaleIn max-h-[92vh] overflow-y-auto"
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white text-base font-black flex items-center justify-center shadow-sm">
              {studentIndex}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-black text-slate-900">{student.name}</span>
                {student.gender && (
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {student.gender}
                  </span>
                )}
                {school && (
                  <span className={`text-xs font-black px-3 py-0.5 rounded-lg border shadow-2xs ${school.badgeBg}`}>
                    {school.shortName}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">학생 정보 및 주간 통학 프로필</span>
            </div>
          </div>

          <button
            onClick={closeStudentPanel}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 상세 정보 그리드 (폰트 크기 및 간격 여유 확보) */}
        <div className="grid grid-cols-[130px_1fr] gap-y-3.5 text-sm md:text-base py-1 items-center">
          <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
            <Home className="w-4 h-4 text-slate-400 shrink-0" />
            동 · 호수
          </span>
          <span className="font-extrabold text-slate-900">{student.building} {student.unit}</span>

          <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            학교 / 학년
          </span>
          <span className="font-extrabold text-slate-900">
            {school?.name || student.schoolId} · <span className="text-blue-700 font-mono font-black">{formatGradeDisplay(student.grade, student.schoolId)}</span>
          </span>

          {student.gate && (
            <>
              <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
                <Home className="w-4 h-4 text-slate-400 shrink-0" />
                정차 게이트
              </span>
              <span className="font-bold text-slate-900">{student.gate}</span>
            </>
          )}

          <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 성함
          </span>
          <span className="font-bold text-slate-900">{privateInfo?.guardianName || '-'}</span>

          <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 연락처
          </span>
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-black text-slate-900 tracking-wider">
              {displayPhone}
            </span>
            {currentRole === 'admin' && (
              <button
                onClick={() => setShowFullPhone(!showFullPhone)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition cursor-pointer"
                title={showFullPhone ? '번호 가리기' : '전체 번호 확인 (관리자)'}
              >
                {showFullPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>

          {privateInfo?.studentPhone && (
            <>
              <span className="text-slate-500 font-bold flex items-center gap-2 whitespace-nowrap text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                학생 연락처
              </span>
              <span className="font-mono font-bold text-slate-800 tracking-wider">
                {currentRole === 'admin' && showFullPhone
                  ? privateInfo.studentPhone
                  : '***-****-' + privateInfo.studentPhone.slice(-4)}
              </span>
            </>
          )}

          {student.notes && (
            <>
              <span className="text-slate-500 font-bold whitespace-nowrap self-start pt-1.5 text-sm">특이사항</span>
              <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-semibold">
                {student.notes}
              </div>
            </>
          )}
        </div>

        {/* 요일별 등/하교 현황 요약 (정돈되고 큰 폰트의 단정한 디자인) */}
        {student.weeklySchedule && (
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                주간 요일별 등·하교 시간표
              </span>
              <span className="text-xs text-slate-500 font-medium">
                요일별 탑승 여부 및 설정 시간
              </span>
            </div>

            {/* 5개 요일 카드 그리드 */}
            <div className="grid grid-cols-5 gap-2.5">
              {[
                { day: 1, label: '월' },
                { day: 2, label: '화' },
                { day: 3, label: '수' },
                { day: 4, label: '목' },
                { day: 5, label: '금' },
              ].map(({ day, label }) => {
                const ws = student.weeklySchedule?.[day];
                const isMorningActive = ws?.morningActive ?? true;
                const isAfternoonActive = ws?.afternoonActive ?? true;

                return (
                  <div
                    key={day}
                    className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2.5 shadow-2xs hover:border-slate-300 transition"
                  >
                    {/* 요일 헤더 */}
                    <div className="text-center pb-1.5 border-b border-slate-100 font-extrabold text-sm text-slate-900">
                      {label}요일
                    </div>

                    {/* 등교 */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-slate-500">등교</span>
                      <div className="flex items-center justify-between">
                        {isMorningActive ? (
                          <span className="font-mono text-sm font-black text-blue-700 tracking-tight">
                            {formatMinute(ws?.morningMinute || 460)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            미이용
                          </span>
                        )}
                        {isMorningActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                    </div>

                    {/* 하교 */}
                    <div className="flex flex-col gap-0.5 pt-1.5 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500">하교</span>
                      <div className="flex items-center justify-between">
                        {isAfternoonActive ? (
                          <span className="font-mono text-sm font-black text-slate-800 tracking-tight">
                            {formatMinute(ws?.afternoonMinute || 930)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            미이용
                          </span>
                        )}
                        {isAfternoonActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                        )}
                      </div>
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
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm md:text-base transition cursor-pointer shadow-xs mt-1"
        >
          확인 (닫기)
        </button>
      </div>
    </div>
  );
};
