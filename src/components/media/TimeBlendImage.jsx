import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { TIMELINE_TRANSITION } from './useTimeline';

/**
 * TimeBlendImage 컴포넌트
 *
 * 12시간 주기(12pm->12am)에 따라 낮/밤 이미지의 opacity를 블렌딩하는 컴포넌트.
 * 두 이미지를 스택으로 렌더링하고 timeline 값에 따라 opacity를 조절한다.
 *
 * 동작 방식:
 * 1. timeline 0-1 값을 12시간 주기로 매핑
 *    - timeline 0.00 = 12pm (정오) -> 완전 낮 이미지
 *    - timeline 0.33 = 4pm (오후) -> 낮 67% + 밤 33%
 *    - timeline 0.67 = 8pm (저녁) -> 낮 33% + 밤 67%
 *    - timeline 1.00 = 12am (자정) -> 완전 밤 이미지
 * 2. 선형 블렌딩: timeline 값이 증가할수록 밤 이미지 opacity 증가
 *
 * Props:
 * @param {string} dayImage - 낮 이미지 소스 (12pm) [Required]
 * @param {string} nightImage - 밤 이미지 소스 (12am) [Required]
 * @param {number} timeline - 시간대 값 (0-1) [Optional, 기본값: 0]
 * @param {string} alt - 이미지 대체 텍스트 [Optional, 기본값: '']
 * @param {string} aspectRatio - 컨테이너 종횡비, 'auto'면 원본 비율 [Optional, 기본값: '1/1']
 * @param {string} objectFit - 이미지 맞춤 방식 [Optional, 기본값: 'cover']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TimeBlendImage
 *   dayImage="/images/product-day.jpg"
 *   nightImage="/images/product-night.jpg"
 *   timeline={0.5}
 *   alt="Product"
 *   aspectRatio="auto"
 * />
 */
export function TimeBlendImage({
  dayImage,
  nightImage,
  timeline = 0,
  alt = '',
  aspectRatio = '1/1',
  objectFit = 'cover',
  sx,
  ...props
}) {
  const { dayOpacity, nightOpacity, blendedBg } = useMemo(() => {
    const nightT = Math.max(0, Math.min(1, timeline));

    const dayR = 0xE8, dayG = 0xE5, dayB = 0xE1;
    const nightR = 0x12, nightG = 0x10, nightB = 0x0E;
    const r = Math.round(dayR + (nightR - dayR) * nightT);
    const g = Math.round(dayG + (nightG - dayG) * nightT);
    const b = Math.round(dayB + (nightB - dayB) * nightT);
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return {
      dayOpacity: 1,
      nightOpacity: nightT,
      blendedBg: hex,
    };
  }, [timeline]);

  const isAutoRatio = aspectRatio === 'auto';

  if (!dayImage && !nightImage) {
    return (
      <Box
        sx={ {
          position: 'relative',
          width: '100%',
          ...(!isAutoRatio && { aspectRatio }),
          backgroundColor: 'grey.200',
          ...sx,
        } }
        { ...props }
      />
    );
  }

  return (
    <Box
      sx={ {
        position: 'relative',
        width: '100%',
        ...(!isAutoRatio && { aspectRatio }),
        overflow: 'hidden',
        backgroundColor: blendedBg,
        ...sx,
      } }
      { ...props }
    >
      {dayImage && (
        <Box
          component="img"
          src={ dayImage }
          alt={ `${alt} - Day` }
          sx={ {
            position: isAutoRatio ? 'relative' : 'absolute',
            ...(isAutoRatio ? {} : { top: 0, left: 0, height: '100%' }),
            width: '100%',
            height: isAutoRatio ? 'auto' : '100%',
            display: 'block',
            objectFit: isAutoRatio ? 'contain' : objectFit,
            opacity: dayOpacity,
            transition: `opacity ${TIMELINE_TRANSITION.css}`,
          } }
        />
      )}

      {nightImage && (
        <Box
          component="img"
          src={ nightImage }
          alt={ `${alt} - Night` }
          sx={ {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: isAutoRatio ? 'contain' : objectFit,
            opacity: nightOpacity,
            transition: `opacity ${TIMELINE_TRANSITION.css}`,
          } }
        />
      )}
    </Box>
  );
}

export default TimeBlendImage;
