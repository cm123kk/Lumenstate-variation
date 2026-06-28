/**
 * 스크롤 저장 키 생성 유틸.
 *
 * 같은 탭에서 PC ↔ 모바일 (DevTools 반응형 모드 토글)을 오갈 때
 * 같은 sessionStorage / 같은 in-memory ref가 공유되어 값이 섞이는 것을 방지.
 *
 * 키에 viewport 버킷('m' = 모바일, 'd' = 데스크톱)을 prefix하여
 * 두 환경의 스크롤 상태를 자동으로 격리.
 *
 * 임계값: window.innerWidth < 768 (MUI sm 브레이크포인트 기준)
 *
 * 실제 PC 사용자와 실제 모바일 사용자는 어차피 다른 브라우저라 자동 격리.
 * 이 유틸은 주로 개발/테스트 환경에서의 contamination 방지용.
 */

const MOBILE_BREAKPOINT = 768;

/**
 * 현재 viewport 버킷 반환
 * @returns {'m' | 'd'}
 */
export function getViewportBucket() {
  if (typeof window === 'undefined') return 'd';
  return window.innerWidth < MOBILE_BREAKPOINT ? 'm' : 'd';
}

/**
 * pathname을 viewport 버킷으로 prefix한 스크롤 저장 키 반환
 * @param {string} pathname
 * @returns {string} 예: 'd:/' 또는 'm:/product/5'
 */
export function makeScrollKey(pathname) {
  return `${getViewportBucket()}:${pathname}`;
}

/**
 * sessionStorage 저장용 prefix 포함 풀 키
 * @param {string} pathname
 * @returns {string} 예: 'scroll:d:/' 또는 'scroll:m:/product/5'
 */
export function makeStorageKey(pathname) {
  return `scroll:${makeScrollKey(pathname)}`;
}
