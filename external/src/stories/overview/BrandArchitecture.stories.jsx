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
  TreeNode,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/Brand Architecture',
  parameters: {
    layout: 'padded',
  },
};

export const Doc = {
  render: () => {
    const systemLayers = {
      'Data Layer': {
        'content.js': {
          역할: '앱 전체 콘텐츠 (브랜드명, 메뉴, 히어로, 제품 등)',
          소비처: 'HeroSection, BrandValueSection, ProductShowcase, Footer, AppShell',
        },
        'theme.js': {
          역할: '4색 팔레트 + 타이포 + 간격 토큰',
          소비처: '모든 컴포넌트 (sx prop을 통해)',
        },
        'useTimeline.jsx': {
          역할: '타임라인 상태 (0~1) 관리',
          소비처: 'TimeBlendImage, ProductShowcase, AppShell, HeroSection',
        },
      },
      'Asset Layer': {
        'src/assets/product/': {
          역할: '제품 Day/Night 이미지 쌍 (3:4)',
          생성: 'generate-product-images.mjs → Gemini API',
          소비처: 'TimeBlendImage → ProductImageViewer, ProductShowcase',
        },
        'src/assets/brand-mood/': {
          역할: '무드보드 에디토리얼 이미지 Day/Night 쌍',
          생성: 'generate-product-images.mjs (MOODBOARD_SCENES)',
          소비처: 'HeroSection 무드보드 그리드',
        },
      },
      'UI Layer': {
        HeroSection: '브랜드명 + 태그라인 + 무드보드 이미지 크로스페이드',
        BrandValueSection: '3가지 브랜드 가치 (Immanence, Continuity, Flexibility)',
        ProductShowcase: '타임라인 슬라이더 + 제품 그리드 (Day↔Night)',
        AppShell: '헤더 (로고, 시계, 미니 타임라인) + Footer',
      },
    };

    return (
      <>
        <DocumentTitle
          title="Brand Architecture"
          status="Available"
          note="브랜드 시스템의 데이터 흐름과 관계 구조"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Brand Architecture
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 4 } }>
            Lumenstate 브랜드 시스템을 구성하는 데이터, 에셋, UI 레이어의 관계 구조도
          </Typography>

          {/* System Layers */}
          <SectionTitle title="System Layers" description="3개 레이어가 단방향으로 연결됩니다: Data → Asset → UI" />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 } }>
            <Box sx={ { fontFamily: 'monospace' } }>
              { Object.entries(systemLayers).map(([key, value]) => (
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

          {/* Visual Direction → Theme */}
          <SectionTitle title="Visual Direction → Theme 매핑" description="비주얼 디렉션의 4색과 폰트가 MUI 테마 토큰에 어떻게 연결되는지" />
          <TableContainer sx={ { mb: 3 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>비주얼 디렉션</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Hex</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Theme 토큰 (Light)</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Theme 토큰 (Dark)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#F5F2EE', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      Wall Tint White
                    </Box>
                  </TableCell>
                  <TableCell><code>#F5F2EE</code></TableCell>
                  <TableCell>background.default</TableCell>
                  <TableCell>primary.main</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#F2E9DA', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      3800K White
                    </Box>
                  </TableCell>
                  <TableCell><code>#F2E9DA</code></TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>text.primary</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#12100E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      Warm Black
                    </Box>
                  </TableCell>
                  <TableCell><code>#12100E</code></TableCell>
                  <TableCell>text.primary, primary.main</TableCell>
                  <TableCell>background.default</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#FFC66E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      3800K Accent
                    </Box>
                  </TableCell>
                  <TableCell><code>#FFC66E</code></TableCell>
                  <TableCell>secondary.main</TableCell>
                  <TableCell>secondary.main</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>용도</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>폰트</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Theme 매핑</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Display (h1-h6)</TableCell>
                  <TableCell>Cormorant Garamond</TableCell>
                  <TableCell>typography.h1~h6.fontFamily</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Body / UI</TableCell>
                  <TableCell>Pretendard Variable</TableCell>
                  <TableCell>typography.fontFamily (기본)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Icon</TableCell>
                  <TableCell>lucide-react</TableCell>
                  <TableCell>1.5px 스트로크</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Content → Component */}
          <SectionTitle title="Content → Component 매핑" description="content.js의 각 키가 어떤 컴포넌트를 채우는지" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>content.js 키</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>데이터</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>컴포넌트</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>brand</code></TableCell>
                  <TableCell>name, tagline</TableCell>
                  <TableCell>AppShell (로고)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>navigation</code></TableCell>
                  <TableCell>menuItems[]</TableCell>
                  <TableCell>AppShell (메뉴)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>hero</code></TableCell>
                  <TableCell>title, subtitle, moodboard{}</TableCell>
                  <TableCell>HeroSection</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>hero.moodboard</code></TableCell>
                  <TableCell>hero/heroNight, side/sideNight, gallery[]</TableCell>
                  <TableCell>HeroSection (TimeBlendImage 크로스페이드)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>brandValue</code></TableCell>
                  <TableCell>features[] (icon, title, description)</TableCell>
                  <TableCell>BrandValueSection (BrandValueCard x3)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>products</code></TableCell>
                  <TableCell>sectionTitle, sectionSubtitle</TableCell>
                  <TableCell>ProductShowcase</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>footer</code></TableCell>
                  <TableCell>copyright</TableCell>
                  <TableCell>Footer</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Image Pipeline */}
          <SectionTitle title="Image Pipeline → Asset → Component" description="이미지가 생성되어 컴포넌트에 도달하는 흐름" />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 } }>
            <Typography variant="body2" sx={ { fontFamily: 'monospace', whiteSpace: 'pre-line', lineHeight: 2 } }>
              { `generate-product-images.mjs
  ├── PRODUCTS[20] + buildDayPrompt()
  │     → Gemini API → src/assets/product/{id}-day.png
  │     → buildNightPrompt() + day.png 레퍼런스
  │           → Gemini API → src/assets/product/{id}-night.png
  │
  ├── MOODBOARD_SCENES[7] + buildMoodboardPrompt()
  │     → Gemini API → src/assets/brand-mood/{name}.png
  │     → buildMoodboardNightPrompt() + day.png 레퍼런스
  │           → Gemini API → src/assets/brand-mood/{name}-night.png
  │
  └── 결과물
        ├── product/*.png → TimeBlendImage → ProductImageViewer, ProductShowcase
        └── brand-mood/*.png → content.js import → HeroSection 무드보드` }
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            상세 제품 스펙과 프롬프트 구조는 Overview/Image Pipeline 참조
          </Typography>
        </PageContainer>
      </>
    );
  },
};
