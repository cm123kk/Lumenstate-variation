---
name: lumenstate-product-variation
description: >-
  Lumenstate 제품 상세페이지의 베리에이션 컷(메인 이미지 아래 갤러리 썸네일)을 일관된 브랜드 톤으로 자동 생성한다.
  src/data/products.js 의 제품 1종과 재료 옵션(glassFinish·hardware)을 받아, 동일 제품을 각도·줌·디테일 크롭으로
  변주하되 "빛의 연속성"(주간→야간 점등) 테마를 베이스로 N장 만들고, Gemini(Nano Banana, gemini-3.1-flash-image-preview)
  이미지 모델로 렌더한다. 모든 컷은 동일 카메라·동일 브랜드 톤·고정 재료를 공유한다.
  사용자가 Lumenstate 제품 베리에이션, 상세 갤러리 컷, 제품 베리에이션 썸네일 생성을 말하거나, products.js 의 제품을
  브랜드 톤에 맞는 이미지로 만들어 달라고 하면 — 'Lumenstate', '베리에이션', '제품 컷', 'Nano Banana', 'gemini image'
  중 하나라도 등장하면 — 반드시 이 스킬을 사용한다. 이 스킬은 Lumenstate 도메인 전용이며, 임의 이미지 생성이나
  일반 목업 요청과 혼동하지 말 것.
---

# Lumenstate Product Variation

Lumenstate 제품 상세페이지(`ProductDetailTemplate` / `ProductImageViewer`)의 **메인 이미지 아래에 깔리는 베리에이션 갤러리 컷**을 자동 생성한다. 메인 hero 컷은 이미 `src/assets/product/{id}.png` 로 존재하므로 **이 스킬은 hero를 만들지 않는다.** 동일 제품을 **각도 · 줌 · 디테일 크롭**으로 변주하고, 그 변주를 **빛의 연속성(주간 → 야간 점등)** 타임라인 위에 배치해, 갤러리를 훑는 행위 자체가 브랜드 가치 *Continuity* 의 체험이 되게 한다.

## 핵심 원칙 (왜 이렇게 하는가)

- **재료는 제품을 정의하는 값 → 한 호출 안에서 고정.** `glassFinish`·`hardware` 는 products.js 의 제품 객체에 들어있지 않고 `PRODUCT_OPTIONS` 의 선택지로만 존재한다. 사용자가 고른 한 조합(기본 `opaline` + `patina-brass` — 상세 템플릿 기본값과 동일)을 받아 N장 내내 바꾸지 않는다. 재료가 컷마다 흔들리면 "같은 제품의 다른 컷"이 아니라 "다른 제품"이 되어 버린다.
- **톤 일관성은 공통 블록 고정으로 보장.** `[Style]` 과 카메라 설정은 매 컷 **동일한 상수**다. 변하는 것은 컷 프레이밍·점등 상태·시간대뿐. 매번 모델에게 톤을 다시 설명하면 컷마다 분위기가 미묘하게 어긋난다 — 그래서 변하는 축만 델타로 주입한다.
- **빛의 연속성이 베이스 테마.** 컷 순서가 곧 하루의 흐름(점등 직전 → 주간 점등 → 재료 디테일 → 야간 확산광)이다.

## 사전 준비

1. **패키지**: `@google/genai` 미설치 시 설치한다 — `pnpm add @google/genai`.
2. **API 키 발급**: [aistudio.google.com](https://aistudio.google.com) 에서 키 발급.
3. **`.env.local`** 에 `GEMINI_API_KEY=발급키` 기입. (프로젝트 루트의 `.gitignore` 는 이미 `*.local` 로 `.env.local` 을 제외하므로 별도 추가 불필요 — 한 번 확인만.)
4. 스크립트는 `process.env.GEMINI_API_KEY` 를 참조하며, **미설정 시 명확한 에러 메시지와 함께 즉시 종료(exit 1)** 한다. 크레딧·시간을 낭비하지 않기 위해 가장 먼저 검사한다.

## 입력

| 인자 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `--product <id>` | ✅ | — | products.js 의 제품 id (1~20) |
| `--glass <value>` | | `opaline` | glassFinish 옵션 (clear/frosted/opaline/amber/smoke) — **고정** |
| `--hardware <value>` | | `patina-brass` | hardware 옵션 (patina-brass/polished-brass/brushed-nickel/matte-black/chrome) — **고정** |
| `--count <N>` | | `4` | 생성할 베리에이션 컷 수 |
| `--out <dir>` | | `generated/lumenstate/{id}` | 출력 디렉토리 |
| `--dry-run` | | off | API 호출 없이 조립된 프롬프트만 출력 (검토·디버그용) |

참조 필드: `type`, `form`, `lightPattern`, `lux`, `kelvin` (+ `glassFinish`·`hardware` 는 인자로 받아 고정).

## 워크플로우

1. **사전 검사** — `@google/genai` 설치 여부, `GEMINI_API_KEY` 존재 여부. 없으면 즉시 안내 후 종료.
2. **제품 로드** — `scripts/generate.mjs` 가 products.js 에서 해당 id 의 `type/form/lightPattern/lux/kelvin/title` 을 읽는다. (products.js 는 png 에셋을 import 하므로 node 에서 직접 import 할 수 없다 → 스크립트가 소스 텍스트에서 필요한 스칼라 필드만 파싱한다.)
3. **해석** — `references/space-mapping.md`(type→공간), `references/lighting-mapping.md`(kelvin·lux·lightPattern→시각 언어) 로 매핑.
4. **베리에이션 매트릭스 확정** — 아래 컷 레시피에서 N개 선택.
5. **프롬프트 조립** — `references/prompt-template.md` 의 5요소 템플릿으로 컷별 프롬프트 생성.
6. **생성·저장** — Gemini 호출 → `{out}/{id}-{cutSlug}.png` 저장.
7. **보고** — 저장 경로 + 각 컷의 프롬프트 로그를 사용자에게 보고.

대부분의 경우 그냥 스크립트를 실행한다:

```bash
# 먼저 프롬프트만 확인 (키·크레딧 불필요)
node .claude/skills/lumenstate-product-variation/scripts/generate.mjs --product 17 --dry-run

# 실제 생성
node .claude/skills/lumenstate-product-variation/scripts/generate.mjs \
  --product 17 --glass opaline --hardware patina-brass --count 4
```

레시피·톤·매핑을 조정해야 하면 스크립트 상수와 짝을 이루는 `references/` 문서를 먼저 읽고, **양쪽을 함께** 수정한다(스크립트가 실제 동작, references 가 그 근거·설명).

## 베리에이션 매트릭스 (hero 제외, 빛의 연속성 베이스)

기본 4컷 — 각도·줌·디테일을 바꾸며 점등 상태가 하루를 따라 흐른다:

| # | 컷 (각도/줌) | 점등 상태 | 시간대 |
|---|---|---|---|
| 1 | 3/4 각도 미드샷, 제품 전체 폼 | 점등 직전 / off, 잔열 같은 미광 | 늦은 오후 |
| 2 | 정면 미디엄, 발광면 중심 | 작업 밝기 on, `lightPattern` 또렷이 | 블루아워 전환 |
| 3 | 재료 디테일 매크로 크롭 | on, hardware 에 부드러운 스페큘러 | 저녁 |
| 4 | 로우앵글 와이드, 공간에 작게 | dim warm on, 표면에 퍼지는 확산광 | 밤 |

`N` 이 4 미만이면 앞에서부터, 초과면 순환하며 인덱스 접미사를 붙인다. 자세한 정의는 `references/prompt-template.md`.

## 5요소 템플릿

`[Style][Subject][Setting][Action][Composition]` — 상세는 `references/prompt-template.md`.

- **[Style]** warm minimal · ambient warmth · editorial·architectural · flat & quiet(글로우/그라데이션/드롭섀도 배제) · 3800K 웜 뉴트럴. *(03-visual-direction 근거, 모든 컷 고정)*
- **[Subject]** `form` + `glassFinish` + `hardware` — **고정**.
- **[Setting]** `type` → 공간 컨텍스트 (CEILING=거실/다이닝, STAND=거실 코너·리딩누크, WALL=복도·침실 벽, DESK=책상·사이드테이블).
- **[Action]** `kelvin`→발광 색온도, `lux`→광량, `lightPattern`→빛 확산 형태 + 시간대.
- **[Composition]** 컷 각도·줌, eye-level 3/4 기조, rule-of-thirds, 1:1. *(카메라 설정 고정)*

## Gemini 설정

- 모델: `gemini-3.1-flash-image-preview` (Nano Banana 2)
- 패키지: `@google/genai`, `ai.models.generateContent({ model, contents, config })`
- `config.imageConfig`: `{ aspectRatio: '1:1', imageSize: '1K' }`
  - ⚠️ `1024px` 요구는 `imageSize: '1K'` 로 매핑된다(SDK 값은 `1K/2K/4K`). 또한 현재 `gemini-3.1-flash-image-preview` 는 `imageSize` 를 무시하고 항상 1K 를 반환하는 알려진 이슈가 있다(js-genai #1461) — 1K(≈1024²)가 기본이므로 실용상 문제 없음.
- 반환 이미지는 `response.candidates[0].content.parts[].inlineData.data` (base64) 에서 읽어 파일로 저장.

## 실패 모드 (의도적으로 빨리 실패)

- `GEMINI_API_KEY` 미설정 → 발급 가이드 출력 후 `exit(1)`.
- 존재하지 않는 `--product` id → 유효 범위 안내 후 종료.
- 유효하지 않은 `--glass`/`--hardware` 값 → 허용 목록 출력 후 종료.

## 참조 파일

- `references/prompt-template.md` — 5요소 템플릿 전문, 컷 레시피, 브랜드 톤 어휘집.
- `references/space-mapping.md` — `product.type` → 공간 컨텍스트 매핑표.
- `references/lighting-mapping.md` — `kelvin`/`lux`/`lightPattern` → 시각 언어 변환표.
