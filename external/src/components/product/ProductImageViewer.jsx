import { forwardRef, useRef, useLayoutEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TimeBlendImage } from '../media/TimeBlendImage';
import { useTimeline } from '../../hooks/useTimeline';
import { useSharedTransition } from '../../contexts/SharedTransitionContext';

/**
 * ProductImageViewer 컴포넌트
 *
 * 제품 이미지 뷰어. 낮/밤 이미지를 TimeBlendImage로 블렌딩.
 * Shared Element 전환 시 타겟 rect를 보고하고, 오버레이 활성 중 실제 이미지를 숨김.
 *
 * 동작 방식:
 * 1. 배경: TimeBlendImage (원본 비율 유지, 낮/밤 블렌딩)
 * 2. mount 시 useLayoutEffect로 타겟 rect를 SharedTransitionContext에 보고
 * 3. 오버레이 애니메이션 중: 실제 이미지 opacity 0 (오버레이가 대체)
 * 4. 오버레이 종료 후: 실제 이미지 표시
 *
 * Props:
 * @param {Array} images - 제품 이미지 배열 [dayImage, nightImage] [Required]
 * @param {string} productName - 제품명 (alt 텍스트용) [Optional]
 * @param {number} lux - 제품 조도 값 [Optional]
 * @param {number} kelvin - 제품 색온도 값 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductImageViewer
 *   images={[dayImage, nightImage]}
 *   productName="Lumen Desk Pro"
 *   lux={260}
 *   kelvin={3200}
 * />
 */
const ProductImageViewer = forwardRef(function ProductImageViewer(
  {
    images = [],
    productName = 'Product',
    lux,
    kelvin,
    ...props
  },
  ref
) {
  const { timeline } = useTimeline();
  const { isAnimating, setTargetRect } = useSharedTransition();
  const imageBoxRef = useRef(null);

  // 낮/밤 이미지 분리
  const dayImage = images[0] || null;
  const nightImage = images[1] || images[0] || null;

  // mount 직후 (paint 전) 타겟 rect 보고 → 오버레이 애니메이션 시작
  useLayoutEffect(() => {
    if (isAnimating && imageBoxRef.current) {
      const rect = imageBoxRef.current.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [isAnimating, setTargetRect]);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
      }}
      {...props}
    >
      {/* 배경 이미지 - 오버레이 활성 중 숨김, 종료 후 표시 */}
      <Box
        ref={imageBoxRef}
        sx={{
          width: '100%',
          height: '100%',
          opacity: isAnimating ? 0 : 1,
          transition: 'opacity 0.15s ease',
        }}
      >
        <TimeBlendImage
          dayImage={dayImage}
          nightImage={nightImage}
          timeline={timeline}
          alt={productName}
          aspectRatio="auto"
          objectFit="cover"
          sx={ { width: '100%', height: '100%' } }
        />
      </Box>

      {/* Lux / Kelvin 정보 - 우측 상단 */}
      {(lux || kelvin) && (
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 10,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              color: '#F2E9DA',
            }}
          >
            {lux && `${lux} lx`}
            {lux && kelvin && ' · '}
            {kelvin && `${kelvin} K`}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export { ProductImageViewer };
export default ProductImageViewer;
