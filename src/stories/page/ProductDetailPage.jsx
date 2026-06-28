import { forwardRef } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import ProductDetailSection from '../../components/templates/ProductDetailSection';

/**
 * ProductDetailPage 컴포넌트
 *
 * 제품 상세 페이지. PageContainer + ProductDetailSection 조합.
 * GNB는 라우터 레벨에서 처리.
 *
 * 배경색은 Day/Night 두 레이어를 opacity로 블렌딩.
 * 이미지 블렌딩과 동일한 GPU compositor 파이프라인 사용.
 *
 * Props:
 * @param {object} product - 제품 데이터 (products.js 구조) [Required]
 *   - { id, title, type, lux, kelvin, images, video, price }
 * @param {object} meta - 제품 메타 정보 [Optional]
 *   - { itemNumber, leadTime, shipDate }
 * @param {function} onCheckout - 체크아웃 핸들러 () => void [Optional]
 * @param {string} currency - 통화 코드 [Optional, 기본값: 'USD']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductDetailPage
 *   product={products[0]}
 *   meta={{ itemNumber: 'LM-001', leadTime: '4 Weeks' }}
 *   onCheckout={() => navigate('/checkout')}
 * />
 */
const ProductDetailPage = forwardRef(function ProductDetailPage(
  {
    product = {},
    meta = {},
    onCheckout,
    currency = 'USD',
    sx = {},
    ...props
  },
  ref
) {
  return (
    <PageContainer ref={ref} sx={sx} {...props}>
      <ProductDetailSection
        product={product}
        meta={meta}
        onCheckout={onCheckout}
        currency={currency}
      />
    </PageContainer>
  );
});

export { ProductDetailPage };
export default ProductDetailPage;
