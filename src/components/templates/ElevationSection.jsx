import { useState, useCallback, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { HorizontalScrollContainer } from '../content-transition/HorizontalScrollContainer';
import { elevationSet1Video, elevationSet2Video, elevationSet3Video } from '../../assets/elevation';

/**
 * ElevationSection 컴포넌트
 *
 * 3개의 Elevation 비디오를 가로 스크롤로 배치.
 * 스크롤 진행도에 따라 각 비디오의 프레임이 스크러빙된다.
 *
 * 동작 방식:
 * 1. 연속적인 가로 스크롤 progress (0-1)를 3개 구간에 매핑
 * 2. Set 1: progress 0→0.33 → 비디오 0%→100%
 * 3. Set 2: progress 0.33→0.67 → 비디오 0%→100%
 * 4. Set 3: progress 0.67→1 → 비디오 0%→100%
 *
 * @param {object} sx - 추가 스타일 [Optional]
 */
function ElevationSection({ sx }) {
  const [progress, setProgress] = useState(0);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const video3Ref = useRef(null);

  const onScrollProgress = useCallback((v) => {
    setProgress(v);
  }, []);

  /**
   * 각 비디오의 currentTime을 progress 구간에 매핑
   */
  useEffect(() => {
    const scrub = (ref, start, end) => {
      const video = ref.current;
      if (!video || !video.duration) return;
      const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
      const target = video.duration * t;
      if (Math.abs(video.currentTime - target) > 0.033) {
        video.currentTime = target;
      }
    };

    scrub(video1Ref, 0, 0.33);
    scrub(video2Ref, 0.33, 0.67);
    scrub(video3Ref, 0.67, 1);
  }, [progress]);

  const videos = [
    { src: elevationSet1Video, ref: video1Ref },
    { src: elevationSet2Video, ref: video2Ref },
    { src: elevationSet3Video, ref: video3Ref },
  ];

  return (
    <Box component="section" sx={{ width: '100%', ...sx }}>
      <HorizontalScrollContainer
        gap="0px"
        padding="0px"
        onScrollProgress={onScrollProgress}
      >
        {videos.map((v, i) => (
          <HorizontalScrollContainer.Slide key={i}>
            <Box
              component="video"
              ref={v.ref}
              muted
              playsInline
              preload="auto"
              sx={{
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                display: 'block',
              }}
            >
              <source src={v.src} type="video/mp4" />
            </Box>
          </HorizontalScrollContainer.Slide>
        ))}
      </HorizontalScrollContainer>
    </Box>
  );
}

export { ElevationSection };
export default ElevationSection;
