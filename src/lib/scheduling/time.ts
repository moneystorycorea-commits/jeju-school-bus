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
