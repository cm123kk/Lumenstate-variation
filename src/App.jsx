import { BrowserRouter, Routes, Route, useNavigate, useLocation, useNavigationType } from 'react-router-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { TimelineProvider } from './components/media/useTimeline';
import { CartProvider } from './components/cart/CartContext';
import { SharedTransitionProvider, useSharedTransition } from './components/motion/SharedTransitionContext';
import { SharedElementOverlay } from './components/motion/SharedElementOverlay';
import { TimeBlendImage } from './components/media/TimeBlendImage';
import { LumenstateShell } from './components/layout/LumenstateShell';
import { makeScrollKey, makeStorageKey } from './utils/scrollKey';
import LandingPage from './stories/page/LandingPage';
import CheckoutPage from './stories/page/CheckoutPage';
import ProductDetailRoute from './stories/page/ProductDetailRoute';

/**
 * 페이지 전환 애니메이션 설정
 */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

/**
 * Lenis ref를 하위 컴포넌트에 전달하기 위한 Context
 */
const LenisRefContext = createContext(null);

/**
 * 스크롤 복원 컴포넌트
 */
function ScrollRestorer({ scrollMap, pathname, navInfoRef }) {
  const lenisRef = useContext(LenisRefContext);
  const navType = useNavigationType(); // 'PUSH' | 'POP' | 'REPLACE'

  useLayoutEffect(() => {
    const fromPathname = navInfoRef.current?.from;

    const isBack = navType === 'POP';
    const isLogicalReverse = fromPathname?.startsWith('/product/') && !pathname.startsWith('/product/');
    const shouldRestore = isBack || isLogicalReverse;

    // 우선순위: sessionStorage(클릭 시점 동기 저장) > scrollMap(이벤트 기반)
    // 키는 viewport 버킷 prefix됨 (PC ↔ 모바일 토글 시 contamination 방지)
    let saved = null;
    if (shouldRestore) {
      try {
        const ss = sessionStorage.getItem(makeStorageKey(pathname));
        if (ss) saved = JSON.parse(ss);
      } catch {
        // ignore
      }
      if (!saved) saved = scrollMap.current[makeScrollKey(pathname)];
    }
    const targetY = saved ? saved.scrollY : 0;

    // 1. 저장된 페이지 높이로 minHeight 확보 (즉시 scrollTo가 clamp되지 않도록)
    if (saved?.scrollHeight) {
      document.documentElement.style.minHeight = `${saved.scrollHeight}px`;
      document.body.style.minHeight = `${saved.scrollHeight}px`;
      // 강제 reflow
      void document.documentElement.offsetHeight;
    }

    // 2. 즉시 scrollTo
    window.scrollTo(0, targetY);
    if (lenisRef?.current) {
      lenisRef.current.resize();
      lenisRef.current.scrollTo(targetY, { immediate: true, force: true });
    }

    // 3. RAF retry — 이미지 로드 등으로 document가 커지는 동안 계속 재시도
    let rafId;
    const startTime = performance.now();
    const retry = () => {
      if (Math.abs(window.scrollY - targetY) < 2) return;
      if (performance.now() - startTime > 500) return;
      window.scrollTo(0, targetY);
      if (lenisRef?.current) {
        lenisRef.current.scrollTo(targetY, { immediate: true, force: true });
      }
      rafId = requestAnimationFrame(retry);
    };
    rafId = requestAnimationFrame(retry);

    // 4. minHeight 해제 (1초 뒤 - 그 사이 content가 자연적으로 차오름)
    const cleanupTimeout = saved?.scrollHeight
      ? setTimeout(() => {
        document.documentElement.style.minHeight = '';
        document.body.style.minHeight = '';
      }, 1000)
      : null;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
      document.documentElement.style.minHeight = '';
      document.body.style.minHeight = '';
    };
  }, [scrollMap, pathname, lenisRef, navType, navInfoRef]);

  return null;
}

/**
 * 메인 앱 레이아웃 (GNB 포함)
 */
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollMap = useRef({});
  const prevPathname = useRef(location.pathname);
  // 마지막 navigation의 { from, to } 정보. ScrollRestorer가 이걸 보고 복원 여부 판단.
  // prevPathname은 useEffect 내에서 업데이트되어 lost되므로 별도 ref로 보관.
  const navInfoRef = useRef({ from: null, to: location.pathname });
  const { triggerReverse } = useSharedTransition();

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      navInfoRef.current = {
        from: prevPathname.current,
        to: location.pathname,
      };

      scrollMap.current[makeScrollKey(prevPathname.current)] = {
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
      };

      const productMatch = prevPathname.current.match(/^\/product\/([^/]+)/);
      const isLeavingProduct = !location.pathname.startsWith('/product/');
      if (productMatch && isLeavingProduct) {
        triggerReverse(`product-${productMatch[1]}`);
      }

      prevPathname.current = location.pathname;
    }
  }, [location.pathname, triggerReverse]);

  // 스크롤 이벤트마다 현재 pathname으로 저장.
  // 주의: pathname 변경 직후 ~ScrollRestorer 작업 종료 시점까지는 save를 잠금
  //       (ScrollRestorer의 scrollTo가 listener를 트리거하여 잘못된 중간 값을 덮어쓰는 것 방지)
  useEffect(() => {
    const pathname = location.pathname;
    const lockedUntil = performance.now() + 700;
    const save = () => {
      if (performance.now() < lockedUntil) return;
      const value = {
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
      };
      scrollMap.current[makeScrollKey(pathname)] = value;
      try {
        sessionStorage.setItem(makeStorageKey(pathname), JSON.stringify(value));
      } catch {
        // ignore
      }
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [location.pathname]);

  const handleCartClick = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  return (
    <LumenstateShell
      onCartClick={handleCartClick}
      hideHeaderUntilScroll={location.pathname === '/'}
    >
      <SharedElementOverlay
        renderContent={(content) => (
          <TimeBlendImage
            dayImage={content.day}
            nightImage={content.night}
            timeline={content.timeline}
            aspectRatio="3/4"
            objectFit="cover"
            sx={{ width: '100%', height: '100%' }}
          />
        )}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <ScrollRestorer
            scrollMap={scrollMap}
            pathname={location.pathname}
            navInfoRef={navInfoRef}
          />

          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/product/:productId" element={<ProductDetailRoute />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </LumenstateShell>
  );
}

function App() {
  const lenisRef = useRef(null);

  useEffect(() => {
    // 브라우저 자동 스크롤 복원 비활성화 (우리 ScrollRestorer가 직접 관리)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis();
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <LenisRefContext.Provider value={lenisRef}>
      <CartProvider>
        <TimelineProvider initialTimeline={0}>
          <SharedTransitionProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/*" element={<AppLayout />} />
              </Routes>
            </BrowserRouter>
          </SharedTransitionProvider>
        </TimelineProvider>
      </CartProvider>
    </LenisRefContext.Provider>
  );
}

export default App;
