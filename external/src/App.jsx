import { BrowserRouter, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars -- motion.div used in JSX
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { TimelineProvider } from './hooks/useTimeline';
import { CartProvider } from './context/CartContext';
import { SharedTransitionProvider } from './contexts/SharedTransitionContext';
import { SharedElementOverlay } from './components/transition/SharedElementOverlay';
import { AppShell } from './components/navigation/AppShell';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import { products } from './data/products';

/**
 * 페이지 전환 애니메이션 설정 (컴포넌트 외부 정의)
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
 * 제품 상세 페이지 래퍼
 * URL 파라미터에서 productId를 추출하여 해당 제품 데이터 전달
 */
function ProductDetailRoute() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === Number(productId)) || products[0];

  // 샘플 메타 정보 (실제로는 API에서 가져올 수 있음)
  const meta = {
    itemNumber: `LM-${String(product.id).padStart(3, '0')}`,
    leadTime: '4 Weeks',
    shipDate: 'Jan 15, 2025',
  };

  return (
    <ProductDetailPage
      product={{ ...product, price: 1290 }}
      meta={meta}
    />
  );
}

/**
 * 스크롤 복원 컴포넌트
 *
 * AnimatePresence의 motion.div 안에 배치.
 * new page mount 직후 (useLayoutEffect = paint 전) 저장된 스크롤 위치 복원.
 *
 * 타이밍:
 * 1. motion.div mount → LandingPage/ProductDetailPage 렌더 → DOM 생성
 * 2. useLayoutEffect 실행 (paint 전) → 콘텐츠 존재하는 상태에서 scrollTo
 * 3. paint → 페이지가 올바른 스크롤 위치에서 opacity 0→1 fade in
 */
function ScrollRestorer({ scrollMap, pathname }) {
  const lenisRef = useContext(LenisRefContext);

  useLayoutEffect(() => {
    const saved = scrollMap.current[pathname];
    const targetY = saved ? saved.scrollY : 0;

    // 저장된 페이지 높이가 있으면 minHeight로 스크롤 공간 확보
    // (이미지 미로딩 상태에서도 scrollTo가 clamping 당하지 않도록)
    if (saved?.scrollHeight) {
      document.body.style.minHeight = `${saved.scrollHeight}px`;
    }

    // paint 전에 스크롤 복원 (opacity: 0 상태라 사용자에게 jump 안 보임)
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo(0, targetY);
    }

    // 이미지 로딩 + 레이아웃 안정화 후 minHeight 해제
    if (saved?.scrollHeight) {
      const cleanup = setTimeout(() => {
        document.body.style.minHeight = '';
      }, 1000);
      return () => {
        clearTimeout(cleanup);
        document.body.style.minHeight = '';
      };
    }
  }, [scrollMap, pathname, lenisRef]);

  return null;
}

/**
 * 메인 앱 레이아웃 (GNB 포함)
 *
 * 스크롤 관리:
 * - render 중 pathname 변경 감지 → 이전 경로의 scrollY 저장 (콘텐츠 살아있을 때)
 * - ScrollRestorer가 new page mount 후 저장된 위치 복원
 * - 최초 방문 경로: 저장값 없음 → top(0)으로 이동
 */
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollMap = useRef({});
  const prevPathname = useRef(location.pathname);

  // pathname 변경 시 이전 경로의 스크롤 위치 + 페이지 높이 저장
  // useEffect: paint 직후 실행, 이 시점에 old page가 아직 DOM에 있음 (exit 진행 중)
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      scrollMap.current[prevPathname.current] = {
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
      };
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);

  /**
   * Cart 클릭 → /checkout으로 이동
   */
  const handleCartClick = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  return (
    <AppShell onCartClick={handleCartClick}>
      {/* 오버레이: AnimatePresence 바깥 → 페이지 fade와 독립 */}
      <SharedElementOverlay />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {/* mount 직후 스크롤 복원 (paint 전) */}
          <ScrollRestorer scrollMap={scrollMap} pathname={location.pathname} />

          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/product/:productId" element={<ProductDetailRoute />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function App() {
  const lenisRef = useRef(null);

  useEffect(() => {
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
                {/* Checkout - 독립 레이아웃 (GNB 없음) */}
                <Route path="/checkout" element={<CheckoutPage />} />

                {/* Main - AppShell 레이아웃 (GNB 포함) */}
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
