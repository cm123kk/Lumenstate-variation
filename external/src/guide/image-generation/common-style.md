# Lumenstate Product Image — Common Style Guide

Gemini API (Nano Banana 2) 이미지 생성을 위한 공통 비주얼 규칙.
모든 제품 이미지는 이 규칙을 공유한다.

---

## 1. Style Keywords

모든 프롬프트에 포함해야 하는 스타일 키워드:

```
Dieter Rams, Bauhaus, Apple industrial design, geometric, symmetric,
minimalist, photorealistic product photography
```

---

## 2. Composition (구도)

| 항목 | 값 |
|------|-----|
| Aspect Ratio | 3:4 (portrait) |
| Product Fill | 프레임의 40-60% (제품별 `fillRatio` 참조) |
| Alignment | 정중앙 (center-center) |
| Padding | 상하좌우 최소 15% 여백 (제품이 가장자리에 닿지 않도록) |
| Camera Angle | **정면 (straight-on frontal)** — 설치 방식 무관, 항상 정면 |
| Depth of Field | 전체 샤프 (deep focus), 배경 보케 없음 |

### 카메라 각도 (CRITICAL)

**모든 제품은 설치 방식에 관계없이 정면 구도(straight-on frontal view)를 사용한다.**

- 카메라가 제품 면에 수직 (perpendicular)
- 대각선 구도, 3/4 뷰, 기울어진 앵글 금지
- 원근 왜곡(perspective distortion) 최소화

### 패딩 바운더리 (CRITICAL)

제품은 프레임 가장자리에서 최소 15% 안쪽에 위치해야 한다:
- 좌측 여백: 이미지 폭의 15% 이상
- 우측 여백: 이미지 폭의 15% 이상
- 상단 여백: 이미지 높이의 15% 이상
- 하단 여백: 이미지 높이의 15% 이상

---

## 3. Background (배경)

### Day Mode
- **색상**: `#E8E5E1` (Warm Off-White)
- **특징**: 균일한 무한 배경(seamless studio backdrop), 그라데이션 없음
- **바닥면**: 배경과 동일 톤, 수평선 없음 (일체형)

### Night Mode
- **색상**: `#12100E` (Warm Black)
- **특징**: 균일한 무한 배경, 제품 발광에 의한 자연스러운 밝기 변화만 허용
- **바닥면**: 제품 광원에 의해 미세하게 밝아지는 것만 허용

---

## 4. Material Palette (재질)

모든 제품은 2가지 재질만 사용:

| 재질 | 설명 | 표면 |
|------|------|------|
| Frame | Matte black anodized aluminum | 무광, 미세한 메탈 텍스처 |
| Diffuser | White frosted glass / opaline acrylic | 반투명, 부드러운 산란 |

**금지 재질**: 우드, 패브릭, 크롬(광택), 골드, 컬러 도장

---

## 5. Lighting (조명)

### Day Mode — Studio Lighting
- **광원**: 소프트박스, 좌상단에서 균일 확산광
- **그림자**: 제품 아래/뒤로 부드러운 드롭 섀도 (opacity ~15%, blur ~30px)
- **반사**: 없음 (매트 재질이므로 스페큘러 하이라이트 최소화)
- **제품 상태**: 꺼짐 (OFF) — 디퓨저는 불투명한 화이트

### Night Mode — Self-Illumination Only
- **광원**: 제품 자체가 유일한 광원
- **그림자**: 없음 (광원이 제품 내부)
- **주변 영향**: 제품 가까운 벽면/바닥에 따뜻한 앰버 반사광
- **제품 상태**: 켜짐 (ON) — 디퓨저가 앰버 발광

---

## 6. Color Temperature (색온도)

Night Mode 발광색은 **3800K** 색온도를 기준으로 한다:

| 항목 | 값 |
|------|-----|
| 색온도 | 3800K (Warm White) |
| Hex 근사 | `#FFC66E` (앰버-화이트) |
| RGB | R: 255, G: 198, B: 110 |
| 분위기 | 따뜻하지만 과하지 않은 촛불 직전의 온기 |

**발광 강도 가이드:**
- 디퓨저 중심: 100% 밝기 (거의 화이트에 가까운 앰버)
- 디퓨저 가장자리: 80% 밝기 (앰버 톤 강해짐)
- 주변 벽/바닥 반사: 20-30% 밝기 (은은한 앰버 풀)

---

## 7. Watermark (Night Mode Only)

Night Mode 이미지에만 4각 별 워터마크 포함:

- **형태**: 4-pointed star (✦)
- **위치**: 우하단 (right: 5%, bottom: 5%)
- **크기**: 프레임 높이의 ~3%
- **색상**: `#C0B8A8` (밝은 웜 그레이, 반투명)

---

## 8. Forbidden Elements (금지 요소)

프롬프트의 Negative Prompt에 항상 포함:

```
No gradient background, no text, no logos, no brand name,
no environment, no interior, no furniture, no people,
no reflective surfaces, no glossy finish, no chrome,
no lens flare, no bokeh, no color fringing,
no wireframe, no sketch style, no illustration,
no multiple products, no accessories,
no diagonal view, no angled composition, no 3/4 view,
no perspective distortion, no tilted camera, no oblique angle
```

---

## 9. Image Specifications

| 항목 | 값 |
|------|-----|
| Resolution | 1024 x 1365 (3:4) 또는 동비율 |
| Format | PNG (투명 배경 아님) |
| Color Space | sRGB |
| Bit Depth | 8-bit |
| 파일명 규칙 | `{id}.png` (Day), `{id}-1.png` (Night) |

---

## 10. Brand Moodboard Image Specifications

제품 이미지와 별도로, 브랜드 에디토리얼 무드보드 이미지에 적용되는 규칙.

### 이미지 유형 및 비율

| 유형 | Aspect Ratio | 용도 | Grid 배치 |
|------|-------------|------|----------|
| Hero Landscape | **3:2** (실제 출력: 2048×1365) | 히어로 섹션 메인 이미지 | 8/12 컬럼 |
| Portrait | **3:4** (실제 출력: 1792×2400, 즉 56:75) | 히어로 사이드 / 갤러리 | 4/12 컬럼 |

### Grid 높이 매칭 규칙 (CRITICAL)

8:4 그리드에서 양쪽 이미지 높이를 일치시키려면:
- 우측 (4/12): 56:75 (width:height)
- 좌측 (8/12): 가로 2배 → 112:75 ≈ **3:2** (API 지원 비율 중 가장 근사)
- 실제 높이 차이: ~0.45% (~2px at 1200px viewport)

### 표시 규칙 (CRITICAL)

- 모든 이미지는 **원본 비율 그대로** 표시: `width: 100%`, `height: auto`
- `object-fit: cover`로 컨테이너에 억지로 맞추지 않음
- 같은 행에 배치되는 이미지는 동일 비율이거나 수학적으로 높이가 맞는 비율 사용

### 파일 위치 및 네이밍

| 항목 | 값 |
|------|-----|
| 디렉토리 | `src/assets/brand-mood/` |
| Day 파일명 | `{brand-mood-name}.png` (예: `arc-lamp-living.png`) |
| Night 파일명 | `{brand-mood-name}-night.png` (예: `arc-lamp-living-night.png`) |

### 현재 무드보드 이미지 목록

| Name | 비율 | 제품 | 구도 |
|------|------|------|------|
| arc-lamp-living | 3:2 | #2 Arc Floor Lamp | Side, 우측 배치, 좌상단 여백 |
| column-lamp-studio | 3:4 | #6 Column Lamp | Frontal |
| arch-light-gallery | 3:4 | #11 Arch Light | Frontal, 대칭 |
| cube-pendant-workshop | 16:9 | #16 Cube Pendant | Side |
| capsule-lamp-loft | 16:9 | #18 Capsule Lamp | Side |
| split-disc-meditation | 3:4 | #8 Split Disc | Frontal, 대칭 |
| prism-lamp-desk | 16:9 | #20 Prism Lamp | Side |

### Hero 이미지 구도 규칙

히어로 메인 이미지는 좌측 상단에 타이틀 오버레이가 겹치므로:
- 인물+조명: 우측 중앙~하단에 배치
- 좌측 상단: 완전 빈 벽 (구조물, 빔, 천장선 없음)
- 배경 벽: 완전 평평한 단일 면 (코너, 단차 없음)
- 천장: 프레임 내에 보이지 않을 정도로 높게
- 공간: 일반 실내의 2배 이상 규모감
