import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { ProductCard } from '../components/product/ProductCard';
import { AnimatedGridItem } from '../components/product/AnimatedGridItem';

/**
 * 시각적 상수 (ProductGrid 전용)
 */
const GRID = {
  SPACING: { xs: 1.5, sm: 2, md: 3 },           // 반응형 그리드 간격
  ROW_SPACING: { xs: 3, sm: 4, md: 6 },         // 반응형 행 간격
  SIZE: { xs: 6, sm: 4, md: 3, xl: 2.4 },       // 반응형 열 크기 (xs: 2열, sm: 3열, md: 4열, xl: 5열)
};

/**
 * ProductGrid 템플릿 컴포넌트
 *
 * ProductCard들을 반응형 그리드로 배치하는 템플릿.
 * displayList가 전달되면 필터 전환 애니메이션을 적용한다.
 *
 * 동작 방식:
 * 1. displayList 또는 products 배열을 받아 그리드로 렌더링
 * 2. timeline 값에 따라 모든 카드의 낮/밤 이미지 동기화
 * 3. 반응형 열 구성 (xs: 2열, sm: 3열, md: 4열)
 * 4. displayList 사용 시 각 아이템을 AnimatedGridItem으로 래핑하여 전환 애니메이션 적용
 *
 * Props:
 * @param {Array} products - 제품 데이터 배열 [Optional, displayList 미사용 시 필요]
 * @param {Array} displayList - 애니메이션 아이템 배열 [{product, itemPhase}] [Optional]
 * @param {function} registerRef - FLIP DOM 참조 등록 콜백 [Optional]
 * @param {number} timeline - 시간대 값 (0-1) [Optional, 기본값: 0]
 * @param {function} onProductClick - 제품 클릭 핸들러 [Optional]
 * @param {string|number} selectedProductId - 선택된 제품 ID [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductGrid
 *   displayList={displayList}
 *   registerRef={registerRef}
 *   timeline={0.5}
 *   onProductClick={(product) => console.log(product)}
 * />
 */
const ProductGrid = forwardRef(function ProductGrid({
  products = [],
  displayList,
  registerRef,
  containerRef,
  timeline = 0,
  onProductClick,
  selectedProductId,
  sx,
  ...props
}, ref) {
  // 하위호환: displayList가 없으면 products를 stable 상태로 래핑
  const items = displayList
    ? displayList
    : products.map((product) => ({ product, itemPhase: 'stable' }));

  if (items.length === 0) {
    return null;
  }

  return (
    <Box ref={containerRef || ref} sx={sx} {...props}>
      <Grid container spacing={GRID.SPACING} rowSpacing={GRID.ROW_SPACING}>
        {items.map(({ product, itemPhase }) => (
          <Grid key={product.id} size={GRID.SIZE}>
            <AnimatedGridItem
              itemPhase={itemPhase}
              productId={product.id}
              registerRef={registerRef}
            >
              <ProductCard
                product={product}
                timeline={timeline}
                onClick={onProductClick ? () => onProductClick(product) : undefined}
                isSelected={selectedProductId === product.id}
              />
            </AnimatedGridItem>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

export { ProductGrid };
export default ProductGrid;
