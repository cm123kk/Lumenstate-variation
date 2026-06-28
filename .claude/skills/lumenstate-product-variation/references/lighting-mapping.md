# 조명 색온도 매핑 (`kelvin` → 점등 글로우)

`scripts/generate.mjs` 의 `describeKelvin` 와 짝을 이룬다. **점등(on) 컷에서만** 발광 색온도를 서술하고, off 컷은 색온도를 넣지 않는다.

> 제품의 외형(색·재질·마감)은 레퍼런스 이미지가 정의하고, 배치 공간은 `references/space-mapping.md` 가 정의한다. 여기서 다루는 것은 **점등 시 빛의 색온도**뿐이다. `lux`·`lightPattern` 은 이 스킬에서 사용하지 않는다.

## kelvin → 발광 색온도

| 범위 | 서술 |
|---|---|
| ≤ 2700K | deep candle-warm amber (~2400-2700K) |
| ≤ 3200K | warm amber-white (~3000-3200K) |
| ≤ 3800K | brand-signature warm-neutral (~3400-3800K) |
| ≤ 4200K | balanced near-neutral white (~3900-4200K) |
| > 4200K | crisp neutral white (~4400K) |

브랜드는 디지털 푸른 톤이 아닌 3800K 웜 뉴트럴이 중심(03-visual-direction). 4400K 라도 "차가운 백색"이 아니라 "선명한 중성백"으로 서술한다.

## flat & quiet 제약

on 컷의 글로우는 따뜻하게 빛나되, 03-visual-direction 의 평면성 원칙에 따라 **글로우 블룸·렌즈 플레어·방향성 드롭섀도는 만들지 않는다.** off 컷은 밝은 주간 인테리어, on 컷은 어두운 저녁/야간 인테리어에 따뜻한 글로우가 도는 톤(`{id}-1.png` 의 야간 감각)으로 간다.

> 매핑 수정 시: `describeKelvin` 와 이 표를 함께 고친다.
