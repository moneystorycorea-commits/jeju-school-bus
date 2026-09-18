import { MinuteOfDay } from '@/types';

export function parseTimeToMinute(timeStr: string): MinuteOfDay {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function formatMinute(minutes: MinuteOfDay): string {
  const safeMinutes = Math.max(0, Math.min(1439, Math.round(minutes)));
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function snapToFiveMinutes(minutes: MinuteOfDay, snapUnit = 5): MinuteOfDay {
  return Math.round(minutes / snapUnit) * snapUnit;
}

export function getTimelinePositionPercent(
  currentMinute: MinuteOfDay,
  startMinute: MinuteOfDay,
  endMinute: MinuteOfDay
): number {
  if (endMinute <= startMinute) return 0;
  const clamped = Math.max(startMinute, Math.min(endMinute, currentMinute));
  return ((clamped - startMinute) / (endMinute - startMinute)) * 100;
}

export function getMinuteFromPercent(
  percent: number,
  startMinute: MinuteOfDay,
  endMinute: MinuteOfDay,
  snapUnit = 5
): MinuteOfDay {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const rawMinute = startMinute + (clampedPercent / 100) * (endMinute - startMinute);
  return snapToFiveMinutes(rawMinute, snapUnit);
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return dateStr;
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${dayName})`;
}

export function getWeekdayNumber(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  return day === 0 ? 7 : day; // 1:월 ~ 7:일
}

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDaysDifference(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 1;
  const [y1, m1, d1] = startStr.split('-').map(Number);
  const [y2, m2, d2] = endStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
}

// 괄호 안 영문 텍스트 제거 (예: 'NLCS 교사연수 휴교 (INSET Day)' -> 'NLCS 교사연수 휴교')
export function cleanHolidayName(name: string): string {
  if (!name) return '';
  return name.replace(/\s*[\(\[][^)\]]*[a-zA-Z]+[^)\]]*[\)\]]/g, '').trim();
}

// 콤팩트 날짜 포맷터 (예: '26/8/17(월)~18(화)' 또는 '26/8/20(목)')
export function formatCompactHolidayRange(startStr: string, endStr: string): string {
  if (!startStr) return '';
  const effectiveEnd = endStr || startStr;

  const [sY, sM, sD] = startStr.split('-').map(Number);
  const [eY, eM, eD] = effectiveEnd.split('-').map(Number);

  const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];
  const sDate = new Date(sY, sM - 1, sD);
  const eDate = new Date(eY, eM - 1, eD);
  const sDayName = dayOfWeekNames[sDate.getDay()];
  const eDayName = dayOfWeekNames[eDate.getDay()];

  const shortSY = String(sY).slice(-2);
  const shortEY = String(eY).slice(-2);

  if (startStr === effectiveEnd) {
    return `${shortSY}/${sM}/${sD}(${sDayName})`;
  }

  if (sY === eY && sM === eM) {
    return `${shortSY}/${sM}/${sD}(${sDayName})~${eD}(${eDayName})`;
  }

  if (sY === eY && sM !== eM) {
    return `${shortSY}/${sM}/${sD}(${sDayName})~${eM}/${eD}(${eDayName})`;
  }

  return `${shortSY}/${sM}/${sD}(${sDayName})~${shortEY}/${eM}/${eD}(${eDayName})`;
}
