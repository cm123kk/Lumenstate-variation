import { forwardRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { SplitScreen } from "../layout/SplitScreen";
import ProductImageViewer from "../product/ProductImageViewer";
import ProductVariationGrid from "../media/ProductVariationGrid";
import { ProductHeroTemplate } from "./ProductHeroTemplate";
import { ProductInfoTemplate } from "./ProductInfoTemplate";
import { useCart } from "../cart/CartContext";

/**
 * ProductDetailTemplate 컴포넌트
 *
 * 제품 상세 페이지 템플릿. SplitScreen 50:50 분할 레이아웃.
 * 왼쪽 영역은 HeroStack으로 제품명을 수직 가운데 정렬.
 *
 * 레이아웃 (SplitScreen + HeroStack):
 * - left (50%):
 *   - Hero: 제품명, Lux/Kelvin (수직 가운데 정렬)
 *   - Footer: Meta, Options, Actions
 * - right (50%): ProductImageViewer (대표 이미지 + 타임라인 슬라이더)
 *   - 대표 이미지 바로 아래 베리에이션 컷 1xN 그리드 (variations 있을 때)
 *
 * Props:
 * @param {object} product - 제품 데이터 (products.js 구조) [Required]
 *   - { id, title, type, lux, kelvin, images, variations, video, price }
 * @param {object} meta - 제품 메타 정보 [Optional]
 *   - { itemNumber, leadTime, shipDate }
 * @param {function} onAddToCart - 장바구니 추가 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductDetailTemplate
 *   product={products[0]}
 *   meta={{ itemNumber: 'LM-001', leadTime: '4 Weeks' }}
 *   onAddToCart={(quantity) => console.log(quantity)}
 * />
 */
const ProductDetailTemplate = forwardRef(function ProductDetailTemplate(
	{ product = {}, meta = {}, onAddToCart, sx = {}, ...props },
	ref
) {
	const { addItem } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [options, setOptions] = useState({
		glassFinish: "opaline",
		hardware: "patina-brass",
		height: "61-72",
	});

	// 이미지 배열 생성
	const images = product.images || [];

	// 베리에이션 컷 (대표 이미지 바로 아래 1xN 그리드)
	const variations = product.variations || [];

	// 썸네일 호버/탭 시 대표 이미지를 그 컷으로 교체.
	// activeImage = 현재 표시할 베리에이션(없으면 기본 대표 이미지).
	// lastImage = 페이드아웃 동안 유지할 직전 src (이미지 깨짐 방지).
	const [activeImage, setActiveImage] = useState(null);
	const [lastImage, setLastImage] = useState(null);

	const handleActiveChange = (src) => {
		setActiveImage(src);
		if (src) {
			setLastImage(src);
		}
	};

	/**
	 * 옵션 변경 핸들러
	 */
	const handleOptionChange = (key, value) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
	};

	/**
	 * 장바구니 추가 핸들러
	 */
	const handleAddToCart = (qty, opts) => {
		// CartContext에 아이템 추가
		addItem(product, opts, qty);

		// 외부 핸들러도 호출 (있는 경우)
		if (onAddToCart) {
			onAddToCart(qty, opts);
		}
	};

	return (
		<SplitScreen
			ref={ref}
			ratio="50:50"
			gap={4}
			stackAt="md"
			stackOrder="reverse"
			sx={sx}
			left={
				<Stack
					spacing={{ xs: 4, sm: 6, md: 12 }}
					sx={{
						p: { xs: 2, sm: 3, md: 5 },
						justifyContent: "center",
					}}
				>
					<ProductHeroTemplate
						title={product.title}
						description={product.description}
						type={product.type}
						lux={product.lux}
						kelvin={product.kelvin}
					/>
					<ProductInfoTemplate
						meta={meta}
						price={product.price || 0}
						currency={product.currency || "USD"}
						options={options}
						onOptionChange={handleOptionChange}
						quantity={quantity}
						onQuantityChange={setQuantity}
						size="large"
						onAddToCart={handleAddToCart}
					/>
				</Stack>
			}
			right={
				// 대표 이미지(원래 크기, 칼럼 폭 가득) + 그 아래 작은 베리에이션 썸네일.
				// 큰 이미지를 유지하므로 sticky 대신 자연 스크롤로 썸네일까지 도달하게 한다.
				<Box>
					{/* 대표 이미지 — 칼럼 폭을 꽉 채우는 원래 크기. 위에 베리에이션 프리뷰 오버레이 크로스페이드 */}
					<Box sx={{ position: "relative" }}>
						<ProductImageViewer
							productId={product.id}
							images={images}
							lux={product.lux}
							kelvin={product.kelvin}
							productName={product.title}
						/>

						{/* 호버/탭한 베리에이션 컷 오버레이 (부드러운 페이드 인/아웃) */}
						{lastImage && (
							<Box
								component="img"
								src={activeImage || lastImage}
								alt=""
								aria-hidden="true"
								sx={{
									position: "absolute",
									inset: 0,
									width: "100%",
									height: "100%",
									objectFit: "cover",
									opacity: activeImage ? 1 : 0,
									transition: "opacity 0.45s ease",
									pointerEvents: "none",
									// lx/K 스펙 라벨(zIndex 10) 위에 올려, 베리에이션 프리뷰 중에는 라벨을 가린다.
									zIndex: 11,
								}}
							/>
						)}
					</Box>

					{/* 대표 이미지 아래 베리에이션 컷 — 작은 썸네일, 호버 시 대표 이미지 교체 */}
					{variations.length > 0 && (
						<ProductVariationGrid
							images={variations}
							alt={product.title}
							columns={5}
							hasDivider={false}
							onActiveChange={handleActiveChange}
							sx={{
								mt: { xs: 3, md: 4 },
								maxWidth: { md: 520 },
								mx: { md: "auto" },
								px: { md: 0 },
							}}
						/>
					)}
				</Box>
			}
			{...props}
		/>
	);
});

export { ProductDetailTemplate };
export default ProductDetailTemplate;
