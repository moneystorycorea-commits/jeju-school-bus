import { create } from 'zustand';
import {
  Student,
  StudentPrivateInfo,
  School,
  Location,
  RouteSegment,
  Vehicle,
  TripTemplate,
  TripInstance,
  StudentSchedule,
  SchoolHoliday,
  TimeRequest,
  ScheduleType,
  UserRole,
  Conflict,
  MinuteOfDay,
  StudentWeeklySchedule,
} from '@/types';
import {
  INITIAL_STUDENTS,
  INITIAL_STUDENT_PRIVATE_INFO,
  INITIAL_SCHOOLS,
  INITIAL_LOCATIONS,
  INITIAL_ROUTE_SEGMENTS,
  INITIAL_VEHICLES,
  INITIAL_TRIP_TEMPLATES,
  INITIAL_STUDENT_SCHEDULES,
  INITIAL_HOLIDAYS,
  generateStudentSchedulesForDate,
} from '../mock/initialData';
import { calculateTripInstance, getSchoolTravelMinutes } from '../scheduling/routeCalculator';
import { detectAllConflicts } from '../scheduling/conflictDetector';
import { getWeekdayNumber, formatMinute } from '../scheduling/time';

interface HistorySnapshot {
  students: Student[];
  schedules: StudentSchedule[];
  routeSegments: RouteSegment[];
  tripTemplates: TripTemplate[];
}

interface ScheduleState {
  // 상태 데이터
  serviceDate: string;
  scheduleType: ScheduleType;
  currentRole: UserRole;
  students: Student[];
  schools: School[];
  locations: Location[];
  routeSegments: RouteSegment[];
  vehicles: Vehicle[];
  tripTemplates: TripTemplate[];
  schedules: StudentSchedule[];
  holidays: SchoolHoliday[];
  timeRequests: TimeRequest[];
  privateInfoMap: Record<string, StudentPrivateInfo>;

  // UI 상태
  selectedStudentId: string | null;
  isDetailDrawerOpen: boolean;
  detailDrawerTab: 'info' | 'vacation' | 'route';
  isStudentPanelOpen: boolean;
  isStudentModalOpen: boolean;
  isConflictModalOpen: boolean;
  isMobileNavOpen: boolean;
  guardianNotification: string | null;
  saveStatus: 'saved' | 'saving' | 'error';
  isHelpOpen: boolean;
  activeNav: string;
  draggingMinute: MinuteOfDay | null;

  // 히스토리 (Undo)
  history: HistorySnapshot[];

  // 파생 데이터 Getter 함수들
  getTripInstances: () => TripInstance[];
  getConflicts: () => Conflict[];
  getPrivateInfo: (studentId: string) => StudentPrivateInfo | null;

  // 액션
  setDraggingMinute: (minute: MinuteOfDay | null) => void;
  setServiceDate: (date: string) => void;
  nextDate: () => void;
  prevDate: () => void;
  setScheduleType: (type: ScheduleType) => void;
  setCurrentRole: (role: UserRole) => void;
  setActiveNav: (nav: string) => void;
  
  selectStudent: (studentId: string | null, openDrawer?: boolean, openPanel?: boolean) => void;
  closeDetailDrawer: () => void;
  openDetailDrawer: () => void;
  closeStudentPanel: () => void;
  openStudentModal: () => void;
  closeStudentModal: () => void;
  openConflictModal: () => void;
  closeConflictModal: () => void;
  toggleMobileNav: () => void;
  setDetailDrawerTab: (tab: 'info' | 'vacation' | 'route') => void;
  clearGuardianNotification: () => void;

  updateAssignedTime: (studentId: string, newMinute: MinuteOfDay) => void;
  requestTimeChange: (studentId: string, newMinute: MinuteOfDay) => void;
  approveTimeRequest: (requestId: string) => void;
  rejectTimeRequest: (requestId: string) => void;

  addStudent: (data: {
    name: string;
    building: string;
    unit: string;
    schoolId: string;
    grade: string;
    emergencyContact: string;
    gender?: '여' | '남' | '';
    gate?: string;
    notes?: string;
    studentPhone?: string;
    guardianName?: string;
    guardianContact?: string;
    defaultMorningMinute?: MinuteOfDay;
    weeklySchedule?: StudentWeeklySchedule;
  }) => void;

  updateStudentWeeklySchedule: (
    studentId: string,
    weekday: number,
    morningMinute: MinuteOfDay,
    afternoonMinute: MinuteOfDay,
    morningActive?: boolean,
    afternoonActive?: boolean,
    notes?: string,
    alternateMinutes?: MinuteOfDay[],
    selectedAlternateIndex?: number
  ) => void;

  toggleAlternateSchedule: (
    studentId: string,
    date: string,
    type: ScheduleType
  ) => void;

  updateStudentInfo: (
    studentId: string,
    info: Partial<Student>,
    privateInfo?: Partial<StudentPrivateInfo>
  ) => void;

  addHoliday: (holiday: Omit<SchoolHoliday, 'id'>) => void;
  removeHoliday: (holidayId: string) => void;

  reorderStudents: (oldIndex: number, newIndex: number) => void;
  updateRouteSegmentTravelTime: (segmentId: string, deltaMinutes: number) => void;
  resetRouteSegments: () => void;
  
  undo: () => void;
  saveChanges: () => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  serviceDate: '2024-10-28', // 시안 기준 (월요일)
  scheduleType: 'MORNING',
  currentRole: 'admin',
  students: INITIAL_STUDENTS,
  schools: INITIAL_SCHOOLS,
  locations: INITIAL_LOCATIONS,
  routeSegments: INITIAL_ROUTE_SEGMENTS,
  vehicles: INITIAL_VEHICLES,
  tripTemplates: INITIAL_TRIP_TEMPLATES,
  schedules: INITIAL_STUDENT_SCHEDULES,
  holidays: INITIAL_HOLIDAYS,
  timeRequests: [],
  privateInfoMap: INITIAL_STUDENT_PRIVATE_INFO,

  selectedStudentId: null,
  isDetailDrawerOpen: false,
  detailDrawerTab: 'info',
  isStudentPanelOpen: false,
  isStudentModalOpen: false,
  isConflictModalOpen: false,
  isMobileNavOpen: false,
  guardianNotification: null,
  saveStatus: 'saved',
  isHelpOpen: false,
  activeNav: 'schedule',
  draggingMinute: null,

  history: [],

  setDraggingMinute: (minute: MinuteOfDay | null) => set({ draggingMinute: minute }),

  getTripInstances: () => {
    const { serviceDate, scheduleType, tripTemplates, routeSegments, locations, schedules } = get();
    const weekday = getWeekdayNumber(serviceDate);

    const activeTemplates = tripTemplates.filter(
      (t) => t.type === scheduleType && t.weekdays.includes(weekday)
    );

    const activeSchoolIds = new Set<string>(
      schedules
        .filter((s) => s.date === serviceDate && s.type === scheduleType)
        .map((s) => s.schoolId)
    );

    return activeTemplates.map((template) => {
      const { instance } = calculateTripInstance(
        template,
        serviceDate,
        routeSegments,
        locations,
        activeSchoolIds
      );
      return instance;
    });
  },

  getConflicts: () => {
    const { schedules, students, holidays, routeSegments, serviceDate } = get();
    const tripInstances = get().getTripInstances();
    return detectAllConflicts({
      tripInstances,
      schedules: schedules.filter((s) => s.date === serviceDate),
      students,
      holidays,
      segments: routeSegments,
      serviceDate,
    });
  },

  getPrivateInfo: (studentId: string) => {
    const { currentRole, privateInfoMap } = get();
    if (currentRole !== 'admin') {
      return null;
    }
    return privateInfoMap[studentId] || null;
  },

  setServiceDate: (date: string) => {
    const { schedules, students } = get();
    const existing = schedules.filter((s) => s.date === date);
    if (existing.length === 0) {
      const newSchedules = generateStudentSchedulesForDate(students, date);
      set({ serviceDate: date, schedules: [...schedules, ...newSchedules] });
    } else {
      set({ serviceDate: date });
    }
  },
  nextDate: () => {
    const curr = new Date(get().serviceDate);
    curr.setDate(curr.getDate() + 1);
    const nextDateStr = curr.toISOString().slice(0, 10);
    get().setServiceDate(nextDateStr);
  },
  prevDate: () => {
    const curr = new Date(get().serviceDate);
    curr.setDate(curr.getDate() - 1);
    const prevDateStr = curr.toISOString().slice(0, 10);
    get().setServiceDate(prevDateStr);
  },
  setScheduleType: (type: ScheduleType) => set({ scheduleType: type }),
  setCurrentRole: (role: UserRole) => set({ currentRole: role }),
  setActiveNav: (nav: string) => set({ activeNav: nav }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  clearGuardianNotification: () => set({ guardianNotification: null }),

  selectStudent: (studentId, openDrawer = true, openPanel = false) => {
    set({
      selectedStudentId: studentId,
      isDetailDrawerOpen: openDrawer ? true : get().isDetailDrawerOpen,
      isStudentPanelOpen: openPanel,
    });
  },
  closeDetailDrawer: () => set({ isDetailDrawerOpen: false }),
  openDetailDrawer: () => set({ isDetailDrawerOpen: true }),
  closeStudentPanel: () => set({ isStudentPanelOpen: false }),
  openStudentModal: () => set({ isStudentModalOpen: true }),
  closeStudentModal: () => set({ isStudentModalOpen: false }),
  openConflictModal: () => set({ isConflictModalOpen: true }),
  closeConflictModal: () => set({ isConflictModalOpen: false }),
  setDetailDrawerTab: (tab) => set({ detailDrawerTab: tab, isDetailDrawerOpen: true }),

  updateAssignedTime: (studentId: string, newMinute: MinuteOfDay) => {
    const { students, schedules, routeSegments, currentRole, serviceDate, scheduleType, tripTemplates } = get();
    
    // Guardian / Student 역할인 경우 실제 배정시간을 변경하지 않고 TimeRequest 생성
    if (currentRole !== 'admin') {
      get().requestTimeChange(studentId, newMinute);
      return;
    }

    const snapshot: HistorySnapshot = {
      students: [...students],
      schedules: [...schedules],
      routeSegments: [...routeSegments],
      tripTemplates: [...tripTemplates],
    };

    const targetStudent = students.find((s) => s.id === studentId);
    const targetSchedule = schedules.find(
      (s) => s.studentId === studentId && s.date === serviceDate && s.type === scheduleType
    );

    let updatedTripTemplates = tripTemplates;
    let updatedSchedules = schedules;

    if (targetStudent && targetSchedule && scheduleType === 'MORNING') {
      const isVehicle1 = targetStudent.schoolId === 'NLCS' || targetStudent.schoolId === 'CHEONG' || targetStudent.schoolId === 'CHEONG_MID';
      const vehicleId = isVehicle1 ? 'v1' : 'v2';
      const travelMinutes = getSchoolTravelMinutes(targetStudent.schoolId, routeSegments);
      const newDeparture = (newMinute - travelMinutes) as MinuteOfDay;
      const oldDeparture = (targetSchedule.assignedMinute - travelMinutes) as MinuteOfDay;
      const delta = newDeparture - oldDeparture;

      if (delta !== 0) {
        // 1. 해당 호차의 TripTemplate 출발시간 동기화 (운행시간표와 실시간 연동)
        // 1호차는 1회차 NLCS, 2회차 저청으로 분리 운행되므로 해당 학교가 포함된 Trip만 연동
        const weekday = getWeekdayNumber(serviceDate);
        updatedTripTemplates = tripTemplates.map((tpl) => {
          if (tpl.type === 'MORNING' && tpl.vehicleId === vehicleId && tpl.weekdays.includes(weekday)) {
            const hasSchool = tpl.stops.some((st) => {
              if (targetStudent.schoolId === 'NLCS') return st.locationId.includes('NLCS');
              if (targetStudent.schoolId === 'CHEONG' || targetStudent.schoolId === 'CHEONG_MID') return st.locationId.includes('CHEONG');
              return true; // 2호차: BHA, SJA, KIS 함께 탑승
            });
            if (hasSchool) {
              return {
                ...tpl,
                defaultDepartureMinute: newDeparture,
                referenceReturnMinute:
                  tpl.referenceReturnMinute !== undefined
                    ? ((tpl.referenceReturnMinute + delta) as MinuteOfDay)
                    : undefined,
              };
            }
          }
          return tpl;
        });

        // 2. 동일 차량/동행 노선 학생들의 assignedMinute 동기화
        // 1호차: NLCS 학생들끼리, 저청 학생들끼리 분리
        // 2호차: BHA, SJA, KIS 학생 전체 동행 순환 동기화
        const sameTripSchoolIds = isVehicle1
          ? (targetStudent.schoolId === 'NLCS' ? new Set(['NLCS']) : new Set(['CHEONG', 'CHEONG_MID']))
          : new Set(['BHA', 'SJA', 'KIS']);

        updatedSchedules = schedules.map((s) => {
          if (s.date === serviceDate && s.type === 'MORNING') {
            const stu = students.find((st) => st.id === s.studentId);
            if (stu && sameTripSchoolIds.has(stu.schoolId)) {
              const updatedMin = (s.assignedMinute + delta) as MinuteOfDay;
              return {
                ...s,
                assignedMinute: updatedMin,
                calculatedMinute: updatedMin,
              };
            }
          }
          return s;
        });
      } else {
        updatedSchedules = schedules.map((s) => {
          if (s.studentId === studentId && s.date === serviceDate && s.type === scheduleType) {
            return {
              ...s,
              assignedMinute: newMinute,
              calculatedMinute: newMinute,
            };
          }
          return s;
        });
      }
    } else {
      updatedSchedules = schedules.map((s) => {
        if (s.studentId === studentId && s.date === serviceDate && s.type === scheduleType) {
          return {
            ...s,
            assignedMinute: newMinute,
            calculatedMinute: newMinute,
          };
        }
        return s;
      });
    }

    set((state) => ({
      schedules: updatedSchedules,
      tripTemplates: updatedTripTemplates,
      history: [...state.history.slice(-9), snapshot],
      saveStatus: 'saving',
    }));

    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 500);
  },

  requestTimeChange: (studentId: string, newMinute: MinuteOfDay) => {
    const { serviceDate, scheduleType, timeRequests, students } = get();
    const student = students.find((s) => s.id === studentId);
    const newRequest: TimeRequest = {
      id: `req-${Date.now()}`,
      studentId,
      serviceDate,
      type: scheduleType,
      requestedMinute: newMinute,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    set({
      timeRequests: [...timeRequests, newRequest],
      guardianNotification: `${student?.name || '학생'}의 희망 시간(${formatMinute(newMinute)}) 변경 신청이 접수되었습니다. 관리자 승인 후 운영시간에 반영됩니다.`,
      saveStatus: 'saved',
    });
  },

  approveTimeRequest: (requestId: string) => {
    const { timeRequests, schedules } = get();
    const req = timeRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = timeRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'approved' as const } : r
    );

    const updatedSchedules = schedules.map((s) => {
      if (s.studentId === req.studentId && s.date === req.serviceDate && s.type === req.type) {
        return {
          ...s,
          assignedMinute: req.requestedMinute,
          requestedMinute: req.requestedMinute,
          calculatedMinute: req.requestedMinute,
        };
      }
      return s;
    });

    set({
      timeRequests: updatedRequests,
      schedules: updatedSchedules,
      saveStatus: 'saved',
    });
  },

  rejectTimeRequest: (requestId: string) => {
    set((state) => ({
      timeRequests: state.timeRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected' as const } : r
      ),
      saveStatus: 'saved',
    }));
  },

  addStudent: (data) => {
    const { students, schedules, privateInfoMap, serviceDate } = get();
    const newId = `s${Date.now().toString().slice(-4)}`;
    const weekday = getWeekdayNumber(serviceDate);
    const todayMorning = data.weeklySchedule && data.weeklySchedule[weekday]
      ? data.weeklySchedule[weekday].morningMinute
      : data.defaultMorningMinute || 460;
    const todayAfternoon = data.weeklySchedule && data.weeklySchedule[weekday]
      ? data.weeklySchedule[weekday].afternoonMinute
      : 930;

    const newStudent: Student = {
      id: newId,
      name: data.name,
      building: data.building,
      unit: data.unit,
      schoolId: data.schoolId,
      grade: data.grade,
      sortOrder: students.length + 1,
      active: true,
      gender: data.gender,
      gate: data.gate,
      notes: data.notes,
      weeklySchedule: data.weeklySchedule,
    };

    const newPrivate: StudentPrivateInfo = {
      studentId: newId,
      emergencyContact: data.emergencyContact,
      studentPhone: data.studentPhone,
      guardianName: data.guardianName,
      guardianContact: data.guardianContact,
    };

    const newMorningSchedule: StudentSchedule = {
      id: `sc-${newId}-${serviceDate}-m`,
      studentId: newId,
      schoolId: data.schoolId,
      date: serviceDate,
      type: 'MORNING',
      requestedMinute: todayMorning,
      assignedMinute: todayMorning,
      calculatedMinute: todayMorning,
      dwellMinutes: 1,
      notes: data.notes,
    };

    const newAfternoonSchedule: StudentSchedule = {
      id: `sc-${newId}-${serviceDate}-a`,
      studentId: newId,
      schoolId: data.schoolId,
      date: serviceDate,
      type: 'AFTERNOON',
      requestedMinute: todayAfternoon,
      assignedMinute: todayAfternoon,
      calculatedMinute: todayAfternoon,
      dwellMinutes: 1,
      notes: data.notes,
    };

    set({
      students: [...students, newStudent],
      schedules: [...schedules, newMorningSchedule, newAfternoonSchedule],
      privateInfoMap: { ...privateInfoMap, [newId]: newPrivate },
      selectedStudentId: newId,
      isStudentModalOpen: false,
      saveStatus: 'saved',
    });
  },

  updateStudentWeeklySchedule: (
    studentId,
    weekday,
    morningMinute,
    afternoonMinute,
    morningActive,
    afternoonActive,
    notes,
    alternateMinutes,
    selectedAlternateIndex
  ) => {
    const { students, schedules, serviceDate, scheduleType } = get();
    const currentWeekday = getWeekdayNumber(serviceDate);

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        const prevWeekly = s.weeklySchedule || {};
        const prevDay = prevWeekly[weekday];
        const updatedWeekly = {
          ...prevWeekly,
          [weekday]: {
            weekday,
            morningMinute,
            afternoonMinute,
            morningActive: morningActive !== undefined ? morningActive : (prevDay?.morningActive ?? true),
            afternoonActive: afternoonActive !== undefined ? afternoonActive : (prevDay?.afternoonActive ?? true),
            active: true,
            notes: notes !== undefined ? notes : prevDay?.notes,
            alternateMinutes: alternateMinutes !== undefined ? alternateMinutes : prevDay?.alternateMinutes,
            selectedAlternateIndex: selectedAlternateIndex !== undefined ? selectedAlternateIndex : prevDay?.selectedAlternateIndex,
          },
        };
        return { ...s, weeklySchedule: updatedWeekly };
      }
      return s;
    });

    // 오늘 요일과 일치하면 현재 화면의 schedule도 즉시 동기화
    let updatedSchedules = schedules;
    if (weekday === currentWeekday) {
      const targetMinute = scheduleType === 'MORNING' ? morningMinute : afternoonMinute;
      updatedSchedules = schedules.map((sc) => {
        if (sc.studentId === studentId && sc.date === serviceDate && sc.type === scheduleType) {
          return {
            ...sc,
            assignedMinute: targetMinute,
            requestedMinute: targetMinute,
            calculatedMinute: targetMinute,
            notes: notes !== undefined ? notes : sc.notes,
            alternateMinutes: alternateMinutes !== undefined ? alternateMinutes : sc.alternateMinutes,
            selectedAlternateIndex: selectedAlternateIndex !== undefined ? selectedAlternateIndex : sc.selectedAlternateIndex,
          };
        }
        return sc;
      });
    }

    set({
      students: updatedStudents,
      schedules: updatedSchedules,
      saveStatus: 'saving',
    });

    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 400);
  },

  toggleAlternateSchedule: (studentId, date, type) => {
    const { schedules } = get();
    const updatedSchedules = schedules.map((sc) => {
      if (
        sc.studentId === studentId &&
        sc.date === date &&
        sc.type === type &&
        sc.alternateMinutes &&
        sc.alternateMinutes.length > 1
      ) {
        const currentIndex = sc.selectedAlternateIndex ?? 0;
        const nextIndex = (currentIndex + 1) % sc.alternateMinutes.length;
        const newMinute = sc.alternateMinutes[nextIndex];
        return {
          ...sc,
          selectedAlternateIndex: nextIndex,
          assignedMinute: newMinute,
          requestedMinute: newMinute,
          calculatedMinute: newMinute,
        };
      }
      return sc;
    });

    set({ schedules: updatedSchedules, saveStatus: 'saved' });
  },

  updateStudentInfo: (studentId, info, privateInfo) => {
    const { students, privateInfoMap } = get();
    const updatedStudents = students.map((s) => (s.id === studentId ? { ...s, ...info } : s));
    const updatedPrivateMap = { ...privateInfoMap };
    if (privateInfo) {
      updatedPrivateMap[studentId] = {
        ...(updatedPrivateMap[studentId] || { studentId, emergencyContact: '' }),
        ...privateInfo,
      };
    }
    set({ students: updatedStudents, privateInfoMap: updatedPrivateMap, saveStatus: 'saved' });
  },

  addHoliday: (holidayData) => {
    const newHoliday: SchoolHoliday = {
      ...holidayData,
      id: `h-${Date.now()}`,
    };
    set((state) => ({
      holidays: [...state.holidays, newHoliday],
      saveStatus: 'saved',
    }));
  },

  removeHoliday: (holidayId) => {
    set((state) => ({
      holidays: state.holidays.filter((h) => h.id !== holidayId),
      saveStatus: 'saved',
    }));
  },

  reorderStudents: (oldIndex: number, newIndex: number) => {
    const { students } = get();
    if (oldIndex === newIndex) return;

    const snapshot: HistorySnapshot = {
      students: [...students],
      schedules: [...get().schedules],
      routeSegments: [...get().routeSegments],
      tripTemplates: [...get().tripTemplates],
    };

    const reordered = [...students];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    set((state) => ({
      students: updated,
      history: [...state.history.slice(-9), snapshot],
      saveStatus: 'saving',
    }));

    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 500);
  },

  updateRouteSegmentTravelTime: (segmentId: string, deltaMinutes: number) => {
    const { routeSegments } = get();
    const updated = routeSegments.map((seg) => {
      if (seg.id === segmentId) {
        const nextTime = Math.max(1, seg.travelMinutes + deltaMinutes);
        return { ...seg, travelMinutes: nextTime };
      }
      return seg;
    });

    set({
      routeSegments: updated,
      saveStatus: 'saving',
    });

    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 400);
  },

  resetRouteSegments: () => {
    set({
      routeSegments: INITIAL_ROUTE_SEGMENTS,
      saveStatus: 'saved',
    });
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;

    const prev = history[history.length - 1];
    set({
      students: prev.students,
      schedules: prev.schedules,
      routeSegments: prev.routeSegments,
      tripTemplates: prev.tripTemplates || get().tripTemplates,
      history: history.slice(0, -1),
    });
  },

  saveChanges: () => {
    set({ saveStatus: 'saving' });
    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 400);
  },
}));
