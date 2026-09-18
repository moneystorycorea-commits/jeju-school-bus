/**
 * 학교 구분 및 학년 포맷팅 헬퍼
 * 국제학교: NLCS, BHA, KIS, SJA -> 무조건 'G'를 붙여서 학년 표시 통일 (G1 ~ G12)
 * 한국학교: 저청초(CHEONG), 저청중(CHEONG_MID) -> 'N학년' (배지에서는 숫자만)
 */

export const INTERNATIONAL_SCHOOL_IDS = ['NLCS', 'BHA', 'KIS', 'SJA'] as const;
export const KOREAN_SCHOOL_IDS = ['CHEONG', 'CHEONG_MID'] as const;

export function isInternationalSchool(schoolId?: string): boolean {
  if (!schoolId) return false;
  return (
    INTERNATIONAL_SCHOOL_IDS.includes(schoolId as any) ||
    !KOREAN_SCHOOL_IDS.includes(schoolId as any)
  );
}

/**
 * 학년 표시 통일 함수
 * @param grade 기존 학년 문자열 (예: '10', '10학년', 'G10', '?')
 * @param schoolId 학교 ID ('NLCS', 'BHA', 'KIS', 'SJA', 'CHEONG', 'CHEONG_MID')
 * @param isBadge 좌측 학생 행의 원형 배지인지 여부 (한국 학교의 경우 배지에는 숫자만 '3' 표시)
 */
export function formatGradeDisplay(
  grade?: string,
  schoolId?: string,
  isBadge: boolean = false
): string {
  if (!grade || grade === '?' || grade.includes('재학') || grade.trim() === '') {
    return '?';
  }

  const isIntl = isInternationalSchool(schoolId);

  if (isIntl) {
    // 국제학교는 'G' 접두사로 통일 (대문자 G)
    if (grade.toUpperCase().startsWith('G')) {
      return grade.toUpperCase();
    }
    const match = grade.match(/\d+/);
    return match ? `G${match[0]}` : grade;
  }

  // 한국 학교 (저청초, 저청중)
  const match = grade.match(/\d+/);
  if (isBadge) {
    return match ? match[0] : grade.replace('학년', '');
  }
  return match ? `${match[0]}학년` : grade;
}
