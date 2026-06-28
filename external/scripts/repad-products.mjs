/**
 * 제품 이미지 1-4 패딩 확장 + #2 곡률 수정 스크립트
 *
 * 기존 Day 이미지를 레퍼런스로 사용하여:
 * 1. 패딩이 더 넓은 Day 이미지 재생성
 * 2. 재생성된 Day를 레퍼런스로 Night 이미지 생성
 *
 * Usage:
 *   node scripts/repad-products.mjs              # Day 패딩 확장 → Night 생성
 *   node scripts/repad-products.mjs --day-only   # Day 패딩 확장만
 *   node scripts/repad-products.mjs --night-only # 기존 Day로 Night만
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

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
const OUTPUT_DIR = path.join(ROOT, 'src/assets/product');
const DELAY_MS = 3000;

const STYLE = {
  dayBg: '#E8E5E1',
  nightBg: '#12100E',
  emissionColor: '#FFC66E',
  colorTemp: '3800K',
  aspectRatio: '3:4',
  resolution: '2K',
};

// ---------- 제품별 패딩 확장 프롬프트 ----------

const REPAD_PROMPTS = [
  {
    id: 1,
    dayPrompt: `Keep the EXACT same product — same circular ceiling ring shape, same materials (matte black anodized aluminum frame, white frosted glass diffuser), same camera angle (directly below looking up), same lighting, same shadow.

CRITICAL CHANGE — Reduce the product size within the frame:
- The product must fill approximately 40% of the frame (currently ~60%).
- Minimum 25% clear padding from ALL edges (top, bottom, left, right). The product must NOT come close to any edge.
- The product stays perfectly centered.

Background: perfectly uniform warm off-white (${STYLE.dayBg}), seamless from edge to edge. No gradient, no horizon, no floor plane.
Do NOT alter the product design, material, lighting, or shadow in any way. Only make the product smaller within the frame with more surrounding space.`,

    nightPrompt: `Transform this product image into night/dark mode. Keep the EXACT same product shape, angle, composition, position, and size.

Background: uniform deep warm black (${STYLE.nightBg}). No gradient.
Light state: ON. Frosted glass diffuser emits warm ${STYLE.colorTemp} light (${STYLE.emissionColor}).
Warm amber light radiates downward from the frosted diffuser. Ring frame becomes dark silhouette. Soft pool of light below.
Diffuser center: 100% brightness. Diffuser edge: 80%. Nearby surface reflection: 20-30%.
Product is the ONLY light source. No studio lighting.
Keep: product form, size, centered composition with generous padding, aspect ratio.
No text, no logos, no lens flare, no gradient background.`,
  },
  {
    id: 2,
    dayPrompt: `Keep the EXACT same product type — a parabolic arc floor lamp with matte black aluminum rod, square black stone base, and horizontal light bar at the arc's end. Same camera angle (straight-on frontal), same studio lighting.

CRITICAL CHANGES:
1. PADDING: Reduce the product fill to approximately 70% of the frame (currently ~85%). Minimum 15% clear padding from ALL edges.
2. ARC CURVE: The arc rod MUST follow a PERFECT MATHEMATICAL PARABOLIC CURVE — y = ax². The curve must be geometrically precise, smooth, and mathematically exact. No organic wobble, no hand-drawn feel. Think of a precise engineering diagram rendered in 3D. The rod rises vertically from the stone base, then curves in a perfect parabola overhead, terminating in the horizontal light bar.

The product stays perfectly centered. Background: perfectly uniform warm off-white (${STYLE.dayBg}), seamless.
Material: matte black anodized aluminum, white frosted glass diffuser (light OFF).
Style: Dieter Rams, Bauhaus, extreme geometric precision.
Do NOT add any environment, text, or additional objects.`,

    nightPrompt: `Transform this arc floor lamp image into night/dark mode. Keep the EXACT same product shape, arc curve, angle, composition, position, and size.

Background: uniform deep warm black (${STYLE.nightBg}). No gradient.
Light state: ON. The horizontal light bar emits warm ${STYLE.colorTemp} light (${STYLE.emissionColor}) downward.
A focused pool of warm light on the floor beneath the bar. The thin arc rod is barely visible. Stone base catches minimal reflected light.
Diffuser center: 100% brightness. Edge: 80%. Floor reflection: 20-30%.
Product is the ONLY light source.
CRITICAL: The arc curve must remain a PERFECT MATHEMATICAL PARABOLA — identical to the day image.
Keep: product form, size, centered composition, padding, aspect ratio.
No text, no logos, no lens flare, no gradient background.`,
  },
  {
    id: 3,
    dayPrompt: `Keep the EXACT same product — same horizontal rectangular wall sconce shape, same materials (matte black frame, white frosted glass front, horizontal center slit), same camera angle (straight-on perpendicular to wall), same lighting.

CRITICAL CHANGE — Reduce the product size within the frame:
- The product must fill approximately 35% of the frame (currently ~45%).
- Minimum 20% clear padding from ALL edges. The product must float with generous space around it.
- The product stays perfectly centered.

Background: perfectly uniform warm off-white (${STYLE.dayBg}), seamless. No gradient, no horizon.
Do NOT alter the product design, material, lighting, or shadow. Only make the product smaller with more padding.`,

    nightPrompt: `Transform this wall sconce image into night/dark mode. Keep the EXACT same product shape, angle, composition, position, and size.

Background: uniform deep warm black (${STYLE.nightBg}). No gradient.
Light state: ON. Warm amber light washes upward and downward from the edges. Center slit remains dark. Symmetrical glow on wall above and below.
Emission: ${STYLE.colorTemp} (${STYLE.emissionColor}). Diffuser center: 100%. Edge: 80%. Wall reflection: 20-30%.
Product is the ONLY light source.
Keep: product form, size, centered composition, generous padding, aspect ratio.
No text, no logos, no lens flare.`,
  },
  {
    id: 4,
    dayPrompt: `Keep the EXACT same product — same slim horizontal linear wall bar, same materials (two thin black aluminum rails with white frosted glass strip between), same camera angle (straight-on perpendicular), same lighting.

CRITICAL CHANGE — Reduce the product size within the frame:
- The product must fill approximately 25% of the frame (currently ~40%).
- Minimum 30% clear padding from ALL edges (top, bottom, left, right). The product is small and delicate, floating in a vast field of empty background.
- The product stays perfectly centered.

Background: perfectly uniform warm off-white (${STYLE.dayBg}), seamless from edge to edge. No gradient, no horizon.
Do NOT alter the product design, material, lighting, or shadow. Only make the product smaller with much more surrounding space.`,

    nightPrompt: `Transform this linear wall bar image into night/dark mode. Keep the EXACT same product shape, angle, composition, position, and size.

Background: uniform deep warm black (${STYLE.nightBg}). No gradient.
Light state: ON. Warm amber light emanates from the gap between rails, washing left and right. Fixture appears as a thin luminous line.
Emission: ${STYLE.colorTemp} (${STYLE.emissionColor}). Center: 100%. Edge: 80%. Wall reflection: 20-30%.
Product is the ONLY light source.
Keep: product form, size, centered composition, very generous padding, aspect ratio.
No text, no logos, no lens flare.`,
  },
];

// ---------- Generation ----------

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
        aspectRatio: STYLE.aspectRatio,
        imageSize: STYLE.resolution,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response parts');

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
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- Main ----------

async function main() {
  const args = process.argv.slice(2);
  const dayOnly = args.includes('--day-only');
  const nightOnly = args.includes('--night-only');
  const doDay = !nightOnly;
  const doNight = !dayOnly;

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  console.log('\n  Product Image Repad (1-4)');
  console.log(`  Mode: ${doDay && doNight ? 'Day repad → Night' : doDay ? 'Day repad only' : 'Night only'}\n`);

  for (const product of REPAD_PROMPTS) {
    const dayPath = path.join(OUTPUT_DIR, `${product.id}.png`);
    const nightPath = path.join(OUTPUT_DIR, `${product.id}-1.png`);

    if (doDay) {
      process.stdout.write(`  [#${product.id}] Day repad ... `);
      try {
        const result = await generateFromRef(ai, product.dayPrompt, dayPath, dayPath);
        console.log(`OK (${formatBytes(result.size)})`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
      await sleep(DELAY_MS);
    }

    if (doNight) {
      process.stdout.write(`  [#${product.id}] Night ... `);
      try {
        const result = await generateFromRef(ai, product.nightPrompt, dayPath, nightPath);
        console.log(`OK (${formatBytes(result.size)})`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
      await sleep(DELAY_MS);
    }
  }

  console.log('\n  Done.\n');
}

main().catch(console.error);
