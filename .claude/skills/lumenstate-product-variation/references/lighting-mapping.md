# 조명 시각 언어 매핑 (`kelvin` / `lux` / `lightPattern` → Action)

`scripts/generate.mjs` 의 `describeKelvin` / `describeLux` / `describeLightPattern` 와 짝을 이룬다. 점등(`lit: true`) 컷에서만 광량·색온도·패턴이 들어가고, off 컷은 상태 서술만 쓴다.

## kelvin → 발광 색온도

| 범위 | 서술 |
|---|---|
| ≤ 2700K | deep candle-warm amber (~2400-2700K) |
| ≤ 3200K | warm amber-white (~3000-3200K) |
| ≤ 3800K | brand-signature warm-neutral (~3400-3800K) |
| ≤ 4200K | balanced near-neutral white (~3900-4200K) |
| > 4200K | crisp neutral white (~4400K) |

> 브랜드는 디지털 푸른 톤이 아닌 3800K 웜 뉴트럴이 중심(03-visual-direction). 4400K 라도 "차가운 백색"이 아니라 "선명한 중성백"으로 서술한다.

## lux → 광량 / 세기

| 범위 | 서술 |
|---|---|
| ≤ 180 | low, intimate — 채우기보다 부드럽게 고이는 |
| ≤ 300 | moderate, comfortable — 은은한 존재감 |
| > 300 | bright, confident — 자기 영역을 또렷이 정의 |

## lightPattern → 빛이 퍼지는 형태

products.js 의 `lightPattern` 토큰을 키워드로 풀어 자연어 시각화로 바꾼다(부분 일치):

| 키워드 | 시각화 |
|---|---|
| `downward` | 아래로 부드럽게 퍼지는 확산 콘 |
| `upward-downward` / `dual` | 면을 위아래로 적시는 빛 |
| `upward` | 벽을 따라 위로 그레이징 |
| `horizontal` | 옆으로 퍼지는 수평 띠 |
| `perimeter` / `halo` | 둘레를 감싸는 부드러운 헤일로 |
| `omnidirectional` | 사방으로 균일하게 방사 |
| `vertical` | 키 큰 수직 패널의 균일광 |
| `radiate` / `four-directional` | 여러 방향으로 방사 |
| `gap` / `emission` | 좁은 갭에서 새어나오는 가는 빛 줄 |
| `refraction` / `prism` | 희미한 기하 패싯으로 굴절 |
| `spot` | 아래 면에 맺히는 집중 풀 |
| (그 외) | 부드러운 균일 확산 |

## flat & quiet 제약 재확인

서술은 빛의 **형태·색온도·세기**를 묘사하되, 03-visual-direction 의 평면성 원칙에 따라 **글로우 블룸·렌즈 플레어·방향성 드롭섀도는 만들지 않는다.** 그림자는 "떨어지는" 것이 아니라 "빛이 감싸는" 확산광이어야 한다.

> 매핑 추가/수정 시: products.js 에 새 `lightPattern` 토큰이 생기면 여기와 `describeLightPattern` 양쪽에 키워드를 추가한다.
