import Box from '@mui/material/Box';
import { TimelineSlider } from '../input/TimelineSlider';
import { useTimeline, TIMELINE_TRANSITION } from '../media/useTimeline';

/**
 * FloatingTimeline 컴포넌트
 *
 * 화면 하단 중앙에 고정되는 플로팅 타임라인 컨트롤러.
 * 전역 TimelineContext를 통해 테마와 제품 이미지 시간대를 조절.
 *
 * Props:
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <FloatingTimeline />
 */
export function FloatingTimeline({ sx }) {
  const { isDarkMode } = useTimeline();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 20, sm: 24, md: 32 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        backgroundColor: isDarkMode
          ? 'rgba(18,16,14,0.45)'
          : 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isDarkMode
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(255,255,255,0.25)',
        borderRadius: { xs: '24px', sm: '28px', md: '32px' },
        boxShadow: isDarkMode
          ? '0 0 12px rgba(0,0,0,0.2)'
          : '0 0 12px rgba(0,0,0,0.06)',
        px: { xs: 2.5, sm: 3, md: 5 },
        py: { xs: 1.5, md: 2 },
        transition: `all ${TIMELINE_TRANSITION.css}`,
        ...sx,
      }}
    >
      <TimelineSlider />
    </Box>
  );
}

export default FloatingTimeline;
