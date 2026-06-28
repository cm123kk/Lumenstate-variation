import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';
import { products } from '../../data/products';

// Brand moodboard — day
import arcLampLiving from '../../assets/brand-mood/arc-lamp-living.png';
import archLightGallery from '../../assets/brand-mood/arch-light-gallery.png';
import capsuleLampLoft from '../../assets/brand-mood/capsule-lamp-loft.png';
import columnLampStudio from '../../assets/brand-mood/column-lamp-studio.png';
import cubePendantWorkshop from '../../assets/brand-mood/cube-pendant-workshop.png';
import prismLampDesk from '../../assets/brand-mood/prism-lamp-desk.png';
import splitDiscMeditation from '../../assets/brand-mood/split-disc-meditation.png';
// Brand moodboard — night
import arcLampLivingNight from '../../assets/brand-mood/arc-lamp-living-night.png';
import archLightGalleryNight from '../../assets/brand-mood/arch-light-gallery-night.png';
import capsuleLampLoftNight from '../../assets/brand-mood/capsule-lamp-loft-night.png';
import columnLampStudioNight from '../../assets/brand-mood/column-lamp-studio-night.png';
import cubePendantWorkshopNight from '../../assets/brand-mood/cube-pendant-workshop-night.png';
import prismLampDeskNight from '../../assets/brand-mood/prism-lamp-desk-night.png';
import splitDiscMeditationNight from '../../assets/brand-mood/split-disc-meditation-night.png';

// Elevation videos
import {
  elevationSet1Video,
  elevationSet2Video,
  elevationSet3Video,
} from '../../assets/elevation';
// Elevation stills
import elevationDay from '../../assets/elevation/elevation-day.png';
import elevationNight from '../../assets/elevation/elevation-night.png';
import elevationNightB from '../../assets/elevation/elevation-night-b.png';
import elevationOpenDay from '../../assets/elevation/elevation-open-day.png';
import elevationOpenDayB from '../../assets/elevation/elevation-open-day-b.png';
import elevationOpenNight from '../../assets/elevation/elevation-open-night.png';
import elevationGlassDay from '../../assets/elevation/elevation-glass-day.png';
import elevationGlassNight from '../../assets/elevation/elevation-glass-night.png';
import elevationGlassNightB from '../../assets/elevation/elevation-glass-night-b.png';

// 실제 렌더링에 사용 중인 무드 (HeroSection에서 사용)
const brandMoodInUse = [
  { name: 'arc-lamp-living', day: arcLampLiving, night: arcLampLivingNight, usedAt: 'HeroSection / hero main' },
  { name: 'arch-light-gallery', day: archLightGallery, night: archLightGalleryNight, usedAt: 'HeroSection / side' },
];
// 데이터/파일에는 있으나 현재 렌더되지 않는 무드
const brandMoodUnused = [
  { name: 'split-disc-meditation', day: splitDiscMeditation, night: splitDiscMeditationNight },
  { name: 'capsule-lamp-loft', day: capsuleLampLoft, night: capsuleLampLoftNight },
  { name: 'column-lamp-studio', day: columnLampStudio, night: columnLampStudioNight },
  { name: 'cube-pendant-workshop', day: cubePendantWorkshop, night: cubePendantWorkshopNight },
  { name: 'prism-lamp-desk', day: prismLampDesk, night: prismLampDeskNight },
];

const elevationVideosInUse = [
  { name: 'set1_moving.mp4', src: elevationSet1Video, usedAt: 'ElevationSection slide 1' },
  { name: 'set2_moving.mp4', src: elevationSet2Video, usedAt: 'ElevationSection slide 2' },
  { name: 'set3_moving.mp4', src: elevationSet3Video, usedAt: 'ElevationSection slide 3' },
];

const elevationStillsUnused = [
  { name: 'elevation-day', src: elevationDay },
  { name: 'elevation-night', src: elevationNight },
  { name: 'elevation-night-b', src: elevationNightB },
  { name: 'elevation-open-day', src: elevationOpenDay },
  { name: 'elevation-open-day-b', src: elevationOpenDayB },
  { name: 'elevation-open-night', src: elevationOpenNight },
  { name: 'elevation-glass-day', src: elevationGlassDay },
  { name: 'elevation-glass-night', src: elevationGlassNight },
  { name: 'elevation-glass-night-b', src: elevationGlassNightB },
];

export default {
  title: 'Overview/Lumenstate/07 Assets',
  parameters: {
    layout: 'padded',
  },
};

/** 라벨과 미디어(이미지/비디오)를 세로로 쌓은 단일 셀. 원본 비율 유지 */
function AssetCell({ label, src, isVideo = false }) {
  return (
    <Stack spacing={0.75}>
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'grey.100',
          overflow: 'hidden',
          position: 'relative',
          lineHeight: 0,
        }}
      >
        {isVideo ? (
          <Box
            component="video"
            src={src}
            autoPlay
            muted
            loop
            playsInline
            sx={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : (
          <Box
            component="img"
            src={src}
            alt={label}
            loading="lazy"
            sx={{ width: '100%', height: 'auto', display: 'block' }}
          />
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'text.secondary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

/** Day/Night 페어를 한 블록으로. 원본 비율 유지 */
function PairBlock({ title, subtitle, usedAt, day, night }) {
  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
            {subtitle}
          </Typography>
        )}
        {usedAt && (
          <Typography variant="caption" color="primary.main" sx={{ fontSize: 10, display: 'block' }}>
            {usedAt}
          </Typography>
        )}
      </Box>
      <Grid container spacing={1}>
        <Grid size={6}>
          <AssetCell label="Day" src={day} />
        </Grid>
        <Grid size={6}>
          <AssetCell label="Night" src={night} />
        </Grid>
      </Grid>
    </Box>
  );
}

export const Default = {
  render: () => (
    <>
      <DocumentTitle
        title="Assets"
        status="Available"
        note="Product images, brand mood photos, elevation videos — grouped by actual usage"
        brandName="Design System"
        systemName="Lumenstate"
        version="1.0"
      />
      <PageContainer>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Assets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          현재 사이트에 실제 렌더링되는 에셋을 상단에, 데이터/파일에는 있지만 현재 화면에 보이지 않는 에셋을 하단에 정리합니다. 모든 이미지/비디오는 원본 비율 그대로 표시됩니다.
        </Typography>

        {/* ========== 상단: In Use ========== */}
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 2, mb: 2 }}>
          In Use
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          현재 페이지에 실제 렌더링되는 에셋들.
        </Typography>

        {/* Product Images — 전체 사용 */}
        <SectionTitle
          title="Product Images"
          description={`${products.length}개 제품 × Day/Night 2장 = ${products.length * 2}장. ProductCard(그리드) + ProductImageViewer(상세)에서 사용. src/assets/product/{id}.png (Day) / {id}-1.png (Night)`}
        />
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {products.map((p) => (
            <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <PairBlock
                title={`#${p.id} ${p.title}`}
                subtitle={`${p.id}.png / ${p.id}-1.png`}
                day={p.images?.[0]}
                night={p.images?.[1]}
              />
            </Grid>
          ))}
        </Grid>

        {/* Brand Mood — 실제 사용 */}
        <SectionTitle
          title="Brand Mood Images"
          description={`${brandMoodInUse.length}개 페어. HeroSection의 hero/side 슬롯에서 사용.`}
        />
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {brandMoodInUse.map((m) => (
            <Grid key={m.name} size={{ xs: 12, sm: 6 }}>
              <PairBlock
                title={m.name}
                subtitle={`${m.name}.png / ${m.name}-night.png`}
                usedAt={m.usedAt}
                day={m.day}
                night={m.night}
              />
            </Grid>
          ))}
        </Grid>

        {/* Elevation Videos */}
        <SectionTitle
          title="Elevation Videos"
          description={`${elevationVideosInUse.length}개. ElevationSection의 가로 스크롤 스크러빙에 사용. src/assets/elevation/*.mp4`}
        />
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {elevationVideosInUse.map((v) => (
            <Grid key={v.name} size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.75}>
                <AssetCell label={v.name} src={v.src} isVideo />
                <Typography variant="caption" color="primary.main" sx={{ fontSize: 10 }}>
                  {v.usedAt}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* ========== 하단: Unused ========== */}
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 4, mb: 2, color: 'text.secondary' }}>
          Unused (데이터/파일만 존재)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          파일은 있지만 현재 페이지에서 렌더되지 않는 에셋들. 향후 확장 또는 참고용.
        </Typography>

        {/* Brand Mood — 미사용 */}
        <SectionTitle
          title="Brand Mood Images (unused)"
          description={`${brandMoodUnused.length}개 페어. content.gallery 등에 정의되어 있으나 현재 렌더되지 않음.`}
        />
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {brandMoodUnused.map((m) => (
            <Grid key={m.name} size={{ xs: 12, sm: 6, md: 4 }}>
              <PairBlock
                title={m.name}
                subtitle={`${m.name}.png / ${m.name}-night.png`}
                day={m.day}
                night={m.night}
              />
            </Grid>
          ))}
        </Grid>

        {/* Elevation Stills — 미사용 */}
        <SectionTitle
          title="Elevation Stills (unused)"
          description={`${elevationStillsUnused.length}개 정지 이미지. 엘리베이션 변형 컨셉(open/glass)용 파일. 현재 컴포넌트에서는 비디오만 사용.`}
        />
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {elevationStillsUnused.map((s) => (
            <Grid key={s.name} size={{ xs: 6, sm: 4, md: 3 }}>
              <AssetCell label={`${s.name}.png`} src={s.src} />
            </Grid>
          ))}
        </Grid>
      </PageContainer>
    </>
  ),
};
