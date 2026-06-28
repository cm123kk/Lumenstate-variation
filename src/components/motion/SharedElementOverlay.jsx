import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useSharedTransition } from './SharedTransitionContext';

/**
 * Shared Element 전환 애니메이션 설정 (기본값)
 */
const DEFAULT_TRANSITION = {
  type: 'tween',
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * SharedElementOverlay 컴포넌트
 *
 * Shared Element 전환의 시각적 표현을 담당하는 fixed 레이어.
 * Source의 rect에서 시작해 Target의 rect로 transform 애니메이션.
 * 컨텐츠 자체는 renderContent prop으로 외부 주입.
 *
 * 동작 방식:
 * 1. startTransition / triggerReverse 호출 시 -> sourceRect 위치에 마운트
 * 2. setTargetRect 호출 시 -> animate prop이 갱신되어 transform 애니메이션
 * 3. 애니메이션 완료 -> endTransition -> 즉시 unmount
 *
 * Props:
 * @param {function} renderContent - content를 받아 React 노드를 반환하는 함수 [Required]
 *   - signature: (content) => ReactNode
 * @param {object} transition - framer-motion transition 옵션 [Optional, 기본값: 0.5s tween]
 *
 * Example usage:
 * <SharedElementOverlay
 *   renderContent={(content) => (
 *     <TimeBlendImage
 *       dayImage={content.day}
 *       nightImage={content.night}
 *       timeline={content.timeline}
 *       aspectRatio="auto"
 *       sx={{ width: '100%', height: '100%' }}
 *     />
 *   )}
 * />
 */
function SharedElementOverlay({ renderContent, transition = DEFAULT_TRANSITION }) {
  const { sourceRect, targetRect, content, isAnimating, endTransition } = useSharedTransition();

  if (!isAnimating || !sourceRect || content == null) return null;

  const target = targetRect || sourceRect;
  const scaleX = target.width / sourceRect.width;
  const scaleY = target.height / sourceRect.height;

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: sourceRect.width,
        height: sourceRect.height,
        transformOrigin: '0 0',
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      initial={{
        x: sourceRect.left,
        y: sourceRect.top,
        scaleX: 1,
        scaleY: 1,
      }}
      animate={{
        x: target.left,
        y: target.top,
        scaleX,
        scaleY,
      }}
      transition={transition}
      onAnimationComplete={() => {
        if (targetRect) endTransition();
      }}
    >
      {renderContent(content)}
    </motion.div>
  );
}

export { SharedElementOverlay };
export default SharedElementOverlay;
