import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { PRODUCT_TYPES } from '../../data/products';

/**
 * ProductFilter 컴포넌트
 *
 * 제품 타입별 필터링 탭 메뉴.
 * md 이상: 세로 탭, md 미만: 가로 탭(스크롤 가능).
 *
 * Props:
 * @param {string} selected - 현재 선택된 타입 (PRODUCT_TYPES 값 또는 'all') [Optional, 기본값: 'all']
 * @param {function} onChange - 변경 핸들러 (type) => void [Required]
 * @param {boolean} showAll - 'All' 탭 표시 여부 [Optional, 기본값: true]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProductFilter selected="ceiling" onChange={handleFilter} />
 */
export function ProductFilter({ selected = 'all', onChange, showAll = true, sx }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 필터 옵션 정의
  const filterOptions = [
    ...(showAll ? [{ id: 'all', label: 'All' }] : []),
    { id: PRODUCT_TYPES.CEILING, label: 'Ceiling' },
    { id: PRODUCT_TYPES.STAND, label: 'Stand' },
    { id: PRODUCT_TYPES.WALL, label: 'Wall' },
    { id: PRODUCT_TYPES.DESK, label: 'Desk' },
  ];

  const verticalIndicatorSx = {
    left: 0,
    right: 'auto',
    width: 6,
    height: '6px !important',
    borderRadius: '50%',
    marginTop: '13px',
    transition: 'top 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const horizontalIndicatorSx = {
    height: 2,
    borderRadius: 0,
    transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <Box sx={sx}>
      <Tabs
        orientation={isMobile ? 'horizontal' : 'vertical'}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons={false}
        value={selected}
        onChange={(e, newValue) => onChange(newValue)}
        aria-label="product type filter"
        sx={{
          '& .MuiTabs-indicator': isMobile ? horizontalIndicatorSx : verticalIndicatorSx,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            minWidth: isMobile ? 'auto' : 60,
            minHeight: isMobile ? 40 : 32,
            alignItems: isMobile ? 'center' : 'flex-start',
            pl: 2,
            pr: isMobile ? 2 : 1,
            py: 0.75,
            fontSize: '0.8125rem',
          },
          '& .Mui-selected': {
            fontWeight: 600,
          },
        }}
      >
        {filterOptions.map((option) => (
          <Tab key={option.id} label={option.label} value={option.id} />
        ))}
      </Tabs>
    </Box>
  );
}

export default ProductFilter;
