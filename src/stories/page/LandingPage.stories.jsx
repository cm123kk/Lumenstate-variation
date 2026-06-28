import Box from '@mui/material/Box';

import LandingPage from './LandingPage';

export default {
  title: 'Page/LandingPage',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## LandingPage

Lumenstate 브랜드의 메인 랜딩 페이지.

### 구성
- **TopSection**: 무드보드 히어로 섹션 (에디토리얼 이미지) + 브랜드 가치 카드
- **ProductShowcase**: 타임라인 슬라이더 연동 제품 그리드

### 기능
- 히어로: 브랜드 무드보드 이미지 (3:2 랜드스케이프 + 56:75 포트레이트)
- 타임라인 슬라이더로 시간대별 제품 이미지 전환
- 배경색은 테마 \`background.default\` 토큰으로 자동 라이트/다크 전환
        `,
      },
    },
  },
  argTypes: {
    sx: {
      control: 'object',
      description: '추가 스타일 객체',
    },
  },
};

/**
 * 기본 사용법 - 전체 랜딩 페이지
 */
export const Default = {
  render: (args) => (
    <Box sx={{ minHeight: '400vh', backgroundColor: 'background.default' }}>
      <LandingPage {...args} />
    </Box>
  ),
};
