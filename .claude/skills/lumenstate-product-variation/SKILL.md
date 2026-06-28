---
name: lumenstate-product-variation
description: >-
  Lumenstate 제품 상세페이지의 베리에이션 컷(대표 사진 아래 갤러리 썸네일)을 자동 생성하는 도메인 한정 스킬.
  핵심: src/assets/product/{id}.png(상세페이지에 등록된 낮/대표 이미지)를 Gemini(Nano Banana,
  gemini-3.1-flash-image-preview)에 레퍼런스로 전달하는 image-to-image 방식으로, 대표 사진과 100% 동일한
  제품을 유지한 채 그 제품을 실제 인테리어 공간(product.type 매핑)에 배치하고 각도·줌·디테일 크롭으로 변주한다.
  텍스트로 제품을 새로 그리지 않고(그러면 다른 제품이 나온다), 단색 스튜디오 배경이 아니라 인테리어와 어우러지게 한다.
  off↔on 점등 연속성(낮 밝은 공간 ↔ 야간 어두운 공간의 따뜻한 글로우)을 베이스 테마로 깐다. 컷들은 서로
  독립적이므로 항상 병렬로 생성한다.
  사용자가 Lumenstate 제품 베리에이션, 상세 갤러리 컷, 베리에이션 썸네일 생성을 말하거나, products.js 의 제품을
  대표 사진 기준으로 변주 이미지로 만들어 달라고 하면 — 'Lumenstate', '베리에이션', '제품 컷', 'Nano Banana',
  'gemini image' 중 하나라도 등장하면 — 반드시 이 스킬을 사용한다. Lumenstate 도메인 전용이며 임의 이미지
  생성·일반 목업과 혼동하지 말 것.
---

# Lumenstate Product Variation

제품 상세페이지(`ProductDetailTemplate` / `ProductImageViewer`)의 **대표 사진 아래 갤러리에 깔리는 베리에이션 컷**을 자동 생성한다.

## 핵심 원칙 (가장 중요)

**대표 사진을 레퍼런스 이미지로 전달하는 image-to-image 다.** 텍스트로 제품을 묘사해 새로 그리면(text-to-image) products.js 의 필드(`form`, `glassFinish`…)는 이상화된 값이라 **실제 대표 사진과 다른 제품**이 나온다. 그래서 이 스킬은:

- `src/assets/product/{id}.png` — **상세페이지에 등록된 낮(밝은 배경/소등) 대표 이미지** — 를 모델에 그대로 입력한다.
- 형태·비율·색·재질·마감은 레퍼런스와 **100% 동일**하게 유지한다. 제품을 재설계하거나 부품을 더하지 않는다.
- **이 제품을 실제 인테리어 공간에 배치**한다(단색 스튜디오 배경이 아니라, `product.type` 에 맞는 공간 — CEILING→거실/다이닝 천장 매입 등). 제품이 실제로 설치된 모습으로 보여야 한다.
- 변하는 것은 **각도 · 줌 · 디테일 크롭**(과 점등 상태)뿐. 제품 자체는 모든 컷에서 같다.

즉, 제품 정체성은 레퍼런스로 고정하고(텍스트로 그리지 않음), 그 제품을 공간 속에서 다양한 각도·줌·디테일로 보여준다. 둘 중 하나라도 어기면 — 제품을 텍스트로 그리면 다른 제품이 되고, 단색 배경에 두면 카탈로그 컷이 되어 — 갤러리의 의도가 깨진다.

## 빛의 연속성 (베이스 테마)

기존 에셋 페어가 곧 연속성의 기준이다: `{id}.png`(소등·밝은 배경) ↔ `{id}-1.png`(점등·어두운 배경, 따뜻한 글로우). 베리에이션도 이 off↔on 축을 따른다 — off 컷은 밝은 주간 공간, on 컷은 어두운 저녁/야간 공간에 따뜻한 글로우.

## 병렬 처리 (전제)

컷들은 서로 독립적이다. `scripts/generate.mjs` 는 N개 컷을 **항상 `Promise.all` 로 병렬 생성**한다(순차 아님). 한 컷이 실패해도 나머지는 계속 진행하고, 마지막에 성공/전체 개수를 보고한다. 새 변주축을 추가하더라도 이 병렬 구조를 유지한다.

## 사전 준비

1. **패키지**: `@google/genai` (미설치 시 `pnpm add @google/genai`).
2. **API 키**: [aistudio.google.com](https://aistudio.google.com) 발급 → 프로젝트 루트 `.env.local` 에 `GEMINI_API_KEY=발급키`. `.gitignore` 의 `*.local` 이 이미 제외한다.
3. 미설정 시 스크립트가 **명확한 에러로 즉시 종료**(크레딧·시간 보호).

## 입력

| 인자 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `--product <id>` | ✅ | — | products.js 의 제품 id (1~20). `src/assets/product/{id}.png` 가 레퍼런스가 된다 |
| `--count <N>` | | `4` | 생성할 베리에이션 컷 수 (5면 인물 컷까지 포함, 갤러리 권장) |
| `--only <slug[,slug]>` | | — | 지정 slug 컷만 재생성(count 무시, 다른 컷 파일 보존). 예: `--only detail-crop` |
| `--out <dir>` | | `generated/lumenstate/{id}` | 출력 디렉토리 |
| `--dry-run` | | off | API 호출 없이 조립된 프롬프트만 출력 |

> 재료 옵션(`--glass`/`--hardware`)은 더 이상 받지 않는다. 제품 외형은 **레퍼런스 이미지**가 정의하므로, 텍스트로 재료를 덧씌우면 대표 사진과 어긋난다. 참조하는 products.js 필드는 점등 색온도용 `kelvin` 뿐이다.

## 워크플로우

1. **사전 검사** — 패키지·`GEMINI_API_KEY`. 없으면 즉시 종료.
2. **레퍼런스 로드** — `src/assets/product/{id}.png` 를 base64 로 읽는다. 없으면 종료.
3. **제품 메타 로드** — products.js 에서 `type`(공간 매핑)·`kelvin`(점등 글로우 색온도) 파싱.
4. **컷 레시피 선택** — 인테리어 컨텍스트 × 각도·줌·디테일 크롭 × off/on (아래 매트릭스).
5. **병렬 생성** — 각 컷마다 `[레퍼런스 이미지 + 변주 지시 텍스트]` 를 Gemini 에 보내고, `Promise.all` 로 동시 처리.
6. **저장·보고** — `{out}/{id}-{slug}.{ext}` (확장자는 반환 mimeType 기준). 성공 개수 보고.

```bash
# 프롬프트만 확인 (키·크레딧 불필요)
node .claude/skills/lumenstate-product-variation/scripts/generate.mjs --product 1 --dry-run

# 실제 생성 (4컷 병렬)
node .claude/skills/lumenstate-product-variation/scripts/generate.mjs --product 1 --count 4
```

레시피·톤을 조정하려면 `references/prompt-template.md` 를 읽고 스크립트 상수(`CUT_RECIPES`, `STYLE`, `buildPrompt`)와 **함께** 수정한다.

## 베리에이션 매트릭스 (인테리어 컨텍스트 · 각도·줌·디테일 크롭 · off↔on)

**세 축으로 대비를 크게 한다 — (a) 컷마다 배경(bg)이 다르고, (b) 구도가 와이드↔클로즈↔인물까지 갈리고, (c) 카메라 방향이 좌측 사선↔정면↔우측 사선으로 분산된다.**

| # | slug | 구도 (대비 크게) | 카메라 방향 | 배경(bg) | 점등 |
|---|---|---|---|---|---|
| 1 | `room-wide-day` | 와이드 establishing, 제품 작게·공간 넓게 | **좌측 3/4** | 0 | off |
| 2 | `room-front-lit` | 정면 미디엄, 제품 부각·공간 흐림 | 정면 | 1 | on |
| 3 | `detail-crop` | 매크로 클로즈(특징부·식별 가능), 얕은 심도 | 완만한 3/4 | 2 | off |
| 4 | `angle-low-night` | 완만한 오프앵글(과한 왜곡 X) | **우측 3/4·로우** | 3 | on |
| 5 | `lifestyle-person` | **인물 등장** 라이프스타일(거주 공간), 캔디드 | 반대편 오프축 | 4 | on |

> 평면 마운트(WALL/CEILING)는 `INSTALL_BY_TYPE` 로 설치면 밀착·형태 유지를 강제한다(공중부양·형태 재해석 방지). 발광부는 모든 컷에서 레퍼런스의 깊이·프로파일을 그대로 유지(평평한 패널은 평평하게, 돔은 돔으로).

`N ≤ 5` → 앞에서부터. `N > 5` → 순환 + 접미사. 모든 컷은 **레퍼런스와 동일한 제품**을 공유하며, 변하는 것은 **배경 · 구도 · 점등**이다. 디테일 크롭은 부품을 재배치하지 않도록 지오메트리를 고정하고, 발광 헤드/디퓨저는 모든 컷에서 레퍼런스의 깊이·프로파일을 유지한다. 배경은 `product.type` → 5종 배열에서 컷별로 선택(`references/space-mapping.md`).

## 프롬프트 구조

각 컷의 `contents` = `[ 레퍼런스 이미지(inlineData), 변주 지시 텍스트 ]`. 텍스트는:

1. **고정 지시** — "제공된 이미지를 정확한 제품 레퍼런스로 사용. 기구의 형태·비율·색·재질·마감을 100% 동일하게 유지. 재설계·부품 추가 금지. **이 제품을 아래 인테리어에 실제 설치된 모습으로 자연스럽게 배치**."
2. **Setting** — `product.type` → 인테리어 공간(`references/space-mapping.md`).
3. **Variation** — 컷별 각도·줌·크롭.
4. **Lighting** — off/on + 점등 시 `kelvin` 색온도.
5. **Style** — Lumenstate 인테리어 톤(warm minimal, ambient warmth, flat & quiet).

상세는 `references/prompt-template.md`.

## Gemini 설정

- 모델: `gemini-3.1-flash-image-preview` (Nano Banana 2)
- `ai.models.generateContent({ model, contents: [imagePart, textPart], config })`
- `config.imageConfig`: `{ aspectRatio: '1:1', imageSize: '1K' }` (1K ≈ 1024²; 이 프리뷰는 imageSize 무시하고 1K 반환 — js-genai #1461)
- ⚠️ `outputMimeType` 은 **Developer API 미지원**(Enterprise 전용) → 넣지 말 것. 모델이 JPEG 를 반환하므로 저장 시 `inlineData.mimeType` 으로 확장자를 맞춘다.
- 반환: `response.candidates[0].content.parts[].inlineData.{data,mimeType}`.

## 실패 모드 (의도적 fail-fast)

`GEMINI_API_KEY` 미설정 · 패키지 미설치 · 존재하지 않는 id · `src/assets/product/{id}.png` 부재 → 안내 후 즉시 종료.

## 참조 파일

- `references/prompt-template.md` — 변주 지시 템플릿 전문, 컷 레시피, 톤 어휘집.
- `references/space-mapping.md` — `product.type` → 인테리어 공간 매핑표.
- `references/lighting-mapping.md` — `kelvin` → 점등 색온도 변환표.
