import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import { LumenstateGNB as GNB } from '../navigation/LumenstateGNB';
import { Footer } from '../navigation/Footer';
import { FloatingTimeline } from '../overlay-feedback/FloatingTimeline';
import { useTimeline, TIMELINE_TRANSITION } from '../media/useTimeline';

/**
 * LumenstateShell 컴포넌트
 *
 * Lumenstate 전용 앱 레이아웃 쉘.
 * Day/Night 배경 블렌딩, GNB, Footer, FloatingTimeline을 포함.
 *
 * Props:
 * @param {function} onCartClick - Cart 아이콘 클릭 핸들러 [Optional]
 * @param {function} onSubscribe - 뉴스레터 구독 핸들러 [Optional]
 * @param {node} children - 메인 콘텐츠 영역 [Required]
 * @param {number} headerHeight - 헤더 높이 (px) [Optional, 기본값: 64]
 * @param {boolean} hasHeaderBorder - 헤더 하단 보더 [Optional, 기본값: true]
 * @param {boolean} isHeaderSticky - 헤더 고정 [Optional, 기본값: true]
 * @param {boolean} isHeaderTransparent - 헤더 투명 배경 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <LumenstateShell onCartClick={() => setCartOpen(true)}>
 *   <MainContent />
 * </LumenstateShell>
 */
const LumenstateShell = forwardRef(function LumenstateShell({
  onCartClick,
  onSubscribe,
  children,
  headerHeight = 64,
  hasHeaderBorder = true,
  isHeaderSticky = true,
  isHeaderTransparent = false,
  hideHeaderUntilScroll = false,
  sx,
  ...props
}, ref) {
  const { timeline } = useTimeline();

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        ...sx,
      }}
      {...props}
    >
      {/* Day 배경 (항상 opacity: 1) */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#E8E5E1',
          zIndex: 0,
        }}
      />
      {/* Night 배경 (opacity 블렌딩) */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#12100E',
          opacity: timeline,
          transition: `opacity ${TIMELINE_TRANSITION.css}`,
          zIndex: 0,
        }}
      />

      {/* GNB */}
      <GNB
        onCartClick={onCartClick}
        height={headerHeight}
        hasBorder={hasHeaderBorder}
        isSticky={isHeaderSticky}
        isTransparent={isHeaderTransparent}
        hideUntilScroll={hideHeaderUntilScroll}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: 10, md: 14 },
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Footer onSubscribe={onSubscribe} />

      {/* 글로벌 타임라인 컨트롤러 */}
      <FloatingTimeline />
    </Box>
  );
});

export { LumenstateShell };
