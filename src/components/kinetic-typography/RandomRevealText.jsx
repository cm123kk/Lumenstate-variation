import { useEffect, useState, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';

/**
 * RandomRevealText 컴포넌트
 *
 * 텍스트의 각 글자를 랜덤 순서로 blur에서 선명하게 전환하며 노출하는 키네틱 타이포그래피.
 * Fisher-Yates 셔플로 랜덤 순서를 생성하고, stagger 간격으로 순차 reveal.
 *
 * 동작 흐름:
 * 1. trigger='mount'면 마운트 즉시 시작. trigger='inview'면 viewport 진입 시 시작.
 * 2. 시작 시 delay만큼 지연 후 stagger 간격으로 각 글자가 순차 reveal.
 * 3. 각 글자는 blur(12px) + opacity(0) → blur(0) + opacity(1) 전환.
 * 4. 한 번 reveal된 후 viewport를 벗어나도 reveal 상태 유지 (replay=true 시 재시작).
 *
 * Props:
 * @param {string} text - 표시할 텍스트 [Required]
 * @param {'mount' | 'inview'} trigger - 애니메이션 시작 트리거 [Optional, 기본값: 'mount']
 *   - 'mount': mount 즉시 시작 (above-the-fold 텍스트용)
 *   - 'inview': viewport 진입 시 시작 (스크롤 후 보이는 텍스트용)
 * @param {number} delay - 애니메이션 시작 지연 (ms). trigger 발화 후 첫 글자가 나타나기까지 [Optional, 기본값: 300]
 * @param {number} stagger - 글자 간 reveal 간격 (ms) [Optional, 기본값: 80]
 * @param {number} threshold - inview 트리거 시 IntersectionObserver threshold [Optional, 기본값: 0.2]
 * @param {boolean} replay - inview 트리거 시 viewport 재진입마다 재생할지 [Optional, 기본값: false]
 * @param {string} variant - MUI Typography variant [Optional]. 미지정 시 부모 스타일 상속.
 *   부모에 이미 `<Typography variant="h1">`이 있다면 variant 없이 사용해 상속하는 것을 권장.
 * @param {object} sx - MUI sx 스타일 [Optional]
 *
 * Example usage:
 * // Above-the-fold (즉시 시작)
 * <RandomRevealText text="Welcome" delay={300} stagger={60} />
 *
 * // 스크롤로 보이는 텍스트 (viewport 진입 시 시작)
 * <RandomRevealText text="Section title" trigger="inview" delay={0} stagger={40} />
 */
function RandomRevealText({
  text,
  trigger = 'mount',
  delay = 300,
  stagger = 80,
  threshold = 0.2,
  replay = false,
  variant,
  sx = {},
}) {
  const containerRef = useRef(null);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [isActive, setIsActive] = useState(trigger === 'mount');

  /** 공백을 제외한 글자의 랜덤 순서 생성 (Fisher-Yates shuffle) */
  const randomOrder = useMemo(() => {
    const indices = text
      .split('')
      .map((char, i) => (char !== ' ' ? i : -1))
      .filter((i) => i !== -1);

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [text]);

  /** trigger='inview'일 때 IntersectionObserver로 viewport 감지 */
  useEffect(() => {
    if (trigger !== 'inview') return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (replay) {
            // 재생 시 reveal 상태 초기화 후 활성화
            setRevealedIndices(new Set());
            setIsActive(false);
            // 다음 tick에 활성화하여 effect가 새로 실행되도록
            requestAnimationFrame(() => setIsActive(true));
          } else {
            setIsActive(true);
            observer.disconnect();
          }
        } else if (replay) {
          setIsActive(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, threshold, replay]);

  /** isActive가 true일 때 stagger 간격으로 순차 reveal */
  useEffect(() => {
    if (!isActive) return;

    const timeouts = [];
    randomOrder.forEach((charIndex, orderIndex) => {
      const timeout = setTimeout(() => {
        setRevealedIndices((prev) => new Set([...prev, charIndex]));
      }, delay + orderIndex * stagger);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [isActive, randomOrder, delay, stagger]);

  return (
    <Box
      ref={containerRef}
      component="span"
      aria-label={text}
      sx={ {
        ...(variant ? { typography: variant } : null),
        ...sx,
      } }
    >
      { text.split('').map((char, index) => {
        const isRevealed = char === ' ' || revealedIndices.has(index);
        return (
          <Box
            component="span"
            key={ index }
            aria-hidden="true"
            sx={ {
              display: 'inline-block',
              opacity: isRevealed ? 1 : 0,
              filter: isRevealed ? 'blur(0px)' : 'blur(12px)',
              transition: 'opacity 1.2s ease-out, filter 1.2s ease-out',
              minWidth: char === ' ' ? '0.3em' : undefined,
            } }
          >
            { char }
          </Box>
        );
      }) }
    </Box>
  );
}

export default RandomRevealText;
