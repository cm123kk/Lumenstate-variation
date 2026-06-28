/**
 * Product Image Background Normalizer
 *
 * 제품 이미지의 배경색을 페이지 배경과 정확히 일치시키는 스크립트.
 *   - Day (라이트 모드): N.png → #E8E5E1
 *   - Night (다크 모드): N-1.png → #12100E
 *
 * 동작 방식:
 *   1. 이미지 네 모서리에서 배경색 샘플링
 *   2. 각 픽셀이 샘플링된 배경색과 얼마나 가까운지 색상 거리(Color Distance) 계산
 *   3. 거리가 threshold 이내면 → 타겟 배경색으로 교체
 *   4. threshold 근처 픽셀은 부드럽게 블렌딩하여 경계가 자연스럽게 처리
 *
 * Usage:
 *   node scripts/normalize-product-bg.mjs                    # Day 이미지 전체
 *   node scripts/normalize-product-bg.mjs --mode night       # Night 이미지 전체
 *   node scripts/normalize-product-bg.mjs --mode night --ids 1,2,3
 *   node scripts/normalize-product-bg.mjs --threshold 40     # 임계값 조정
 *   node scripts/normalize-product-bg.mjs --parallel         # 병렬 처리
 *   node scripts/normalize-product-bg.mjs --dry-run          # 미리보기 (저장 안 함)
 */

import sharp from 'sharp';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- Setup ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PRODUCT_DIR = path.join(ROOT, 'src/assets/product');

// ---------- Config ----------

const MODES = {
  day: {
    target: { r: 0xE8, g: 0xE5, b: 0xE1 },  // #E8E5E1
    defaultThreshold: 35,
    feather: 10,
    pattern: /^\d+\.png$/,                     // N.png
    label: 'Day (Light)',
  },
  night: {
    target: { r: 0x12, g: 0x10, b: 0x0E },   // #12100E
    defaultThreshold: 25,
    feather: 8,
    pattern: /^\d+-1\.png$/,                   // N-1.png
    label: 'Night (Dark)',
  },
};

/** 모서리 샘플링 영역 크기 (px) */
const SAMPLE_SIZE = 20;

// ---------- CLI Args ----------

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const dryRun = args.includes('--dry-run');
const parallel = args.includes('--parallel');
const force = args.includes('--force');
const modeKey = getArg('mode') || 'day';
const mode = MODES[modeKey];
if (!mode) {
  console.error(`Error: 알 수 없는 모드 "${modeKey}". day 또는 night 사용.`);
  process.exit(1);
}
const idsArg = getArg('ids');
const targetIds = idsArg ? idsArg.split(',').map(Number) : null;
const threshold = Number(getArg('threshold') || mode.defaultThreshold);

// ---------- Helpers ----------

/**
 * 두 RGB 색상 간 유클리드 거리 계산
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 이미지 네 모서리에서 배경색 샘플링 (중앙값 사용)
 */
function sampleBackground(data, width, height, channels) {
  const samples = [];
  const regions = [
    { x: 0, y: 0 },                                    // 좌상
    { x: width - SAMPLE_SIZE, y: 0 },                   // 우상
    { x: 0, y: height - SAMPLE_SIZE },                   // 좌하
    { x: width - SAMPLE_SIZE, y: height - SAMPLE_SIZE }, // 우하
  ];

  for (const region of regions) {
    for (let dy = 0; dy < SAMPLE_SIZE; dy++) {
      for (let dx = 0; dx < SAMPLE_SIZE; dx++) {
        const px = region.x + dx;
        const py = region.y + dy;
        const idx = (py * width + px) * channels;
        samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
  }

  // 각 채널별 중앙값
  const median = (arr) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  return {
    r: median(samples.map((s) => s.r)),
    g: median(samples.map((s) => s.g)),
    b: median(samples.map((s) => s.b)),
  };
}

/**
 * 현재 모드에 맞는 이미지 파일 목록 가져오기
 */
function getImages() {
  const files = fs.readdirSync(PRODUCT_DIR);
  return files
    .filter((f) => mode.pattern.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));
}

// ---------- Main ----------

async function processImage(filename) {
  const filepath = path.join(PRODUCT_DIR, filename);
  const id = parseInt(filename);
  const { target, feather } = mode;

  const log = [];
  log.push(`\n[${id}] ${filename} 처리 중...`);

  const image = sharp(filepath);
  const { width, height, channels } = await image.metadata();
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  // 1. 현재 배경색 샘플링
  const bg = sampleBackground(data, width, height, channels);
  log.push(`  샘플링된 배경: rgb(${bg.r}, ${bg.g}, ${bg.b})`);
  log.push(`  타겟 배경:     rgb(${target.r}, ${target.g}, ${target.b})`);

  const bgToTargetDist = colorDistance(bg.r, bg.g, bg.b, target.r, target.g, target.b);
  log.push(`  배경 → 타겟 거리: ${bgToTargetDist.toFixed(1)}`);

  if (bgToTargetDist < 3 && !force) {
    log.push('  ✓ 이미 타겟 배경과 일치. 스킵.');
    console.log(log.join('\n'));
    return { id, skipped: true };
  }

  // force 모드: 타겟 색 기준으로 직접 비교
  const refColor = force ? target : bg;
  if (force) log.push('  (force 모드: 타겟 색 기준 직접 비교)');

  // 2. 픽셀별 배경 판단 및 교체
  const output = Buffer.from(data);
  let replacedCount = 0;
  let blendedCount = 0;
  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const dist = colorDistance(r, g, b, refColor.r, refColor.g, refColor.b);

    if (dist <= threshold) {
      output[idx] = target.r;
      output[idx + 1] = target.g;
      output[idx + 2] = target.b;
      replacedCount++;
    } else if (dist <= threshold + feather) {
      const t = (dist - threshold) / feather;
      output[idx] = Math.round(target.r * (1 - t) + r * t);
      output[idx + 1] = Math.round(target.g * (1 - t) + g * t);
      output[idx + 2] = Math.round(target.b * (1 - t) + b * t);
      blendedCount++;
    }
  }

  const replacedPct = ((replacedCount / totalPixels) * 100).toFixed(1);
  const blendedPct = ((blendedCount / totalPixels) * 100).toFixed(1);
  log.push(`  교체: ${replacedCount}px (${replacedPct}%) | 블렌딩: ${blendedCount}px (${blendedPct}%)`);

  // 3. 저장
  if (!dryRun) {
    await sharp(output, { raw: { width, height, channels } })
      .png()
      .toFile(filepath);
    log.push('  ✓ 저장 완료');
  } else {
    log.push('  (dry-run: 저장 안 함)');
  }

  console.log(log.join('\n'));
  return { id, replacedPct, blendedPct };
}

async function main() {
  const { target, feather } = mode;
  const hex = `#${target.r.toString(16).toUpperCase().padStart(2, '0')}${target.g.toString(16).toUpperCase().padStart(2, '0')}${target.b.toString(16).toUpperCase().padStart(2, '0')}`;

  console.log('=== Product Image Background Normalizer ===');
  console.log(`모드: ${mode.label} | 타겟: ${hex} | Threshold: ${threshold} | Feather: ${feather}`);
  if (parallel) console.log('(병렬 처리 모드)');
  if (dryRun) console.log('(DRY RUN 모드)');

  const images = getImages();
  const toProcess = targetIds
    ? images.filter((f) => targetIds.includes(parseInt(f)))
    : images;

  console.log(`\n처리 대상: ${toProcess.length}개 이미지`);
  console.log(toProcess.map((f) => `  - ${f}`).join('\n'));

  let results;
  if (parallel) {
    results = await Promise.all(toProcess.map((file) => processImage(file)));
  } else {
    results = [];
    for (const file of toProcess) {
      results.push(await processImage(file));
    }
  }

  console.log('\n=== 완료 ===');
  const processed = results.filter((r) => !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  console.log(`처리: ${processed.length}개 | 스킵: ${skipped.length}개`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
