/**
 * Hero Section Side Image Generator
 *
 * HeroSection 우측 이미지(arch-light-gallery)의 바닥 영역을
 * 좌측 이미지(arc-lamp-living)와 동일하게 맞추기 위해,
 * 원본 이미지를 레퍼런스로 새 이미지를 생성하는 스크립트.
 *
 * 변경 내용:
 *   - 동일 구도(좁은 갤러리 복도, arch wall light, 바닥에 앉은 인물)
 *   - 시각적 특징 유지 (Kinfolk 에디토리얼 톤, warm neutral)
 *   - 전체 컨텐츠를 프레임 위쪽으로 올려 바닥 영역 확대 (~35-40%)
 *
 * 생성 워크플로우:
 *   1. Day 원본을 레퍼런스로 → 바닥 확대된 Day 이미지 생성
 *   2. 새 Day를 레퍼런스로 → Night 이미지 생성
 *
 * Usage:
 *   node scripts/generate-hero-side-image.mjs               # Day → Night 순차 생성
 *   node scripts/generate-hero-side-image.mjs --mode day    # Day만 생성
 *   node scripts/generate-hero-side-image.mjs --mode night  # Night만 (새 Day 레퍼런스)
 *   node scripts/generate-hero-side-image.mjs --dry-run     # 프롬프트만 출력
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// ---------- Setup ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env.local') });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env.local');
  process.exit(1);
}

const MODEL = 'gemini-3.1-flash-image-preview';
const ASSET_DIR = path.join(ROOT, 'src/assets/brand-mood');
const ASPECT_RATIO = '3:4';
const RESOLUTION = '2K';

// ---------- File Paths ----------

const FILES = {
  dayOriginal: path.join(ASSET_DIR, 'arch-light-gallery.png'),
  nightOriginal: path.join(ASSET_DIR, 'arch-light-gallery-night.png'),
  dayOutput: path.join(ASSET_DIR, 'arch-light-gallery.png'),
  nightOutput: path.join(ASSET_DIR, 'arch-light-gallery-night.png'),
};

// ---------- Brand Style Constants ----------

const STYLE = {
  dayBg: '#E8E5E1',
  nightBg: '#12100E',
  emissionColor: '#FFC66E',
  colorTemp: '3800K',
};

// ---------- Negative Prompt ----------

const NEGATIVE = 'No stock photo look, no posed model, no smile, no eye contact with camera, no bright saturated colors, no HDR over-processing, no lens flare, no vignette, no split toning, no teal-and-orange grading, no text, no logos, no watermarks.';

// ---------- Prompts ----------

const DAY_PROMPT = `Reproduce this reference image as closely as possible — IDENTICAL corridor width, wall proportions, skylight, arch wall light shape and position, person pose and position, lighting, color, photography style. Everything must match the reference 100%.

THE ONLY CHANGE: Lower the floor baseline. The line where the back wall meets the floor (the wall-floor junction at the far end of the corridor) should move DOWN by approximately 10% of the frame height. This means the visible concrete floor area becomes slightly thinner, and the back wall appears slightly taller. Nothing else changes — same corridor width, same spacious front wall, same arch light, same person, same skylight, same perspective, same everything.

Do NOT change the corridor proportions — keep the back wall wide and spacious exactly as in the reference. Do NOT distort or reshape the arch wall light. Do NOT move the person, the arch light, or the skylight. ONLY the floor baseline shifts down.

${NEGATIVE}`;

// Night prompt removed — not needed for this task

// ---------- Image Generation ----------

async function generateFromRef(ai, prompt, refImagePath, outputPath) {
  const refData = fs.readFileSync(refImagePath);
  const base64 = refData.toString('base64');

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64 } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: ASPECT_RATIO,
        imageSize: RESOLUTION,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response parts received from API');

  for (const part of parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(outputPath, buffer);
      return { size: buffer.length };
    }
  }

  throw new Error('No image data in response');
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

// ---------- CLI ----------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { mode: 'both', dryRun: false };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
    case '--mode':
      options.mode = args[++i];
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--help':
      console.log(`
Hero Section Side Image Generator

좌측 hero 이미지와 바닥 영역을 맞추기 위해
우측 side 이미지를 재생성합니다.

Usage:
  node scripts/generate-hero-side-image.mjs [options]

Options:
  --mode <mode>   'day', 'night', or 'both' (default: both)
  --dry-run       Print prompts without calling API
  --help          Show this help message
`);
      process.exit(0);
    }
  }

  return options;
}

// ---------- Main ----------

async function main() {
  const options = parseArgs();
  console.log('\n  Hero Side Image Generator');
  console.log(`  Model: ${MODEL}`);
  console.log(`  Aspect Ratio: ${ASPECT_RATIO}`);
  console.log(`  Resolution: ${RESOLUTION}`);
  console.log(`  Source: arch-light-gallery.png`);
  console.log('  Task: Day recompose (push content down, reduce floor)\n');

  // Dry run
  if (options.dryRun) {
    console.log(`${'='.repeat(60)}`);
    console.log('  DAY — Push content down, reduce floor area');
    console.log(`${'='.repeat(60)}\n`);
    console.log(DAY_PROMPT);
    console.log('\nDry run complete. No API calls were made.');
    return;
  }

  // Check source image exists
  if (!fs.existsSync(FILES.dayOriginal)) {
    console.error(`Error: Day source not found: ${FILES.dayOriginal}`);
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  process.stdout.write('  [1] Day recompose ... ');
  try {
    const result = await generateFromRef(ai, DAY_PROMPT, FILES.dayOriginal, FILES.dayOutput);
    console.log(`OK (${formatBytes(result.size)}) -> arch-light-gallery.png`);
    console.log(`\n  Done: 1 succeeded`);
    console.log(`  Output: ${ASSET_DIR}/`);
  } catch (error) {
    console.log(`FAILED: ${error.message}`);
    console.log('\n  Done: 0 succeeded, 1 failed');
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
