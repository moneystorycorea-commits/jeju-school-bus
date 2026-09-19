import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Phone,
  PhoneCall,
  Home,
  GraduationCap,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
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
  const [showFullStudentPhone, setShowFullStudentPhone] = useState(false);
  const [phoneToast, setPhoneToast] = useState<string | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 학생 전환 시 민감정보 마스킹 상태 및 토스트 자동 초기화
  useEffect(() => {
    setShowFullPhone(false);
    setShowFullStudentPhone(false);
    setPhoneToast(null);
  }, [selectedStudentId]);

  const fallbackCopyText = (text: string) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  };

  const copyAndCall = (phone: string, label: string) => {
    if (currentRole !== 'admin' || !phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // 클립보드에 원본 번호 복사
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(phone).catch(() => fallbackCopyText(phone));
    } else {
      fallbackCopyText(phone);
    }

    setPhoneToast(`${label} 번호 복사 및 통화 연결 (${phone})`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setPhoneToast(null);
    }, 2500);

    // 모바일 전화 다이얼러 호출 (번호 자동 복붙 상태)
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleLinkClick = (e: React.MouseEvent, phone: string, label: string) => {
    if (currentRole !== 'admin' || !phone) {
      e.preventDefault();
      return;
    }
    // 클립보드에 원본 번호 복사
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(phone).catch(() => fallbackCopyText(phone));
    } else {
      fallbackCopyText(phone);
    }

    setPhoneToast(`${label} 번호 복사 및 통화 연결 (${phone})`);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setPhoneToast(null);
    }, 2500);
  };

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

  // 터치 제스처 (손으로 좌우로 쓸어서 이전/다음 학생 즉시 넘기기 - 애니메이션 없이 직관적 전환)
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const isHorizontalSwipeRef = React.useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
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
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || isHorizontalSwipeRef.current !== true) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      isHorizontalSwipeRef.current = null;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const diffX = endX - touchStartXRef.current;
    const minSwipeThreshold = 40; // 40px 이상 이동 시 즉시 넘김

    if (diffX < -minSwipeThreshold) {
      handleNextStudent();
    } else if (diffX > minSwipeThreshold) {
      handlePrevStudent();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isHorizontalSwipeRef.current = null;
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

  // 보호자 연락처(비상연락망) 마스킹 처리
  const rawPhone = privateInfo?.emergencyContact || '010-3849-1234';
  const maskedPhone = '***-****-' + rawPhone.slice(-4);
  const displayPhone = currentRole === 'admin' && showFullPhone ? rawPhone : maskedPhone;

  // 학생 연락처 마스킹 처리
  const rawStudentPhone = privateInfo?.studentPhone;
  const maskedStudentPhone = rawStudentPhone ? '***-****-' + rawStudentPhone.slice(-4) : '미등록';
  const displayStudentPhone = rawStudentPhone
    ? (currentRole === 'admin' && showFullStudentPhone ? rawStudentPhone : maskedStudentPhone)
    : '미등록';

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

      {/* 메인 활성 카드 */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-[740px] w-full p-5 sm:p-7 md:p-8 flex flex-col gap-3.5 sm:gap-4.5 select-none max-h-[92vh] overflow-y-auto z-10 touch-pan-y"
      >
        {/* 전화번호 복사 및 바로 연결 알림 토스트 */}
        {phoneToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-slate-900/95 text-white text-xs sm:text-sm font-bold rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
            <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span>{phoneToast}</span>
          </div>
        )}

        {/* 상단 시퀀스 인디케이터 바 (얇고 세련된 페이지네이션 바) */}
        <div className="w-full flex items-center gap-1">
          {students.map((s) => {
            const isCurrent = s.id === student.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStudent(s.id, false, true)}
                className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'flex-[2.5] bg-blue-600 shadow-2xs'
                    : 'flex-1 bg-slate-200/80 hover:bg-slate-300'
                }`}
                title={`${s.name} 학생 보기`}
              />
            );
          })}
        </div>

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
        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-y-2.5 sm:gap-y-3 text-xs sm:text-sm md:text-base py-1 items-center">
          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
            동 · 호수
          </span>
          <span className="font-extrabold text-slate-900 min-h-[32px] flex items-center">{student.building} {student.unit}</span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
            학교 / 학년
          </span>
          <span className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap min-h-[32px]">
            <span>
              {school?.shortName || student.schoolId} · <span className="text-blue-700 font-mono font-black">{formatGradeDisplay(student.grade, student.schoolId)}</span>
            </span>
          </span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
            정차 게이트
          </span>
          <span className="font-extrabold text-slate-900 min-h-[32px] flex items-center">
            {student.gate ? (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 text-xs sm:text-sm">
                {student.gate}
              </span>
            ) : (
              <span className="text-slate-400 font-medium text-xs sm:text-sm">-</span>
            )}
          </span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
            보호자 성함
          </span>
          <span className="font-extrabold text-slate-900 min-h-[32px] flex items-center">
            {privateInfo?.guardianName || '홍길동 (학부모)'}
          </span>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            {currentRole === 'admin' ? (
              <button
                type="button"
                onClick={() => copyAndCall(rawPhone, '보호자')}
                className="p-1 -ml-1 rounded-md text-blue-600 hover:bg-blue-100/80 hover:text-blue-800 transition cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                title="보호자에게 전화 걸기 (클립보드 복사)"
              >
                <Phone className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              </span>
            )}
            보호자 연락처
          </span>
          <div className="flex items-center gap-2 min-h-[32px]">
            {currentRole === 'admin' ? (
              <a
                href={`tel:${rawPhone.replace(/[^0-9]/g, '')}`}
                onClick={(e) => handleLinkClick(e, rawPhone, '보호자')}
                className="font-mono font-extrabold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 py-0.5 px-1.5 -ml-1.5 rounded-lg hover:bg-blue-50 active:scale-95 transition cursor-pointer group"
                title="보호자에게 전화 걸기 (클립보드 복사)"
              >
                <span className="underline decoration-blue-300 underline-offset-4">{displayPhone}</span>
                <PhoneCall className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700 shrink-0 opacity-80 group-hover:opacity-100" />
              </a>
            ) : (
              <span className="font-mono font-extrabold text-slate-900 py-0.5 px-1.5 -ml-1.5 inline-flex items-center">{displayPhone}</span>
            )}
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => setShowFullPhone(!showFullPhone)}
                className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-1 rounded-md hover:bg-slate-100 shrink-0"
                title={showFullPhone ? "가리기" : "전체 번호 보기"}
              >
                {showFullPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[32px]">
            {currentRole === 'admin' && rawStudentPhone ? (
              <button
                type="button"
                onClick={() => copyAndCall(rawStudentPhone, '학생')}
                className="p-1 -ml-1 rounded-md text-blue-600 hover:bg-blue-100/80 hover:text-blue-800 transition cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                title="학생에게 전화 걸기 (클립보드 복사)"
              >
                <Phone className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              </span>
            )}
            학생 연락처
          </span>
          <div className="flex items-center gap-2 min-h-[32px]">
            {currentRole === 'admin' && rawStudentPhone ? (
              <a
                href={`tel:${rawStudentPhone.replace(/[^0-9]/g, '')}`}
                onClick={(e) => handleLinkClick(e, rawStudentPhone, '학생')}
                className="font-mono font-extrabold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 py-0.5 px-1.5 -ml-1.5 rounded-lg hover:bg-blue-50 active:scale-95 transition cursor-pointer group"
                title="학생에게 전화 걸기 (클립보드 복사)"
              >
                <span className="underline decoration-blue-300 underline-offset-4">{displayStudentPhone}</span>
                <PhoneCall className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700 shrink-0 opacity-80 group-hover:opacity-100" />
              </a>
            ) : (
              <span className={`font-mono ${rawStudentPhone ? 'font-extrabold text-slate-900' : 'font-medium text-slate-400'} py-0.5 px-1.5 -ml-1.5 inline-flex items-center`}>
                {displayStudentPhone}
              </span>
            )}
            {currentRole === 'admin' && rawStudentPhone && (
              <button
                type="button"
                onClick={() => setShowFullStudentPhone(!showFullStudentPhone)}
                className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-1 rounded-md hover:bg-slate-100 shrink-0"
                title={showFullStudentPhone ? "가리기" : "전체 번호 보기"}
              >
                {showFullStudentPhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>

          <span className="text-slate-500 font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap text-xs sm:text-sm min-h-[44px]">
            <span className="p-1 -ml-1 inline-flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            </span>
            특이사항 / 비고
          </span>
          <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 leading-relaxed min-h-[44px] flex items-center">
            {student.notes ? (
              <span>{student.notes}</span>
            ) : (
              <span className="text-slate-400 font-normal">-</span>
            )}
          </div>
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
  );
};
