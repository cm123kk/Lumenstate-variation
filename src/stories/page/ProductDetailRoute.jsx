import { useParams } from 'react-router-dom';
import ProductDetailPage from './ProductDetailPage';
import { products } from '../../data/products';

/**
 * 제품 상세 페이지 래퍼
 *
 * URL 의 `:productId` 를 읽어 해당 제품 데이터를 찾아 ProductDetailPage 에 주입한다.
 */
function ProductDetailRoute() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === Number(productId)) || products[0];

  const meta = {
    itemNumber: `LM-${String(product.id).padStart(3, '0')}`,
    leadTime: '4 Weeks',
    shipDate: 'Jan 15, 2025',
  };

  return (
    <ProductDetailPage
      product={ { ...product, price: 1290 } }
      meta={ meta }
    />
  );
}

export default ProductDetailRoute;
export { ProductDetailRoute };
