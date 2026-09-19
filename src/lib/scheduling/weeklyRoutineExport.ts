import { Student, TripTemplate, RouteSegment, Location, School, StudentPrivateInfo } from '@/types';
import { calculateTripInstance } from './routeCalculator';
import { formatMinute } from './time';
import { formatGradeDisplay } from '@/lib/constants/schools';

/**
 * 학생별 정상 운행 주간 루틴(등교 및 하교)을 요약 문자열로 추출
 */
export function formatStudentWeeklySummary(st: Student): {
  morningText: string;
  afternoonText: string;
  fullSummary: string;
} {
  const ws = st.weeklySchedule || {};
  const dayNames = ['', '월', '화', '수', '목', '금'];

  // 등교 분석
  const mGroups: Record<string, number[]> = {};
  for (let d = 1; d <= 5; d++) {
    const item = ws[d];
    const timeStr = item && item.morningActive !== false ? formatMinute(item.morningMinute) : '미이용';
    if (!mGroups[timeStr]) mGroups[timeStr] = [];
    mGroups[timeStr].push(d);
  }

  let morningText = '';
  const mKeys = Object.keys(mGroups);
  if (mKeys.length === 1) {
    morningText = mKeys[0] === '미이용' ? '등교 미이용' : mKeys[0];
  } else {
    morningText = mKeys
      .map((k) => {
        const days = mGroups[k];
        const daysStr = days.length === 5 ? '월~금' : days.map((d) => dayNames[d]).join('·');
        return `${daysStr} ${k}`;
      })
      .join(' / ');
  }

  // 하교 분석
  const aGroups: Record<string, number[]> = {};
  for (let d = 1; d <= 5; d++) {
    const item = ws[d];
    const timeStr = item && item.afternoonActive !== false ? formatMinute(item.afternoonMinute) : '미이용';
    if (!aGroups[timeStr]) aGroups[timeStr] = [];
    aGroups[timeStr].push(d);
  }

  let afternoonText = '';
  const aKeys = Object.keys(aGroups);
  if (aKeys.length === 1) {
    afternoonText = aKeys[0] === '미이용' ? '하교 미이용' : aKeys[0];
  } else {
    afternoonText = aKeys
      .map((k) => {
        const days = aGroups[k];
        const daysStr = days.length === 5 ? '월~금' : days.map((d) => dayNames[d]).join('·');
        return `${daysStr} ${k}`;
      })
      .join(' / ');
  }

  return {
    morningText,
    afternoonText,
    fullSummary: `등교 ${morningText} | 하교 ${afternoonText}`,
  };
}

/**
 * 1호차 / 2호차 학생 분류 (정규 운행 기준)
 */
export function getVehicleStudents(students: Student[]) {
  const v1Students = students.filter((s) => ['NLCS', 'CHEONG', 'CHEONG_MID'].includes(s.schoolId));
  const v2Students = students.filter((s) => ['BHA', 'SJA', 'KIS'].includes(s.schoolId));
  return { v1Students, v2Students };
}

/**
 * 한글(Hancom HWP 2020) 호환 HML XML 생성 함수
 */
export function generateWeeklyRoutineHml(
  tripTemplates: TripTemplate[],
  routeSegments: RouteSegment[],
  locations: Location[],
  schools: School[],
  students: Student[],
  privateInfoMap: Record<string, StudentPrivateInfo>
): string {
  const { v1Students, v2Students } = getVehicleStudents(students);

  const formatWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 5) return '월~금';
    const sorted = [...weekdays].sort((a, b) => a - b);
    if (sorted.length === 4 && sorted[0] === 1 && sorted[3] === 4) return '월~목';
    const dayMap: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
    return sorted.map((d) => dayMap[d]).join('·');
  };

  const getTemplateSteps = (tpl: TripTemplate) => {
    const { instance } = calculateTripInstance(tpl, '2026-09-01', routeSegments, locations);
    const steps: string[] = [];
    if (tpl.type === 'MORNING') {
      steps.push(`단지(${formatMinute(tpl.defaultDepartureMinute)})`);
      tpl.stops.forEach((stop) => {
        const sc = schools.find((s) => stop.locationId.includes(s.id));
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : formatMinute(tpl.defaultDepartureMinute);
        const name = (stop.locationId.includes('CHEONG') ? '저청초' : (sc?.shortName || stop.locationId));
        steps.push(`${name}(${time} 도착)`);
      });
      const retMin = tpl.referenceReturnMinute || instance?.calculatedReturnMinute;
      if (retMin) {
        steps.push(`단지(${formatMinute(retMin)} 복귀)`);
      }
    } else {
      tpl.stops.forEach((stop) => {
        const sc = schools.find((s) => stop.locationId.includes(s.id));
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : formatMinute(tpl.defaultDepartureMinute);
        const name = (stop.locationId.includes('CHEONG') ? '저청초' : (sc?.shortName || stop.locationId));
        steps.push(`${name}(${time} 출발)`);
      });
      const retMin = tpl.referenceReturnMinute || instance?.calculatedReturnMinute;
      if (retMin) {
        steps.push(`단지(${formatMinute(retMin)} 도착)`);
      }
    }
    return steps.join(' → ');
  };

  const morningTemplates = tripTemplates
    .filter((t) => t.type === 'MORNING')
    .sort((a, b) => a.defaultDepartureMinute - b.defaultDepartureMinute);

  const afternoonTemplates = tripTemplates
    .filter((t) => t.type === 'AFTERNOON')
    .sort((a, b) => a.defaultDepartureMinute - b.defaultDepartureMinute);

  let pTags = '';

  pTags += `<P><TEXT><CHAR>【 아주 더 하이클래스 제주 통학차량 주간 정규 운행시간표 &amp; 탑승 배정표 】</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>2026-2027학년도 정상 운행 주간 루틴 기준 (입주민 공고용)</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR></CHAR></TEXT></P>`;

  pTags += `<P><TEXT><CHAR>■ 1. 등교(오전) 운행시간표</CHAR></TEXT></P>`;
  morningTemplates.forEach((tpl) => {
    const vName = tpl.vehicleId === 'v1' ? '1호차' : '2호차';
    const steps = getTemplateSteps(tpl);
    const days = formatWeekdays(tpl.weekdays);
    pTags += `<P><TEXT><CHAR>• [${vName}] ${steps} | 요일: ${days}</CHAR></TEXT></P>`;
  });
  pTags += `<P><TEXT><CHAR></CHAR></TEXT></P>`;

  pTags += `<P><TEXT><CHAR>■ 2. 하교(오후) 운행시간표 (출발시간순)</CHAR></TEXT></P>`;
  afternoonTemplates.forEach((tpl) => {
    const vName = tpl.vehicleId === 'v1' ? '1호차' : '2호차';
    const steps = getTemplateSteps(tpl);
    const days = formatWeekdays(tpl.weekdays);
    pTags += `<P><TEXT><CHAR>• [${vName}] ${steps} | 요일: ${days}</CHAR></TEXT></P>`;
  });
  pTags += `<P><TEXT><CHAR></CHAR></TEXT></P>`;

  pTags += `<P><TEXT><CHAR>■ 3. 차량별 학생 주간 정규 탑승 배정표 (총 ${students.length}명)</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>[ 1호차 전담 운행 학생 - NLCS &amp; 저청초/중 (${v1Students.length}명) ]</CHAR></TEXT></P>`;
  v1Students.forEach((st, idx) => {
    const sc = schools.find((s) => s.id === st.schoolId);
    const priv = privateInfoMap[st.id];
    const summary = formatStudentWeeklySummary(st);
    const guardian = priv?.guardianName ? `${priv.guardianName} (${priv.emergencyContact})` : (priv?.emergencyContact || '-');
    const phone = priv?.studentPhone ? ` | 학생: ${priv.studentPhone}` : '';
    const gate = st.gate ? ` [게이트: ${st.gate}]` : '';
    pTags += `<P><TEXT><CHAR>${idx + 1}. ${st.name} (${sc?.shortName || st.schoolId} ${formatGradeDisplay(st.grade, st.schoolId)}, ${st.building} ${st.unit}${gate})</CHAR></TEXT></P>`;
    pTags += `<P><TEXT><CHAR>   - 등교: ${summary.morningText} | 하교: ${summary.afternoonText}</CHAR></TEXT></P>`;
    pTags += `<P><TEXT><CHAR>   - 보호자: ${guardian}${phone} | 비고: ${st.notes || '특이사항 없음'}</CHAR></TEXT></P>`;
  });
  pTags += `<P><TEXT><CHAR></CHAR></TEXT></P>`;

  pTags += `<P><TEXT><CHAR>[ 2호차 전담 운행 학생 - BHA &amp; SJA &amp; KIS (${v2Students.length}명) ]</CHAR></TEXT></P>`;
  v2Students.forEach((st, idx) => {
    const sc = schools.find((s) => s.id === st.schoolId);
    const priv = privateInfoMap[st.id];
    const summary = formatStudentWeeklySummary(st);
    const guardian = priv?.guardianName ? `${priv.guardianName} (${priv.emergencyContact})` : (priv?.emergencyContact || '-');
    const phone = priv?.studentPhone ? ` | 학생: ${priv.studentPhone}` : '';
    const gate = st.gate ? ` [게이트: ${st.gate}]` : '';
    pTags += `<P><TEXT><CHAR>${idx + 1}. ${st.name} (${sc?.shortName || st.schoolId} ${formatGradeDisplay(st.grade, st.schoolId)}, ${st.building} ${st.unit}${gate})</CHAR></TEXT></P>`;
    pTags += `<P><TEXT><CHAR>   - 등교: ${summary.morningText} | 하교: ${summary.afternoonText}</CHAR></TEXT></P>`;
    pTags += `<P><TEXT><CHAR>   - 보호자: ${guardian}${phone} | 비고: ${st.notes || '특이사항 없음'}</CHAR></TEXT></P>`;
  });
  pTags += `<P><TEXT><CHAR></CHAR></TEXT></P>`;

  pTags += `<P><TEXT><CHAR>■ 4. 통학버스 이용 입주민 유의사항</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>1. 학생 안전을 위해 출발 5분 전까지 단지 내 지정 탑승 위치에 대기하여 주시기 바랍니다.</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>2. 학교 학사일정(단축수업, 시험, 방학 등) 변경이나 미이용 시 관리사무소로 사전 연락 부탁드립니다.</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>3. 기상 악화(폭설, 태풍 등) 및 제주 도로 교통상황에 따라 일부 운행 시간이 탄력적으로 조정될 수 있습니다.</CHAR></TEXT></P>`;
  pTags += `<P><TEXT><CHAR>아주 더 하이클래스 제주 관리사무소 (발행일: 2026년 9월)</CHAR></TEXT></P>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<HWPML Style="Hancom-Office" Version="2.1">
  <HEAD>
    <DOCSUMMARY>
      <TITLE>아주더하이클래스 통학차량 정규 운행시간표 및 학생 탑승 배정표</TITLE>
      <AUTHOR>아주더하이클래스 관리사무소</AUTHOR>
      <DATE>${new Date().toISOString().slice(0, 10)}</DATE>
    </DOCSUMMARY>
  </HEAD>
  <BODY>
    <SECTION Id="0">
      ${pTags}
    </SECTION>
  </BODY>
</HWPML>`;
}

/**
 * MS Word (.doc) 및 한글 HTML 열기 호환 문서 생성 함수
 */
export function generateWeeklyRoutineHtml(
  tripTemplates: TripTemplate[],
  routeSegments: RouteSegment[],
  locations: Location[],
  schools: School[],
  students: Student[],
  privateInfoMap: Record<string, StudentPrivateInfo>
): string {
  const { v1Students, v2Students } = getVehicleStudents(students);

  const formatWeekdays = (weekdays: number[]) => {
    if (weekdays.length === 5) return '월~금';
    const sorted = [...weekdays].sort((a, b) => a - b);
    if (sorted.length === 4 && sorted[0] === 1 && sorted[3] === 4) return '월~목';
    const dayMap: Record<number, string> = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
    return sorted.map((d) => dayMap[d]).join('·');
  };

  const getTemplateSteps = (tpl: TripTemplate) => {
    const { instance } = calculateTripInstance(tpl, '2026-09-01', routeSegments, locations);
    const steps: string[] = [];
    if (tpl.type === 'MORNING') {
      steps.push(`단지 <b>${formatMinute(tpl.defaultDepartureMinute)}</b>`);
      tpl.stops.forEach((stop) => {
        const sc = schools.find((s) => stop.locationId.includes(s.id));
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : formatMinute(tpl.defaultDepartureMinute);
        const name = (stop.locationId.includes('CHEONG') ? '저청초' : (sc?.shortName || stop.locationId));
        steps.push(`${name} <b>${time}</b>`);
      });
      const retMin = tpl.referenceReturnMinute || instance?.calculatedReturnMinute;
      if (retMin) {
        steps.push(`단지 <b>${formatMinute(retMin)}</b>`);
      }
    } else {
      tpl.stops.forEach((stop) => {
        const sc = schools.find((s) => stop.locationId.includes(s.id));
        const instStop = instance?.stops.find((s) => s.locationId === stop.locationId);
        const time = instStop ? formatMinute(instStop.arrivalMinute) : formatMinute(tpl.defaultDepartureMinute);
        const name = (stop.locationId.includes('CHEONG') ? '저청초' : (sc?.shortName || stop.locationId));
        steps.push(`${name} <b>${time}</b>`);
      });
      const retMin = tpl.referenceReturnMinute || instance?.calculatedReturnMinute;
      if (retMin) {
        steps.push(`단지 <b>${formatMinute(retMin)}</b>`);
      }
    }
    return steps.join(' &rarr; ');
  };

  const morningTemplates = tripTemplates
    .filter((t) => t.type === 'MORNING')
    .sort((a, b) => a.defaultDepartureMinute - b.defaultDepartureMinute);

  const afternoonTemplates = tripTemplates
    .filter((t) => t.type === 'AFTERNOON')
    .sort((a, b) => a.defaultDepartureMinute - b.defaultDepartureMinute);

  const morningRows = morningTemplates
    .map((tpl) => {
      const isV1 = tpl.vehicleId === 'v1';
      return `
      <tr style="background-color: ${isV1 ? '#f0f6fd' : '#ffffff'};">
        <td style="padding: 7px; text-align: center; font-weight: bold; border: 1px solid #94a3b8; color: ${isV1 ? '#1d4ed8' : '#334155'};">${isV1 ? '1호차' : '2호차'}</td>
        <td style="padding: 7px 10px; border: 1px solid #94a3b8;">${getTemplateSteps(tpl)}</td>
        <td style="padding: 7px; text-align: center; font-weight: bold; border: 1px solid #94a3b8;">${formatWeekdays(tpl.weekdays)}</td>
        <td style="padding: 7px; text-align: center; font-family: monospace; font-weight: bold; border: 1px solid #94a3b8;">${tpl.referenceReturnMinute ? formatMinute(tpl.referenceReturnMinute) : '-'}</td>
      </tr>`;
    })
    .join('');

  const afternoonRows = afternoonTemplates
    .map((tpl) => {
      const isV1 = tpl.vehicleId === 'v1';
      return `
      <tr style="background-color: ${isV1 ? '#f0f6fd' : '#ffffff'};">
        <td style="padding: 7px; text-align: center; font-weight: bold; border: 1px solid #94a3b8; color: ${isV1 ? '#1d4ed8' : '#334155'};">${isV1 ? '1호차' : '2호차'}</td>
        <td style="padding: 7px 10px; border: 1px solid #94a3b8;">${getTemplateSteps(tpl)}</td>
        <td style="padding: 7px; text-align: center; font-weight: bold; border: 1px solid #94a3b8;">${formatWeekdays(tpl.weekdays)}</td>
        <td style="padding: 7px; text-align: center; font-family: monospace; font-weight: bold; border: 1px solid #94a3b8;">${tpl.referenceReturnMinute ? formatMinute(tpl.referenceReturnMinute) : '-'}</td>
      </tr>`;
    })
    .join('');

  const renderStudentRows = (list: Student[]) => {
    return list
      .map((st, idx) => {
        const sc = schools.find((s) => s.id === st.schoolId);
        const priv = privateInfoMap[st.id];
        const summary = formatStudentWeeklySummary(st);
        const contact = priv?.guardianName ? `${priv.guardianName} (${priv.emergencyContact})` : (priv?.emergencyContact || '-');
        const studentContact = priv?.studentPhone || '-';
        return `
        <tr style="background-color: ${idx % 2 === 1 ? '#f8fafc' : '#ffffff'};">
          <td style="padding: 6px; text-align: center; font-weight: bold; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="padding: 6px 8px; font-weight: bold; border: 1px solid #cbd5e1;">${st.name} <span style="font-size: 9pt; color: #64748b;">(${st.gender || '-'})</span></td>
          <td style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">${st.building} ${st.unit}</td>
          <td style="padding: 6px; text-align: center; font-weight: bold; border: 1px solid #cbd5e1;">${sc?.shortName || st.schoolId} <span style="color: #2563eb;">${formatGradeDisplay(st.grade, st.schoolId)}</span></td>
          <td style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">${st.gate || '정문'}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 9.5pt;">${contact}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 9.5pt; font-family: monospace;">${studentContact}</td>
          <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 9.5pt;"><b>등:</b> ${summary.morningText}<br/><b>하:</b> ${summary.afternoonText}</td>
          <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 9pt; color: #475569;">${st.notes || '-'}</td>
        </tr>`;
      })
      .join('');
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>아주 더 하이클래스 제주 통학차량 주간 정규 운행시간표</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
    body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.4; font-size: 10.5pt; }
    h1 { text-align: center; font-size: 20pt; font-weight: 900; margin: 0 0 4px 0; letter-spacing: 0.12em; }
    .subtitle { text-align: center; font-size: 11pt; font-weight: bold; color: #475569; margin-bottom: 16px; }
    h2 { font-size: 12.5pt; font-weight: 900; margin: 14px 0 6px 0; color: #1e3a8a; border-left: 4px solid #1d4ed8; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt; }
    th { background-color: #f1f5f9; border: 1.5px solid #475569; padding: 7px 6px; text-align: center; font-weight: 900; }
    td { border: 1px solid #cbd5e1; }
    .page-break { page-break-after: always; }
    .notice-box { border: 2px solid #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 6px; margin-top: 14px; }
    .notice-title { font-size: 11.5pt; font-weight: 900; margin-bottom: 6px; }
    .notice-item { font-size: 10pt; font-weight: bold; line-height: 1.5; color: #1e293b; margin-bottom: 3px; }
    .office-name { text-align: center; font-size: 13pt; font-weight: 900; letter-spacing: 0.3em; margin-top: 12px; padding-top: 10px; border-top: 2px solid #64748b; }
  </style>
</head>
<body>
  <!-- ==================== 1페이지: 주간 정규 운행시간표 ==================== -->
  <h1>아 주 더 하 이 클 래 스  제 주</h1>
  <div class="subtitle">【 2026-2027학년도 통학버스 주간 정규 운행시간표 (정상 운행 기준) 】</div>

  <h2>1. 등교(오전) 운행시간표</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">호차</th>
        <th style="width: 68%;">운행 코스 및 시간</th>
        <th style="width: 11%;">운행 요일</th>
        <th style="width: 11%;">단지 복귀</th>
      </tr>
    </thead>
    <tbody>
      ${morningRows}
    </tbody>
  </table>

  <h2>2. 하교(오후) 운행시간표 (출발시간순 정렬)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">호차</th>
        <th style="width: 68%;">운행 코스 및 시간</th>
        <th style="width: 11%;">운행 요일</th>
        <th style="width: 11%;">단지 복귀</th>
      </tr>
    </thead>
    <tbody>
      ${afternoonRows}
    </tbody>
  </table>

  <div class="notice-box">
    <div class="notice-title">📌 [ 통학버스 이용 입주민 유의사항 ]</div>
    <div class="notice-item">1. 학생 안전을 위해 <b>출발 5분 전까지</b> 단지 내 지정 탑승 위치에 대기하여 주시기 바랍니다.</div>
    <div class="notice-item">2. 학교 학사일정(단축수업, 시험, 방학 등) 변경이나 미이용 시 <b>관리사무소로 사전 연락</b> 부탁드립니다.</div>
    <div class="notice-item">3. 기상 악화(폭설, 태풍 등) 및 제주 도로 교통상황에 따라 일부 운행 시간이 탄력적으로 조정될 수 있습니다.</div>
    <div class="office-name">아 주 더 하 이 클 래 스  관 리 사 무 소</div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== 2페이지: 차량별 학생 주간 정규 탑승 배정표 ==================== -->
  <h1>차량별 학생 주간 정규 탑승 배정표</h1>
  <div class="subtitle">【 2026-2027학년도 정상 운행 주간 루틴 기준 (총 ${students.length}명) 】</div>

  <h2>1. 1호차 탑승 학생 (NLCS &amp; 저청초/중 - ${v1Students.length}명)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No.</th>
        <th style="width: 12%;">성명(성별)</th>
        <th style="width: 11%;">동·호수</th>
        <th style="width: 12%;">학교/학년</th>
        <th style="width: 10%;">정차 게이트</th>
        <th style="width: 15%;">보호자(연락처)</th>
        <th style="width: 12%;">학생 연락처</th>
        <th style="width: 15%;">등·하교 주간 루틴</th>
        <th style="width: 8%;">특이사항</th>
      </tr>
    </thead>
    <tbody>
      ${renderStudentRows(v1Students)}
    </tbody>
  </table>

  <h2>2. 2호차 탑승 학생 (BHA &amp; SJA &amp; KIS - ${v2Students.length}명)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">No.</th>
        <th style="width: 12%;">성명(성별)</th>
        <th style="width: 11%;">동·호수</th>
        <th style="width: 12%;">학교/학년</th>
        <th style="width: 10%;">정차 게이트</th>
        <th style="width: 15%;">보호자(연락처)</th>
        <th style="width: 12%;">학생 연락처</th>
        <th style="width: 15%;">등·하교 주간 루틴</th>
        <th style="width: 8%;">특이사항</th>
      </tr>
    </thead>
    <tbody>
      ${renderStudentRows(v2Students)}
    </tbody>
  </table>

  <div style="text-align: right; font-size: 9pt; color: #64748b; margin-top: 10px;">
    아주더하이클래스 제주 관리사무소 | 문의 및 일정 변경: 관리사무소 통학관리팀
  </div>
</body>
</html>`;
}

/**
 * 브라우저 파일 다운로드 헬퍼
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 워드(.doc) 문서 다운로드
 */
export function downloadWeeklyRoutineWord(
  tripTemplates: TripTemplate[],
  routeSegments: RouteSegment[],
  locations: Location[],
  schools: School[],
  students: Student[],
  privateInfoMap: Record<string, StudentPrivateInfo>
) {
  const html = generateWeeklyRoutineHtml(tripTemplates, routeSegments, locations, schools, students, privateInfoMap);
  downloadFile('아주더하이클래스_통학차량_주간운행시간표_및_배정표.doc', '\ufeff' + html, 'application/msword;charset=utf-8');
}

/**
 * 한컴 2020 호환 한글(.hml) 문서 다운로드
 */
export function downloadWeeklyRoutineHml(
  tripTemplates: TripTemplate[],
  routeSegments: RouteSegment[],
  locations: Location[],
  schools: School[],
  students: Student[],
  privateInfoMap: Record<string, StudentPrivateInfo>
) {
  const hml = generateWeeklyRoutineHml(tripTemplates, routeSegments, locations, schools, students, privateInfoMap);
  downloadFile('아주더하이클래스_통학차량_주간운행시간표_및_배정표.hml', hml, 'text/xml;charset=utf-8');
}