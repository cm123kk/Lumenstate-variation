import { forwardRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TimeBlendImage } from '../media/TimeBlendImage';
import { useTimeline } from '../media/useTimeline';
import { useSharedElement } from '../motion/useSharedElement';

/**
 * ProductImageViewer 컴포넌트
 *
 * 제품 이미지 뷰어. 낮/밤 이미지를 TimeBlendImage로 블렌딩.
 * Shared Element 전환은 useSharedElement 훅이 자동으로 처리.
 *
 * Props:
 * @param {string|number} productId - 제품 ID (Shared Element id로 사용) [Required]
 * @param {Array} images - 제품 이미지 배열 [dayImage, nightImage] [Required]
 * @param {string} productName - 제품명 (alt 텍스트용) [Optional]
 * @param {number} lux - 제품 조도 값 [Optional]
 * @param {number} kelvin - 제품 색온도 값 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductImageViewer
 *   productId={1}
 *   images={[dayImage, nightImage]}
 *   productName="Lumen Desk Pro"
 * />
 */
const ProductImageViewer = forwardRef(function ProductImageViewer(
  {
    productId,
    images = [],
    productName = 'Product',
    lux,
    kelvin,
    ...props
  },
  ref
) {
  const { timeline } = useTimeline();

  // 낮/밤 이미지 분리
  const dayImage = images[0] || null;
  const nightImage = images[1] || images[0] || null;

  /**
   * Shared Element용 content (메모이제이션)
   */
  const sharedContent = useMemo(
    () => ({ day: dayImage, night: nightImage, timeline }),
    [dayImage, nightImage, timeline]
  );

  const shared = useSharedElement({
    id: `product-${productId}`,
    content: sharedContent,
  });

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        width: '100%',
      }}
      {...props}
    >
      <Box
        ref={shared.ref}
        sx={{
          width: '100%',
          aspectRatio: '3/4',
        }}
      >
        <TimeBlendImage
          dayImage={dayImage}
          nightImage={nightImage}
          timeline={timeline}
          alt={productName}
          aspectRatio="3/4"
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
