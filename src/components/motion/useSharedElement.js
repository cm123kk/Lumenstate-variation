import { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useSharedTransition } from './SharedTransitionContext';
import { makeStorageKey } from '../../utils/scrollKey';

/**
 * useSharedElement 훅
 *
 * Source 또는 Target 역할을 자동으로 처리하는 통합 훅.
 * 같은 id를 가진 element가 페이지 전환 양쪽에 있으면 Shared Element 전환이 일어남.
 *
 * 동작 방식:
 * 1. mount/scroll/resize 시 자기 정보(rect, content)를 Context에 보고
 *    - 역전환의 source 캐시로 사용됨
 * 2. **Mount 시점에만** 활성 전환의 activeId가 자기 id와 일치하는지 확인하여 target rect 등록
 *    - 'forward' 모드: 즉시 측정
 *    - 'reverse' 모드: RAF defer (스크롤 복원 이후 측정)
 * 3. handleClick: 클릭 시 forward 전환 시작 (선택사항)
 *
 * Source vs Target 자동 판별:
 * - Source는 transition 시작 전부터 mount되어 있음 → mount 시점에 isAnimating=false → skip
 *   클릭 후 state 변경에도 useLayoutEffect는 empty deps라 재실행 안됨 → 자기 자신을 target으로 등록 안함
 * - Target은 transition 활성 후 새 페이지에서 mount → mount 시점에 isAnimating=true & 매칭 → 등록
 *
 * Props:
 * @param {string} id - 공유 요소 식별자 [Required]
 * @param {*} content - 오버레이에 전달할 사용자 데이터 (메모이제이션 권장) [Required]
 * @param {function} onTrigger - 클릭 후 호출 (e.g. navigate) [Optional]
 *
 * Returns:
 * @returns {{ ref: React.RefObject, onClick: function }}
 *
 * Example usage:
 * function ProductCard({ product, onClick }) {
 *   const content = useMemo(() => ({ images: product.images }), [product.images]);
 *   const shared = useSharedElement({
 *     id: `product-${product.id}`,
 *     content,
 *     onTrigger: () => navigate(`/product/${product.id}`),
 *   });
 *   return <div ref={shared.ref} onClick={shared.onClick}>...</div>;
 * }
 */
export function useSharedElement({ id, content, onTrigger }) {
  const ref = useRef(null);
  const ctxRef = useRef(null);
  const ctx = useSharedTransition();

  // 항상 최신 ctx 값을 ref로 보관 (mount-only effect에서 stale closure 방지)
  ctxRef.current = ctx;

  /**
   * 자기 정보 지속 보고 (역전환의 source가 됨)
   */
  useEffect(() => {
    if (!ref.current) return;

    const report = () => {
      if (!ref.current || !ctxRef.current) return;
      ctxRef.current.reportElement(id, {
        rect: ref.current.getBoundingClientRect(),
        content,
      });
    };

    report();
    window.addEventListener('scroll', report, { passive: true });
    window.addEventListener('resize', report, { passive: true });

    return () => {
      window.removeEventListener('scroll', report);
      window.removeEventListener('resize', report);
      if (ctxRef.current) ctxRef.current.forgetElement(id);
    };
  }, [id, content]);

  /**
   * Target 등록 — Mount 시점에 한 번만 평가
   *
   * 핵심: empty deps로 mount 시 1회만 실행.
   * - Source는 mount 시점에 isAnimating=false → skip. 이후 state가 바뀌어도 effect 재실행 X → 자기 자신을 target 등록 안함.
   * - Target은 transition 활성 상태에서 mount → 즉시 등록.
   */
  useLayoutEffect(() => {
    const c = ctxRef.current;
    if (!c) return;
    if (!c.isAnimating || c.activeId !== id || !ref.current) return;

    if (c.mode === 'reverse') {
      const raf = requestAnimationFrame(() => {
        if (ref.current && ctxRef.current) {
          ctxRef.current.setTargetRect(ref.current.getBoundingClientRect());
        }
      });
      return () => cancelAnimationFrame(raf);
    }

    if (c.mode === 'forward') {
      c.setTargetRect(ref.current.getBoundingClientRect());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount 시 1회만

  /**
   * 클릭 시 forward 전환 시작
   * 중요: navigate 전에 현재 스크롤 위치를 동기적으로 저장.
   *       (useEffect 기반 저장은 timing race로 0이 캡처될 수 있음)
   */
  const onClick = useCallback((e) => {
    // 클릭 순간의 스크롤 위치를 sessionStorage에 즉시 저장.
    // 키는 viewport 버킷 prefix됨 (PC ↔ 모바일 토글 contamination 방지).
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(
          makeStorageKey(window.location.pathname),
          JSON.stringify({
            scrollY: window.scrollY,
            scrollHeight: document.documentElement.scrollHeight,
          })
        );
      } catch {
        // sessionStorage 불가 환경 무시
      }
    }
    if (ref.current) {
      ctx.startTransition(id, ref.current.getBoundingClientRect(), content);
    }
    if (onTrigger) onTrigger(e);
  }, [id, content, onTrigger, ctx]);

  return { ref, onClick };
}

export default useSharedElement;
