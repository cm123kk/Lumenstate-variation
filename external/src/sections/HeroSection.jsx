import { forwardRef, useRef } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { TIMELINE_TRANSITION } from '../hooks/useTimeline';

import LineGrid from '../components/layout/LineGrid';
import { TimeBlendImage } from '../components/media/TimeBlendImage';
import { useTimeline } from '../hooks/useTimeline';
import { useParallax } from '../hooks/useParallax';
import { content } from '../data/content';

/**
 * HeroSection 컴포넌트
 *
 * 브랜드 무드보드 이미지와 타이틀을 포함한 에디토리얼 히어로 섹션.
 * LineGrid를 사용한 2컬럼 레이아웃. 타임라인에 따라 낮/밤 이미지 크로스페이드.
 * 타이틀이 이미지보다 느리게 스크롤되는 패럴럭스 효과 적용.
 *
 * 레이아웃:
 * - 좌측 (8/12): 히어로 랜드스케이프 이미지 (3:2) + 브랜드명/태그라인 오버레이
 * - 우측 (4/12): 포트레이트 무드보드 이미지 (56:75)
 * - 모든 이미지는 원본 비율(width:100%, height:auto)로 표시, cover 크롭 없음
 * - 타임라인 값(0-1)에 따라 TimeBlendImage로 낮↔밤 크로스페이드
 *
 * @param {object} sx - 추가 스타일 [Optional]
 */
const HeroSection = forwardRef(function HeroSection({ sx, ...props }, ref) {
  const { title, subtitle, moodboard } = content.hero;
  const { timeline, isDarkMode } = useTimeline();
  const sectionRef = useRef(null);
  const parallaxY = useParallax(sectionRef, 0.7);

  return (
    <Box
      ref={(node) => {
        sectionRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      sx={{
        width: '100%',
        ...sx,
      }}
      {...props}
    >
      <LineGrid container gap={0} borderColor="action.hover" sx={{ width: '100%' }}>
        {/* Row 1 Left - 히어로 랜드스케이프 + 타이틀 오버레이 (데스크톱만) */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <TimeBlendImage
              dayImage={moodboard.hero}
              nightImage={moodboard.heroNight}
              timeline={timeline}
              alt="Lumenstate brand mood"
              aspectRatio="auto"
            />
            {/* 타이틀 오버레이 - 패럴럭스 (배경보다 느리게) */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                mt: { xs: -4, md: -8 },
                p: { xs: 4, md: 8 },
                transform: `translateY(${parallaxY}px)`,
                willChange: 'transform',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: '2.5rem', sm: '4rem', md: '6rem' },
                  color: isDarkMode ? 'common.white' : 'common.black',
                  transition: `color ${TIMELINE_TRANSITION.css}`,
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.125rem', sm: '1.5rem', md: '3rem' },
                  color: isDarkMode ? 'common.white' : 'common.black',
                  transition: `color ${TIMELINE_TRANSITION.css}`,
                  fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
                  fontWeight: 100,
                  opacity: 0.7,
                  wordSpacing: '0.3em',
                  pl: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Row 1 Right - 포트레이트 무드보드 (모바일: 타이틀 오버레이 포함) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <TimeBlendImage
              dayImage={moodboard.side}
              nightImage={moodboard.sideNight}
              timeline={timeline}
              alt={moodboard.sideAlt}
              aspectRatio="auto"
            />
            {/* 모바일 전용 타이틀 오버레이 */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                justifyContent: 'flex-start',
                p: 4,
                pt: 6,
                transform: `translateY(${parallaxY}px)`,
                willChange: 'transform',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: '2.5rem', sm: '4rem' },
                  color: isDarkMode ? 'common.white' : 'common.black',
                  transition: `color ${TIMELINE_TRANSITION.css}`,
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.125rem', sm: '1.5rem' },
                  color: isDarkMode ? 'common.white' : 'common.black',
                  transition: `color ${TIMELINE_TRANSITION.css}`,
                  fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
                  fontWeight: 100,
                  opacity: 0.7,
                  wordSpacing: '0.3em',
                  pl: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>
        </Grid>

      </LineGrid>
    </Box>
  );
});

export { HeroSection };
export default HeroSection;
