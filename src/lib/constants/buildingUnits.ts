/**
 * 제주 아주더하이클래스 단지 (총 167세대) 동별 실제 호실 매핑
 * 건축 도면 및 단지 배치표 기준 100% 일치
 */
export const COMPLEX_BUILDINGS = [
  '101동', '102동', '103동', '104동', '105동',
  '106동', '107동', '108동', '109동', '110동',
  '111동', '112동', '113동', '114동', '115동',
  '116동', '117동',
] as const;

export type ComplexBuilding = typeof COMPLEX_BUILDINGS[number];

// 8세대 타입 (101~104동, 115동: 1, 2호 라인 4개 층)
const UNITS_8 = [
  '101호', '102호',
  '201호', '202호',
  '301호', '302호',
  '401호', '402호',
];

// 11세대 타입 (105동: 1층 필로티로 103호 없음, 2~4층 1~3호)
const UNITS_105 = [
  '101호', '102호',
  '201호', '202호', '203호',
  '301호', '302호', '303호',
  '401호', '402호', '403호',
];

// 4세대 복층/펜트하우스 타입 (106동~110동: 101, 102, 301, 401호)
const UNITS_DUPLEX_4 = [
  '101호', '102호',
  '301호',
  '401호',
];

// 16세대 타입 (111동~114동, 116동~117동: 1~4호 라인 4개 층)
const UNITS_16 = [
  '101호', '102호', '103호', '104호',
  '201호', '202호', '203호', '204호',
  '301호', '302호', '303호', '304호',
  '401호', '402호', '403호', '404호',
];

export const BUILDING_UNITS_MAP: Record<string, string[]> = {
  '101동': UNITS_8,
  '102동': UNITS_8,
  '103동': UNITS_8,
  '104동': UNITS_8,
  '105동': UNITS_105,
  '106동': UNITS_DUPLEX_4,
  '107동': UNITS_DUPLEX_4,
  '108동': UNITS_DUPLEX_4,
  '109동': UNITS_DUPLEX_4,
  '110동': UNITS_DUPLEX_4,
  '111동': UNITS_16,
  '112동': UNITS_16,
  '113동': UNITS_16,
  '114동': UNITS_16,
  '115동': UNITS_8,
  '116동': UNITS_16,
  '117동': UNITS_16,
};

/**
 * 특정 동에 존재하는 실제 호수 목록 반환
 */
export function getUnitsForBuilding(building: string): string[] {
  if (!building) return [];
  const normalized = building.includes('동') ? building : `${building}동`;
  return BUILDING_UNITS_MAP[normalized] || [];
}
