import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';

/**
 * 필터 전환 애니메이션 타이밍 상수
 */
const FILTER_TRANSITION = {
  fadeOut: 600,
  reflow: 1200,
  flipStep: 600,
  fadeIn: 600,
  heightTransition: 500,
  easing: {
    fade: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    flip: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  blur: '8px',
  scale: 0.95,
};

/**
 * 필터에 따른 제품 목록 반환
 */
function getFilteredProducts(allProducts, filter) {
  if (filter === 'all') return [...allProducts];
  return allProducts.filter((p) => p.type === filter);
}

/**
 * useFilterTransition 훅
 *
 * 제품 필터 변경 시 3단계 순차 애니메이션을 오케스트레이션한다.
 *
 * 동작 방식:
 * 1. 필터 변경 감지 → 이전/이후 제품 비교 → exiting/staying/entering 분류
 * 2. Phase 1 (fadeOut): 퇴장 아이템 blur + fade out
 * 3. Phase 2 (reflow): DOM 교체 + FLIP L자형 위치 애니메이션
 * 4. Phase 3 (fadeIn): 입장 아이템 blur + fade in
 *
 * @param {Array} allProducts - 전체 제품 배열 [Required]
 * @param {string} filter - 현재 필터 값 ('all' | product type) [Required]
 * @returns {{ displayList, phase, registerRef, isAnimating }}
 */
export function useFilterTransition(allProducts, filter) {
  const [displayList, setDisplayList] = useState(() =>
    getFilteredProducts(allProducts, filter).map((product) => ({
      product,
      itemPhase: 'stable',
    }))
  );
  const [phase, setPhase] = useState('idle');

  const prevFilterRef = useRef(filter);
  const elementMapRef = useRef(new Map());
  const firstRectsRef = useRef(new Map());
  const stayingIdsRef = useRef(new Set());
  const timeoutsRef = useRef([]);
  const containerRef = useRef(null);
  const oldHeightRef = useRef(0);

  /**
   * DOM 참조 등록 콜백
   */
  const registerRef = useCallback((productId, element) => {
    if (element) {
      elementMapRef.current.set(productId, element);
    } else {
      elementMapRef.current.delete(productId);
    }
  }, []);

  /**
   * 진행 중인 애니메이션 취소 및 인라인 스타일 정리
   */
  const cancelAnimation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    elementMapRef.current.forEach((el) => {
      el.style.transition = '';
      el.style.transform = '';
    });
    const c = containerRef.current;
    if (c) {
      c.style.height = '';
      c.style.overflow = '';
      c.style.transition = '';
    }
  }, []);

  /**
   * setTimeout 래퍼 (정리 추적용)
   */
  const addTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  /**
   * FLIP 인라인 스타일 정리
   */
  const cleanupFlipStyles = useCallback(() => {
    stayingIdsRef.current.forEach((id) => {
      const el = elementMapRef.current.get(id);
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
      }
    });
  }, []);

  /**
   * 필터 변경 감지 및 애니메이션 시작
   */
  useEffect(() => {
    const prevFilter = prevFilterRef.current;
    if (prevFilter === filter) return;

    cancelAnimation();

    const prevItems = getFilteredProducts(allProducts, prevFilter);
    const nextItems = getFilteredProducts(allProducts, filter);
    prevFilterRef.current = filter;

    // 아이템 분류
    const prevIds = new Set(prevItems.map((p) => p.id));
    const nextIds = new Set(nextItems.map((p) => p.id));
    const exitingIds = new Set([...prevIds].filter((id) => !nextIds.has(id)));
    const stayingIds = new Set([...prevIds].filter((id) => nextIds.has(id)));
    const enteringIds = new Set([...nextIds].filter((id) => !prevIds.has(id)));
    stayingIdsRef.current = stayingIds;

    const hasExiting = exitingIds.size > 0;
    const hasEntering = enteringIds.size > 0;
    const hasStaying = stayingIds.size > 0;
    const reflowDelay = hasStaying ? FILTER_TRANSITION.reflow : 50;

    // 애니메이션 시작 전 컨테이너 높이를 현재 값으로 고정
    const container = containerRef.current;
    if (container) {
      oldHeightRef.current = container.offsetHeight;
      container.style.transition = 'none';
      container.style.height = `${container.offsetHeight}px`;
      container.style.overflow = 'hidden';
    }

    /**
     * 애니메이션 완료 → 컨테이너 높이를 old → new로 transition 후 auto 복원
     *
     * overflow: hidden 유지한 채 height=0/scrollHeight로 자연 높이 측정.
     * 동기 DOM 조작 사이에 paint 없으므로 시각적 불연속 없음.
     */
    const transitionHeight = () => {
      const c = containerRef.current;
      if (!c) return;
      const oldHeight = oldHeightRef.current;

      // overflow hidden 유지한 채 자연 높이 측정
      // height:0 → scrollHeight = 콘텐츠 자연 높이, 동기 처리로 paint 발생 안함
      c.style.height = '0';
      const newHeight = c.scrollHeight;
      c.style.height = `${oldHeight}px`;

      // 높이 변화 없으면 바로 정리
      if (Math.abs(newHeight - oldHeight) < 1) {
        c.style.height = '';
        c.style.overflow = '';
        c.style.transition = '';
        return;
      }

      // overflow hidden 유지 → old → new height transition → 완료 후 전부 해제
      requestAnimationFrame(() => {
        c.style.transition = `height ${FILTER_TRANSITION.heightTransition}ms ${FILTER_TRANSITION.easing.fade}`;
        c.style.height = `${newHeight}px`;

        const cleanId = setTimeout(() => {
          c.style.height = '';
          c.style.overflow = '';
          c.style.transition = '';
        }, FILTER_TRANSITION.heightTransition);
        timeoutsRef.current.push(cleanId);
      });
    };

    const captureFirstRects = () => {
      const rects = new Map();
      stayingIds.forEach((id) => {
        const el = elementMapRef.current.get(id);
        if (el) rects.set(id, el.getBoundingClientRect());
      });
      firstRectsRef.current = rects;
    };

    const startFadeIn = () => {
      cleanupFlipStyles();

      if (hasEntering) {
        setPhase('fadeIn');
        setDisplayList(
          nextItems.map((product) => ({
            product,
            itemPhase: enteringIds.has(product.id) ? 'entering' : 'stable',
          }))
        );

        addTimeout(() => {
          setPhase('idle');
          setDisplayList(
            nextItems.map((product) => ({ product, itemPhase: 'stable' }))
          );
          transitionHeight();
        }, FILTER_TRANSITION.fadeIn);
      } else {
        setPhase('idle');
        setDisplayList(
          nextItems.map((product) => ({ product, itemPhase: 'stable' }))
        );
        transitionHeight();
      }
    };

    const startReflow = () => {
      captureFirstRects();

      setPhase('reflow');
      setDisplayList(
        nextItems.map((product) => ({
          product,
          itemPhase: enteringIds.has(product.id) ? 'entering-hidden' : 'staying',
        }))
      );

      addTimeout(startFadeIn, reflowDelay);
    };

    /* eslint-disable react-hooks/set-state-in-effect -- 애니메이션 오케스트레이션: 초기 phase/displayList 즉시 설정 필요 */
    if (hasExiting) {
      setPhase('fadeOut');
      setDisplayList(
        prevItems.map((product) => ({
          product,
          itemPhase: exitingIds.has(product.id) ? 'exiting' : 'stable',
        }))
      );
      addTimeout(startReflow, FILTER_TRANSITION.fadeOut);
    } else if (hasEntering) {
      startReflow();
    } else {
      setPhase('idle');
      setDisplayList(
        nextItems.map((product) => ({ product, itemPhase: 'stable' }))
      );
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [filter, allProducts, cancelAnimation, addTimeout, cleanupFlipStyles]);

  /**
   * FLIP: reflow 단계에서 L자형 위치 보간
   */
  useLayoutEffect(() => {
    if (phase !== 'reflow') return;

    const firstRects = firstRectsRef.current;
    const stayingIds = stayingIdsRef.current;

    if (firstRects.size === 0 || stayingIds.size === 0) return;

    const stepMs = FILTER_TRANSITION.flipStep;
    const easing = FILTER_TRANSITION.easing.flip;

    stayingIds.forEach((id) => {
      const el = elementMapRef.current.get(id);
      if (!el) return;
      const firstRect = firstRects.get(id);
      if (!firstRect) return;

      const lastRect = el.getBoundingClientRect();
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;

      const hasX = Math.abs(deltaX) >= 1;
      const hasY = Math.abs(deltaY) >= 1;

      if (!hasX && !hasY) return;

      // Invert
      el.style.transition = 'none';
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      // Play
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (hasX && hasY) {
            el.style.transition = `transform ${stepMs}ms ${easing}`;
            el.style.transform = `translate(0, ${deltaY}px)`;

            const stepId = setTimeout(() => {
              el.style.transition = `transform ${stepMs}ms ${easing}`;
              el.style.transform = 'translate(0, 0)';
            }, stepMs);
            timeoutsRef.current.push(stepId);
          } else if (hasX) {
            el.style.transition = `transform ${stepMs}ms ${easing}`;
            el.style.transform = `translate(0, ${deltaY}px)`;
          } else {
            el.style.transition = `transform ${stepMs}ms ${easing}`;
            el.style.transform = 'translate(0, 0)';
          }
        });
      });
    });
  }, [phase]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    displayList,
    phase,
    registerRef,
    containerRef,
    isAnimating: phase !== 'idle',
  };
}

export { FILTER_TRANSITION };
