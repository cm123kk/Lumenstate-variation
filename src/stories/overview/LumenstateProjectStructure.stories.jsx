import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  DocumentTitle,
  PageContainer,
  TreeNode,
} from '../../components/storybookDocumentation';
import projectStructure from '../../data/projectStructure.js';

export default {
  title: 'Overview/Lumenstate/04 Project Structure',
  parameters: {
    layout: 'padded',
  },
};

/**
 * 컴포넌트가 아닌 항목(Hook / Context / Data)의 목적·역할 설명.
 * 파일 이름 또는 export 이름을 키로 사용.
 */
const DESCRIPTIONS = {
  // Context / Provider
  CartContext: 'Context · 장바구니 전역 상태 + localStorage 영속',
  SharedTransitionContext: 'Context · 페이지 전환 간 Shared Element 상태 공유',
  TimelineProvider: 'Provider · 전역 시간값(0~1) Provider',
  CartProvider: 'Provider · 장바구니 Provider',
  SharedTransitionProvider: 'Provider · Shared Element 전환 Provider',

  // Hooks
  useCart: 'Hook · 장바구니 상태 소비',
  useTimeline: 'Hook · 전역 시간값 구독',
  useSharedTransition: 'Hook · Shared Element 전환 상태 접근',
  useSharedElement: 'Hook · 공유 엘리먼트 좌표·크기 측정',
  useParallax: 'Hook · 스크롤 기반 패럴럭스 진행도',
  useAppShell: 'Hook · AppShell 반응형 상태',
  useFilterTransition: 'Hook · 필터 변경 시 전환 애니메이션',

  // Data
  products: 'Data · 제품 카탈로그 (20+ 조명 제품)',
  content: 'Data · 브랜드/히어로/네비 카피 중앙 관리',
  componentTokenMap: 'Data · 컴포넌트 ↔ 디자인 토큰 매핑',
  ruleRelationships: 'Data · Rules·Skills 관계 그래프',
  projectStructure: 'Data · 프로젝트 구조 자동 생성 데이터',
};

/** Context/Provider 이름 패턴 */
const isContextName = (name) => /Context$|Provider$/.test(name);

/**
 * 트리 노드를 TreeNode 가 받을 수 있는 중첩 객체로 변환.
 * - 컴포넌트: 중첩 객체 (자식 컴포넌트 포함)
 * - Context/Provider: 자식 유무와 상관없이 리프(설명 문자열)로 표시
 * - Hooks/Data: 리프(설명 문자열)
 */
function nodeToTree(node) {
  const out = {};
  const nameCount = {};

  for (const child of node.children || []) {
    // Context/Provider는 설명만 남기고 하위 탐색 중단
    if (isContextName(child.name)) {
      out[child.name] = DESCRIPTIONS[child.name] || 'Context/Provider';
      continue;
    }
    let key = child.name;
    if (nameCount[key] !== undefined) {
      nameCount[key] += 1;
      key = `${child.name}#${nameCount[key]}`;
    } else {
      nameCount[key] = 0;
    }
    out[key] = nodeToTree(child);
  }

  for (const h of node.hooks || []) {
    out[h.name] = DESCRIPTIONS[h.name] || 'Hook';
  }

  for (const d of node.data || []) {
    out[d.name] = DESCRIPTIONS[d.name] || 'Data';
  }

  return out;
}

/** Project Structure - App.jsx 를 루트로 한 전체 구조 트리 탐색기 */
export const Default = {
  render: () => {
    const root = projectStructure.root;
    const tree = nodeToTree(root);

    return (
      <>
        <DocumentTitle
          title="Project Structure"
          status="Available"
          note="App.jsx 를 루트로 한 전체 컴포넌트 포함 관계"
          brandName="Design System"
          systemName="Lumenstate"
          version="1.0"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Project Structure
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 1 } }>
            클릭하여 펼치기/접기 | <code>src/App.jsx</code> · 재생성: <code>pnpm generate-structure</code>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={ { mb: 3 } }>
            컴포넌트는 중첩 구조로, 컴포넌트가 아닌 항목(Hook · Context · Data)은 목적·역할 설명과 함께 리프로 표시한다.
          </Typography>

          <Box sx={ { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
            <Box sx={ { fontFamily: 'monospace' } }>
              <TreeNode keyName={ root.name } value={ tree } depth={ 0 } defaultOpen />
            </Box>
          </Box>
        </PageContainer>
      </>
    );
  },
};
