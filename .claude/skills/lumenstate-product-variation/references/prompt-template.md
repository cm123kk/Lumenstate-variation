# 변주 지시 템플릿 + 컷 레시피 (image-to-image, 인테리어 배치)

`scripts/generate.mjs` 의 `STYLE` / `SPACE_BY_TYPE` / `CUT_RECIPES` / `buildPrompt` 와 짝을 이룬다. 수정 시 이 문서와 스크립트를 **함께** 고친다.

## 큰 그림

이 스킬은 두 가지를 동시에 만족시킨다:

1. **제품은 텍스트로 그리지 않는다.** 상세페이지 대표 이미지(`src/assets/product/{id}.png`, 낮/소등)를 레퍼런스로 모델에 넣어 **형태·비율·색·재질·마감을 100% 동일**하게 유지한다.
2. **그 제품을 실제 인테리어에 배치한다.** 단색 스튜디오 배경이 아니라, `product.type` 에 맞는 공간(거실/다이닝 천장, 거실 코너, 벽, 책상)에 실제 설치된 모습으로 보여준다.

`contents = [ { inlineData: 레퍼런스 PNG }, { text: 변주 지시 } ]`

## 텍스트 5블록

```
1) 고정 지시  제공된 이미지를 정확한 제품 레퍼런스로 사용. 기구의 형태·비율·색·재질·마감을 100% 동일하게.
              재설계/부품 추가·제거 금지. 발광 헤드/디퓨저는 레퍼런스와 같은 깊이·두께·프로파일 그대로
              (평평한 패널이든 엣지 스트립이든 돔 렌즈든) — 없던 깊이·곡률을 더하지 말고(얇은 평면을 드럼/돔으로
              만들지 말 것), 있던 형태를 납작하게 뭉개지도 말 것. 벽/천장 마운트·백플레이트는 레퍼런스만큼
              슬림하게 — 레퍼런스에 없는 두툼한 마운트·브래킷·하우징을 더하거나 키우지 말 것. 실제 설치된 모습으로 배치.
2) Setting      product.type → 인테리어 공간. 컷마다 다른 배경(bg 인덱스). lifestyle 컷은 거주 공간 + 인물. (space-mapping.md)
3) Installation  product.type → 설치 고정. WALL/CEILING 은 면에 밀착·공중부양 금지, WALL 은 정면에 가깝게(실루엣·대칭 유지). (INSTALL_BY_TYPE)
4) Variation    컷별 구도 — 와이드 / 미디엄 / 매크로 클로즈 / 완만한 오프앵글 / 인물 라이프스타일 (대비를 크게).
                + Camera(방위) 고정: 좌측 3/4 → 정면 → 완만한 3/4 → 우측 3/4·로우 → 반대편 오프축 (앵글 분산).
5) Lighting     off / on. on 이면 kelvin 색온도 (references/lighting-mapping.md).
6) Style        Lumenstate 톤(warm minimal, ambient warmth, flat & quiet) + 세트 전체가 같은 ambient 무드로 일관.
```

> 1번(고정 지시)·3번(Installation)·6번(Style)은 타입/공유 상수. 변하는 것은 2번(Setting: **컷마다 배경이 다름**)·4번(구도: **컷마다 대비를 크게**)·5번(점등)이다. 평면 마운트(WALL/CEILING)는 3번 설치 고정으로 형태 재해석·공중부양을 막는다.

## 컷 레시피 (인테리어 컨텍스트 · off↔on 연속성)

off 컷은 밝은 주간 인테리어(`{id}.png` 톤), on 컷은 점등 글로우가 도는 어두운 저녁/야간(`{id}-1.png` 톤):

| slug | 변주 | 점등 | 공간·시간 |
|---|---|---|---|
| `room-3q-day` | 3/4 establishing, 공간 함께 | off | 밝은 주간 |
| `room-front-lit` | 정면 미디엄, 제품 부각 | on | 저녁 글로우 |
| `detail-crop` | 제품 디테일 매크로 크롭, 배경 얕은 심도 | off | 주간 앰비언트 |
| `angle-low-night` | 로우/오프셋 앵글, 공간 함께 | on | 야간 글로우 |
| `detail-glow` | 발광 헤드/디퓨저 매크로 크롭(점등) | on | 저녁 글로우 |

`N ≤ 5` → 앞에서부터. `N > 5` → 순환하며 `-2`, `-3` 접미사. **5컷이면 크롭/줌이 2장**(`detail-crop` off + `detail-glow` on)이 되어 establishing 중복을 피한다.

특정 컷만 다시 만들려면 `--only <slug[,slug]>` 로 해당 컷만 재생성한다(다른 컷 파일은 보존). 예: `--only detail-crop,detail-glow`.

### 디테일 크롭 주의

`detail-crop` / `detail-glow` 는 두 가지를 동시에 지켜야 한다:

1. **단일 프레임 하나** — "collage / grid of multiple shots" 를 명시적으로 금지하지 않으면 모델이 4분할 콜라주를 만든다(실제 발생). `view` 에 "ONE continuous frame, never a collage or grid" 를 유지.
1-b. **레퍼런스 동일성 우선(줌/크롭 자유)** — 디테일 컷은 **얼마든지 타이트하게 줌/크롭해도 된다.** 단 하나의 기준은 *보이는 부분이 레퍼런스의 해당 부분과 정확히 동일*(형태·비율·배열·재질·마감)할 것. 부품을 재포즈·재배열·재해석하지 말고, 모듈 조립품은 잘린 영역의 타일 형태·배열을 레퍼런스 그대로(더 가깝게만) 보여준다. 정면에 가깝게 잡으면 평면 제품의 일치가 가장 잘 보인다. (전체가 식별돼야 한다는 제약은 두지 않는다 — 제품만 동일하면 됨.)
2. **지오메트리 보존(중요)** — 타이트 크롭은 전체 형태 맥락을 잃어 모델이 부품을 **재배치/재부착**한다(실제 발생: 아치 램프의 발광 디스크가 팁이 아니라 수직 기둥 중간에 붙고 베이스가 정육면체로 바뀜). `view` 는 "a genuine photographic crop of the reference geometry, NOT a redrawn detail" + "do not relocate, reattach, duplicate, straighten or invent any part" 로 부품 위치를 고정한다. 모호한 "edge and surface" 대신 **실재하는 특정 부품**(발광 헤드, 암-베이스 접합부)을 크롭 대상으로 지목한다. 배경은 얕은 심도(shallow DoF)로 흐린다.

## 조립 예 (id 1 Lumen Desk Pro, CEILING, `room-3q-day`)

```
Use the provided image as the exact product reference. Keep the fixture itself — its shape, proportions,
color, material and finish — 100% identical to the reference. Do not redesign it or add/remove parts.
Place this exact fixture naturally into the interior described below, as it would really be installed.
Setting: the fixture is flush-mounted to the ceiling of a calm living-and-dining room with low warm-toned
furniture below.
Variation: a three-quarter establishing angle showing the fixture within its room. Framing: medium-wide,
the surrounding interior visible around it; square 1:1.
Lighting: daylight, the fixture unlit / off, the room bright and airy.
Style: Editorial architectural interior photography in the Lumenstate brand tone: warm minimal, ambient
warmth, flat and quiet. ...
```

## 병렬 처리

컷은 서로 독립적이므로 `generate.mjs` 가 `Promise.all` 로 동시에 생성한다. 레시피를 늘려도 병렬 구조를 유지한다.
