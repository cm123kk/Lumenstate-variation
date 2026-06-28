import Box from '@mui/material/Box';

import { HeroSection } from './HeroSection';

export default {
  title: 'Section/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## HeroSection

브랜드 무드보드 이미지와 타이틀을 포함한 에디토리얼 히어로 섹션.

### 구조
- LineGrid 2컬럼 레이아웃 (8:4)
- 좌측 (8/12): 히어로 랜드스케이프 이미지 (3:2) + 브랜드명/태그라인 오버레이
- 우측 (4/12): 포트레이트 무드보드 이미지 (56:75)

### 이미지 비율
- 좌측 3:2, 우측 56:75 → 수학적으로 높이가 ~0.45% 차이 (~2px at 1200px)
- 모든 이미지는 \`width: 100%; height: auto\`로 원본 비율 유지 (cover 크롭 없음)

### 타이틀 오버레이
- 히어로 이미지 좌측 상단에 position: absolute로 겹침
- 이미지 생성 시 좌상단을 빈 벽으로 구성하여 가독성 확보
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
 * 기본 사용법 - 무드보드 에디토리얼 레이아웃
 */
export const Default = {
  render: () => (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <HeroSection />
    </Box>
  ),
};
