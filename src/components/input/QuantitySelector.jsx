import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

/**
 * QuantitySelector 컴포넌트
 *
 * 수량 선택을 위한 - / 숫자 / + 형태의 입력 컴포넌트.
 *
 * Props:
 * @param {number} value - 현재 수량 [Required]
 * @param {function} onChange - 수량 변경 핸들러 (newValue) => void [Required]
 * @param {number} min - 최소 수량 [Optional, 기본값: 1]
 * @param {number} max - 최대 수량 [Optional, 기본값: 99]
 * @param {boolean} isDisabled - 비활성화 여부 [Optional, 기본값: false]
 * @param {string} size - 크기 'small' | 'medium' [Optional, 기본값: 'medium']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <QuantitySelector value={1} onChange={(v) => setQty(v)} />
 */
const QuantitySelector = forwardRef(function QuantitySelector(
  {
    value = 1,
    onChange,
    min = 1,
    max = 99,
    isDisabled = false,
    size = 'medium',
    sx = {},
    ...props
  },
  ref
) {
  const sizeConfig = {
    small: { buttonSize: 32, fontSize: '0.875rem', iconSize: 16, minWidth: 80 },
    medium: { buttonSize: 40, fontSize: '1rem', iconSize: 20, minWidth: 100 },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const handleDecrease = () => {
    if (value > min && onChange) onChange(value - 1);
  };

  const handleIncrease = () => {
    if (value < max && onChange) onChange(value + 1);
  };

  return (
    <Box
      ref={ref}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        minWidth: config.minWidth,
        opacity: isDisabled ? 0.5 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        ...sx,
      }}
      {...props}
    >
      <IconButton
        onClick={handleDecrease}
        disabled={isDisabled || value <= min}
        size={size}
        sx={{
          width: config.buttonSize,
          height: config.buttonSize,
          borderRadius: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': { backgroundColor: 'action.hover' },
          '&:disabled': { color: 'text.disabled' },
        }}
        aria-label="Decrease quantity"
      >
        <RemoveIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>

      <Typography
        component="span"
        sx={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'monospace',
          fontSize: config.fontSize,
          fontWeight: 500,
          color: 'text.primary',
          minWidth: config.buttonSize,
          userSelect: 'none',
        }}
      >
        {value}
      </Typography>

      <IconButton
        onClick={handleIncrease}
        disabled={isDisabled || value >= max}
        size={size}
        sx={{
          width: config.buttonSize,
          height: config.buttonSize,
          borderRadius: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': { backgroundColor: 'action.hover' },
          '&:disabled': { color: 'text.disabled' },
        }}
        aria-label="Increase quantity"
      >
        <AddIcon sx={{ fontSize: config.iconSize }} />
      </IconButton>
    </Box>
  );
});

export default QuantitySelector;
