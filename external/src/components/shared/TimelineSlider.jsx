import { forwardRef, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Sun, Sunset, Moon } from 'lucide-react';

import { useTimeline, TIME_PRESETS } from '../../hooks/useTimeline';

/**
 * TimelineSlider 컴포넌트
 *
 * 4개 시간대 아이콘 버튼으로 구성된 미니멀 타임라인 선택기.
 * 클릭으로 시간대를 전환하며 전역 테마와 제품 이미지에 반영.
 *
 * 동작 방식:
 * 1. 4개 아이콘 버튼 (12pm, 4pm, 8pm, 12am) 가로 배치
 * 2. 클릭 시 해당 시간대로 즉시 전환
 * 3. 활성 시간대 아이콘은 강조, 나머지는 흐리게 표시
 *
 * Props:
 * @param {function} onChange - 값 변경 시 콜백 (value: 0-1) [Optional]
 * @param {boolean} showLabels - 시간 라벨 표시 여부 [Optional, 기본값: true]
 * @param {boolean} useGlobalState - 전역 TimelineContext 사용 여부 [Optional, 기본값: true]
 * @param {number} value - 직접 제어 시 timeline 값 [Optional]
 * @param {string} color - 아이콘 색상 강제 지정 [Optional]
 * @param {boolean} disableTransition - 트랜지션 비활성화 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 */
const TimelineSlider = forwardRef(function TimelineSlider({
  onChange,
  showLabels = true,
  useGlobalState = true,
  value: controlledValue,
  color,
  disableTransition = false,
  sx,
  ...props
}, ref) {
  const { timeline: globalTimeline, setTimeline, isDarkMode } = useTimeline();
  const timeline = useGlobalState ? globalTimeline : (controlledValue ?? 0);

  const lineColor = color || (isDarkMode ? '#F2E9DA' : '#12100E');

  const timeMarkers = useMemo(() => [
    { label: '12pm', icon: Sun, preset: TIME_PRESETS[0] },
    { label: '4pm', icon: Sunset, preset: TIME_PRESETS[1] },
    { label: '8pm', icon: Moon, preset: TIME_PRESETS[2] },
    { label: '12am', icon: Moon, preset: TIME_PRESETS[3] },
  ], []);

  const activeMarkerIndex = useMemo(() => {
    let closestIndex = 0;
    let minDiff = Math.abs(timeline - TIME_PRESETS[0].timeline);
    TIME_PRESETS.forEach((preset, index) => {
      const diff = Math.abs(timeline - preset.timeline);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });
    return closestIndex;
  }, [timeline]);

  const handleClick = useCallback((preset) => {
    if (useGlobalState) setTimeline(preset.timeline);
    if (onChange) onChange(preset.timeline);
  }, [useGlobalState, setTimeline, onChange]);

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: { xs: 2, sm: 3, md: 5 },
        ...sx,
      }}
      {...props}
    >
      {timeMarkers.map((marker, index) => {
        const IconComponent = marker.icon;
        const isActive = index === activeMarkerIndex;

        return (
          <ButtonBase
            key={marker.label}
            onClick={() => handleClick(marker.preset)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              p: 1,
              borderRadius: 1,
              transition: disableTransition ? 'none' : 'opacity 200ms',
              opacity: isActive ? 1 : 0.35,
              '&:hover': {
                opacity: isActive ? 1 : 0.6,
              },
            }}
          >
            <IconComponent
              size={20}
              strokeWidth={1.5}
              color={lineColor}
            />
            {showLabels && (
              <Typography
                sx={{
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: lineColor,
                }}
              >
                {marker.label}
              </Typography>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
});

export { TimelineSlider };
export default TimelineSlider;
