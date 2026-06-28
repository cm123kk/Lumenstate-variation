import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
  TreeNode,
} from '../../components/storybookDocumentation';

export default {
  title: 'Overview/Project Summary',
  parameters: {
    layout: 'padded',
  },
};

export const Default = {
  render: () => {
    const siteMap = {
      'Landing': {
        'Hero': '브랜드 소개 + 무드보드',
        'Brand Value': '핵심 가치 3가지',
        'Product Showcase': '타임라인 + 제품 그리드',
      },
      'Product Detail': {
        'Spec': '제품 스펙 + 이미지',
        'Options': '옵션 선택 + 장바구니',
      },
      'Checkout': {
        'Contact': '연락처',
        'Shipping': '배송지',
        'Payment': '결제',
      },
    };

    return (
      <>
        <DocumentTitle
          title="Project Summary"
          status="Available"
          note="프로젝트 기획 요약"
          brandName="Lumenstate"
          systemName="Brand Guide"
          version="1.0"
        />
        <PageContainer>
          {/* ── 한 줄 요약 ── */}
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Lumenstate
          </Typography>
          <Typography variant="body1" sx={ { mb: 1 } }>
            <strong>Light defines the space.</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
            하루의 빛 변화에 반응하는 건축 조명 브랜드.
            사용자가 타임라인을 조작하면 조명 제품의 낮/밤 모습과 페이지 전체 톤이 함께 전환된다.
          </Typography>

          <Divider sx={ { my: 3 } } />

          {/* ── 무엇을 만드는가 ── */}
          <SectionTitle title="What" />
          <Typography variant="body2" sx={ { mb: 1 } }>
            20개 조명 제품을 판매하는 싱글 브랜드 e-commerce 웹사이트.
          </Typography>
          <Box component="ul" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2">제품 타입: Ceiling · Stand · Wall · Desk</Typography></li>
            <li><Typography variant="body2">각 제품은 Day/Night 이미지 쌍으로 표현</Typography></li>
            <li><Typography variant="body2">옵션: Glass Finish · Hardware · Height</Typography></li>
          </Box>

          {/* ── 핵심 경험 ── */}
          <SectionTitle title="Core Experience" />
          <Typography variant="body2" sx={ { mb: 1 } }>
            <strong>타임라인 슬라이더 (0 → 1 = 정오 → 자정)</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
            슬라이더 하나로 아래 세 가지가 동시에 전환된다.
          </Typography>
          <Box component="ol" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2">제품 이미지: Day 사진 → Night 사진 크로스페이드</Typography></li>
            <li><Typography variant="body2">배경색: #F5F2EE (밝음) → #12100E (어두움)</Typography></li>
            <li><Typography variant="body2">텍스트색: 어두운 글자 → 밝은 글자</Typography></li>
          </Box>

          {/* ── 브랜드 가치 ── */}
          <SectionTitle title="Brand Value" />
          <Box component="ul" sx={ { pl: 2, mb: 4 } }>
            <li><Typography variant="body2"><strong>Immanence</strong> — 공간에 스며드는 빛. 눈부심 없이 건축과 하나 되는 조명.</Typography></li>
            <li><Typography variant="body2"><strong>Continuity</strong> — 낮에서 밤으로 끊김 없는 전환. 조도와 색온도가 하루를 따라간다.</Typography></li>
            <li><Typography variant="body2"><strong>Flexibility</strong> — 평소엔 자동, 필요할 땐 정밀 수동 제어.</Typography></li>
          </Box>

          <Divider sx={ { my: 3 } } />

          {/* ── 사이트 구조 ── */}
          <SectionTitle title="Site Map" />
          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 4 } }>
            <Box sx={ { fontFamily: 'monospace' } }>
              { Object.entries(siteMap).map(([key, value]) => (
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

          {/* ── 비주얼 룰 ── */}
          <SectionTitle title="Visual Rules" />
          <Box component="ul" sx={ { pl: 2, mb: 1 } }>
            <li><Typography variant="body2">색상 4개만 사용. 그래디언트, 글로우, 블러 금지.</Typography></li>
            <li>
              <Typography variant="body2">
                <Box component="span" sx={ { display: 'inline-flex', alignItems: 'center', gap: 0.5 } }>
                  <Box sx={ { width: 10, height: 10, bgcolor: '#F5F2EE', border: '1px solid', borderColor: 'divider', borderRadius: '2px' } } /> #F5F2EE
                  <Box sx={ { width: 10, height: 10, bgcolor: '#F2E9DA', border: '1px solid', borderColor: 'divider', borderRadius: '2px', ml: 1 } } /> #F2E9DA
                  <Box sx={ { width: 10, height: 10, bgcolor: '#12100E', border: '1px solid', borderColor: 'divider', borderRadius: '2px', ml: 1 } } /> #12100E
                  <Box sx={ { width: 10, height: 10, bgcolor: '#FFC66E', border: '1px solid', borderColor: 'divider', borderRadius: '2px', ml: 1 } } /> #FFC66E
                </Box>
              </Typography>
            </li>
            <li><Typography variant="body2">Display: Cormorant Garamond / Body: Pretendard Variable</Typography></li>
            <li><Typography variant="body2">아이콘: lucide-react (1.5px stroke)</Typography></li>
          </Box>
        </PageContainer>
      </>
    );
  },
};
