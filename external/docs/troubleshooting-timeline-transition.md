# Day/Night 타임라인 전환 트러블슈팅

## 배경

Lumenstate의 Day/Night 전환 시스템은 `timeline` 값(0-1)에 따라 페이지 배경색과 제품 이미지를 동시에 블렌딩한다.
이 과정에서 발생한 시각적 문제들과 해결 과정을 정리한다.

---

## 문제 1: 헤더-컨텐츠, 컨텐츠-푸터 사이 빈 공간

### 증상
GNB(헤더)와 메인 콘텐츠 사이, 그리고 콘텐츠와 푸터 사이에 배경이 적용되지 않은 빈 공간이 보임.

### 원인
Day/Night 배경 레이어가 `PageContainer` 내부의 `<Stack spacing={16}>` 안에 있었음.
`spacing={16}`은 자식 간 128px 마진을 생성하는데, `position: absolute`인 배경 레이어도 이 마진 영향을 받아 컨텐츠와 분리됨.

### 해결
Day/Night 배경 레이어를 개별 페이지에서 제거하고, `AppShell`에 `position: fixed` 레이어 2개로 통합.

```jsx
// AppShell.jsx
{/* Day 배경 (항상 opacity: 1) */}
<Box sx={{ position: 'fixed', inset: 0, backgroundColor: '#E8E5E1', zIndex: 0 }} />
{/* Night 배경 (opacity 블렌딩) */}
<Box sx={{ position: 'fixed', inset: 0, backgroundColor: '#12100E', opacity: timeline,
  transition: `opacity ${TIMELINE_TRANSITION.css}`, zIndex: 0 }} />
```

### 핵심 교훈
- `position: fixed`는 viewport 기준이라 부모 레이아웃(Stack spacing)의 영향을 받지 않음
- 전역 배경은 개별 페이지가 아닌 AppShell 레벨에서 관리해야 일관성 보장

---

## 문제 2: MuiPaper/MuiCard 불투명 배경색 스냅

### 증상
타임라인 전환 중 일부 컴포넌트의 배경색이 부드럽게 전환되지 않고 `timeline=0.5` 지점에서 갑자기 변경됨.

### 원인
MUI 테마 오버라이드에서 `MuiPaper`와 `MuiCard`에 불투명 `backgroundColor`가 설정되어 있었음.
`timeline >= 0.5`에서 라이트→다크 테마가 전환될 때, 이 배경색이 즉시 스냅됨.

```js
// 변경 전
MuiPaper: { styleOverrides: { root: { backgroundColor: '#E8E5E1' } } }  // 라이트
MuiPaper: { styleOverrides: { root: { backgroundColor: '#12100E' } } }  // 다크
```

### 해결
`MuiPaper`와 `MuiCard`의 `backgroundColor`를 `'transparent'`로 변경하여 AppShell 배경이 비치도록 함.

```js
// theme.js, darkTheme.js
MuiPaper: { styleOverrides: { root: { borderRadius: 0, backgroundColor: 'transparent' } } }
```

### 핵심 교훈
- 테마 토큰 기반 `backgroundColor`는 테마 전환 시 **스냅**(즉시 변경)됨
- 연속적 전환이 필요한 영역의 컴포넌트는 배경을 투명하게 두고, 전역 배경 레이어에 의존해야 함

---

## 문제 3: background-color vs opacity 트랜지션 시간차

### 증상
`getTimelineBg()` (offset 보정 포함)로 단일 레이어 `background-color` 전환 시도 시,
배경과 이미지 전환 속도가 달라짐. 잘 되던 제품 페이지까지 시간차 발생.

### 원인
CSS 렌더링 파이프라인의 차이:

| 속성 | 실행 위치 | 특성 |
|------|----------|------|
| `opacity` | GPU compositor thread | 빠르고 안정적, 프레임 드랍 거의 없음 |
| `background-color` | Main thread (CPU) | React 리렌더, 테마 전환 등 메인 스레드 작업과 경쟁 |

이미지의 `opacity` 트랜지션은 GPU에서, 배경의 `background-color` 트랜지션은 CPU에서 실행되어 프레임 단위 미세한 시간차 발생.

### 해결
단일 레이어 `background-color` 방식을 포기하고, **2개 레이어 opacity 블렌딩** 방식으로 전환.
배경도 이미지도 모두 `opacity` 트랜지션을 사용하므로 동일 compositor 파이프라인에서 처리됨.

### 핵심 교훈
- `opacity`와 `transform`만 GPU compositor에서 애니메이션 가능
- `background-color`, `color`, `border-color` 등은 main thread에서 처리
- 동기화가 중요한 요소들은 반드시 **동일한 CSS 속성 유형**의 트랜지션을 사용해야 함

---

## 문제 4: 랜딩페이지에서만 배경-이미지 전환 시차 (핵심 문제)

### 증상
제품 상세 페이지에서는 배경과 이미지가 완벽히 동기화되는데,
랜딩페이지의 제품 카드에서만 배경 전환 속도와 이미지 전환 속도가 다름.

### 원인
`CustomCard`의 hover 스타일이 TimeBlendImage의 opacity 트랜지션을 **덮어씀**.

```jsx
// CustomCard.jsx - getHoverStyles()
'& .custom-card-media img': {
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',  // ← 이것만 선언
}
```

CSS `transition`은 shorthand 속성이다. `transition: transform 0.4s`로 설정하면
**transform만 트랜지션 대상**이 되고, TimeBlendImage가 설정한 `transition: opacity 600ms ease-out`은 완전히 사라진다.

실측 확인:
```
히어로 이미지:    transition: opacity 0.6s ease-out          ← 정상
제품 카드 이미지: transition: transform 0.4s cubic-bezier(...) ← opacity 트랜지션 없음!
```

결과:
- AppShell 배경: `opacity 600ms ease-out`으로 부드럽게 전환
- 제품 카드 이미지: opacity 트랜지션 없이 **즉시 변경**
- → 이미지가 먼저 바뀌고 배경이 뒤따라오는 시차 발생

### 왜 제품 상세 페이지에서는 괜찮았나?
제품 상세 페이지는 `ProductImageViewer` → `TimeBlendImage`를 직접 사용한다.
`CustomCard`를 거치지 않으므로 hover 스타일 오버라이드가 발생하지 않음.

### 해결

```jsx
// CustomCard.jsx - 수정
'& .custom-card-media img, ...': {
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 600ms ease-out',
  //                                                        ^^^^^^^^^^^^^^^^^^^^^^^^ 추가
}
```

transform(hover 확대)과 opacity(Day/Night 블렌딩) 트랜지션을 **함께 선언**하여
hover 효과와 타임라인 전환이 모두 정상 작동.

### 핵심 교훈
- CSS `transition`은 shorthand — 한쪽에서 선언하면 **다른 속성의 트랜지션을 전부 제거**함
- 부모 컴포넌트의 hover 스타일이 자식의 트랜지션을 의도치 않게 덮어쓸 수 있음
- 디버깅 시 **브라우저 DevTools의 computed transition 값**을 직접 확인하는 것이 가장 확실함

---

## 추가 수정: CustomCard 미디어 래퍼 배경색

### 문제
`CustomCard.getMediaStyles()`에 `backgroundColor: 'grey.200'` (불투명)이 설정되어 있어,
이미지 뒤에서 타임라인과 무관하게 고정 색상을 표시. 테마 전환 시 스냅 발생.

### 해결
`backgroundColor: 'grey.200'`을 제거하여 AppShell 배경이 비치도록 함.

---

## 최종 아키텍처

```
AppShell
├── Day 배경 (#E8E5E1, position: fixed, opacity: 1)
├── Night 배경 (#12100E, position: fixed, opacity: timeline, transition: opacity 600ms)
├── GNB (투명 배경)
├── Main Content (투명 컨테이너들)
│   ├── TimeBlendImage (blendedBg 배경 + Day/Night 이미지 opacity 블렌딩)
│   └── 모든 Card/Paper (투명 배경)
└── Footer (투명 배경)
```

**원칙**: 배경은 AppShell 한 곳에서만 관리. 모든 내부 컨테이너는 투명.
모든 시간대 전환 트랜지션은 `opacity` 속성을 사용하여 GPU compositor에서 동기 처리.
