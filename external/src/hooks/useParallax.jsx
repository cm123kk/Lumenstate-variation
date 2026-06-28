import { useState, useEffect, useCallback } from 'react';

/**
 * useParallax 훅
 *
 * 스크롤 위치에 따라 요소에 패럴럭스 오프셋(Y축)을 계산한다.
 * speed < 1이면 배경보다 느리게, speed > 1이면 빠르게 움직인다.
 *
 * 동작 방식:
 * 1. 대상 요소의 뷰포트 내 위치를 추적
 * 2. 요소 상단이 뷰포트 상단에 있을 때 offset = 0
 * 3. 스크롤할수록 (1 - speed) 비율만큼 느리게/빠르게 이동
 *
 * @param {React.RefObject} ref - 패럴럭스를 적용할 요소의 ref
 * @param {number} speed - 스크롤 속도 비율 (0.4 = 배경의 40% 속도) [Optional, 기본값: 0.5]
 * @returns {number} translateY에 적용할 px 값
 */
export function useParallax(ref, speed = 0.5) {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const scrolled = -rect.top;
    if (scrolled < 0) {
      setOffsetY(0);
      return;
    }
    setOffsetY(scrolled * (1 - speed));
  }, [ref, speed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return offsetY;
}

export default useParallax;
