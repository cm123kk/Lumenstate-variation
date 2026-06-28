import { ProductVariationGrid } from './ProductVariationGrid';
import { productAssets } from '../../assets/product';

// 이미지 표시 컴포넌트 데모 → 실제 베리에이션 에셋 사용 (Placeholder 예외)
const variationImages = productAssets[11].variations;

export default {
  title: 'Custom Component/ProductVariationGrid',
  component: ProductVariationGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    images: {
      control: 'object',
      description: '베리에이션 이미지 URL 배열',
    },
    alt: {
      control: 'text',
      description: '각 이미지 대체 텍스트 접두',
    },
    columns: {
      control: { type: 'number', min: 2, max: 6 },
      description: '데스크탑 열 수 (1xN 그리드의 N)',
    },
    sx: {
      control: 'object',
      description: '추가 MUI sx 스타일',
    },
  },
};

export const Default = {
  args: {
    images: variationImages,
    alt: 'Lumen Mini variation',
    columns: 5,
  },
};
