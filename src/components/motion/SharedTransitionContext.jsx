import { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * Shared Element Transition Context
 *
 * 페이지 전환 시 공유 요소의 연속적 애니메이션을 위한 일반화된 상태 관리.
 *
 * 모드:
 * - 'forward': source 클릭 → 새 페이지의 target으로 전환
 * - 'reverse': 페이지 이탈 시 캐시된 source 정보로 역전환
 *
 * Content 데이터:
 * - 임의 형태의 사용자 정의 데이터 (이미지 URL, 메타데이터 등)
 * - Overlay의 renderContent(content)에 전달되어 시각적 표현 결정
 */
const SharedTransitionContext = createContext(null);

/**
 * SharedTransitionProvider 컴포넌트
 *
 * Props:
 * @param {React.ReactNode} children - 자식 컴포넌트 [Required]
 *
 * Example usage:
 * <SharedTransitionProvider>
 *   <App />
 * </SharedTransitionProvider>
 */
function SharedTransitionProvider({ children }) {
  const [state, setState] = useState({
    activeId: null,
    mode: null,           // 'forward' | 'reverse' | null
    sourceRect: null,
    targetRect: null,
    content: null,        // 사용자 정의 데이터
    isAnimating: false,
  });

  /**
   * id별 element 정보 캐시 (역전환 시 source로 사용)
   * Map<id, { rect, content }>
   */
  const elementCacheRef = useRef(new Map());
  const lastReportedIdRef = useRef(null);

  /**
   * Forward 전환 시작 (source element 클릭)
   *
   * @param {string} id - 공유 요소 식별자
   * @param {DOMRect|object} rect - source의 viewport rect
   * @param {*} content - 오버레이에 전달할 사용자 데이터
   */
  const startTransition = useCallback((id, rect, content) => {
    setState({
      activeId: id,
      mode: 'forward',
      sourceRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      targetRect: null,
      content,
      isAnimating: true,
    });
  }, []);

  /**
   * 타겟 rect 설정
   * - forward: 새 페이지의 target element가 mount될 때 호출
   * - reverse: 도착지 element가 mount될 때 호출 (RAF defer 권장)
   */
  const setTargetRect = useCallback((rect) => {
    setState((prev) => ({
      ...prev,
      targetRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    }));
  }, []);

  /**
   * 전환 종료
   */
  const endTransition = useCallback(() => {
    setState({
      activeId: null,
      mode: null,
      sourceRect: null,
      targetRect: null,
      content: null,
      isAnimating: false,
    });
  }, []);

  /**
   * Element 정보 보고 (mount/scroll/resize 시)
   * 역전환 시 source로 사용될 수 있도록 캐시.
   */
  const reportElement = useCallback((id, info) => {
    elementCacheRef.current.set(id, info);
    lastReportedIdRef.current = id;
  }, []);

  /**
   * Element 캐시에서 제거 (unmount 시)
   */
  const forgetElement = useCallback((id) => {
    elementCacheRef.current.delete(id);
    if (lastReportedIdRef.current === id) {
      lastReportedIdRef.current = null;
    }
  }, []);

  /**
   * Reverse 전환 트리거
   *
   * source rect가 viewport 밖이면 viewport 경계로 clamp.
   * (element가 스크롤로 밀려나 있어도 overlay는 viewport 내에서 시작)
   *
   * @param {string} [id] - 역전환 source의 id. 생략 시 마지막 보고된 element 사용.
   * @returns {boolean} 트리거 성공 여부
   */
  const triggerReverse = useCallback((id) => {
    const targetId = id ?? lastReportedIdRef.current;
    if (!targetId) return false;

    const info = elementCacheRef.current.get(targetId);
    if (!info || !info.rect) return false;

    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    const { top, left, width, height } = info.rect;
    // top이 viewport 밖이면 viewport 내로 끌어옴.
    // - top < 0 (위로 스크롤되어 사라짐) → 0 (viewport 상단)
    // - top > vh (아래로 사라짐) → vh - height (viewport 하단에 맞춤)
    // - 그 사이는 그대로
    const maxTop = Math.max(0, vh - height);
    const clampedTop = Math.max(0, Math.min(top, maxTop));

    setState({
      activeId: targetId,
      mode: 'reverse',
      sourceRect: { top: clampedTop, left, width, height },
      targetRect: null,
      content: info.content,
      isAnimating: true,
    });
    return true;
  }, []);

  return (
    <SharedTransitionContext.Provider
      value={{
        ...state,
        startTransition,
        setTargetRect,
        endTransition,
        reportElement,
        forgetElement,
        triggerReverse,
      }}
    >
      {children}
    </SharedTransitionContext.Provider>
  );
}

/**
 * useSharedTransition 커스텀 훅
 */
function useSharedTransition() {
  const context = useContext(SharedTransitionContext);
  if (!context) {
    return {
      activeId: null,
      mode: null,
      sourceRect: null,
      targetRect: null,
      content: null,
      isAnimating: false,
      startTransition: () => {},
      setTargetRect: () => {},
      endTransition: () => {},
      reportElement: () => {},
      forgetElement: () => {},
      triggerReverse: () => false,
    };
  }
  return context;
}

export { SharedTransitionProvider, useSharedTransition };
export default SharedTransitionContext;
