import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
  TreeNode,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/Content Map',
  parameters: {
    layout: 'padded',
  },
};

/** 데이터 구조 스토리 (기존) */
export const Doc = {
  render: () => {
    const contentStructure = {
      brand: {
        name: 'Lumenstate',
        tagline: 'Light defines the space.',
      },
      navigation: {
        menuItems: [
          '{ id: "brand", label: "Brand", path: "/brand" }',
          '{ id: "collection", label: "Collection", path: "/collection" }',
          '{ id: "shop", label: "Shop", path: "/shop" }',
        ],
      },
      hero: {
        title: 'Lumenstate',
        subtitle: 'Light defines the space.',
        moodboard: {
          hero: 'arc-lamp-living.png (Day)',
          heroNight: 'arc-lamp-living-night.png (Night)',
          side: 'arch-light-gallery.png (Day)',
          sideNight: 'arch-light-gallery-night.png (Night)',
          sideAlt: 'Arch light in gallery space',
          gallery: [
            '{ src: archLightGallery, srcNight: ...Night, alt: "Arch light in gallery space" }',
            '{ src: splitDiscMeditation, srcNight: ...Night, alt: "Split disc in meditation room" }',
            '{ src: capsuleLampLoft, srcNight: ...Night, alt: "Capsule lamp in loft workspace" }',
          ],
        },
      },
      brandValue: {
        features: [
          '{ id: "immanence", icon: "CircleDot", title: "Immanence" }',
          '{ id: "continuity", icon: "Repeat", title: "Continuity" }',
          '{ id: "flexibility", icon: "Activity", title: "Flexibility" }',
        ],
      },
      products: {
        sectionTitle: 'Product Showcase',
        sectionSubtitle: 'Explore brightness and color temperature changes throughout the day',
      },
      footer: {
        copyright: '© 2025 Lumenstate. All rights reserved.',
      },
    };

    return (
      <>
        <DocumentTitle
          title="Content Map"
          status="Available"
          note="content.js 데이터 구조와 컴포넌트 바인딩"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Content Map
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 1 } }>
            <code>src/data/content.js</code>의 전체 데이터 구조와 각 키가 바인딩되는 컴포넌트
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            모든 텍스트 콘텐츠와 이미지 참조는 이 파일에서 중앙 관리됩니다.
          </Typography>

          {/* Tree Structure */}
          <SectionTitle title="content.js 트리 구조" />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 } }>
            <Box sx={ { fontFamily: 'monospace' } }>
              { Object.entries(contentStructure).map(([key, value]) => (
                <TreeNode
                  key={ key }
                  keyName={ key }
                  value={ value }
                  depth={ 0 }
                  defaultOpen={ true }
                />
              )) }
            </Box>
          </Box>

          <Divider sx={ { my: 3 } } />

          {/* Moodboard Asset Mapping */}
          <SectionTitle title="Moodboard 에셋 매핑" description="hero.moodboard에서 import하는 Day/Night 이미지 쌍" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>용도</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Day 파일</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Night 파일</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>제품</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Hero 메인</TableCell>
                  <TableCell><code>arc-lamp-living.png</code></TableCell>
                  <TableCell><code>arc-lamp-living-night.png</code></TableCell>
                  <TableCell>Parabolic arc floor lamp (#2)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hero 사이드</TableCell>
                  <TableCell><code>arch-light-gallery.png</code></TableCell>
                  <TableCell><code>arch-light-gallery-night.png</code></TableCell>
                  <TableCell>Arch portal wall light (#11)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gallery [0]</TableCell>
                  <TableCell><code>arch-light-gallery.png</code></TableCell>
                  <TableCell><code>arch-light-gallery-night.png</code></TableCell>
                  <TableCell>Arch portal wall light (#11)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gallery [1]</TableCell>
                  <TableCell><code>split-disc-meditation.png</code></TableCell>
                  <TableCell><code>split-disc-meditation-night.png</code></TableCell>
                  <TableCell>Split disc wall light (#8)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Gallery [2]</TableCell>
                  <TableCell><code>capsule-lamp-loft.png</code></TableCell>
                  <TableCell><code>capsule-lamp-loft-night.png</code></TableCell>
                  <TableCell>Capsule floor lamp (#18)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            에셋 경로: <code>src/assets/brand-mood/</code> | 생성: <code>generate-product-images.mjs</code> MOODBOARD_SCENES
          </Typography>

          <Divider sx={ { my: 3 } } />

          {/* Brand Value Data */}
          <SectionTitle title="Brand Value 데이터" description="brandValue.features — 3가지 핵심 가치" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Icon</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Title</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>immanence</TableCell>
                  <TableCell>CircleDot</TableCell>
                  <TableCell>Immanence</TableCell>
                  <TableCell>Light quietly residing within the space.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>continuity</TableCell>
                  <TableCell>Repeat</TableCell>
                  <TableCell>Continuity</TableCell>
                  <TableCell>Seamless & natural day to night flow.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>flexibility</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Flexibility</TableCell>
                  <TableCell>Auto by default, precise on demand.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Import Structure */}
          <SectionTitle title="Import 구조" description="content.js가 이미지를 import하는 방식" />
          <Box sx={ { p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 4 } }>
            <Typography variant="body2" sx={ { fontFamily: 'monospace', whiteSpace: 'pre-line', fontSize: '12px', lineHeight: 1.8 } }>
              { `// Day 이미지
import arcLampLiving from '../assets/brand-mood/arc-lamp-living.png';
import columnLampStudio from '../assets/brand-mood/column-lamp-studio.png';
import archLightGallery from '../assets/brand-mood/arch-light-gallery.png';
import splitDiscMeditation from '../assets/brand-mood/split-disc-meditation.png';
import capsuleLampLoft from '../assets/brand-mood/capsule-lamp-loft.png';

// Night 이미지 (같은 파일명 + "-night" suffix)
import arcLampLivingNight from '../assets/brand-mood/arc-lamp-living-night.png';
...` }
            </Typography>
          </Box>
        </PageContainer>
      </>
    );
  },
};

/** 웹사이트 전체 문구 인벤토리 */
export const TextInventory = {
  render: () => {
    return (
      <>
        <DocumentTitle
          title="Text Inventory"
          status="Available"
          note="웹사이트에 표시되는 모든 문구 목록"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Text Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            웹사이트에 표시되는 모든 텍스트를 페이지/섹션별로 분류한 목록입니다.
          </Typography>

          {/* ── Header / GNB ── */}
          <SectionTitle title="Header (GNB)" description="모든 페이지 공통 — 상단 고정" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>위치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>문구</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>소스</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>로고</TableCell>
                  <TableCell><strong>Lumenstate</strong></TableCell>
                  <TableCell><code>content.brand.name</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>메뉴 항목</TableCell>
                  <TableCell>Brand / Collection / Shop</TableCell>
                  <TableCell><code>content.navigation.menuItems</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>타임라인 프리셋</TableCell>
                  <TableCell>12pm / 4pm / 8pm / 12am</TableCell>
                  <TableCell>하드코딩 (TimelineSlider)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* ── Landing Page ── */}
          <Box sx={ { mb: 1, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 } }>
            <Typography variant="h6" sx={ { fontWeight: 700 } }>
              Landing Page <Chip label="/" size="small" sx={ { ml: 1, fontFamily: 'monospace' } } />
            </Typography>
          </Box>

          {/* Hero Section */}
          <SectionTitle title="Hero Section" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>위치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>문구</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>소스</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>타이틀 (h1)</TableCell>
                  <TableCell><strong>Lumenstate</strong></TableCell>
                  <TableCell><code>content.hero.title</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>서브타이틀 (h3)</TableCell>
                  <TableCell><strong>Light defines the space.</strong></TableCell>
                  <TableCell><code>content.hero.subtitle</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>이미지 alt 텍스트</TableCell>
                  <TableCell>Arch light in gallery space / Split disc in meditation room / Capsule lamp in loft workspace</TableCell>
                  <TableCell><code>content.hero.moodboard.gallery[].alt</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Brand Value Section */}
          <SectionTitle title="Brand Value Section" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>카드</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>타이틀</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명 (EN)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>카드 1</TableCell>
                  <TableCell><strong>Immanence</strong></TableCell>
                  <TableCell>Light quietly residing within the space.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>카드 2</TableCell>
                  <TableCell><strong>Continuity</strong></TableCell>
                  <TableCell>Seamless & natural day to night flow.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>카드 3</TableCell>
                  <TableCell><strong>Flexibility</strong></TableCell>
                  <TableCell>Auto by default, precise on demand.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="subtitle2" sx={ { fontWeight: 600, mb: 1 } }>상세 설명 (KO)</Typography>
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 120 } }>Immanence</TableCell>
                  <TableCell>조명이 건축과 하나가 되어 은은하고 눈부심 없는 빛을 전합니다. 공간의 표면과 시선을 해치지 않으면서, 드러내지 않는 존재감과 방해 없는 정밀함을 구현합니다.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Continuity</TableCell>
                  <TableCell>밝기와 색온도가 하루의 흐름을 따라 한낮의 선명함에서 저녁의 온기로 부드럽게 이어집니다. 급격한 변화나 깜빡임 없이, 오직 안정적이고 편안한 빛만을 선사합니다.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Flexibility</TableCell>
                  <TableCell>자동화가 일상의 조명을 관리하고, 필요할 때는 즉시 조도와 색온도를 정밀하게 제어할 수 있습니다. 최소한의 센서와 효율적인 기본 설정으로 공간의 맥락을 존중합니다.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Product Showcase */}
          <SectionTitle title="Product Showcase Section" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>위치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>문구</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>소스</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>섹션 타이틀</TableCell>
                  <TableCell><strong>Product Showcase</strong></TableCell>
                  <TableCell><code>content.products.sectionTitle</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>섹션 서브타이틀</TableCell>
                  <TableCell>Explore brightness and color temperature changes throughout the day</TableCell>
                  <TableCell><code>content.products.sectionSubtitle</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>필터 라벨</TableCell>
                  <TableCell>Ceiling / Stand / Wall / Desk</TableCell>
                  <TableCell>하드코딩 (ProductCard)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>빈 이미지</TableCell>
                  <TableCell>No image</TableCell>
                  <TableCell>하드코딩 (ProductCard)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* ── Product Detail Page ── */}
          <Box sx={ { mb: 1, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 } }>
            <Typography variant="h6" sx={ { fontWeight: 700 } }>
              Product Detail Page <Chip label="/product/:id" size="small" sx={ { ml: 1, fontFamily: 'monospace' } } />
            </Typography>
          </Box>

          <SectionTitle title="제품 정보" />
          <TableContainer sx={ { mb: 3 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>위치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>문구</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>소스</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>제품명</TableCell>
                  <TableCell>Lumen Desk Pro, Lumen Ceiling, ... (20개)</TableCell>
                  <TableCell><code>products[].title</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>제품 설명</TableCell>
                  <TableCell>(각 제품 고유 설명 — 한국어)</TableCell>
                  <TableCell><code>products[].description</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>메타 라벨</TableCell>
                  <TableCell>Item Number / Lead Time / Est. Ship Date</TableCell>
                  <TableCell>하드코딩 (ProductMeta)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>수량 라벨</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>하드코딩 (ProductActions)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>CTA 버튼</TableCell>
                  <TableCell>Add to Cart / Adding...</TableCell>
                  <TableCell>하드코딩 (ProductActions)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="제품 탭" />
          <Stack direction="row" spacing={ 1 } sx={ { mb: 4, flexWrap: 'wrap', gap: 1 } }>
            <Chip label="Overview" size="small" variant="outlined" />
            <Chip label="Description" size="small" variant="outlined" />
            <Chip label="Tech Specs + Downloads" size="small" variant="outlined" />
            <Chip label="Explore the Collection" size="small" variant="outlined" />
            <Chip label="Finish Samples" size="small" variant="outlined" />
            <Chip label="Bulbs + Spare Parts" size="small" variant="outlined" />
          </Stack>

          <SectionTitle title="제품 옵션" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>옵션</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>라벨</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>선택지</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Glass Finish</TableCell>
                  <TableCell>Glass Finish</TableCell>
                  <TableCell>Clear / Frosted / Opaline / Amber / Smoke</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Hardware</TableCell>
                  <TableCell>Hardware</TableCell>
                  <TableCell>Patina Brass / Polished Brass / Brushed Nickel / Matte Black / Chrome</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>Height</TableCell>
                  <TableCell>OAH (Overall Height)</TableCell>
                  <TableCell>36"-48" / 49"-60" / 61"-72" / 73"-84" / 85"-96"</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="장바구니 (Cart Drawer)" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>헤더</TableCell>
                  <TableCell>Cart</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>빈 상태</TableCell>
                  <TableCell>Your cart is empty / Add items to get started</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>소계</TableCell>
                  <TableCell>Subtotal</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>CTA</TableCell>
                  <TableCell>Checkout / Processing...</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* ── Checkout Page ── */}
          <Box sx={ { mb: 1, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 } }>
            <Typography variant="h6" sx={ { fontWeight: 700 } }>
              Checkout Page <Chip label="/checkout" size="small" sx={ { ml: 1, fontFamily: 'monospace' } } />
            </Typography>
          </Box>

          <SectionTitle title="체크아웃 단계" />
          <Stack direction="row" spacing={ 1 } sx={ { mb: 3 } }>
            <Chip label="Cart" size="small" />
            <Chip label="Information" size="small" />
            <Chip label="Shipping" size="small" />
            <Chip label="Payment" size="small" />
          </Stack>

          <SectionTitle title="Express Checkout" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>헤더</TableCell>
                  <TableCell>Express checkout</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>버튼</TableCell>
                  <TableCell>shop (Shop Pay) / G Pay (Google Pay)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>구분선</TableCell>
                  <TableCell>OR</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="연락처 폼 (Contact)" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>섹션 타이틀</TableCell>
                  <TableCell>연락처</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>로그인 링크</TableCell>
                  <TableCell>로그인</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>이메일 라벨</TableCell>
                  <TableCell>이메일</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>이메일 placeholder</TableCell>
                  <TableCell>이메일을 입력하세요</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>뉴스레터</TableCell>
                  <TableCell>뉴스 및 혜택 이메일 수신</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="배송지 폼 (Shipping)" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>필드</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>라벨</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>섹션 타이틀</TableCell>
                  <TableCell>배송지</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>국가</TableCell>
                  <TableCell>국가/지역 — 대한민국 / 미국 / 캐나다 / 영국 / 호주</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>이름</TableCell>
                  <TableCell>성 / 이름</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>회사</TableCell>
                  <TableCell>회사 (선택사항)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>주소</TableCell>
                  <TableCell>주소 / 상세주소 (선택사항)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>기타</TableCell>
                  <TableCell>도시 / 우편번호 / 전화번호</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="액션 버튼" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>뒤로</TableCell>
                  <TableCell>Return to cart</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>계속</TableCell>
                  <TableCell>Continue to shipping / Processing...</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <SectionTitle title="정책 링크" />
          <Stack direction="row" spacing={ 1 } sx={ { mb: 4 } }>
            <Chip label="Refund policy" size="small" variant="outlined" />
            <Chip label="Privacy policy" size="small" variant="outlined" />
            <Chip label="Terms of service" size="small" variant="outlined" />
          </Stack>

          <Divider sx={ { my: 3 } } />

          {/* ── Footer ── */}
          <SectionTitle title="Footer" description="모든 페이지 공통 (Checkout 제외)" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 180 } }>브랜드명</TableCell>
                  <TableCell>Lumenstate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>태그라인</TableCell>
                  <TableCell>Light defines the space.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>뉴스레터 타이틀</TableCell>
                  <TableCell>Newsletter</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>이메일 placeholder</TableCell>
                  <TableCell>Enter your email / Subscribed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>소셜</TableCell>
                  <TableCell>Follow Us</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>저작권</TableCell>
                  <TableCell>© 2025 Lumenstate. All rights reserved.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* ── Product Names ── */}
          <SectionTitle title="제품명 (20개)" description="products.js — 전체 제품 목록" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600, width: 40 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 600, width: 160 } }>제품명</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>타입</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설명 (요약)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { [
                  { id: 1, title: 'Lumen Desk Pro', type: 'ceiling', desc: '집중이 필요한 책상 위를 위한 조명' },
                  { id: 2, title: 'Lumen Ceiling', type: 'stand', desc: '천장에 녹아드는 은은한 매입 조명' },
                  { id: 3, title: 'Lumen Floor', type: 'wall', desc: '바닥에서 천장까지 수직 리듬 완성' },
                  { id: 4, title: 'Lumen Wall', type: 'wall', desc: '벽면을 따라 부드럽게 퍼지는 간접 조명' },
                  { id: 5, title: 'Lumen Table', type: 'wall', desc: '식탁 위 대화의 온기를 더하는 펜던트' },
                  { id: 6, title: 'Lumen Ambient', type: 'stand', desc: '공간 분위기를 조율하는 무드 조명' },
                  { id: 7, title: 'Lumen Arc', type: 'wall', desc: '우아한 곡선의 조형적 플로어 램프' },
                  { id: 8, title: 'Lumen Sphere', type: 'wall', desc: '구체에서 사방으로 퍼지는 전방위 조명' },
                  { id: 9, title: 'Lumen Linear', type: 'wall', desc: '직선의 절제미로 빛의 선을 그음' },
                  { id: 10, title: 'Lumen Pendant', type: 'stand', desc: '천장에서 내려오는 포인트 조명' },
                  { id: 11, title: 'Lumen Mini', type: 'wall', desc: '컴팩트 휴대 충전식 조명' },
                  { id: 12, title: 'Lumen Studio', type: 'ceiling', desc: '전문가용 고연색 작업 조명' },
                  { id: 13, title: 'Lumen Spot', type: 'stand', desc: '집중형 액센트 조명' },
                  { id: 14, title: 'Lumen Flex', type: 'wall', desc: '다관절 유연 각도 조절 조명' },
                  { id: 15, title: 'Lumen Ring', type: 'desk', desc: '균형 잡힌 빛의 고리' },
                  { id: 16, title: 'Lumen Cube', type: 'ceiling', desc: '정육면체 프로스트 글라스 펜던트' },
                  { id: 17, title: 'Lumen Dome', type: 'desk', desc: '반구형 데스크 조명' },
                  { id: 18, title: 'Lumen Capsule', type: 'stand', desc: '캡슐 형태 플로어 램프' },
                  { id: 19, title: 'Lumen Stack', type: 'wall', desc: '디스크 3층 스택 벽 조명' },
                  { id: 20, title: 'Lumen Prism', type: 'desk', desc: '삼각기둥 프리즘 데스크 조명' },
                ].map((p) => (
                  <TableRow key={ p.id }>
                    <TableCell sx={ { fontFamily: 'monospace' } }>{ p.id }</TableCell>
                    <TableCell sx={ { fontWeight: 600 } }>{ p.title }</TableCell>
                    <TableCell><Chip label={ p.type } size="small" variant="outlined" /></TableCell>
                    <TableCell sx={ { color: 'text.secondary' } }>{ p.desc }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>
        </PageContainer>
      </>
    );
  },
};
