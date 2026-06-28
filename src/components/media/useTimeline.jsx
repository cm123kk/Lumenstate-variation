import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import defaultTheme from '../../styles/themes/default';
import darkTheme from '../../styles/themes/darkTheme';

/**
 * Timeline Context
 *
 * Lumenstate 시간대 전역 상태 관리.
 * timeline 값(0-1)에 따라 자동으로 라이트/다크 테마 전환.
 *
 * 시간대 매핑:
 * - 0.00 = 12pm (정오) - 라이트
 * - 0.33 = 4pm (오후) - 라이트
 * - 0.50 = 6pm (전환점) - 라이트->다크 경계
 * - 0.67 = 8pm (저녁) - 다크
 * - 1.00 = 12am (자정) - 다크
 */
const TimelineContext = createContext({
  timeline: 0,
  setTimeline: () => {},
  isDarkMode: false,
  timeInfo: {
    hour: 12,
    label: '12pm',
    lux: 480,
    kelvin: 4400,
  },
});

/**
 * useTimeline 커스텀 훅
 *
 * 전역 타임라인 상태에 접근하는 훅.
 *
 * @returns {{ timeline: number, setTimeline: function, isDarkMode: boolean, timeInfo: object, timelineBg: string }}
 *
 * Example usage:
 * const { timeline, setTimeline, isDarkMode, timelineBg } = useTimeline();
 */
export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

/**
 * 시간대별 조도/색온도 매핑 테이블
 */
const TIME_PRESETS = [
  { timeline: 0.00, hour: 12, label: '12pm', lux: 480, kelvin: 4400 },
  { timeline: 0.33, hour: 16, label: '4pm', lux: 380, kelvin: 3800 },
  { timeline: 0.67, hour: 20, label: '8pm', lux: 180, kelvin: 3200 },
  { timeline: 1.00, hour: 24, label: '12am', lux: 80, kelvin: 2700 },
];

/**
 * timeline 값에서 보간된 배경색 계산
 *
 * @param {number} timeline - 0-1 값
 * @returns {string} 보간된 배경색 hex 문자열
 */
const BG_OFFSET_STOPS = [
  { t: 0.00, v: 0 },
  { t: 0.33, v: 8 },
  { t: 0.67, v: 12 },
  { t: 1.00, v: 0 },
];

const getTimelineBg = (timeline) => {
  const t = Math.max(0, Math.min(1, timeline));

  let i = 0;
  for (; i < BG_OFFSET_STOPS.length - 2; i++) {
    if (t < BG_OFFSET_STOPS[i + 1].t) break;
  }
  const from = BG_OFFSET_STOPS[i];
  const to = BG_OFFSET_STOPS[i + 1];
  const range = to.t - from.t;
  const lt = range > 0 ? (t - from.t) / range : 0;
  const offset = Math.round(from.v + (to.v - from.v) * lt);

  const dayR = 0xE8, dayG = 0xE5, dayB = 0xE1;
  const nightR = 0x12, nightG = 0x10, nightB = 0x0E;

  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp(Math.round(dayR + (nightR - dayR) * t) + offset);
  const g = clamp(Math.round(dayG + (nightG - dayG) * t) + offset);
  const b = clamp(Math.round(dayB + (nightB - dayB) * t) + offset);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * timeline 값에서 시간 정보 계산
 *
 * @param {number} timeline - 0-1 값
 * @returns {{ hour: number, label: string, lux: number, kelvin: number }}
 */
const getTimeInfo = (timeline) => {
  const clampedTimeline = Math.max(0, Math.min(1, timeline));

  let lowerIndex = 0;
  for (let i = 0; i < TIME_PRESETS.length - 1; i++) {
    if (clampedTimeline >= TIME_PRESETS[i].timeline &&
        clampedTimeline <= TIME_PRESETS[i + 1].timeline) {
      lowerIndex = i;
      break;
    }
  }

  const lower = TIME_PRESETS[lowerIndex];
  const upper = TIME_PRESETS[Math.min(lowerIndex + 1, TIME_PRESETS.length - 1)];

  const range = upper.timeline - lower.timeline;
  const t = range > 0 ? (clampedTimeline - lower.timeline) / range : 0;

  const lux = Math.round(lower.lux + (upper.lux - lower.lux) * t);
  const kelvin = Math.round(lower.kelvin + (upper.kelvin - lower.kelvin) * t);
  const hour = Math.round(lower.hour + (upper.hour - lower.hour) * t);

  let closestPreset = TIME_PRESETS[0];
  let minDiff = Math.abs(clampedTimeline - TIME_PRESETS[0].timeline);
  for (const preset of TIME_PRESETS) {
    const diff = Math.abs(clampedTimeline - preset.timeline);
    if (diff < minDiff) {
      minDiff = diff;
      closestPreset = preset;
    }
  }

  return { hour, label: closestPreset.label, lux, kelvin };
};

/**
 * TimelineProvider 컴포넌트
 *
 * 전역 타임라인 상태와 테마 자동 전환을 제공하는 Provider.
 *
 * Props:
 * @param {React.ReactNode} children - 자식 컴포넌트 [Required]
 * @param {number} initialTimeline - 초기 timeline 값 [Optional, 기본값: 0]
 *
 * Example usage:
 * <TimelineProvider initialTimeline={0}>
 *   <App />
 * </TimelineProvider>
 */
export const TimelineProvider = ({ children, initialTimeline = 0 }) => {
  const [timeline, setTimelineState] = useState(initialTimeline);

  const setTimeline = useCallback((value) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setTimelineState(clampedValue);
  }, []);

  const isDarkMode = useMemo(() => timeline >= 0.5, [timeline]);
  const timeInfo = useMemo(() => getTimeInfo(timeline), [timeline]);
  const timelineBg = useMemo(() => getTimelineBg(timeline), [timeline]);
  const currentTheme = useMemo(
    () => (isDarkMode ? darkTheme : defaultTheme),
    [isDarkMode]
  );

  const contextValue = useMemo(
    () => ({ timeline, setTimeline, isDarkMode, timeInfo, timelineBg }),
    [timeline, setTimeline, isDarkMode, timeInfo, timelineBg]
  );

  return (
    <TimelineContext.Provider value={contextValue}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TimelineContext.Provider>
  );
};

/**
 * 타임라인 트랜지션 상수
 */
const TIMELINE_TRANSITION = {
  duration: 600,
  easing: 'ease-out',
  css: '600ms ease-out',
};

export { TIME_PRESETS, getTimeInfo, getTimelineBg, TIMELINE_TRANSITION };

export default useTimeline;
