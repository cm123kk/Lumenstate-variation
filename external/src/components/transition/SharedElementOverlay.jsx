import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars -- motion.div used in JSX
import { TimeBlendImage } from '../media/TimeBlendImage';
import { useSharedTransition } from '../../contexts/SharedTransitionContext';

/**
 * Shared Element 전환 애니메이션 설정 (컴포넌트 외부 정의)
 *
 * GPU 가속 속성만 사용: transform (translate, scale)
 * position: fixed 레이어에서 렌더링 → 페이지 fade와 독립
 */
const overlayTransition = {
  type: 'tween',
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * SharedElementOverlay 컴포넌트
 *
 * 페이지 전환 시 제품 이미지를 fixed 레이어에서 연속적으로 표시.
 * AnimatePresence 바깥에 위치하여 페이지 opacity fade의 영향을 받지 않음.
 *
 * 동작 방식:
 * 1. startTransition 호출 시 → sourceRect 위치에 이미지 표시
 * 2. targetRect 설정 시 → sourceRect → targetRect로 transform 애니메이션
 * 3. 애니메이션 완료 → endTransition → 오버레이 제거
 *
 * Example usage:
 * <SharedElementOverlay />  (AppShell 내부, AnimatePresence 바깥에 배치)
 */
function SharedElementOverlay() {
  const { sourceRect, targetRect, images, timeline, isAnimating, endTransition } =
    useSharedTransition();

  if (!isAnimating || !sourceRect || !images) return null;

  // 타겟이 아직 없으면 소스 위치에 정지 (상세 페이지 mount 대기)
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
      transition={overlayTransition}
      onAnimationComplete={() => {
        if (targetRect) endTransition();
      }}
    >
      <TimeBlendImage
        dayImage={images.day}
        nightImage={images.night}
        timeline={timeline}
        aspectRatio="auto"
        objectFit="cover"
        sx={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
}

export { SharedElementOverlay };
export default SharedElementOverlay;
