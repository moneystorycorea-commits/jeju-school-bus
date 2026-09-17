import React from 'react';
import { AlertTriangle, X, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useScheduleStore } from '@/lib/store/useScheduleStore';

export const ScheduleConflictModal: React.FC = () => {
  const {
    isConflictModalOpen,
    closeConflictModal,
    getConflicts,
    students,
    schools,
    selectStudent,
    setActiveNav,
  } = useScheduleStore();

  if (!isConflictModalOpen) return null;

  const conflicts = getConflicts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none">
      {/* 가로 폭을 대폭 확장한 모달 컨테이너 (max-w-4xl xl:max-w-5xl) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl xl:max-w-5xl w-full p-6 flex flex-col gap-4 animate-scaleUp max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  운행 시간 충돌 분석 및 조치 안내
                </h3>
                {conflicts.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                    충돌 {conflicts.length}건 감지
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                    정상
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                학교 간 최소 이동시간 및 학생별 탑승 간격을 실시간으로 분석하여 충돌 내역을 안내합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeConflictModal}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 충돌 내역 목록 (넓은 가로 폭으로 한눈에 파악, 스크롤 최소화) */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 py-1">
          {conflicts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">감지된 시간 충돌이 없습니다</h4>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  모든 학생의 등·하교 시간과 학교 간 이동시간이 안전 기준을 만족하고 있습니다.
                </p>
              </div>
            </div>
          ) : (
            conflicts.map((c, idx) => {
              const student = students.find((s) => s.id === c.studentId);
              const school = student ? schools.find((sc) => sc.id === student.schoolId) : null;

              return (
                <div
                  key={c.id || idx}
                  className="p-3.5 md:p-4 rounded-xl bg-red-50/70 border border-red-200 hover:border-red-300 transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* 좌측/중앙: 대상 학생 및 충돌 상세 내용 (큰 폰트 & 가독성 최우선) */}
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 오류/주의 뱃지 */}
                      {c.level === 'error' ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-xs font-bold shrink-0 shadow-2xs">
                          오류
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-bold shrink-0 shadow-2xs">
                          주의
                        </span>
                      )}

                      {/* 학생 성명 & 학교 뱃지 */}
                      {student ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-base font-black text-slate-900">
                            {student.name}
                          </span>
                          {school && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded border shadow-2xs ${school.badgeBg}`}>
                              {school.shortName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-base font-black text-slate-900">
                          운행 노선 간격
                        </span>
                      )}

                      {/* 충돌 요약 메시지 (큰 글씨) */}
                      <span className="text-sm md:text-base font-bold text-slate-800 tracking-tight">
                        {c.message}
                      </span>
                    </div>

                    {/* 소요시간 / 간격 세부 정보 바 */}
                    {c.details && c.details.requiredMinutes !== undefined && (
                      <div className="flex items-center gap-3 text-xs md:text-sm text-slate-700 bg-white/90 px-3 py-1.5 rounded-lg border border-red-100 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>소요시간 세부:</span>
                        </span>
                        <span>
                          필요 최소 시간: <strong className="text-slate-900 font-black">{c.details.requiredMinutes}분</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          현재 배정 간격: <strong className="text-slate-900 font-black">{c.details.availableMinutes}분</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-red-600 font-black bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          부족: {Math.abs(c.details.diffMinutes ?? 0)}분
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 우측: 학생 스케줄 바로가기 버튼 */}
                  {student && (
                    <button
                      type="button"
                      onClick={() => {
                        selectStudent(student.id, true, false);
                        closeConflictModal();
                        setActiveNav('schedule');
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs md:text-sm font-bold shadow-2xs transition flex items-center gap-1.5 shrink-0 cursor-pointer self-end md:self-center"
                      title="스케줄 보드에서 해당 학생 위치로 이동하여 시간 조정"
                    >
                      <span>학생 스케줄 보기</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 모달 하단 가이드 & 닫기 버튼 */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            💡 <strong>조치 팁:</strong> 스케줄 표에서 학생 블록을 5분 단위로 드래그 이동하거나, 우측 운행설정에서 구간 소요시간을 조정하면 충돌이 해결됩니다.
          </p>
          <button
            type="button"
            onClick={closeConflictModal}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer shadow-xs ml-auto"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};