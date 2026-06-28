import { forwardRef } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as LucideIcons from "lucide-react";
import { CustomCard } from "./CustomCard";
import FadeTransition from "../motion/FadeTransition";

// 카드 간 cascade 오프셋 (ms) — 카드 0, 1, 2 순으로 더해짐
const CARD_STAGGER = 180;
// 카드 내부 요소 간격
const INNER_STEP = 220;

/**
 * BrandValueCard 컴포넌트
 *
 * 브랜드 가치를 아이콘, 제목, 설명으로 표현하는 카드 컴포넌트.
 * CustomCard를 활용한 수직 레이아웃.
 * 각 텍스트는 viewport 진입 시 FadeTransition(slide-up)으로 순차 노출.
 *
 * Props:
 * @param {string} icon - lucide-react 아이콘 이름 [Required]
 * @param {string} title - 브랜드 가치 제목 [Required]
 * @param {string} description - 짧은 설명 [Required]
 * @param {string} detailedDescription - 상세 설명 [Optional]
 * @param {number} iconSize - 아이콘 크기 (px) [Optional, 기본값: 32]
 * @param {number} cardIndex - 카드 순서 (0, 1, 2...) 카드 간 reveal cascade에 사용 [Optional, 기본값: 0]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <BrandValueCard icon="Sun" title="Immanence" description="..." cardIndex={0} />
 */
const BrandValueCard = forwardRef(function BrandValueCard(
	{
		icon,
		title,
		description,
		detailedDescription,
		iconSize = 32,
		cardIndex = 0,
		sx,
		...props
	},
	ref
) {
	// lucide-react 아이콘 동적 로드
	const IconComponent = LucideIcons[icon];

	// 카드 간 cascade + 카드 내 요소 간 순차 노출
	const cardOffset = cardIndex * CARD_STAGGER;
	const iconDelay = cardOffset;
	const titleDelay = cardOffset + INNER_STEP;
	const descDelay = cardOffset + INNER_STEP * 2;
	const detailDelay = cardOffset + INNER_STEP * 3;

	return (
		<CustomCard
			ref={ref}
			variant="ghost"
			contentPadding="md"
			sx={sx}
			{...props}
		>
			<Stack spacing={{ xs: 3, sm: 4, md: 6 }} py={{ xs: 2, sm: 3, md: 4 }}>
				{/* 아이콘 */}
				{IconComponent && (
					<FadeTransition isTriggerOnView direction="up" delay={iconDelay}>
						<IconComponent
							size={iconSize}
							strokeWidth={1.5}
							color="currentColor"
						/>
					</FadeTransition>
				)}

				{/* 제목 + 짧은 설명 */}
				<Stack spacing={0}>
					<FadeTransition isTriggerOnView direction="up" delay={titleDelay}>
						<Typography
							variant="h5"
							component="h3"
							sx={{
								fontWeight: 600,
								color: "text.primary",
								fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
							}}
						>
							{title}
						</Typography>
					</FadeTransition>
					<FadeTransition isTriggerOnView direction="up" delay={descDelay}>
						<Typography
							variant="body1"
							component="p"
							sx={{
								fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
								color: "text.secondary",
							}}
						>
							{description}
						</Typography>
					</FadeTransition>
				</Stack>

				{/* 상세 설명 */}
				{detailedDescription && (
					<FadeTransition isTriggerOnView direction="up" delay={detailDelay}>
						<Typography
							variant="body1"
							component="p"
							sx={{
								color: "text.secondary",
								lineHeight: 1.6,
								fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
							}}
						>
							{detailedDescription}
						</Typography>
					</FadeTransition>
				)}
			</Stack>
		</CustomCard>
	);
});

export { BrandValueCard };
export default BrandValueCard;
