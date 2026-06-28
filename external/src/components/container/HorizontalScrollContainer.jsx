'use client';
import React, { useRef, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { motion, useScroll, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';

/**
 * HorizontalScrollContainer - 가로 스크롤 컨테이너
 *
 * 세로 스크롤을 가로 이동으로 변환하는 순수 컨테이너입니다.
 * snapCount 지정 시 스크롤 감지마다 한 카드씩 이산(discrete) 전환합니다.
 *
 * 동작 원리:
 * 1. 트랙의 실제 렌더링 너비(px)를 측정
 * 2. 가로 이동 거리 = 트랙 scrollWidth - 뷰포트 너비
 * 3. 세로 스크롤 영역 = 뷰포트 높이 + 가로 이동 거리 (px 단위 정확 매핑)
 * 4. scrollYProgress [0→1]을 snap index로 양자화 → spring 전환
 *
 * @param {React.ReactNode} children - HorizontalScrollContainer.Slide로 감싼 슬라이드들 [Required]
 * @param {string} gap - 슬라이드 간 간격 (CSS 단위) [Optional, 기본값: '0px']
 * @param {string} padding - 좌우 패딩 (CSS 단위) [Optional, 기본값: '0px']
 * @param {string} backgroundColor - 배경색 [Optional, 기본값: 'transparent']
 * @param {React.ReactNode} header - 슬라이드 트랙 상단 고정 콘텐츠 [Optional]
 * @param {React.ReactNode} footer - 슬라이드 트랙 하단 고정 콘텐츠 [Optional]
 * @param {string} headerSpacing - header 하단 여백 (CSS 단위) [Optional, 기본값: '0px']
 * @param {string} footerSpacing - footer 상단 여백 (CSS 단위) [Optional, 기본값: '0px']
 * @param {function} onScrollProgress - 스크롤 진행도 콜백 (0-1) [Optional]
 * @param {number} snapCount - 스냅 포인트 수 (슬라이드 개수). 지정 시 이산 스냅 동작 [Optional]
 *
 * Example usage:
 * <HorizontalScrollContainer gap="24px" padding="40px" snapCount={6}>
 *   <HorizontalScrollContainer.Slide>콘텐츠1</HorizontalScrollContainer.Slide>
 *   <HorizontalScrollContainer.Slide>콘텐츠2</HorizontalScrollContainer.Slide>
 * </HorizontalScrollContainer>
 */
function HorizontalScrollContainer({
  children,
  gap = '0px',
  padding = '0px',
  backgroundColor = 'transparent',
  header,
  footer,
  headerSpacing = '0px',
  footerSpacing = '0px',
  onScrollProgress,
  snapCount,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  /** 이산 스냅용 motionValue — snap index 변경 시 spring 애니메이션 */
  const x = useMotionValue(0);
  const animatedProgress = useMotionValue(0);
  const currentIndexRef = useRef(0);

  // 실제 렌더링된 트랙 너비를 측정하여 정확한 스크롤 거리 계산 (px)
  useEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const viewportWidth = window.innerWidth;
      setWindowHeight(window.innerHeight);
      setScrollDistance(Math.max(0, trackWidth - viewportWidth));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [children, gap, padding]);

  // 세로 스크롤 영역 높이 = 뷰포트 높이 + 가로 이동 거리 (px)
  const containerHeight = windowHeight + scrollDistance;

  // 스크롤 진행도 추적
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /** reduced-motion 감지 시 가로 스크롤 효과 비활성화 */
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * scrollYProgress → snap index 양자화 → animatedProgress spring 전환
   *
   * snapCount가 없으면 기존 선형 연속 매핑 유지 (하위 호환)
   * snapCount가 있으면 Math.round로 가장 가까운 index 계산,
   * index 변경 시에만 spring 애니메이션 트리거
   */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!snapCount || snapCount <= 1) {
      x.set(prefersReducedMotion ? 0 : -v * scrollDistance);
      onScrollProgress?.(v);
      return;
    }

    const steps = snapCount - 1;
    const newIndex = Math.min(Math.round(v * steps), steps);

    if (newIndex !== currentIndexRef.current) {
      currentIndexRef.current = newIndex;
      const targetProgress = newIndex / steps;

      if (prefersReducedMotion) {
        animatedProgress.set(targetProgress);
      } else {
        animate(animatedProgress, targetProgress, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        });
      }
    }
  });

  // animatedProgress 변화 → x 위치 + onScrollProgress 콜백 동기화
  useMotionValueEvent(animatedProgress, 'change', (v) => {
    x.set(prefersReducedMotion ? 0 : -v * scrollDistance);
    onScrollProgress?.(v);
  });

  // scrollDistance 변경 시 (리사이즈) x 위치 재계산
  useEffect(() => {
    x.set(prefersReducedMotion ? 0 : -animatedProgress.get() * scrollDistance);
  }, [scrollDistance, x, animatedProgress, prefersReducedMotion]);

  return (
    <Box
      ref={containerRef}
      component="section"
      sx={{
        height: containerHeight,
        position: 'relative',
        minWidth: 0,
      }}
    >
      {/* Sticky 컨테이너 - 화면에 고정 */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor,
          display: 'flex',
          flexDirection: 'column',
          pt: headerSpacing,
          pb: footerSpacing,
        }}
      >
        {/* 상단 고정 콘텐츠 */}
        {header && (
          <Box sx={{ flexShrink: 0, px: padding }}>
            {header}
          </Box>
        )}

        {/* 가로 슬라이드 트랙 */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <motion.div
            ref={trackRef}
            style={{
              x,
              display: 'flex',
              width: 'max-content',
              gap,
              alignItems: 'center',
              height: '100%',
              paddingLeft: padding,
              paddingRight: padding,
            }}
          >
            {children}
          </motion.div>
        </Box>

        {/* 하단 고정 콘텐츠 */}
        {footer && (
          <Box sx={{ flexShrink: 0, px: padding }}>
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * HorizontalScrollContainer.Slide - 슬라이드 아이템
 *
 * @param {React.ReactNode} children - 슬라이드 내부 콘텐츠 [Required]
 */
function Slide({ children }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 'fit-content',
        height: 'fit-content',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

HorizontalScrollContainer.Slide = Slide;

export { HorizontalScrollContainer };
