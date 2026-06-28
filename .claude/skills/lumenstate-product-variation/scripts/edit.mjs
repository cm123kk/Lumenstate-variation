/**
 * Lumenstate Product Variation — 이미지 편집(인페인팅) 스크립트
 *
 * generate.mjs 는 장면을 통째로 새로 그린다(구도가 매번 바뀜). 반면 이 스크립트는
 * "기존 이미지는 그대로 두고 한 요소만 변경/제거"를 한다 — 기존 PNG/JPG 를 입력으로
 * 넣고, 그 부분만 국소적으로 편집(localized edit)하도록 모델에 지시한다.
 *
 * 사용:
 *   node edit.mjs --in generated/lumenstate/15/15-room-wide-day.jpg \
 *                 --instruction "remove the person in the background" \
 *                 [--out <경로>]   # 생략 시 입력 파일을 덮어씀
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findProjectRoot(start) {
  let dir = start;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot(__dirname);

function loadEnvLocal(root) {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal(PROJECT_ROOT);

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') args.in = argv[++i];
    else if (a === '--instruction') args.instruction = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--ref') args.ref = argv[++i];
  }
  return args;
}

function mimeFor(file) {
  if (/\.png$/i.test(file)) return 'image/png';
  if (/\.webp$/i.test(file)) return 'image/webp';
  return 'image/jpeg';
}

function extFor(mimeType) {
  if (/jpe?g/.test(mimeType)) return 'jpg';
  if (/webp/.test(mimeType)) return 'webp';
  return 'png';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.in) fail('--in <이미지 경로> 는 필수입니다.');
  if (!args.instruction) fail('--instruction "<바꿀 내용>" 은 필수입니다.');

  const inPath = path.resolve(PROJECT_ROOT, args.in);
  if (!fs.existsSync(inPath)) fail(`입력 이미지를 찾을 수 없습니다: ${inPath}`);

  if (!process.env.GEMINI_API_KEY) {
    fail('GEMINI_API_KEY 가 설정되지 않았습니다. .env.local 을 확인하세요.');
  }

  let GoogleGenAI;
  try {
    ({ GoogleGenAI } = await import('@google/genai'));
  } catch {
    fail('@google/genai 가 설치되지 않았습니다. `pnpm add @google/genai` 를 실행하세요.');
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const inMime = mimeFor(inPath);
  const data = fs.readFileSync(inPath).toString('base64');

  // 선택: 제품 레퍼런스 이미지를 함께 넣어 편집 중 제품 형태·비율·부품 배치가 어긋나지 않게 고정한다.
  let refPart = null;
  let refNote = '';
  if (args.ref) {
    const refPath = path.resolve(PROJECT_ROOT, args.ref);
    if (!fs.existsSync(refPath)) fail(`레퍼런스 이미지를 찾을 수 없습니다: ${refPath}`);
    refPart = { inlineData: { mimeType: mimeFor(refPath), data: fs.readFileSync(refPath).toString('base64') } };
    refNote =
      ' A SECOND image is provided purely as the product reference: the fixture in the edited photo must match ' +
      "that reference's EXACT shape, proportions, aspect ratio and part/tile layout — do not simplify, " +
      'rearrange, stretch or squash the product. Only its size in the scene and the requested change may differ.';
  }

  // 국소 편집: 지시한 부분만 바꾸고 나머지는 픽셀 단위로 보존하도록 강하게 못 박는다.
  const prompt =
    'Edit the FIRST image in place. Make ONLY this change: ' +
    `${args.instruction}. ` +
    'Keep EVERYTHING else in that image exactly identical — the same composition, framing, camera angle, ' +
    'lighting, colours, and all other objects, props, furniture, textures and background ' +
    'must stay pixel-for-pixel the same. This is a localized edit / inpaint, NOT a re-generation: do not ' +
    'restyle, recolour, re-light, re-frame or move anything other than what is asked. Where something is ' +
    'removed or resized, fill the area so it blends seamlessly and naturally with the surrounding scene.' +
    refNote;

  console.log(`\n● 이미지 편집`);
  console.log(`  입력: ${path.relative(PROJECT_ROOT, inPath)}`);
  console.log(`  지시: ${args.instruction}\n`);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [
      { inlineData: { mimeType: inMime, data } },
      ...(refPart ? [refPart] : []),
      { text: prompt },
    ],
    config: {
      responseModalities: ['Image'],
      imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) fail('응답에 이미지가 없습니다.');

  const mimeType = imagePart.inlineData.mimeType || inMime;
  const outPath = args.out
    ? path.resolve(PROJECT_ROOT, args.out)
    : inPath.replace(/\.[^.]+$/, `.${extFor(mimeType)}`);
  fs.writeFileSync(outPath, Buffer.from(imagePart.inlineData.data, 'base64'));
  console.log(`✓ 저장됨 → ${path.relative(PROJECT_ROOT, outPath)}\n`);
}

main().catch((err) => fail(err.stack || err.message));
