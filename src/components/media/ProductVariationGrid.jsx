import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import AspectMedia from './AspectMedia';

/**
 * ProductVariationGrid 컴포넌트
 *
 * 제품 상세페이지에서 대표 제품 하단에 베리에이션 컷을 1xN 단일행 그리드로 표시한다.
 * 각 셀은 정사각(1:1) 비율 이미지이며, 데스크탑/모바일 모두 한 줄(columns 열)을 유지한다.
 * 썸네일에 마우스를 올리면(또는 모바일에서 탭하면) onActiveChange 로 해당 이미지를 알린다 →
 * 부모가 대표 이미지를 그 컷으로 교체하는 인터랙션에 사용한다. 마우스가 벗어나면 null 을 전달.
 *
 * Props:
 * @param {string[]} images - 베리에이션 이미지 URL 배열 [Required]
 * @param {string} alt - 각 이미지 대체 텍스트 접두 [Optional, 기본값: 'Product variation']
 * @param {number} columns - 한 줄에 배치할 열 수 [Optional, 기본값: 5]
 * @param {boolean} hasDivider - 상단 1px 디바이더 라인 표시 여부 [Optional, 기본값: true]
 * @param {function} onActiveChange - 호버/탭한 이미지 src 를 전달 (벗어나면 null) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductVariationGrid
 *   images={product.variations}
 *   alt={product.title}
 *   onActiveChange={(src) => setActiveImage(src)}
 * />
 */
const ProductVariationGrid = forwardRef(function ProductVariationGrid(
  {
    images = [],
    alt = 'Product variation',
    columns = 5,
    hasDivider = true,
    onActiveChange,
    sx = {},
    ...props
  },
  ref
) {
  if (!images || images.length === 0) {
    return null;
  }

  // MUI Grid는 12 컬럼 기준 → 5열이면 size 2.4. 모든 브레이크포인트에서 한 줄 유지.
  const itemSize = 12 / columns;

  return (
    <Box
      ref={ref}
      sx={{
        ...(hasDivider && {
          borderTop: '1px solid',
          borderColor: 'divider',
        }),
        pt: { xs: 1.5, md: 2 },
        px: { xs: 2, sm: 2, md: 2.5 },
        pb: { xs: 2, md: 2.5 },
        ...sx,
      }}
      {...props}
    >
      <Grid container spacing={{ xs: 0.75, md: 1 }}>
        {images.map((src, index) => (
          <Grid key={index} size={itemSize}>
            <Box
              onMouseEnter={() => onActiveChange?.(src)}
              onMouseLeave={() => onActiveChange?.(null)}
              onClick={() => onActiveChange?.(src)}
              sx={{
                cursor: onActiveChange ? 'pointer' : 'default',
                transition: 'opacity 0.2s ease',
                '&:hover': onActiveChange ? { opacity: 0.7 } : undefined,
              }}
            >
              <AspectMedia
                src={src}
                alt={`${alt} ${index + 1}`}
                aspectRatio="1/1"
                objectFit="cover"
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

export { ProductVariationGrid };
export default ProductVariationGrid;
