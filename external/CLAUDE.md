# Project Rules

## META INSTRUCTION

IMPORTANT: 이 문서와 `.claude/rules/` 내 모든 규칙은 프로젝트 법률이다.
YOU MUST 코드 작업 전 관련 규칙을 확인하고, 위반 가능성이 있으면 먼저 사용자에게 알려라.
YOU MUST NOT 명시적 허용 없이 규칙을 위반하는 코드를 작성하지 마라.

**지시된 기능만 구현 (CRITICAL)**
- 사용자가 구체적인 지시를 한 경우, 명시된 기능만 구현할 것
- 요청하지 않은 기능, 옵션, 예외 처리를 임의로 추가하지 말 것
- "있으면 좋을 것 같은" 기능은 먼저 사용자에게 제안하고 승인받은 후 구현

## Project Overview

**Starter Kit Basic**은 React + MUI + Storybook 환경을 디자이너에게 마치 디자인 툴처럼 사용할 수 있도록 도와주는 개발 환경입니다.

### 핵심 목적
1. **UI 컴포넌트 체계적 관리** - 재사용 가능한 컴포넌트를 Storybook으로 문서화
2. **디자인 톤 일관성 유지** - 색상, 타이포그래피, 스타일을 중앙에서 관리
3. **로직과 UI 분리** - 제품의 비즈니스 로직과 UI 디자인 작업을 명확히 분리

### 기술 스택
- React 19.x
- MUI 7.x (Material UI)
- Vite 7.x
- Storybook 10.x

## Key Directories

- `src/components/` – 재사용 UI 컴포넌트 (card, carousel, grid 등)
- `src/stories/` – Storybook 스토리 파일 (overview, style, component, template, page)
- `src/common/ui/` – 공통 UI 요소 (ArrowButton, Indicator)
- `src/styles/` – 테마, 전역 스타일
- `src/templates/` – 컴포넌트 조합 템플릿
- `.storybook/` – Storybook 설정

## Common Commands

```bash
pnpm dev              # Vite 개발 서버
pnpm storybook        # Storybook 실행 (포트 6006)
pnpm build            # 프로덕션 빌드
pnpm build-storybook  # Storybook 정적 빌드
pnpm lint             # ESLint 검사
```

## Rules Priority

| 등급 | 의미 | 규칙 파일 |
|------|------|----------|
| CRITICAL | 절대 위반 불가 | mui.md (Grid 규칙) |
| MUST | 반드시 준수 | code-style.md, design-system.md, project-structure.md |
| SHOULD | 관련 작업 시 준수 | storybook.md, refactoring.md |
| REFERENCE | 참조 문서 | components.md, brand/*.md |

## Workflow

### 모든 코드 변경 전 (MANDATORY)
1. 작업 대상 파일/폴더 확인
2. 관련 규칙 확인 (해당 파일 패턴에 맞는 규칙)
3. 규칙 위반 가능성 체크
4. 충돌 시 → 사용자에게 먼저 알림

### 컴포넌트 생성
1. 요구사항 파악 → 기존 유사 컴포넌트 탐색
2. project-structure.md에 따라 위치 결정
3. **디자인 시스템 재활용 (MUST)**:
   - 아이콘: lucide-react 라이브러리 사용
   - 타이포그래피: MUI Typography 컴포넌트 사용
   - 기본 컴포넌트: 기존 `src/components/` 내 컴포넌트 우선 활용
4. 구현 (MUI 기반, sx prop 사용)
5. Storybook 스토리 작성
6. 린트 확인

### 컴포넌트 수정
1. 현재 동작 파악
2. 영향 범위 확인
3. 수정 (기존 동작 유지)
4. 스토리 업데이트 (필요 시)

### 리팩토링
1. 외부 동작 변경 없음 확인
2. refactoring.md 참조
3. 기존 스토리 통과 확인

## 규칙 충돌 처리

사용자 요청이 규칙과 충돌할 경우:
1. "이 요청은 [규칙명]과 충돌합니다" 알림
2. 구체적 충돌 내용 설명
3. 사용자가 명시적으로 예외 허용할 때까지 진행 금지
