import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

import { TimeBlendImage } from './TimeBlendImage';
import { productAssets } from '../../assets/product';

// 테스트용 이미지 (첫 번째 제품의 낮/밤 이미지)
const testImages = productAssets[1]?.images || [];
const dayImage = testImages[0] || '';
const nightImage = testImages[1] || testImages[0] || '';

export default {
  title: 'Custom Component/media/TimeBlendImage',
  component: TimeBlendImage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## TimeBlendImage

12시간 주기(12pm→12am)에 따라 낮/밤 이미지의 opacity를 블렌딩하는 컴포넌트.

### 기능
- timeline 값(0-1)에 따라 낮/밤 이미지 opacity 조절
- 선형 블렌딩: timeline이 증가할수록 밤 이미지 opacity 증가
- aspectRatio="auto" 지원: 원본 이미지 비율 유지

### 시간 매핑
| timeline | 시간대 | 낮 opacity | 밤 opacity |
|----------|--------|------------|------------|
| 0.00 | 12pm (정오) | 100% | 0% |
| 0.33 | 4pm (오후) | 67% | 33% |
| 0.67 | 8pm (저녁) | 33% | 67% |
| 1.00 | 12am (자정) | 0% | 100% |
        `,
      },
    },
  },
  argTypes: {
    dayImage: {
      control: 'text',
      description: '낮 이미지 소스 (12pm)',
    },
    nightImage: {
      control: 'text',
      description: '밤 이미지 소스 (12am)',
    },
    timeline: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '시간대 값 (0=12pm, 1=12am)',
    },
    alt: {
      control: 'text',
      description: '이미지 대체 텍스트',
    },
    aspectRatio: {
      control: 'select',
      options: ['1/1', '4/3', '16/9', '21/9', 'auto'],
      description: '컨테이너 종횡비',
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none'],
      description: '이미지 맞춤 방식',
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 400, maxWidth: '100%' }}>
        <Story />
      </Box>
    ),
  ],
};

/**
 * 기본 사용법
 */
export const Default = {
  args: {
    dayImage,
    nightImage,
    timeline: 0,
    alt: 'Product',
    aspectRatio: '1/1',
    objectFit: 'cover',
  },
};

/**
 * 원본 비율 유지 (aspectRatio="auto")
 */
export const AutoAspectRatio = {
  args: {
    dayImage,
    nightImage,
    timeline: 0.5,
    alt: 'Product',
    aspectRatio: 'auto',
    objectFit: 'contain',
  },
  parameters: {
    docs: {
      description: {
        story: 'aspectRatio="auto"로 원본 이미지 비율을 유지합니다.',
      },
    },
  },
};

/**
 * 인터랙티브 타임라인 데모
 */
export const InteractiveTimeline = {
  render: function InteractiveTimelineDemo() {
    const [timeline, setTimeline] = useState(0);

    const getTimeLabel = (value) => {
      if (value <= 0.16) return '12pm';
      if (value <= 0.5) return '4pm';
      if (value <= 0.83) return '8pm';
      return '12am';
    };

    return (
      <Stack spacing={3}>
        <TimeBlendImage
          dayImage={dayImage}
          nightImage={nightImage}
          timeline={timeline}
          alt="Product"
          aspectRatio="1/1"
        />
        <Box sx={{ px: 1 }}>
          <Slider
            value={timeline}
            onChange={(_, value) => setTimeline(value)}
            min={0}
            max={1}
            step={0.01}
            marks={[
              { value: 0, label: '12pm' },
              { value: 0.33, label: '4pm' },
              { value: 0.67, label: '8pm' },
              { value: 1, label: '12am' },
            ]}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          timeline: {timeline.toFixed(2)} ({getTimeLabel(timeline)})
        </Typography>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '슬라이더로 timeline 값을 조절하여 낮/밤 블렌딩을 확인합니다.',
      },
    },
  },
};

/**
 * 시간대별 상태 비교
 */
export const TimeStates = {
  render: () => (
    <Stack spacing={2}>
      {[
        { timeline: 0, label: '12pm (정오)' },
        { timeline: 0.33, label: '4pm (오후)' },
        { timeline: 0.67, label: '8pm (저녁)' },
        { timeline: 1, label: '12am (자정)' },
      ].map(({ timeline, label }) => (
        <Stack key={timeline} spacing={1}>
          <Typography variant="caption" color="text.secondary">
            {label} - timeline: {timeline}
          </Typography>
          <TimeBlendImage
            dayImage={dayImage}
            nightImage={nightImage}
            timeline={timeline}
            alt="Product"
            aspectRatio="16/9"
          />
        </Stack>
      ))}
    </Stack>
  ),
  decorators: [
    (Story) => (
      <Box sx={{ width: 300 }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '4단계 시간대(12pm, 4pm, 8pm, 12am)별 블렌딩 상태를 비교합니다.',
      },
    },
  },
};

/**
 * 다양한 aspectRatio 비교
 */
export const AspectRatios = {
  render: () => (
    <Stack spacing={3}>
      {['1/1', '4/3', '16/9', 'auto'].map((ratio) => (
        <Stack key={ratio} spacing={1}>
          <Typography variant="caption" color="text.secondary">
            aspectRatio: {ratio}
          </Typography>
          <TimeBlendImage
            dayImage={dayImage}
            nightImage={nightImage}
            timeline={0.5}
            alt="Product"
            aspectRatio={ratio}
          />
        </Stack>
      ))}
    </Stack>
  ),
  decorators: [
    (Story) => (
      <Box sx={{ width: 300 }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: '다양한 aspectRatio 옵션을 비교합니다. "auto"는 원본 비율을 유지합니다.',
      },
    },
  },
};

/**
 * 배경색 매칭 테스트 (offset 조절)
 * - CSS↔이미지 색공간 차이를 offset으로 보정
 * - Overlap/Side-by-side로 실시간 확인
 */
export const BgMatchTest = {
  render: function BgMatchTestDemo() {
    const [timeline, setTimeline] = useState(0.33);
    const [offset4pm, setOffset4pm] = useState(8);
    const [offset8pm, setOffset8pm] = useState(12);

    const t = Math.max(0, Math.min(1, timeline));
    const dayR = 0xE8, dayG = 0xE5, dayB = 0xE1;
    const nightR = 0x12, nightG = 0x10, nightB = 0x0E;

    // 원본 계산값
    const rawR = Math.round(dayR + (nightR - dayR) * t);
    const rawG = Math.round(dayG + (nightG - dayG) * t);
    const rawB = Math.round(dayB + (nightB - dayB) * t);
    const rawHex = `#${rawR.toString(16).padStart(2, '0')}${rawG.toString(16).padStart(2, '0')}${rawB.toString(16).padStart(2, '0')}`;

    // 4-stop 보간: 12pm(0) → 4pm(offset4pm) → 8pm(offset8pm) → 12am(0)
    const getEffectiveOffset = (tVal) => {
      const stops = [
        { t: 0, v: 0 },
        { t: 0.33, v: offset4pm },
        { t: 0.67, v: offset8pm },
        { t: 1, v: 0 },
      ];
      const clamped = Math.max(0, Math.min(1, tVal));
      let i = 0;
      for (; i < stops.length - 2; i++) {
        if (clamped < stops[i + 1].t) break;
      }
      const from = stops[i];
      const to = stops[i + 1];
      const range = to.t - from.t;
      const lt = range > 0 ? (clamped - from.t) / range : 0;
      return Math.round(from.v + (to.v - from.v) * lt);
    };

    const effectiveOffset = getEffectiveOffset(t);
    const clamp = (v) => Math.max(0, Math.min(255, v));
    const adjR = clamp(rawR + effectiveOffset);
    const adjG = clamp(rawG + effectiveOffset);
    const adjB = clamp(rawB + effectiveOffset);
    const adjHex = `#${adjR.toString(16).padStart(2, '0')}${adjG.toString(16).padStart(2, '0')}${adjB.toString(16).padStart(2, '0')}`;

    const day = productAssets[1]?.images[0];
    const night = productAssets[1]?.images[1];

    return (
      <Stack spacing={4}>
        {/* 컨트롤 */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
              timeline: {timeline.toFixed(2)}
            </Typography>
            <Slider
              value={timeline}
              onChange={(_, v) => setTimeline(v)}
              min={0}
              max={1}
              step={0.01}
              marks={[
                { value: 0, label: '12pm' },
                { value: 0.33, label: '4pm' },
                { value: 0.67, label: '8pm' },
                { value: 1, label: '12am' },
              ]}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
              4pm offset: +{offset4pm}
            </Typography>
            <Slider
              value={offset4pm}
              onChange={(_, v) => setOffset4pm(v)}
              min={0}
              max={20}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 8, label: '8' },
                { value: 20, label: '20' },
              ]}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
              8pm offset: +{offset8pm}
            </Typography>
            <Slider
              value={offset8pm}
              onChange={(_, v) => setOffset8pm(v)}
              min={0}
              max={20}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 12, label: '12' },
                { value: 20, label: '20' },
              ]}
            />
          </Box>
          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
            effective: +{effectiveOffset} | raw: {rawHex} → adj: {adjHex}
          </Typography>
        </Stack>

        {/* 1. Overlap 비교: 보정 전 vs 보정 후 */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            1. Overlap — 왼쪽: 보정 전 (raw) / 오른쪽: 보정 후 (+{effectiveOffset})
          </Typography>
          <Stack direction="row" spacing={2}>
            <Box
              sx={{
                flex: 1,
                backgroundColor: rawHex,
                p: 4,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 180 }}>
                <TimeBlendImage
                  dayImage={day}
                  nightImage={night}
                  timeline={timeline}
                  alt="raw"
                  aspectRatio="auto"
                />
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                backgroundColor: adjHex,
                p: 4,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 180 }}>
                <TimeBlendImage
                  dayImage={day}
                  nightImage={night}
                  timeline={timeline}
                  alt="adjusted"
                  aspectRatio="auto"
                />
              </Box>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ flex: 1, textAlign: 'center', fontFamily: 'monospace' }}>
              raw {rawHex}
            </Typography>
            <Typography variant="caption" sx={{ flex: 1, textAlign: 'center', fontFamily: 'monospace' }}>
              +{effectiveOffset} → {adjHex}
            </Typography>
          </Stack>
        </Box>

        {/* 2. Side-by-side 비교: 보정 후만 */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            2. Side-by-side — 이미지 | solid (보정 후)
          </Typography>
          <Stack direction="row" spacing={0}>
            <Box sx={{ width: '50%' }}>
              <TimeBlendImage
                dayImage={day}
                nightImage={night}
                timeline={timeline}
                alt="Image blend"
                aspectRatio="auto"
              />
            </Box>
            <Box
              sx={{
                width: '50%',
                backgroundColor: adjHex,
                minHeight: 200,
              }}
            />
          </Stack>
        </Box>

        {/* 3. 4단계 고정 비교 (보정 적용) */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            3. 4단계 고정 비교 (4pm: +{offset4pm}, 8pm: +{offset8pm})
          </Typography>
          <Stack spacing={2}>
            {[
              { t: 0, label: '12pm' },
              { t: 0.33, label: '4pm' },
              { t: 0.67, label: '8pm' },
              { t: 1, label: '12am' },
            ].map(({ t: tVal, label }) => {
              const eo = getEffectiveOffset(tVal);
              const rr = clamp(Math.round(dayR + (nightR - dayR) * tVal) + eo);
              const gg = clamp(Math.round(dayG + (nightG - dayG) * tVal) + eo);
              const bb = clamp(Math.round(dayB + (nightB - dayB) * tVal) + eo);
              const hex = `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;

              return (
                <Box key={tVal}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', mb: 0.5, display: 'block' }}>
                    {label} (t={tVal}, +{eo}) — {hex}
                  </Typography>
                  <Stack direction="row" spacing={0}>
                    <Box sx={{ width: '50%' }}>
                      <TimeBlendImage
                        dayImage={day}
                        nightImage={night}
                        timeline={tVal}
                        alt={label}
                        aspectRatio="auto"
                      />
                    </Box>
                    <Box
                      sx={{
                        width: '50%',
                        backgroundColor: hex,
                        minHeight: 100,
                      }}
                    />
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    );
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 700, p: 2 }}>
        <Story />
      </Box>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'CSS↔이미지 색공간 차이를 offset 슬라이더로 보정합니다. 경계가 안 보이는 offset 값을 찾으면 getTimelineBg에 적용.',
      },
    },
  },
};

/**
 * Playground - 이미지 정렬 디버그
 */
export const Playground = {
  render: function PlaygroundDemo() {
    const [timeline, setTimeline] = useState(0.5);
    const [showOverlay, setShowOverlay] = useState(true);

    // 1.png, 1-1.png 직접 불러오기
    const day = productAssets[1]?.images[0];
    const night = productAssets[1]?.images[1];

    return (
      <Stack spacing={3}>
        <Typography variant="h6">Playground - 이미지 정렬 테스트</Typography>

        {/* 컨트롤 */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="caption">Timeline: {timeline.toFixed(2)}</Typography>
          <Slider
            value={timeline}
            onChange={(_, v) => setTimeline(v)}
            min={0}
            max={1}
            step={0.01}
            sx={{ width: 200 }}
          />
          <label>
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={(e) => setShowOverlay(e.target.checked)}
            />
            {' '}개별 이미지 표시
          </label>
        </Stack>

        {/* TimeBlendImage 결과 */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            TimeBlendImage (aspectRatio=&quot;auto&quot;)
          </Typography>
          <Box sx={{ border: '1px solid red', display: 'inline-block' }}>
            <TimeBlendImage
              dayImage={day}
              nightImage={night}
              timeline={timeline}
              aspectRatio="auto"
              alt="Test"
            />
          </Box>
        </Box>

        {/* 개별 이미지 비교 */}
        {showOverlay && (
          <Stack direction="row" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                1.png (낮)
              </Typography>
              <Box
                component="img"
                src={day}
                alt="Day"
                sx={{ width: 200, height: 'auto', border: '1px solid blue' }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                1-1.png (밤)
              </Typography>
              <Box
                component="img"
                src={night}
                alt="Night"
                sx={{ width: 200, height: 'auto', border: '1px solid green' }}
              />
            </Box>
          </Stack>
        )}

        {/* 수동 포개기 테스트 */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            수동 포개기 테스트 (position: relative + absolute)
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-block', border: '1px solid orange' }}>
            {/* 낮 이미지 - 공간 확보 */}
            <Box
              component="img"
              src={day}
              alt="Day"
              sx={{
                display: 'block',
                width: 300,
                height: 'auto',
              }}
            />
            {/* 밤 이미지 - 포개기 */}
            <Box
              component="img"
              src={night}
              alt="Night"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: timeline,
              }}
            />
          </Box>
        </Box>
      </Stack>
    );
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 600, p: 2 }}>
        <Story />
      </Box>
    ),
  ],
};
