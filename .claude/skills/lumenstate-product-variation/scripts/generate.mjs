/**
 * Lumenstate Product Variation — 베리에이션 컷 생성 스크립트
 *
 * 동일 제품을 각도·줌·디테일 크롭으로 변주하고, 그 변주를 "빛의 연속성"
 * (주간 → 야간 점등) 타임라인 위에 배치해 N장 생성한다.
 * 재료(glassFinish, hardware)는 제품을 정의하는 값이므로 한 호출 안에서 고정한다.
 * 공통 [Style] + 카메라 블록은 상수로 고정해 모든 컷이 동일 톤을 공유한다.
 *
 * 사용:
 *   node generate.mjs --product 17 --dry-run
 *   node generate.mjs --product 17 --glass opaline --hardware patina-brass --count 4
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ------------------------------------------------------------------ *
 * 0. 경로 · 환경
 * ------------------------------------------------------------------ */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** package.json 을 찾아 위로 거슬러 올라가며 프로젝트 루트를 해석한다. */
function findProjectRoot(start) {
  let dir = start;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot(__dirname);

/** 의존성 없이 .env.local 을 읽어 process.env 에 채운다. */
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

/* ------------------------------------------------------------------ *
 * 1. 옵션 라벨 · 매핑 (references/ 문서와 짝을 이룬다)
 * ------------------------------------------------------------------ */

const GLASS_LABELS = {
  clear: 'clear glass',
  frosted: 'frosted glass',
  opaline: 'opaline (milky white) glass',
  amber: 'amber-tinted glass',
  smoke: 'smoke-grey glass',
};

const HARDWARE_LABELS = {
  'patina-brass': 'aged patina brass',
  'polished-brass': 'polished brass',
  'brushed-nickel': 'brushed nickel',
  'matte-black': 'matte black metal',
  chrome: 'polished chrome',
};

/** product.type (PRODUCT_TYPES 토큰) → 공간 컨텍스트. references/space-mapping.md 참조. */
const SPACE_BY_TYPE = {
  CEILING:
    'a calm living-and-dining room, fixture mounted to a flat plaster ceiling, low warm-toned furniture below',
  STAND:
    'a quiet living-room corner / reading nook, the floor-standing fixture beside a low sofa and a bare wall',
  WALL:
    'a softly lit hallway or bedroom wall, the fixture grazing a wall-tint plaster surface',
  DESK:
    'an uncluttered desk or side table, the small fixture next to a few editorial objects',
};

/** kelvin → 발광 색온도 서술. references/lighting-mapping.md 참조. */
function describeKelvin(k) {
  if (k <= 2700) return 'a deep candle-warm amber light (~2400-2700K)';
  if (k <= 3200) return 'a warm amber-white light (~3000-3200K)';
  if (k <= 3800) return 'the brand-signature warm-neutral light (~3400-3800K)';
  if (k <= 4200) return 'a balanced near-neutral white light (~3900-4200K)';
  return 'a crisp neutral white light (~4400K)';
}

/** lux → 광량/세기 서술. */
function describeLux(lux) {
  if (lux <= 180) return 'a low, intimate output that pools softly rather than fills the room';
  if (lux <= 300) return 'a moderate, comfortable output for ambient presence';
  return 'a bright, confident output that clearly defines its zone';
}

/** lightPattern → 빛이 퍼지는 형태의 시각화. 핵심 토큰을 자연어로 푼다. */
function describeLightPattern(pattern) {
  const p = String(pattern);
  if (p.includes('downward')) return 'light spilling downward in a soft diffuse cone';
  if (p.includes('upward-downward') || p.includes('dual')) return 'light washing both up and down the surface';
  if (p.includes('upward')) return 'light grazing upward across the wall';
  if (p.includes('horizontal')) return 'a horizontal band of light spreading sideways';
  if (p.includes('perimeter') || p.includes('halo')) return 'a soft halo glowing around the perimeter';
  if (p.includes('omnidirectional')) return 'an even glow radiating in every direction';
  if (p.includes('vertical')) return 'a tall vertical panel of even light';
  if (p.includes('radiate') || p.includes('four-directional')) return 'light radiating outward in multiple directions';
  if (p.includes('gap') || p.includes('emission')) return 'thin lines of light escaping from narrow gaps';
  if (p.includes('refraction') || p.includes('prism')) return 'light refracting into faint geometric facets';
  if (p.includes('spot')) return 'a focused pool of light on the surface below';
  return 'a soft even diffusion of light';
}

/* ------------------------------------------------------------------ *
 * 2. 고정 톤 블록 (모든 컷 공유 — 톤 일관성의 핵심)
 * ------------------------------------------------------------------ */

const STYLE =
  'Editorial architectural product photography in the Lumenstate brand tone: warm minimal, ambient warmth, ' +
  'flat and quiet. No glow bloom, no gradient backdrops, no directional drop shadows. A 3800K warm-neutral ' +
  'palette on a wall-tint paper background with restrained negative space. Light is the subject; the fixture ' +
  'is its medium. Calm, precise, magazine-spread restraint.';

const CAMERA =
  'Shot on a 50mm prime at eye level, with consistent exposure and color science across the entire set so the ' +
  'cuts read as one continuous series. Square 1:1 framing, rule-of-thirds placement.';

/* ------------------------------------------------------------------ *
 * 3. 컷 레시피 (hero 없음, 빛의 연속성 베이스)
 * ------------------------------------------------------------------ */

const CUT_RECIPES = [
  {
    slug: 'angle-offdim',
    framing: 'three-quarter-angle mid shot showing the full fixture silhouette in its space',
    zoom: 'medium-wide framing',
    state: 'just before ignition / switched off, only a faint residual warmth in the glass',
    timeOfDay: 'late-afternoon daylight',
    lit: false,
  },
  {
    slug: 'front-glow',
    framing: 'frontal medium shot centered on the emitting surface',
    zoom: 'medium framing',
    state: 'on at comfortable working brightness, its light pattern clearly readable',
    timeOfDay: 'blue-hour transition',
    lit: true,
  },
  {
    slug: 'material-macro',
    framing: 'macro detail crop where the glass finish meets the hardware joint',
    zoom: 'tight close-up',
    state: 'on, with soft specular highlights tracing the hardware',
    timeOfDay: 'early evening',
    lit: true,
  },
  {
    slug: 'context-night',
    framing: 'low-angle wide shot, the fixture small in frame as light washes the room',
    zoom: 'wide framing',
    state: 'dimmed to a warm low output, ambient light spilling gently across surfaces',
    timeOfDay: 'night',
    lit: true,
  },
];

/** N 에 맞춰 레시피를 고른다(부족하면 앞에서부터, 초과면 순환 + 접미사). */
function selectRecipes(count) {
  if (count <= CUT_RECIPES.length) return CUT_RECIPES.slice(0, count);
  return Array.from({ length: count }, (_, i) => {
    const base = CUT_RECIPES[i % CUT_RECIPES.length];
    const cycle = Math.floor(i / CUT_RECIPES.length);
    return cycle === 0 ? base : { ...base, slug: `${base.slug}-${cycle + 1}` };
  });
}

/* ------------------------------------------------------------------ *
 * 4. products.js 파싱 (png import 때문에 직접 import 불가 → 텍스트 파싱)
 * ------------------------------------------------------------------ */

function loadProduct(id) {
  const file = path.join(PROJECT_ROOT, 'src', 'data', 'products.js');
  if (!fs.existsSync(file)) {
    fail(`products.js 를 찾을 수 없습니다: ${file}`);
  }
  const src = fs.readFileSync(file, 'utf8');
  // id 로 시작하는 객체 블록을 잡는다.
  const block = src.match(new RegExp(`\\{\\s*id:\\s*${id},([\\s\\S]*?)\\n\\s*\\},`));
  if (!block) {
    const ids = [...src.matchAll(/id:\s*(\d+),/g)].map((m) => m[1]).join(', ');
    fail(`product id ${id} 를 찾을 수 없습니다. 사용 가능한 id: ${ids}`);
  }
  const body = block[1];
  const str = (key) => {
    const m = body.match(new RegExp(`${key}:\\s*'([^']*)'`));
    return m ? m[1] : undefined;
  };
  const num = (key) => {
    const m = body.match(new RegExp(`${key}:\\s*(\\d+)`));
    return m ? Number(m[1]) : undefined;
  };
  const typeToken = (body.match(/type:\s*PRODUCT_TYPES\.(\w+)/) || [])[1];

  return {
    id,
    title: str('title'),
    type: typeToken, // CEILING | STAND | WALL | DESK
    form: str('form'),
    lightPattern: str('lightPattern'),
    lux: num('lux'),
    kelvin: num('kelvin'),
  };
}

/* ------------------------------------------------------------------ *
 * 5. 프롬프트 조립 (5요소 템플릿)
 * ------------------------------------------------------------------ */

function buildPrompt(product, glassLabel, hardwareLabel, recipe) {
  const setting = SPACE_BY_TYPE[product.type] || 'a quiet, light-toned interior';
  const action = recipe.lit
    ? `The fixture is ${recipe.state}, emitting ${describeKelvin(product.kelvin)} at ${describeLux(product.lux)} — ` +
      `${describeLightPattern(product.lightPattern)}. Time of day: ${recipe.timeOfDay}.`
    : `The fixture is ${recipe.state}. Time of day: ${recipe.timeOfDay}.`;

  const subject =
    `A ${product.form} finished in ${glassLabel} with ${hardwareLabel} hardware — ` +
    'this exact material combination is fixed and must look identical across every cut.';

  const composition =
    `${recipe.framing}, ${recipe.zoom}. ${CAMERA}`;

  return [
    `[Style] ${STYLE}`,
    `[Subject] ${subject}`,
    `[Setting] ${setting}.`,
    `[Action] ${action}`,
    `[Composition] ${composition}`,
  ].join('\n');
}

/* ------------------------------------------------------------------ *
 * 6. CLI 파싱 · 검증
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { count: 4, glass: 'opaline', hardware: 'patina-brass', dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--product') args.product = Number(argv[++i]);
    else if (a === '--glass') args.glass = argv[++i];
    else if (a === '--hardware') args.hardware = argv[++i];
    else if (a === '--count') args.count = Number(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
  }
  return args;
}

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function requireApiKey() {
  if (process.env.GEMINI_API_KEY) return;
  fail(
    'GEMINI_API_KEY 가 설정되지 않았습니다.\n' +
      '   1) https://aistudio.google.com 에서 API 키를 발급하세요.\n' +
      '   2) 프로젝트 루트의 .env.local 에 다음을 추가하세요:\n' +
      '        GEMINI_API_KEY=발급받은키\n' +
      '   3) .gitignore 의 *.local 규칙이 .env.local 을 제외하는지 확인하세요.\n' +
      '   (키 없이 프롬프트만 확인하려면 --dry-run 을 사용하세요.)'
  );
}

/* ------------------------------------------------------------------ *
 * 7. Gemini 호출 · 저장
 * ------------------------------------------------------------------ */

/** SDK 를 한 번만 import 하고 클라이언트를 만든다(미설치 시 즉시 종료). */
async function createClient() {
  let GoogleGenAI;
  try {
    ({ GoogleGenAI } = await import('@google/genai'));
  } catch {
    fail('@google/genai 가 설치되지 않았습니다. `pnpm add @google/genai` 를 실행하세요.');
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function generateImage(ai, prompt) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: prompt,
    config: {
      responseModalities: ['Image'],
      // imageSize 는 SDK 값 '1K'|'2K'|'4K'. 1024px ≈ '1K'.
      // 현재 이 프리뷰 모델은 imageSize 를 무시하고 1K 를 반환하는 알려진 이슈가 있다(js-genai #1461).
      imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    throw new Error('응답에 이미지가 없습니다. 프롬프트나 모델 응답을 확인하세요.');
  }
  return Buffer.from(imagePart.inlineData.data, 'base64');
}

/* ------------------------------------------------------------------ *
 * 8. 메인
 * ------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.product || Number.isNaN(args.product)) {
    fail('--product <id> 는 필수입니다. 예: --product 17');
  }
  if (!GLASS_LABELS[args.glass]) {
    fail(`유효하지 않은 --glass "${args.glass}". 허용: ${Object.keys(GLASS_LABELS).join(', ')}`);
  }
  if (!HARDWARE_LABELS[args.hardware]) {
    fail(`유효하지 않은 --hardware "${args.hardware}". 허용: ${Object.keys(HARDWARE_LABELS).join(', ')}`);
  }

  const product = loadProduct(args.product);
  const glassLabel = GLASS_LABELS[args.glass];
  const hardwareLabel = HARDWARE_LABELS[args.hardware];
  const recipes = selectRecipes(args.count);
  const outDir = path.resolve(
    PROJECT_ROOT,
    args.out || path.join('generated', 'lumenstate', String(args.product))
  );

  console.log(`\n● ${product.title} (id ${product.id}, ${product.type})`);
  console.log(`  재료(고정): ${glassLabel} + ${hardwareLabel}`);
  console.log(`  컷 수: ${recipes.length}  →  ${outDir}\n`);

  // 실제 생성 전 전제조건(키 + 패키지)을 먼저 확정해 크레딧·시간을 낭비하지 않는다.
  let ai = null;
  if (!args.dryRun) {
    requireApiKey();
    ai = await createClient();
    fs.mkdirSync(outDir, { recursive: true });
  }

  // dry-run: 프롬프트만 순차 출력하고 종료.
  if (args.dryRun) {
    for (const recipe of recipes) {
      console.log(`── ${recipe.slug} ──────────────────────────────`);
      console.log(buildPrompt(product, glassLabel, hardwareLabel, recipe));
      console.log('');
    }
    console.log('\n(dry-run: 실제 생성은 하지 않았습니다.)\n');
    return;
  }

  // 컷들은 서로 독립적이므로 병렬로 생성한다(한 컷이 실패해도 나머지는 계속).
  console.log(`  ${recipes.length}개 컷 병렬 생성 중…\n`);
  const results = await Promise.all(
    recipes.map(async (recipe) => {
      const prompt = buildPrompt(product, glassLabel, hardwareLabel, recipe);
      const outPath = path.join(outDir, `${product.id}-${recipe.slug}.png`);
      try {
        const bytes = await generateImage(ai, prompt);
        fs.writeFileSync(outPath, bytes);
        console.log(`  ✓ ${recipe.slug} — 저장됨 (${(bytes.length / 1024).toFixed(0)} KB)`);
        return true;
      } catch (err) {
        console.log(`  ✗ ${recipe.slug} — 실패: ${err.message}`);
        return false;
      }
    })
  );

  const ok = results.filter(Boolean).length;
  console.log(`\n완료: ${ok}/${results.length} 저장 → ${outDir}\n`);
}

main().catch((err) => fail(err.stack || err.message));
