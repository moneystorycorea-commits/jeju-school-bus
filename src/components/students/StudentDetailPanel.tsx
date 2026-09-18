import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Phone,
  Home,
  GraduationCap,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
    selectStudent,
  } = useScheduleStore();

  const [showFullPhone, setShowFullPhone] = useState(false);

  const handlePrevStudent = () => {
    const currentIndex = students.findIndex((s) => s.id === selectedStudentId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + students.length) % students.length;
    selectStudent(students[prevIndex].id, false, true);
  };

  const handleNextStudent = () => {
    const currentIndex = students.findIndex((s) => s.id === selectedStudentId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % students.length;
    selectStudent(students[nextIndex].id, false, true);
  };

  // 카드 스와이프 드래그 및 날리기 애니메이션 상태
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [flyDirection, setFlyDirection] = useState<'left' | 'right' | null>(null);

  // 터치 제스처 (손으로 좌우로 쓸어서 이전/다음 학생 넘기기)
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const isHorizontalSwipeRef = React.useRef<boolean | null>(null);
  const currentDragOffsetRef = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (flyDirection) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    currentDragOffsetRef.current = 0;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null || flyDirection) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // 수평 스와이프인지 수직 스크롤인지 판별 (8px 이상 이동 시)
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      const clampedOffset = Math.max(-160, Math.min(160, diffX));
      currentDragOffsetRef.current = clampedOffset;
      setDragOffset(clampedOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (touchStartXRef.current === null || isHorizontalSwipeRef.current !== true || flyDirection) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      isHorizontalSwipeRef.current = null;
      setDragOffset(0);
      currentDragOffsetRef.current = 0;
      return;
    }

    const finalOffset = currentDragOffsetRef.current;
    const minSwipeThreshold = 45; // 45px 이상 스와이프 시 넘김

    if (finalOffset < -minSwipeThreshold) {
      // 왼쪽으로 날려보내기 -> 다음 학생
      setFlyDirection('left');
      setTimeout(() => {
        handleNextStudent();
        setDragOffset(0);
        currentDragOffsetRef.current = 0;
        setFlyDirection(null);
      }, 180);
    } else if (finalOffset > minSwipeThreshold) {
      // 오른쪽으로 날려보내기 -> 이전 학생
      setFlyDirection('right');
      setTimeout(() => {
        handlePrevStudent();
        setDragOffset(0);
        currentDragOffsetRef.current = 0;
        setFlyDirection(null);
      }, 180);
    } else {
      // 원위치 복귀
      setDragOffset(0);
      currentDragOffsetRef.current = 0;
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
  };

  // 카드 이동 및 회전 변환 스타일
  const cardTransformStyle: React.CSSProperties = flyDirection === 'left'
    ? {
        transform: 'translateX(-120%) rotate(-12deg)',
        opacity: 0,
        transition: 'transform 0.18s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease-in',
      }
    : flyDirection === 'right'
    ? {
        transform: 'translateX(120%) rotate(12deg)',
        opacity: 0,
        transition: 'transform 0.18s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease-in',
      }
    : isDragging && dragOffset !== 0
    ? {
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.04}deg)`,
        transition: 'none',
      }
    : {
        transform: 'translateX(0px) rotate(0deg)',
        transition: 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1)',
      };

  useEffect(() => {
    if (!isStudentPanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStudent();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStudent();
      } else if (e.key === 'Escape') {
        closeStudentPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudentPanelOpen, selectedStudentId, students]);

  if (!isStudentPanelOpen || !selectedStudentId) {
    return null;
  }

  const student = students.find((s) => s.id === selectedStudentId);
  if (!student) return null;

  const school = schools.find((sc) => sc.id === student.schoolId);
  const privateInfo = getPrivateInfo(student.id);

  // 비상연락망 마스킹 처리
  const rawPhone = privateInfo?.emergencyContact || '010-3849-1234';
  const maskedPhone = '***-****-' + rawPhone.slice(-4);
  const displayPhone = currentRole === 'admin' && showFullPhone ? rawPhone : maskedPhone;

  return (
    <div
      onClick={closeStudentPanel}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn"
    >
      {/* 이전 학생 이동 플로팅 버튼 (화면 좌측 반투명 글래스) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevStudent();
        }}
        className="fixed left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/75 hover:bg-white text-slate-800 hover:text-blue-600 backdrop-blur-md shadow-2xl border border-white/80 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 z-50 group"
        title="이전 학생 (단축키: ←)"
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 -translate-x-0.5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 다음 학생 이동 플로팅 버튼 (화면 우측 반투명 글래스) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNextStudent();
        }}
        className="fixed right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/75 hover:bg-white text-slate-800 hover:text-blue-600 backdrop-blur-md shadow-2xl border border-white/80 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 z-50 group"
        title="다음 학생 (단축키: →)"
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 group-hover:scale-110 transition-transform" />
      </button>

      {/* 카드 스택 래퍼 (카드 겹침 시각 효과) */}
      <div className="relative max-w-[740px] w-full flex items-center justify-center">
        {/* 뒤에 겹쳐진 세 번째 카드 */}
        <div className="absolute inset-x-5 sm:inset-x-8 -bottom-3 top-4 bg-slate-300/40 rounded-3xl border border-slate-300/60 shadow-xs pointer-events-none transform scale-[0.96]" />

        {/* 뒤에 겹쳐진 두 번째 카드 */}
        <div className="absolute inset-x-2.5 sm:inset-x-4 -bottom-1.5 top-2 bg-white/90 rounded-3xl border border-slate-200/80 shadow-md pointer-events-none transform scale-[0.98]" />

        {/* 메인 활성 카드 */}
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={cardTransformStyle}
          className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl w-full p-5 sm:p-7 md:p-8 flex flex-col gap-4 sm:gap-5 select-none animate-scaleIn max-h-[92vh] overflow-y-auto z-10 touch-pan-y will-change-transform"
        >
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900">{student.name}</span>
                {student.gender && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {student.gender}
                  </span>
                )}
                {school && (
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border shadow-2xs ${school.badgeBg}`}>
                    {school.shortName}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                학생 정보 및 주간 통학 프로필
              </span>
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
        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-y-2.5 sm:gap-y-3.5 text-xs sm:text-sm md:text-base py-1 items-center">
          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
            <Home className="w-4 h-4 text-slate-400 shrink-0" />
            동 · 호수
          </span>
          <span className="font-extrabold text-slate-900">{student.building} {student.unit}</span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            학교 / 학년
          </span>
          <span className="font-extrabold text-slate-900">
            {school?.name || student.schoolId} · <span className="text-blue-700 font-mono font-black">{formatGradeDisplay(student.grade, student.schoolId)}</span>
          </span>

          {student.gate && (
            <>
              <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
                <Home className="w-4 h-4 text-slate-400 shrink-0" />
                정차 게이트
              </span>
              <span className="font-bold text-slate-900">{student.gate}</span>
            </>
          )}

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 성함
          </span>
          <span className="font-extrabold text-slate-900">
            {privateInfo?.guardianName || '홍길동 (학부모)'}
          </span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            보호자 연락처
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-slate-900">{displayPhone}</span>
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => setShowFullPhone(!showFullPhone)}
                className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-1 rounded-md hover:bg-slate-100"
                title={showFullPhone ? "가리기" : "전체 번호 보기"}
              >
                {showFullPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            학생 연락처
          </span>
          <span className="font-mono font-extrabold text-slate-900">
            {privateInfo?.studentPhone || '010-****-8415'}
          </span>

          {student.notes && (
            <>
              <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm">
                특이사항
              </span>
              <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {student.notes}
              </div>
            </>
          )}
        </div>

        {/* 요일별 등/하교 현황 요약 (모바일 가로보기 및 데스크탑 5열 그리드 반응형) */}
        {student.weeklySchedule && (
          <div className="border border-slate-200 rounded-2xl p-3.5 sm:p-4 bg-slate-50/70 flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                주간 요일별 등·하교 시간표
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                요일별 탑승 여부 및 설정 시간
              </span>
            </div>

            {/* 모바일 가로 1열 행 배치 / 태블릿·PC 5열 세로 카드 그리드 */}
            <div className="flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:gap-2.5">
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
                    className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-start gap-2 sm:gap-2.5 shadow-2xs hover:border-slate-300 transition"
                  >
                    {/* 요일 */}
                    <div className="flex items-center sm:justify-center sm:pb-1.5 sm:border-b border-slate-100 font-extrabold text-xs sm:text-sm text-slate-900 shrink-0">
                      <span className="px-2 py-1 sm:px-0 sm:py-0 rounded-md bg-slate-100 sm:bg-transparent text-slate-900 font-black">
                        {label}요일
                      </span>
                    </div>

                    {/* 등/하교 시간 정보 (모바일에서는 가로 나란히, 데스크탑은 상하 2단) */}
                    <div className="flex items-center gap-3 sm:flex-col sm:gap-2 grow sm:grow-0 justify-end sm:justify-start">
                      {/* 등교 */}
                      <div className="flex items-center sm:flex-col gap-1.5 sm:gap-0.5 bg-blue-50/50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg sm:rounded-none">
                        <span className="text-[11px] font-bold text-slate-500 shrink-0">등교</span>
                        <div className="flex items-center gap-1 sm:justify-between sm:w-full">
                          {isMorningActive ? (
                            <span className="font-mono text-xs sm:text-sm font-black text-blue-700 tracking-tight whitespace-nowrap">
                              {formatMinute(ws?.morningMinute || 460)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                              미이용
                            </span>
                          )}
                          {isMorningActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                      </div>

                      {/* 하교 */}
                      <div className="flex items-center sm:flex-col gap-1.5 sm:gap-0.5 bg-slate-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded-lg sm:rounded-none sm:pt-1.5 sm:border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 shrink-0">하교</span>
                        <div className="flex items-center gap-1 sm:justify-between sm:w-full">
                          {isAfternoonActive ? (
                            <span className="font-mono text-xs sm:text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">
                              {formatMinute(ws?.afternoonMinute || 930)}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                              미이용
                            </span>
                          )}
                          {isAfternoonActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
