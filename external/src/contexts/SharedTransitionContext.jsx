import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Shared Element Transition Context
 *
 * 페이지 전환 시 공유 요소(제품 이미지)의 연속적 애니메이션을 위한 상태 관리.
 * 이미지를 AnimatePresence 바깥의 fixed 오버레이 레이어에서 렌더링하여
 * 페이지 fade와 독립적으로 항상 visible 유지.
 *
 * 동작 방식:
 * 1. ProductCard 클릭 → startTransition(id, rect, images, timeline)
 *    → 오버레이가 카드 위치에 이미지 표시
 * 2. navigate → 상세 페이지 mount
 * 3. ProductImageViewer useLayoutEffect → setTargetRect(rect)
 *    → 오버레이가 카드 위치 → 상세 위치로 fly 애니메이션
 * 4. 애니메이션 완료 → endTransition()
 *    → 오버레이 제거, 실제 이미지 표시
 */
const SharedTransitionContext = createContext(null);

function SharedTransitionProvider({ children }) {
  const [state, setState] = useState({
    activeId: null,
    sourceRect: null,
    targetRect: null,
    images: null,
    timeline: 0,
    isAnimating: false,
  });

  /**
   * 전환 시작: 카드 클릭 시 호출
   * @param {string|number} id - 제품 ID
   * @param {DOMRect} rect - 카드 이미지의 뷰포트 위치
   * @param {{ day: string, night: string }} images - 낮/밤 이미지 URL
   * @param {number} timeline - 현재 타임라인 값 (0-1)
   */
  const startTransition = useCallback((id, rect, images, timeline) => {
    setState({
      activeId: id,
      sourceRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      targetRect: null,
      images,
      timeline,
      isAnimating: true,
    });
  }, []);

  /**
   * 타겟 rect 설정: ProductImageViewer mount 시 호출
   */
  const setTargetRect = useCallback((rect) => {
    setState((prev) => ({
      ...prev,
      targetRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
    }));
  }, []);

  /**
   * 전환 종료: 오버레이 애니메이션 완료 시 호출
   */
  const endTransition = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isAnimating: false,
      sourceRect: null,
      targetRect: null,
      images: null,
    }));
  }, []);

  return (
    <SharedTransitionContext.Provider
      value={{ ...state, startTransition, setTargetRect, endTransition }}
    >
      {children}
    </SharedTransitionContext.Provider>
  );
}

function useSharedTransition() {
  const context = useContext(SharedTransitionContext);
  if (!context) {
    return {
      activeId: null,
      sourceRect: null,
      targetRect: null,
      images: null,
      timeline: 0,
      isAnimating: false,
      startTransition: () => {},
      setTargetRect: () => {},
      endTransition: () => {},
    };
  }
  return context;
}

export { SharedTransitionProvider, useSharedTransition };
export default SharedTransitionContext;
