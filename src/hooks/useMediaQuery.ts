import { useState, useEffect } from 'react';

/**
 * CSS 미디어 쿼리를 감지하는 커스텀 훅
 * @param query 미디어 쿼리 문자열 (예: '(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    // 모던 브라우저 및 구형 브라우저 호환
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    } else {
      // @ts-ignore
      mediaQueryList.addListener(listener);
      // @ts-ignore
      return () => mediaQueryList.removeListener(listener);
    }
  }, [query]);

  return matches;
}

/**
 * 모바일 화면(스마트폰 해상도, 768px 미만) 감지 훅
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}
