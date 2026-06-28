import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { FILTER_TRANSITION } from '../../hooks/useFilterTransition';

/**
 * 아이템별 phase에 따른 CSS 스타일 매핑
 *
 * - stable: 안정 상태 (기본)
 * - exiting: blur + fade out 애니메이션
 * - staying: reflow 중 (FLIP transform은 훅에서 인라인 적용)
 * - entering-hidden: 공간 확보 완료, 시각적으로 숨김 (transition 없음)
 * - entering: blur + fade in 애니메이션
 */
const FADE_TRANSITION = [
  `opacity ${FILTER_TRANSITION.fadeOut}ms ${FILTER_TRANSITION.easing.fade}`,
  `filter ${FILTER_TRANSITION.fadeOut}ms ${FILTER_TRANSITION.easing.fade}`,
  `transform ${FILTER_TRANSITION.fadeOut}ms ${FILTER_TRANSITION.easing.fade}`,
].join(', ');

const ENTER_TRANSITION = [
  `opacity ${FILTER_TRANSITION.fadeIn}ms ${FILTER_TRANSITION.easing.fade}`,
  `filter ${FILTER_TRANSITION.fadeIn}ms ${FILTER_TRANSITION.easing.fade}`,
  `transform ${FILTER_TRANSITION.fadeIn}ms ${FILTER_TRANSITION.easing.fade}`,
].join(', ');

const PHASE_STYLES = {
  stable: {
    opacity: 1,
    filter: 'blur(0px)',
    transform: 'scale(1)',
  },
  exiting: {
    opacity: 0,
    filter: `blur(${FILTER_TRANSITION.blur})`,
    transform: `scale(${FILTER_TRANSITION.scale})`,
    pointerEvents: 'none',
    transition: FADE_TRANSITION,
    willChange: 'opacity, filter, transform',
  },
  staying: {
    opacity: 1,
    filter: 'blur(0px)',
    willChange: 'transform',
  },
  'entering-hidden': {
    opacity: 0,
    filter: `blur(${FILTER_TRANSITION.blur})`,
    transform: `scale(${FILTER_TRANSITION.scale})`,
  },
  entering: {
    opacity: 1,
    filter: 'blur(0px)',
    transform: 'scale(1)',
    transition: ENTER_TRANSITION,
    willChange: 'opacity, filter, transform',
  },
};

/**
 * AnimatedGridItem 컴포넌트
 *
 * ProductCard를 감싸는 애니메이션 래퍼.
 * itemPhase에 따라 CSS transition 스타일을 적용하고,
 * FLIP 위치 애니메이션을 위한 DOM 참조를 등록한다.
 *
 * 동작 방식:
 * 1. 마운트 시 registerRef로 DOM 요소를 훅에 등록
 * 2. itemPhase 변경 시 해당 phase의 CSS 스타일 적용
 * 3. ProductCard 자체는 수정하지 않음 (순수 래퍼)
 *
 * Props:
 * @param {string} itemPhase - 아이템 애니메이션 단계 ('stable'|'exiting'|'staying'|'entering-hidden'|'entering') [Required]
 * @param {string|number} productId - 제품 ID (FLIP ref 등록용) [Required]
 * @param {function} registerRef - DOM 참조 등록 콜백 (productId, element) => void [Optional]
 * @param {React.ReactNode} children - 래핑할 컴포넌트 (ProductCard) [Required]
 *
 * Example usage:
 * <AnimatedGridItem itemPhase="exiting" productId="lamp-01" registerRef={registerRef}>
 *   <ProductCard product={product} timeline={0.5} />
 * </AnimatedGridItem>
 */
function AnimatedGridItem({ itemPhase, productId, registerRef, children }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const el = boxRef.current;
    if (registerRef && el) {
      registerRef(productId, el);
    }
    return () => {
      if (registerRef) {
        registerRef(productId, null);
      }
    };
  }, [productId, registerRef]);

  const sx = PHASE_STYLES[itemPhase] || PHASE_STYLES.stable;

  return (
    <Box ref={boxRef} sx={sx}>
      {children}
    </Box>
  );
}

export { AnimatedGridItem };
export default AnimatedGridItem;
