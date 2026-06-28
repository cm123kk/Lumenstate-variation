# 5요소 프롬프트 템플릿 + 컷 레시피

`scripts/generate.mjs` 의 `STYLE`/`CAMERA`/`CUT_RECIPES`/`buildPrompt` 와 짝을 이룬다. 톤·레시피를 바꾸려면 이 문서와 스크립트를 **함께** 수정한다.

## 템플릿 구조

```
[Style]       모든 컷 고정. 브랜드 톤.
[Subject]     form + glassFinish + hardware. 호출 내 고정.
[Setting]     product.type → 공간 컨텍스트. (space-mapping.md)
[Action]      kelvin + lux + lightPattern + 시간대. 컷마다 변동. (lighting-mapping.md)
[Composition] 컷 각도·줌 + 고정 카메라. (1:1, eye-level 3/4, rule-of-thirds)
```

## [Style] — 고정 톤 (03-visual-direction 근거)

- warm minimal, ambient warmth / editorial · architectural
- flat & quiet: **글로우 블룸·그라데이션 배경·방향성 드롭섀도 금지**
- 3800K 웜 뉴트럴 팔레트, wall-tint 페이퍼 배경, 절제된 여백
- "빛이 주인공, 제품은 매개체" — 차분·정확·매거진 스프레드의 절제

> 왜 고정인가: 컷마다 톤을 다시 묘사하면 분위기가 미세하게 어긋나 "한 시리즈"로 읽히지 않는다. 변하는 축만 델타로 준다.

## [Subject] — 재료 고정

`A {form} finished in {glassLabel} with {hardwareLabel} hardware — 이 조합은 모든 컷에서 동일.`

재료(glassFinish, hardware)는 제품을 정의하는 값. 호출 내내 고정하지 않으면 "다른 컷"이 아니라 "다른 제품"이 된다.

## [Composition] — 고정 카메라

50mm 프라임, eye-level, 동일 노출·컬러 사이언스, 1:1 정방형, rule-of-thirds. 각도·줌만 레시피별로 변동.

## 컷 레시피 (hero 제외, 빛의 연속성 베이스)

메인 hero(`{id}.png`)는 이미 존재 → 여기선 만들지 않는다. 기본 4컷은 각도·줌·디테일을 바꾸며 점등 상태가 하루를 따라 흐른다:

| slug | 각도 / 줌 | 점등 상태 | 시간대 |
|---|---|---|---|
| `angle-offdim` | 3/4 미드샷, 전체 폼 / medium-wide | off, 잔열 미광 | 늦은 오후 |
| `front-glow` | 정면 미디엄, 발광면 / medium | on 작업 밝기, lightPattern 또렷 | 블루아워 |
| `material-macro` | 재료 디테일 매크로 / close-up | on, hardware 스페큘러 | 저녁 |
| `context-night` | 로우앵글 와이드, 작게 / wide | dim warm on, 확산광 | 밤 |

`N < 4` → 앞에서부터. `N > 4` → 순환하며 `-2`, `-3` 접미사.

## 조립 예 (id 17 Lumen Dome, opaline + patina-brass, `material-macro`)

```
[Style] Editorial architectural product photography in the Lumenstate brand tone: warm minimal, ambient warmth, flat and quiet. No glow bloom, no gradient backdrops, no directional drop shadows. ...
[Subject] A hemisphere desk lamp finished in opaline (milky white) glass with aged patina brass hardware — this exact material combination is fixed and must look identical across every cut.
[Setting] An uncluttered desk or side table, the small fixture next to a few editorial objects.
[Action] The fixture is on, with soft specular highlights tracing the hardware, emitting a deep candle-warm amber light (~2400-2700K) at a moderate, comfortable output for ambient presence — an even glow radiating in every direction. Time of day: early evening.
[Composition] macro detail crop where the glass finish meets the hardware joint, tight close-up. Shot on a 50mm prime at eye level, ... Square 1:1 framing, rule-of-thirds placement.
```
