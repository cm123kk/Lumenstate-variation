import { forwardRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CustomCard } from '../card/CustomCard';
import { TimeBlendImage } from '../media/TimeBlendImage';
import { useSharedElement } from '../motion/useSharedElement';

/**
 * ProductCard 컴포넌트
 *
 * Lumenstate 제품 카드. 썸네일(낮/밤 블렌딩), 제품명, 타입 태그, 상태 라벨을 표시한다.
 * Shared Element 전환은 useSharedElement 훅이 자동으로 처리.
 *
 * Props:
 * @param {object} product - 제품 데이터 { id, title, type, lux, kelvin, images } [Required]
 * @param {number} timeline - 시간대 값 (0-1) [Optional, 기본값: 0]
 * @param {function} onClick - 카드 클릭 핸들러 (transition 시작 후 호출) [Optional]
 * @param {boolean} isSelected - 선택 상태 [Optional, 기본값: false]
 * @param {number} hoverMediaScale - hover 시 미디어 확대 비율 [Optional, 기본값: 1.05]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductCard
 *   product={products[0]}
 *   timeline={0.5}
 *   onClick={() => navigate(`/product/${product.id}`)}
 * />
 */
const ProductCard = forwardRef(function ProductCard({
  product,
  timeline = 0,
  onClick,
  isSelected = false,
  hoverMediaScale = 1.05,
  sx,
  ...props
}, ref) {
  const { title, type, lux, kelvin, images } = product;

  /**
   * 낮/밤 이미지 추출
   */
  const { dayImage, nightImage } = useMemo(() => {
    if (!images || images.length === 0) {
      return { dayImage: null, nightImage: null };
    }
    return {
      dayImage: images[0] || null,
      nightImage: images[1] || images[0] || null,
    };
  }, [images]);

  /**
   * Shared Element용 content (메모이제이션 — useSharedElement의 useEffect 의존성)
   */
  const sharedContent = useMemo(
    () => ({ day: dayImage, night: nightImage, timeline }),
    [dayImage, nightImage, timeline]
  );

  const shared = useSharedElement({
    id: `product-${product.id}`,
    content: sharedContent,
    onTrigger: onClick,
  });

  /**
   * 타입 태그 라벨
   */
  const typeLabel = useMemo(() => {
    const typeMap = {
      ceiling: 'Ceiling',
      stand: 'Stand',
      wall: 'Wall',
      desk: 'Desk',
    };
    return typeMap[type] || type;
  }, [type]);

  /**
   * 미디어 슬롯 - TimeBlendImage 렌더링 + shared.ref 부착
   */
  const renderMediaSlot = () => {
    if (!dayImage && !nightImage) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        </Box>
      );
    }

    return (
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
          alt={title}
          aspectRatio="3/4"
          objectFit="cover"
          sx={{ width: '100%', height: '100%' }}
        />
      </Box>
    );
  };

  return (
    <CustomCard
      ref={ref}
      layout="vertical"
      mediaRatio="auto"
      mediaSlot={renderMediaSlot()}
      gap="sm"
      contentPadding="none"
      variant="ghost"
      isInteractive
      onClick={shared.onClick}
      hoverMediaScale={hoverMediaScale}
      sx={sx}
      {...props}
    >
      {/* 타입 태그 */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1,
            py: 0.25,
            backgroundColor: '#12100E',
            color: '#F2E9DA',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {typeLabel}
        </Typography>
      </Box>

      {/* 제품명 + 상태 라벨 */}
      <Stack spacing={0.5}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            color: 'text.secondary',
          }}
        >
          {lux}lx · {kelvin}K
        </Typography>
      </Stack>
    </CustomCard>
  );
});

export { ProductCard };
