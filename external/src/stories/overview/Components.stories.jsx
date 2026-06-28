import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/Components',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 컴포넌트 테이블 렌더링 헬퍼
 */
const ComponentTable = ({ data }) => (
  <TableContainer sx={ { mb: 3 } }>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={ { fontWeight: 600, width: '30%' } }>컴포넌트</TableCell>
          <TableCell sx={ { fontWeight: 600 } }>설명</TableCell>
          <TableCell sx={ { fontWeight: 600, width: '35%' } }>경로</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { data.map((row) => (
          <TableRow key={ row.name }>
            <TableCell sx={ { fontFamily: 'monospace', fontWeight: 500 } }>{ row.name }</TableCell>
            <TableCell>{ row.description }</TableCell>
            <TableCell sx={ { fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' } }>
              { row.path }
            </TableCell>
          </TableRow>
        )) }
      </TableBody>
    </Table>
  </TableContainer>
);

export const Default = {
  render: () => {
    // Part 1: Starter-Kit (범용)
    const layoutComponents = [
      { name: 'PhiSplit', description: '황금비 분할 레이아웃', path: 'components/layout/PhiSplit.jsx' },
      { name: 'SplitScreen', description: '좌우 분할 레이아웃', path: 'components/layout/SplitScreen.jsx' },
      { name: 'HeroStack', description: '수직 레이아웃 (Hero+Footer)', path: 'components/layout/HeroStack.jsx' },
      { name: 'LineGrid', description: '그리드 아이템 사이 1px 라인', path: 'components/layout/LineGrid.jsx' },
      { name: 'CenteredAsideLayout', description: '중앙 + 사이드 레이아웃', path: 'components/layout/CenteredAsideLayout.jsx' },
      { name: 'BentoGrid', description: '벤토 그리드 레이아웃', path: 'components/layout/BentoGrid.jsx' },
      { name: 'RatioContainer', description: '비율 기반 컨테이너', path: 'components/layout/RatioContainer.jsx' },
      { name: 'FullPageContainer', description: '전체 페이지 컨테이너', path: 'components/layout/FullPageContainer.jsx' },
    ];

    const containerComponents = [
      { name: 'PageContainer', description: '반응형 페이지 컨테이너', path: 'components/container/PageContainer.jsx' },
      { name: 'SectionContainer', description: '섹션 컨테이너', path: 'components/container/SectionContainer.jsx' },
      { name: 'CarouselContainer', description: '캐로셀 컨테이너', path: 'components/container/CarouselContainer.jsx' },
    ];

    const cardComponents = [
      { name: 'CardContainer', description: '카드 기본 컨테이너', path: 'components/card/CardContainer.jsx' },
      { name: 'CustomCard', description: '미디어+콘텐츠 카드', path: 'components/card/CustomCard.jsx' },
    ];

    const inputComponents = [
      { name: 'FileDropzone', description: '파일 드래그&드롭 영역', path: 'components/input/FileDropzone.jsx' },
      { name: 'SearchBar', description: '검색 입력 바', path: 'components/input/SearchBar.jsx' },
      { name: 'TagInput', description: '태그 입력 필드', path: 'components/input/TagInput.jsx' },
      { name: 'UnderlineInput', description: '밑줄만 있는 텍스트 인풋', path: 'components/shared/UnderlineInput.jsx' },
      { name: 'UnderlineSelect', description: '밑줄만 있는 셀렉트', path: 'components/shared/UnderlineSelect.jsx' },
    ];

    const mediaComponents = [
      { name: 'AspectMedia', description: '비율 기반 미디어 컨테이너', path: 'components/media/AspectMedia.jsx' },
      { name: 'ImageCarousel', description: '이미지 캐로셀', path: 'components/media/ImageCarousel.jsx' },
      { name: 'ImageTransition', description: '이미지 트랜지션 효과', path: 'components/media/ImageTransition.jsx' },
      { name: 'VideoScrubbing', description: '비디오 스크러빙', path: 'components/media/VideoScrubbing.jsx' },
      { name: 'CarouselIndicator', description: '캐로셀 인디케이터', path: 'components/media/CarouselIndicator.jsx' },
    ];

    const navigationComponents = [
      { name: 'NavMenu', description: '네비게이션 메뉴', path: 'components/navigation/NavMenu.jsx' },
      { name: 'CategoryTab', description: '카테고리 탭', path: 'components/navigation/CategoryTab.jsx' },
    ];

    const typographyComponents = [
      { name: 'FitText', description: '컨테이너에 맞춤 텍스트', path: 'components/typography/FitText.jsx' },
      { name: 'HighlightedTypography', description: '하이라이트 타이포그래피', path: 'components/typography/HighlightedTypography.jsx' },
      { name: 'InlineTypography', description: '인라인 타이포그래피', path: 'components/typography/InlineTypography.jsx' },
      { name: 'StretchedHeadline', description: '스트레치 헤드라인', path: 'components/typography/StretchedHeadline.jsx' },
      { name: 'Title', description: '타이틀 컴포넌트', path: 'components/typography/Title.jsx' },
    ];

    const sharedComponents = [
      { name: 'QuantitySelector', description: '수량 선택기', path: 'components/shared/QuantitySelector.jsx' },
      { name: 'SelectField', description: '드롭다운 선택 필드', path: 'components/shared/SelectField.jsx' },
      { name: 'Breadcrumb', description: '네비게이션 경로 표시', path: 'components/shared/Breadcrumb.jsx' },
      { name: 'ArrowLink', description: '화살표 링크', path: 'components/shared/ArrowLink.jsx' },
    ];

    // Part 2: Lumenstate Brand (브랜드 전용)
    const contextComponents = [
      { name: 'TimelineContext', description: '시간대 값(0-1) 전역 상태 관리', path: 'hooks/useTimeline.jsx' },
      { name: 'CartContext', description: '장바구니 상태 관리', path: 'context/CartContext.jsx' },
    ];

    const lumenSharedComponents = [
      { name: 'TimelineSlider', description: '4단계 시간대 슬라이더', path: 'components/shared/TimelineSlider.jsx' },
      { name: 'MinimalTimelineSlider', description: '헤더용 간소화 타임라인 슬라이더', path: 'components/shared/MinimalTimelineSlider.jsx' },
      { name: 'ScrollVideo', description: '스크롤 위치 기반 비디오 프레임 시킹', path: 'components/shared/ScrollVideo.jsx' },
      { name: 'TimeBlendImage', description: '타임라인 기반 낮/밤 이미지 크로스페이드', path: 'components/media/TimeBlendImage.jsx' },
    ];

    const productComponents = [
      { name: 'ProductCard', description: '제품 카드', path: 'components/product/ProductCard.jsx' },
      { name: 'ProductGallery', description: '제품 이미지 갤러리', path: 'components/product/ProductGallery.jsx' },
      { name: 'ProductOptions', description: '제품 옵션 선택', path: 'components/product/ProductOptions.jsx' },
      { name: 'ProductMeta', description: '제품 메타 정보', path: 'components/product/ProductMeta.jsx' },
      { name: 'ProductActions', description: '제품 액션 영역', path: 'components/product/ProductActions.jsx' },
      { name: 'ProductTabs', description: '제품 정보 탭', path: 'components/product/ProductTabs.jsx' },
      { name: 'ProductFilter', description: '제품 타입 필터', path: 'components/navigation/ProductFilter.jsx' },
    ];

    const cartComponents = [
      { name: 'CartDrawer', description: '장바구니 슬라이드 패널', path: 'components/cart/CartDrawer.jsx' },
      { name: 'CartHeader', description: '장바구니 헤더', path: 'components/cart/CartHeader.jsx' },
      { name: 'CartItem', description: '장바구니 아이템', path: 'components/cart/CartItem.jsx' },
      { name: 'CartSummary', description: '장바구니 요약', path: 'components/cart/CartSummary.jsx' },
      { name: 'CartCheckoutButton', description: '체크아웃 버튼', path: 'components/cart/CartCheckoutButton.jsx' },
    ];

    const checkoutComponents = [
      { name: 'CheckoutLayout', description: '체크아웃 2컬럼 레이아웃', path: 'components/checkout/CheckoutLayout.jsx' },
      { name: 'ContactForm', description: '연락처 폼', path: 'components/checkout/ContactForm.jsx' },
      { name: 'ShippingForm', description: '배송지 폼', path: 'components/checkout/ShippingForm.jsx' },
      { name: 'OrderSummary', description: '주문 요약 패널', path: 'components/checkout/OrderSummary.jsx' },
    ];

    const lumenNavComponents = [
      { name: 'GNB', description: '글로벌 네비게이션 바', path: 'components/navigation/GNB.jsx' },
      { name: 'AppShell', description: '앱 셸', path: 'components/navigation/AppShell.jsx' },
      { name: 'Footer', description: '푸터', path: 'components/navigation/Footer.jsx' },
    ];

    const templateComponents = [
      { name: 'ProductDetailTemplate', description: '제품 상세 페이지 템플릿', path: 'templates/ProductDetailTemplate.jsx' },
      { name: 'ProductHeroTemplate', description: '제품 히어로 영역 템플릿', path: 'templates/ProductHeroTemplate.jsx' },
      { name: 'ProductInfoTemplate', description: '제품 정보 영역 템플릿', path: 'templates/ProductInfoTemplate.jsx' },
      { name: 'CheckoutTemplate', description: '체크아웃 페이지 템플릿', path: 'templates/CheckoutTemplate.jsx' },
    ];

    const sectionComponents = [
      { name: 'HeroSection', description: '히어로 섹션', path: 'sections/HeroSection.jsx' },
      { name: 'ProductShowcase', description: '제품 쇼케이스 섹션', path: 'sections/ProductShowcase.jsx' },
      { name: 'BrandValueSection', description: '브랜드 가치 제안 섹션', path: 'sections/BrandValueSection.jsx' },
      { name: 'ProductDetailSection', description: '제품 상세 섹션', path: 'sections/ProductDetailSection.jsx' },
      { name: 'CheckoutSection', description: '체크아웃 섹션', path: 'sections/CheckoutSection.jsx' },
    ];

    const pageComponents = [
      { name: 'LandingPage', description: '랜딩 페이지', path: 'pages/LandingPage.jsx' },
      { name: 'ProductDetailPage', description: '제품 상세 페이지', path: 'pages/ProductDetailPage.jsx' },
      { name: 'CheckoutPage', description: '체크아웃 페이지', path: 'pages/CheckoutPage.jsx' },
    ];

    return (
      <>
        <DocumentTitle
          title="Components"
          status="Available"
          note="Complete component reference documentation"
          brandName="Design System"
          systemName="Starter Kit"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Components
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            프로젝트 내 컴포넌트 목록 참조 문서입니다.
          </Typography>

          {/* Part 1: Starter-Kit */}
          <Box sx={ { mb: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 } }>
            <Typography variant="h5" sx={ { fontWeight: 700, mb: 1 } }>
              Part 1: Starter-Kit (범용)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              브랜드 독립적인 재사용 가능한 기본 UI 컴포넌트. 어떤 프로젝트에서도 확장/재사용 가능.
            </Typography>
          </Box>

          <SectionTitle title="Layout" />
          <ComponentTable data={ layoutComponents } />

          <SectionTitle title="Container" />
          <ComponentTable data={ containerComponents } />

          <SectionTitle title="Card" />
          <ComponentTable data={ cardComponents } />

          <SectionTitle title="Input" />
          <ComponentTable data={ inputComponents } />

          <SectionTitle title="Media" />
          <ComponentTable data={ mediaComponents } />

          <SectionTitle title="Navigation" />
          <ComponentTable data={ navigationComponents } />

          <SectionTitle title="Typography" />
          <ComponentTable data={ typographyComponents } />

          <SectionTitle title="Shared (범용)" />
          <ComponentTable data={ sharedComponents } />

          <Divider sx={ { my: 4 } } />

          {/* Part 2: Lumenstate Brand */}
          <Box sx={ { mb: 4, p: 2, backgroundColor: 'action.hover', borderRadius: 1 } }>
            <Typography variant="h5" sx={ { fontWeight: 700, mb: 1 } }>
              Part 2: Lumenstate Brand (브랜드 전용)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              환경 반응형 조명 브랜드 Lumenstate 전용 컴포넌트. 타임라인 기반 조도/색온도 시스템.
            </Typography>
          </Box>

          <SectionTitle title="Context" />
          <ComponentTable data={ contextComponents } />

          <SectionTitle title="Shared (Lumenstate 전용)" />
          <ComponentTable data={ lumenSharedComponents } />

          <SectionTitle title="Product" />
          <ComponentTable data={ productComponents } />

          <SectionTitle title="Cart" />
          <ComponentTable data={ cartComponents } />

          <SectionTitle title="Checkout" />
          <ComponentTable data={ checkoutComponents } />

          <SectionTitle title="Navigation (Lumenstate 전용)" />
          <ComponentTable data={ lumenNavComponents } />

          <SectionTitle title="Templates" />
          <ComponentTable data={ templateComponents } />

          <SectionTitle title="Sections" />
          <ComponentTable data={ sectionComponents } />

          <SectionTitle title="Pages" />
          <ComponentTable data={ pageComponents } />
        </PageContainer>
      </>
    );
  },
};
