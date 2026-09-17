import React from 'react';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { AppHeader } from '@/components/layout/AppHeader';
import { TopToolbar } from '@/components/layout/TopToolbar';
import { ScheduleBoard } from '@/components/schedule/ScheduleBoard';
import { StudentDetailPanel } from '@/components/students/StudentDetailPanel';
import { ScheduleDetailDrawer } from '@/components/drawer/ScheduleDetailDrawer';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import { ScheduleConflictModal } from '@/components/schedule/ScheduleConflictModal';
import { TripManagementView } from '@/components/trips/TripManagementView';
import { StudentManagementView } from '@/components/students/StudentManagementView';
import { useScheduleStore } from '@/lib/store/useScheduleStore';
import { CheckCircle, Clock, Check, X } from 'lucide-react';
import { formatMinute } from '@/lib/scheduling/time';

export const App: React.FC = () => {
  const {
    activeNav,
    guardianNotification,
    clearGuardianNotification,
    timeRequests,
    approveTimeRequest,
    rejectTimeRequest,
    currentRole,
    students,
  } = useScheduleStore();

  const pendingRequests = timeRequests.filter((r) => r.status === 'pending');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* 1. 좌측 Navigation Bar (스케줄 / 운행시간표 / 학생 관리 / 설정) */}
      <SidebarNav />

      {/* 2. 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* 상단 통합 헤더 */}
        <AppHeader />

        {/* 상단 조작 툴바 (스케줄 탭에서만 활성화) */}
        {activeNav === 'schedule' && <TopToolbar />}

        {/* 학부모 시간 신청 알림 배너 */}
        {guardianNotification && (
          <div className="bg-blue-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-sm select-none animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-200" />
              <span>{guardianNotification}</span>
            </div>
            <button
              onClick={clearGuardianNotification}
              className="text-blue-200 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 관리자: 대기 중인 시간 신청 승인 검토 바 */}
        {currentRole === 'admin' && pendingRequests.length > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-amber-900 select-none shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">시간 변경 승인 대기 ({pendingRequests.length}건):</span>
              {pendingRequests.map((req) => {
                const st = students.find((s) => s.id === req.studentId);
                return (
                  <span key={req.id} className="bg-white border border-amber-300 px-2.5 py-1 rounded-md font-semibold text-amber-950 flex items-center gap-1.5 shadow-2xs">
                    <span>{st?.name}</span>
                    <span className="font-mono text-blue-600 font-bold">{formatMinute(req.requestedMinute)}</span>
                    <button
                      onClick={() => approveTimeRequest(req.id)}
                      className="text-emerald-700 hover:text-emerald-900 ml-1 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded cursor-pointer"
                      title="승인하여 운영시간에 반영"
                    >
                      <Check className="w-3 h-3" /> 승인
                    </button>
                    <button
                      onClick={() => rejectTimeRequest(req.id)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 bg-red-50 px-1.5 py-0.5 rounded cursor-pointer"
                      title="반려"
                    >
                      <X className="w-3 h-3" /> 거절
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 본문 콘텐츠 + 우측 Drawer Flex 레이아웃 */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* 중앙 스크롤 가능 컨테이너 */}
          <main className="flex-1 overflow-y-auto p-2 sm:p-2.5 flex flex-col gap-2">
            {/* 1) 스케줄 탭: 타임라인 보드 중심 (온전히 등/하교 스케줄 표에 집중) */}
            {activeNav === 'schedule' && <ScheduleBoard />}

            {/* 2) 운행시간표 탭: 왼쪽 별도 탭으로 완벽 분리 */}
            {activeNav === 'trips' && <TripManagementView />}

            {/* 3) 학생 관리 탭 */}
            {activeNav === 'students' && <StudentManagementView />}
          </main>

          {/* 우측 상세 설정 Drawer (스케줄 탭에서만 상시 슬라이드 연동) */}
          {activeNav === 'schedule' && <ScheduleDetailDrawer />}
        </div>
      </div>

      {/* 새 학생 등록 모달 (요일별 등/하교 희망시간 구분 입력 완비) */}
      <StudentFormModal />

      {/* 운행 시간 충돌 분석 및 조치 모달 (가로 폭 확장 & 큰 글씨) */}
      <ScheduleConflictModal />

      {/* 학생 정보 상세 카드 (학생명을 클릭할 경우에만 별도 모달 창으로 팝업) */}
      <StudentDetailPanel />
    </div>
  );
};

export default App;
