import { TopSection } from '../../components/templates/TopSection';
import { ElevationSection } from '../../components/templates/ElevationSection';
import { ProductShowcase } from '../../components/templates/ProductShowcase';

/**
 * LandingPage 컴포넌트
 *
 * Lumenstate 브랜드의 랜딩 페이지.
 * TopSection(히어로 무드보드 + 브랜드 가치)과 ProductShowcase(제품 그리드)로 구성.
 *
 * 레이아웃:
 * - TopSection: 무드보드 히어로 섹션 + 브랜드 가치 카드
 * - ProductShowcase: 타임라인 슬라이더 + 제품 그리드
 *
 * 배경색은 Day(#E8E5E1) / Night(#12100E) 두 레이어를 opacity로 블렌딩.
 * 이미지 블렌딩과 동일한 GPU compositor 파이프라인을 사용하여 전환 동기화.
 *
 * @param {object} sx - 추가 스타일 [Optional]
 */
function LandingPage({ sx }) {
  return (
    <>
      <TopSection />
      <ElevationSection />
      <ProductShowcase sx={sx} />
    </>
  );
}

export default LandingPage;
