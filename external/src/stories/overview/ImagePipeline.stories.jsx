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
} from '../../components/storybookDocumentation';

/** 플로우 노드 박스 */
const Node = ({ label, sub, color = 'text.primary', bgcolor = 'background.paper', border = true }) => (
  <Box sx={ {
    px: 1.5,
    py: 1,
    border: border ? '1px solid' : 'none',
    borderColor: 'divider',
    borderRadius: 1,
    bgcolor,
    minWidth: 100,
    textAlign: 'center',
    flexShrink: 0,
  } }>
    <Typography variant="caption" sx={ { fontWeight: 600, color, fontFamily: 'monospace', display: 'block', lineHeight: 1.3 } }>
      { label }
    </Typography>
    { sub && (
      <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '10px', display: 'block', mt: 0.3 } }>
        { sub }
      </Typography>
    ) }
  </Box>
);

/** 화살표 */
const Arrow = ({ label, vertical = false }) => (
  <Box sx={ {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems: 'center',
    gap: 0.3,
    flexShrink: 0,
    ...(vertical ? { py: 0.5 } : { px: 0.5 }),
  } }>
    <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '16px', lineHeight: 1 } }>
      { vertical ? '\u2193' : '\u2192' }
    </Typography>
    { label && (
      <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '9px', whiteSpace: 'nowrap' } }>
        { label }
      </Typography>
    ) }
  </Box>
);

/** 색상 인라인 뱃지 */
const ColorBadge = ({ hex, label }) => (
  <Box sx={ { display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 1 } }>
    <Box sx={ { width: 10, height: 10, bgcolor: hex, border: '1px solid', borderColor: 'divider', borderRadius: '2px', flexShrink: 0 } } />
    <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: '10px' } }>{ label || hex }</Typography>
  </Box>
);

/** 플로우 행 (가로 정렬) */
const FlowRow = ({ children }) => (
  <Box sx={ { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 } }>
    { children }
  </Box>
);

export default {
  title: 'Overview/Image Pipeline',
  parameters: {
    layout: 'padded',
  },
};

export const Doc = {
  render: () => {
    return (
      <>
        <DocumentTitle
          title="Image Pipeline"
          status="Available"
          note="제품/무드보드 이미지 생성 파이프라인 (generate-product-images.mjs)"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Image Pipeline
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 1 } }>
            <code>scripts/generate-product-images.mjs</code> — Gemini API를 사용한 제품/무드보드 이미지 생성
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            모든 제품 이미지와 무드보드 이미지는 이 스크립트로 생성됩니다.
          </Typography>

          {/* ─── Pipeline 1: Product Images ─── */}
          <SectionTitle title="Pipeline 1 — Product Images" description="20개 제품의 Day/Night 이미지 쌍 생성" />
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2, overflow: 'auto' } }>

            {/* Day Flow */}
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              STEP 1 — Day
            </Typography>
            <FlowRow>
              <Node label="PRODUCTS[20]" sub="form, formDetail, fillRatio" />
              <Arrow />
              <Node label="buildDayPrompt()" sub="+ CAMERA_ANGLES[mounting]" />
              <Arrow label="text only" />
              <Node label="Gemini API" sub="gemini-3.1-flash" bgcolor="#f5f5f5" />
              <Arrow />
              <Node label="{id}-day.png" sub="3:4, 2K" bgcolor="#E8E5E1" />
            </FlowRow>
            <Box sx={ { display: 'flex', gap: 1, ml: 1, mb: 1.5 } }>
              <ColorBadge hex="#E8E5E1" label="배경 #E8E5E1" />
              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '10px' } }>
                조명 OFF / Bauhaus 정밀도 / 완벽 좌우대칭
              </Typography>
            </Box>

            {/* Arrow down: Day → Night reference */}
            <Box sx={ { display: 'flex', alignItems: 'center', ml: '420px', mb: 0.5 } }>
              <Arrow vertical label="레퍼런스" />
            </Box>

            {/* Night Flow */}
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              STEP 2 — Night
            </Typography>
            <FlowRow>
              <Node label="{id}-day.png" sub="레퍼런스 이미지" bgcolor="#E8E5E1" />
              <Arrow />
              <Node label="buildNightPrompt()" sub="+ lightPatternDetail" />
              <Arrow label="image + text" />
              <Node label="Gemini API" sub="gemini-3.1-flash" bgcolor="#f5f5f5" />
              <Arrow />
              <Node label="{id}-night.png" sub="3:4, 2K" bgcolor="#12100E" color="#F2E9DA" />
            </FlowRow>
            <Box sx={ { display: 'flex', gap: 1, ml: 1, mb: 1 } }>
              <ColorBadge hex="#12100E" label="배경 #12100E" />
              <ColorBadge hex="#FFC66E" label="발광 #FFC66E" />
              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '10px' } }>
                조명 ON / 동일 형태+구도 유지
              </Typography>
            </Box>

            {/* Optional: BG Unify */}
            <Divider sx={ { my: 2 } } />
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              STEP 3 — Background Unify (선택적)
            </Typography>
            <FlowRow>
              <Node label="{id}-day.png" sub="기존 이미지" />
              <Arrow />
              <Node label="bgUnifyDayPrompt()" sub="배경만 #E8E5E1로 교체" />
              <Arrow />
              <Node label="Gemini API" bgcolor="#f5f5f5" />
              <Arrow />
              <Node label="{id}-day.png" sub="배경 통일됨" bgcolor="#E8E5E1" />
            </FlowRow>
          </Box>

          {/* ─── Pipeline 2: Moodboard Images ─── */}
          <SectionTitle title="Pipeline 2 — Moodboard Images" description="브랜드 에디토리얼 씬 생성 (제품 이미지를 레퍼런스로 사용)" />
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2, overflow: 'auto' } }>

            {/* Moodboard Day Flow */}
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              STEP 1 — Moodboard Day
            </Typography>
            <FlowRow>
              <Node label="{id}-day.png" sub="제품 레퍼런스" bgcolor="#E8E5E1" />
              <Arrow />
              <Node label="buildMoodboardPrompt()" sub="+ MOODBOARD_SCENES" />
              <Arrow label="image + text" />
              <Node label="Gemini API" sub="커스텀 비율" bgcolor="#f5f5f5" />
              <Arrow />
              <Node label="{name}.png" sub="3:2 / 3:4 / 16:9" />
            </FlowRow>
            <Box sx={ { display: 'flex', gap: 1, ml: 1, mb: 1.5, flexWrap: 'wrap' } }>
              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '10px' } }>
                Kinfolk/Cereal 에디토리얼 / 뮤트 톤 / 40%+ 여백 / 인물 얼굴 비노출
              </Typography>
            </Box>

            {/* Arrow down */}
            <Box sx={ { display: 'flex', alignItems: 'center', ml: '420px', mb: 0.5 } }>
              <Arrow vertical label="레퍼런스" />
            </Box>

            {/* Moodboard Night Flow */}
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              STEP 2 — Moodboard Night
            </Typography>
            <FlowRow>
              <Node label="{name}.png" sub="Day 무드보드 레퍼런스" />
              <Arrow />
              <Node label="buildMoodboardNightPrompt()" sub="+ nightLightingDescription" />
              <Arrow label="image + text" />
              <Node label="Gemini API" bgcolor="#f5f5f5" />
              <Arrow />
              <Node label="{name}-night.png" sub="동일 비율" bgcolor="#12100E" color="#F2E9DA" />
            </FlowRow>
            <Box sx={ { display: 'flex', gap: 1, ml: 1, mb: 1 } }>
              <Typography variant="caption" sx={ { color: 'text.secondary', fontSize: '10px' } }>
                자연광 제거 / 제품이 유일한 광원 / 92-95% 어두움 / 동일 구도+인물
              </Typography>
            </Box>
          </Box>

          {/* ─── Pipeline 3: Output → Component ─── */}
          <SectionTitle title="Output → Component" description="생성된 이미지가 UI 컴포넌트에 도달하는 경로" />
          <Box sx={ { p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4, overflow: 'auto' } }>
            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              제품 이미지
            </Typography>
            <FlowRow>
              <Node label="assets/product/" sub="{id}-day.png + {id}-night.png" />
              <Arrow />
              <Node label="TimeBlendImage" sub="타임라인(0~1)에 따라 크로스페이드" />
              <Arrow />
              <Node label="ProductImageViewer" />
              <Arrow />
              <Node label="ProductShowcase" sub="제품 그리드" />
            </FlowRow>

            <Divider sx={ { my: 2 } } />

            <Typography variant="caption" sx={ { fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' } }>
              무드보드 이미지
            </Typography>
            <FlowRow>
              <Node label="assets/brand-mood/" sub="{name}.png + {name}-night.png" />
              <Arrow />
              <Node label="content.js" sub="import + moodboard{} 구조" />
              <Arrow />
              <Node label="TimeBlendImage" sub="크로스페이드" />
              <Arrow />
              <Node label="HeroSection" sub="무드보드 그리드" />
            </FlowRow>
          </Box>

          <Divider sx={ { my: 3 } } />

          {/* Style Constants */}
          <SectionTitle title="Style Constants" description="모든 이미지에 공통 적용되는 스타일 상수" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>상수</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>값</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>용도</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>dayBg</code></TableCell>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#E8E5E1', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      <code>#E8E5E1</code>
                    </Box>
                  </TableCell>
                  <TableCell>Day 이미지 배경색</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>nightBg</code></TableCell>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#12100E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      <code>#12100E</code>
                    </Box>
                  </TableCell>
                  <TableCell>Night 이미지 배경색</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>emissionColor</code></TableCell>
                  <TableCell>
                    <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                      <Box sx={ { width: 14, height: 14, bgcolor: '#FFC66E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                      <code>#FFC66E</code>
                    </Box>
                  </TableCell>
                  <TableCell>Night 발광색 (3800K)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>aspectRatio</code></TableCell>
                  <TableCell><code>3:4</code></TableCell>
                  <TableCell>제품 이미지 비율 (세로형)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>resolution</code></TableCell>
                  <TableCell><code>2K</code></TableCell>
                  <TableCell>출력 해상도</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Camera Angles */}
          <SectionTitle title="Camera Angles" description="설치 방식별 카메라 구도 — 모든 제품은 완벽한 좌우 대칭" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>설치 방식</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>카메라 구도</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><code>flush-mount</code></TableCell>
                  <TableCell>아래에서 위로 직접 올려다봄 (천장 부착)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>wall-mount</code></TableCell>
                  <TableCell>벽면에 수직으로 정면 촬영</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>floor-standing</code></TableCell>
                  <TableCell>눈높이에서 정면 촬영</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>freestanding</code></TableCell>
                  <TableCell>눈높이에서 정면 촬영</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Product Catalog */}
          <SectionTitle title="Product Catalog" description="20개 제품 스펙 — 각 제품은 Day/Night 이미지 쌍으로 생성" />
          <TableContainer sx={ { mb: 4 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>형태</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>설치</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>Fill%</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { [
                  { id: 1, form: 'circular ceiling ring', mounting: 'flush-mount', fill: 60 },
                  { id: 2, form: 'parabolic arc floor lamp', mounting: 'floor-standing', fill: 70 },
                  { id: 3, form: 'horizontal rectangular wall sconce', mounting: 'wall-mount', fill: 45 },
                  { id: 4, form: 'slim horizontal linear wall bar', mounting: 'wall-mount', fill: 40 },
                  { id: 5, form: 'flat rectangular wall panel', mounting: 'wall-mount', fill: 40 },
                  { id: 6, form: 'tall vertical cylindrical column', mounting: 'floor-standing', fill: 70 },
                  { id: 7, form: 'square wall panel with rounded corners', mounting: 'wall-mount', fill: 40 },
                  { id: 8, form: 'split disc wall light', mounting: 'wall-mount', fill: 50 },
                  { id: 9, form: 'circular frame with horizontal bisecting bar', mounting: 'wall-mount', fill: 55 },
                  { id: 10, form: 'tall cylindrical column with frosted body', mounting: 'floor-standing', fill: 55 },
                  { id: 11, form: 'arch portal wall light', mounting: 'wall-mount', fill: 40 },
                  { id: 12, form: 'rectangular ceiling panel', mounting: 'flush-mount', fill: 50 },
                  { id: 13, form: 'cylindrical bollard', mounting: 'floor-standing', fill: 55 },
                  { id: 14, form: 'multi-tier horizontal wall fixture', mounting: 'wall-mount', fill: 40 },
                  { id: 15, form: 'modular block composition', mounting: 'freestanding', fill: 45 },
                  { id: 16, form: 'cubic pendant', mounting: 'flush-mount', fill: 45 },
                  { id: 17, form: 'hemisphere desk lamp', mounting: 'freestanding', fill: 40 },
                  { id: 18, form: 'capsule floor lamp', mounting: 'floor-standing', fill: 65 },
                  { id: 19, form: 'stacked disc wall light', mounting: 'wall-mount', fill: 45 },
                  { id: 20, form: 'pyramid prism desk lamp', mounting: 'freestanding', fill: 15 },
                ].map((p) => (
                  <TableRow key={ p.id }>
                    <TableCell>{ p.id }</TableCell>
                    <TableCell>{ p.form }</TableCell>
                    <TableCell>
                      <Chip label={ p.mounting } size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{ p.fill }%</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={ { my: 3 } } />

          {/* Moodboard Scenes */}
          <SectionTitle title="Moodboard Scenes" description="브랜드 무드보드 에디토리얼 씬 (content.js에서 import하는 이미지들)" />
          <TableContainer sx={ { mb: 2 } }>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={ { fontWeight: 600 } }>ID</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>파일명</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>제품</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>비율</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>장소</TableCell>
                  <TableCell sx={ { fontWeight: 600 } }>인물</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { [
                  { id: 'mood-5', name: 'arc-lamp-living', product: '#2 Arc floor lamp', ratio: '3:2', place: '미니멀 거실', person: 'UX 디자이너' },
                  { id: 'mood-6', name: 'column-lamp-studio', product: '#6 Column lamp', ratio: '3:4', place: '크리에이티브 스튜디오', person: '크리에이티브 디렉터' },
                  { id: 'mood-7', name: 'arch-light-gallery', product: '#11 Arch portal', ratio: '3:4', place: '갤러리 복도', person: '건축가' },
                  { id: 'mood-8', name: 'cube-pendant-workshop', product: '#16 Cubic pendant', ratio: '16:9', place: '워크숍', person: '산업 디자이너' },
                  { id: 'mood-9', name: 'capsule-lamp-loft', product: '#18 Capsule lamp', ratio: '16:9', place: '미니멀 로프트', person: '포토그래퍼' },
                  { id: 'mood-10', name: 'split-disc-meditation', product: '#8 Split disc', ratio: '3:4', place: '명상/크리에이티브 룸', person: '그래픽 디자이너' },
                  { id: 'mood-11', name: 'prism-lamp-desk', product: '#20 Pyramid prism', ratio: '16:9', place: '디자이너 작업실', person: '프로덕트 디자이너' },
                ].map((s) => (
                  <TableRow key={ s.id }>
                    <TableCell>{ s.id }</TableCell>
                    <TableCell><code>{ s.name }</code></TableCell>
                    <TableCell>{ s.product }</TableCell>
                    <TableCell>{ s.ratio }</TableCell>
                    <TableCell>{ s.place }</TableCell>
                    <TableCell>{ s.person }</TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 4 } }>
            모든 무드보드 씬은 Day/Night 쌍으로 생성됩니다. 촬영 스타일: Kinfolk/Cereal 매거진 에디토리얼
          </Typography>

          <Divider sx={ { my: 3 } } />

          {/* Prompt Structure */}
          <SectionTitle title="프롬프트 구조" description="4가지 프롬프트 빌더 — 각 빌더가 받는 입력과 생성하는 프롬프트의 핵심 지시" />

          {/* buildDayPrompt */}
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
              <Chip label="buildDayPrompt(product)" size="small" sx={ { fontFamily: 'monospace', fontWeight: 600 } } />
              <Arrow />
              <Chip label="제품 Day 이미지" size="small" variant="outlined" />
            </Box>
            <Box sx={ { display: 'flex', gap: 3, flexWrap: 'wrap' } }>
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>입력 (product 속성)</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `form — 제품 형태명
formDetail — 상세 형태 묘사
mounting — 설치방식 → CAMERA_ANGLES
fillRatio — 프레임 내 제품 비율` }
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>핵심 지시</Typography>
                <Typography variant="caption" sx={ { fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `조명 OFF (순수 조형물)
배경 #E8E5E1 (uniform, seamless)
Bauhaus / Dieter Rams 정밀도
완벽 좌우대칭, 3:4 세로` }
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* buildNightPrompt */}
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
              <Chip label="buildNightPrompt(product)" size="small" sx={ { fontFamily: 'monospace', fontWeight: 600 } } />
              <Typography variant="caption" sx={ { color: 'text.secondary' } }>+ Day 이미지 레퍼런스</Typography>
              <Arrow />
              <Chip label="제품 Night 이미지" size="small" variant="outlined" />
            </Box>
            <Box sx={ { display: 'flex', gap: 3, flexWrap: 'wrap' } }>
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>입력</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `lightPatternDetail — 발광 패턴 묘사
{id}-day.png — 형태 레퍼런스` }
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>핵심 지시</Typography>
                <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 1 } }>
                  <Typography variant="caption" sx={ { fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                    { `조명 ON (유일한 광원)
배경 #12100E, 발광 #FFC66E (3800K)
디퓨저 중심 100%, 가장자리 80%
형태/구도/크기 동일 유지` }
                  </Typography>
                  <Box sx={ { display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.3 } }>
                    <Box sx={ { width: 16, height: 16, bgcolor: '#12100E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                    <Box sx={ { width: 16, height: 16, bgcolor: '#FFC66E', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* buildMoodboardPrompt */}
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
              <Chip label="buildMoodboardPrompt(scene)" size="small" sx={ { fontFamily: 'monospace', fontWeight: 600 } } />
              <Typography variant="caption" sx={ { color: 'text.secondary' } }>+ 제품 이미지 레퍼런스</Typography>
              <Arrow />
              <Chip label="무드보드 Day" size="small" variant="outlined" />
            </Box>
            <Box sx={ { display: 'flex', gap: 3, flexWrap: 'wrap' } }>
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>입력 (scene 속성)</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `compositionType — 구도 (정면/측면)
personDescription — 인물 묘사
lightingDescription — 조명 상태
sceneDescription — 공간 묘사` }
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>핵심 지시</Typography>
                <Typography variant="caption" sx={ { fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `Kinfolk / Cereal 에디토리얼
뮤트 톤, 필름 그레인
40%+ 여백 (네거티브 스페이스)
인물 얼굴 비노출` }
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* buildMoodboardNightPrompt */}
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 } }>
            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 } }>
              <Chip label="buildMoodboardNightPrompt(scene)" size="small" sx={ { fontFamily: 'monospace', fontWeight: 600 } } />
              <Typography variant="caption" sx={ { color: 'text.secondary' } }>+ Day 무드보드 레퍼런스</Typography>
              <Arrow />
              <Chip label="무드보드 Night" size="small" variant="outlined" />
            </Box>
            <Box sx={ { display: 'flex', gap: 3, flexWrap: 'wrap' } }>
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>입력</Typography>
                <Typography variant="caption" sx={ { fontFamily: 'monospace', fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `nightLightingDescription
Day 무드보드 이미지 레퍼런스` }
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="caption" sx={ { fontWeight: 600, display: 'block', mb: 0.5 } }>핵심 지시</Typography>
                <Typography variant="caption" sx={ { fontSize: '11px', display: 'block', color: 'text.secondary', lineHeight: 1.6 } }>
                  { `자연광 완전 제거
제품 = 유일한 광원 (#FFC66E)
전체 92-95% 어두움
구도/인물/가구 위치 동일` }
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={ { my: 3 } } />

          {/* CLI Usage */}
          <SectionTitle title="CLI 사용법" />
          <Box sx={ { p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 } }>
            <Typography variant="body2" sx={ { fontFamily: 'monospace', whiteSpace: 'pre-line', fontSize: '12px', lineHeight: 2 } }>
              { `# 전체 제품 Day→Night 순차 생성
node scripts/generate-product-images.mjs

# 특정 제품만 생성
node scripts/generate-product-images.mjs --ids 1,2,3

# Day 이미지만 생성
node scripts/generate-product-images.mjs --mode day

# Night 이미지만 생성 (기존 Day 이미지 레퍼런스)
node scripts/generate-product-images.mjs --mode night

# 프롬프트만 출력 (API 호출 없음)
node scripts/generate-product-images.mjs --dry-run

# 무드보드 생성
node scripts/generate-product-images.mjs --mode moodboard

# 배경색 통일
node scripts/generate-product-images.mjs --mode bg-unify-day` }
            </Typography>
          </Box>
          <Stack direction="row" spacing={ 1 } sx={ { mb: 4, flexWrap: 'wrap', gap: 1 } }>
            <Chip label="Gemini 3.1 Flash Image Preview" size="small" />
            <Chip label="3초 딜레이 (Rate limit)" size="small" variant="outlined" />
            <Chip label=".env.local → GEMINI_API_KEY" size="small" variant="outlined" />
          </Stack>
        </PageContainer>
      </>
    );
  },
};
