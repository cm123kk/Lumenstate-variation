import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

import { ProductCard } from './ProductCard';
import { products } from '../../data/products';

const sampleProduct = products[0];

export default {
  title: 'Custom Component/product/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## ProductCard

Lumenstate 제품 카드 컴포넌트.

### 특징
- TimeBlendImage로 낮/밤 썸네일 블렌딩 (timeline 0-1)
- 타입 태그 (Ceiling / Stand / Wall / Desk)
- 제품명 + 조도(lx) · 색온도(K) 메타 표시
- Shared Element 전환을 useSharedElement 훅이 자동 처리
- CustomCard 기반 (ghost variant, vertical layout, interactive)
        `,
      },
    },
  },
  argTypes: {
    product: {
      control: 'object',
      description: '제품 데이터 { id, title, type, lux, kelvin, images }',
      table: {
        type: { summary: 'object' },
      },
    },
    timeline: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '시간대 값 (0=낮, 1=밤)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    isSelected: {
      control: 'boolean',
      description: '선택 상태',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hoverMediaScale: {
      control: { type: 'number', min: 1, max: 1.3, step: 0.01 },
      description: 'hover 시 미디어 확대 비율',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1.05' },
      },
    },
    sx: {
      control: 'object',
      description: '추가 스타일',
      table: {
        type: { summary: 'object' },
      },
    },
    onClick: {
      action: 'clicked',
      description: '카드 클릭 핸들러 (transition 시작 후 호출)',
      table: {
        type: { summary: 'function' },
      },
    },
  },
};

/** 기본 사용 */
export const Default = {
  args: {
    product: sampleProduct,
    timeline: 0,
    isSelected: false,
    hoverMediaScale: 1.05,
  },
  render: (args) => (
    <Box sx={{ width: 280 }}>
      <ProductCard {...args} />
    </Box>
  ),
};

/** 타임라인 연동 (낮/밤 블렌딩) */
export const WithTimeline = {
  render: function WithTimelineDemo() {
    const [timeline, setTimeline] = useState(0);

    return (
      <Stack spacing={3} sx={{ width: 280 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Day (0)</Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {timeline.toFixed(2)}
            </Typography>
            <Typography variant="caption">Night (1)</Typography>
          </Box>
          <Slider
            value={timeline}
            onChange={(e, v) => setTimeline(v)}
            min={0}
            max={1}
            step={0.01}
          />
        </Box>
        <ProductCard product={sampleProduct} timeline={timeline} />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '슬라이더로 timeline 값을 조절하면 썸네일이 낮↔밤 이미지로 블렌딩됩니다.',
      },
    },
  },
};

/** 타입별 제품 카드 */
export const TypeVariants = {
  render: () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 3,
        width: 800,
      }}
    >
      {products.slice(0, 4).map((product) => (
        <ProductCard key={product.id} product={product} timeline={0.3} />
      ))}
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ceiling, Stand, Wall, Desk 등 타입별 태그 표시를 비교합니다.',
      },
    },
  },
};

/** 선택 상태 */
export const SelectedState = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Stack spacing={1} sx={{ width: 240 }}>
        <Typography variant="caption" color="text.secondary">
          Default
        </Typography>
        <ProductCard product={sampleProduct} isSelected={false} />
      </Stack>
      <Stack spacing={1} sx={{ width: 240 }}>
        <Typography variant="caption" color="text.secondary">
          Selected
        </Typography>
        <ProductCard product={sampleProduct} isSelected={true} />
      </Stack>
    </Stack>
  ),
};

/** Hover 확대 비율 */
export const HoverScale = {
  render: () => (
    <Stack direction="row" spacing={3}>
      <Stack spacing={1} sx={{ width: 240 }}>
        <Typography variant="caption" color="text.secondary">
          scale 1.00 (none)
        </Typography>
        <ProductCard product={products[0]} hoverMediaScale={1.0} />
      </Stack>
      <Stack spacing={1} sx={{ width: 240 }}>
        <Typography variant="caption" color="text.secondary">
          scale 1.05 (default)
        </Typography>
        <ProductCard product={products[1]} hoverMediaScale={1.05} />
      </Stack>
      <Stack spacing={1} sx={{ width: 240 }}>
        <Typography variant="caption" color="text.secondary">
          scale 1.15
        </Typography>
        <ProductCard product={products[2]} hoverMediaScale={1.15} />
      </Stack>
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: '카드에 hover 시 미디어가 확대되는 비율을 비교합니다.',
      },
    },
  },
};

/** 이미지가 없는 경우 */
export const NoImage = {
  render: () => (
    <Box sx={{ width: 280 }}>
      <ProductCard
        product={{
          id: 'no-image',
          title: 'Lumen Placeholder',
          type: 'ceiling',
          lux: 200,
          kelvin: 3000,
          images: [],
        }}
      />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story: 'images 배열이 비어있을 때 폴백 영역을 표시합니다.',
      },
    },
  },
};
