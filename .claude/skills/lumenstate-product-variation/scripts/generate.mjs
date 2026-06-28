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
 * 1. 공간·조명 매핑 (제품 외형은 레퍼런스가 정의, 배치 공간·색온도만 텍스트로)
 * ------------------------------------------------------------------ */

/**
 * product.type → 제품이 자연스럽게 놓이는 인테리어 컨텍스트 목록(컷마다 다른 배경).
 * 각 문자열은 "the fixture is ___" 뒤에 자연스럽게 이어지도록 서술한다.
 * 컷별로 서로 다른 배경을 쓰기 위해 타입마다 5개 변형을 둔다. references/space-mapping.md 참조.
 */
const SPACE_BY_TYPE = {
  CEILING: [
    'flush-mounted to the ceiling of a calm living-and-dining room above a long oak dining table',
    'flush-mounted to the ceiling of a bright open kitchen-dining space above a pale stone island',
    'flush-mounted to the ceiling of an entry foyer above a slim console table near a staircase',
    'flush-mounted to the ceiling of a serene bedroom above a low bed dressed in linen',
    // index 4 — lifestyle: 사람이 머무는 거실
    'flush-mounted to the ceiling of a warm living room above a low modular sofa, an inviting place to relax',
  ],
  STAND: [
    'standing on the floor in a bright living-room corner beside a low bouclé sofa, pale plaster walls and an oak floor',
    'standing in a sunlit reading nook by a tall window with sheer linen curtains and a linen armchair',
    'standing in a warm minimalist bedroom corner beside a low platform bed and a small nightstand',
    'standing in an open-plan loft lounge with a polished concrete floor, a large wool rug and a leather lounge chair',
    'standing in a calm study corner beside a walnut desk stacked with books and a tall shelf',
  ],
  WALL: [
    'mounted on a softly lit hallway wall of warm plaster above a slim console table',
    'mounted on a living-room wall above a low walnut sideboard',
    'mounted on a tall plaster wall in a quiet stairwell',
    'mounted on a powder-room wall beside a round mirror',
    // index 4 — lifestyle: 사람이 책 읽는 침실/거실 (어색한 파우더룸·계단실 피함)
    'mounted on a bedroom wall beside a low bed and a comfortable reading chair, a cozy reading corner',
  ],
  // DESK 는 8종(제품마다 product.id 오프셋으로 다른 배경이 걸리게) — 표면·공간을 폭넓게 변주한다.
  // 배경 문자열은 시간대/밝기를 박지 않는다(밝기는 컷의 Lighting 라인이 정함 — 어떤 배경이 주간·소등 컷에 걸려도 어둡지 않게).
  DESK: [
    'resting on a walnut writing desk in a calm study with warm plaster walls',
    'resting on a woven rattan nightstand beside a low linen-dressed bed',
    'resting on a travertine console in a plaster hallway',
    'resting on a honed-stone kitchen island by a tall window',
    'resting on a wide oak desk in a creative studio with a few art objects',
    'resting on a marble side table beside a bouclé lounge chair',
    'resting on a floating oak shelf against a raw plaster wall',
    'resting on a dark-stained oak sideboard in a living room',
  ],
};

const DEFAULT_BACKGROUNDS = ['in a quiet, light-toned interior'];

/**
 * product.type → 설치 방식 고정. 평면 마운트(WALL/CEILING)는 공중부양·형태 재해석을 막기 위해
 * 마운팅 면에 밀착 + 정면에 가깝게 보이도록 강제한다. references/space-mapping.md 참조.
 */
const INSTALL_BY_TYPE = {
  CEILING:
    'The fixture is mounted flush against the ceiling (never floating free in mid-air); show its true flat ' +
    'circular profile and exact silhouette from the reference, not a deep drum.',
  WALL:
    'The fixture is mounted flat and flush against the wall (never floating free in the room); show it ON the ' +
    'wall surface. A frontal or gently oblique (left/right three-quarter) view is fine, but its exact silhouette ' +
    'and symmetry from the reference must still read clearly — do not use a steep raking angle that distorts it, ' +
    'and never reinvent it as a different, asymmetric or free-standing 3D shape. Mount it at a natural, functional ' +
    'height and position for the room (e.g. beside a bed or a seat as a reading light), not isolated high on an ' +
    'empty wall.',
  STAND: 'The fixture stands on the floor exactly as in the reference.',
  DESK:
    'The fixture rests on its surface (a desk, table or shelf) exactly as in the reference. It is a SMALL ' +
    'tabletop desk lamp — roughly the height of a small stack of books (about 25–35 cm / 10–14 in tall), only a ' +
    'little taller than a coffee mug beside it, taking up just a small corner of the surface and leaving most of ' +
    'the desk empty. Next to everyday desk objects (a mug, a notebook, a pen) it must read as clearly small, and ' +
    'far smaller than a seated person — its top no higher than roughly the chest of someone sitting at the desk. ' +
    'Never render it as a large floor-standing panel, a room divider or an oversized monolith.',
};

/**
 * lifestyle 컷 인물 다양화(인종+성별). product.id 로 결정해 제품마다 다른 사람이 나오되 재현 가능하게 한다.
 * (Math.random 미사용 — 결정적.)
 */
const PEOPLE = [
  'a Black woman',
  'an East Asian man',
  'a white woman',
  'a South Asian man',
  'a Latina woman',
  'a Middle Eastern man',
  'a Southeast Asian woman',
  'a Black man',
];

/**
 * 스케일 기준 오브젝트(컷마다 다르게 — 머그만 반복되면 단조롭다). product.id + 컷 순서로 분산한다.
 * 절대 크기(cm)가 실제 앵커이고, 이 오브젝트는 친숙한 시각적 크기 단서로만 쓴다.
 */
const SCALE_OBJECTS = [
  'a small ceramic vase holding a single dried stem',
  'a pair of folded sunglasses',
  'a stoneware teapot',
  'a small trailing potted plant',
  'a sculptural stone object',
  'a vintage film camera',
  'a scented candle in a glass jar',
  'a small brass dish holding keys',
  'a vintage desk clock',
  'a folded pair of headphones',
];

/** kelvin → 발광 색온도 서술. references/lighting-mapping.md 참조. */
function describeKelvin(k) {
  if (k <= 2700) return 'a deep candle-warm amber light (~2400-2700K)';
  if (k <= 3200) return 'a warm amber-white light (~3000-3200K)';
  if (k <= 3800) return 'the brand-signature warm-neutral light (~3400-3800K)';
  if (k <= 4200) return 'a balanced near-neutral white light (~3900-4200K)';
  return 'a crisp neutral white light (~4400K)';
}

/* ------------------------------------------------------------------ *
 * 2. 고정 톤 블록 (모든 컷 공유 — 톤 일관성의 핵심)
 * ------------------------------------------------------------------ */

// 인테리어 톤만 정의한다. 제품 외형은 레퍼런스 이미지가 정의하므로 여기서 묘사하지 않는다.
const STYLE =
  'Editorial architectural interior photography in the Lumenstate brand tone: warm minimal, ambient warmth, ' +
  'flat and quiet. Every image must share the same calm, cohesive ambient mood so the set reads as one ' +
  'consistent brand story — soft diffuse ambient light, warm-neutral plaster tones, no harsh contrast, no ' +
  'stark or clinical look. The fixture sits naturally within a real, restrained interior — calm plaster walls, ' +
  'low warm-toned furniture, generous negative space. No glow bloom, no gradient vignettes, no directional ' +
  'drop shadows. 3800K warm-neutral palette, magazine-spread restraint. ' +
  'Keep every object at believable real-world proportions: the fixture must read at a natural, common-sense ' +
  'size relative to the people, furniture and room around it — never inflated, oversized, shrunken or out of ' +
  'scale with its surroundings.';

/* ------------------------------------------------------------------ *
 * 3. 컷 레시피 — 레퍼런스 제품을 인테리어에 배치하고 각도·줌·디테일 크롭으로 변주 (off↔on 연속성)
 *    off 컷은 밝은 주간 공간(1.png 톤), on 컷은 점등 글로우가 도는 어두운 저녁/야간(1-1.png 톤).
 * ------------------------------------------------------------------ */

// 컷마다 (1) 배경(bg 인덱스)이 다르고 (2) 구도 대비가 크다: 와이드 → 미디엄 → 매크로 클로즈 →
// 로우앵글 → 인물 등장. off↔on 점등 연속성도 함께 깐다.
const CUT_RECIPES = [
  {
    slug: 'room-wide-day',
    bg: 0,
    camera:
      'orbit the camera to the LEFT and turn the fixture so we clearly see its LEFT side and its depth/thickness ' +
      '— a genuine left three-quarter, NOT a flat head-on view. The fixture must look meaningfully rotated from ' +
      'the other cuts (do not show the same face/angle every time)',
    view:
      'a striking wide editorial establishing shot with real architectural character and DEPTH — not a flat ' +
      'product-on-furniture shot. Build a strong sense of place and visual interest: raking natural light and ' +
      'soft shadow play across textured plaster, a doorway / window / archway framing the view, and layered ' +
      'foreground and background so the eye travels through the space. Compose so the pale fixture reads clearly ' +
      'as the quiet subject with soft figure-ground contrast against the surface behind it — never let a white / ' +
      'pale fixture blend into a same-tone background; give it a deliberate, legible placement as the obvious ' +
      'subject. The fixture sits as a modest, believably-sized object at a natural real-world scale — small ' +
      'relative to the furniture and nearby objects, with generous surface and space around it; it must NOT be ' +
      'oversized or tower over the furniture',
    zoom: 'wide, the fixture small and occupying only a modest part of the frame, the composition itself characterful and editorial',
    lit: false,
    light: 'soft warm daylight with gentle ambient warmth (calm and inviting, never flat or clinical), the fixture unlit / off while the room glows with quiet natural light',
  },
  {
    slug: 'room-front-lit',
    bg: 1,
    camera: 'straight in front of the fixture — a head-on frontal vantage',
    view: 'a frontal medium shot moving close to the fixture',
    zoom: 'medium, the fixture prominent with the room softer behind',
    lit: true,
    light: 'evening, the fixture switched on and glowing warm, the room dimmer so the glow reads',
  },
  {
    slug: 'detail-crop',
    bg: 2,
    camera: 'a near-front-on vantage matching the reference, only very slightly angled if at all',
    view:
      'a tight, deliberate MACRO detail crop of the fixture\'s glowing light surface — fill the frame with its ' +
      'softly lit diffuser(s) and the matte-black frame / edge detail between and around them, a clean editorial ' +
      'close-up that reads as a study of the warm light itself. NO scale object in frame. The fixture is cropped ' +
      'on purpose and extends beyond the frame, but compose the crop INTENTIONALLY and CLEANLY — balanced and ' +
      'squared to the form, the framing edges running parallel to the fixture\'s own lines; it must look like a ' +
      'deliberate editorial crop, NOT an awkward, tilted or lopsided slice that leaves parts half-cut and ' +
      'dangling unevenly at the corners. Keep every part\'s shape, proportion and arrangement EXACTLY as in the ' +
      'reference (just much closer) — do not re-pose, rearrange, resize, straighten, duplicate or reinvent any ' +
      'part. Shallow depth of field, the room soft behind. ONE continuous frame, never a collage or grid',
    zoom: 'a tight macro close-up that fills the frame with the glowing diffuser surface and frame detail, shallow depth of field, no scale object',
    lit: true,
    light: 'the fixture\'s own panels softly glowing in the brand warm-neutral tone — a gentle ambient warmth with no harsh bloom — revealing the surface and finish',
  },
  {
    slug: 'angle-low-night',
    bg: 3,
    camera:
      'orbit the camera to the RIGHT and slightly low, turning the fixture so we clearly see its RIGHT side and ' +
      'depth — a genuine right three-quarter from a low vantage, distinctly different from the other cuts; keep ' +
      'the fixture small in the frame',
    view:
      'a gentle off-axis / oblique angle on the fixture as installed (a soft low or three-quarter vantage), the ' +
      'fixture still clearly readable in its true form — not a steep dramatic distortion. The fixture sits as a ' +
      'modest, believably-sized object on its surface with generous empty surface and room around it — it must ' +
      'NOT be oversized or fill much of the frame; render it small-to-medium in the scene at a natural real-world ' +
      'scale relative to the furniture and nearby objects',
    zoom: 'wide / medium-wide, the fixture small in the frame with plenty of ambient interior context around it',
    lit: true,
    light:
      'night, the fixture\'s panels glowing a WARM, cozy amber-white (the brand warm tone — clearly warm and ' +
      'inviting, NOT cool or plain white), casting a gentle warm light across nearby surfaces; keep the overall ' +
      'scene calm and ambient — warm but not a saturated orange or golden sunset cast',
  },
  // 인물이 등장하는 라이프스타일 컷 — 가장 큰 구도 대비. 사람은 캔디드(카메라 응시 X)로.
  {
    slug: 'lifestyle-person',
    bg: 4,
    withPerson: true,
    scale: 'medium',
    camera:
      'an unforced editorial vantage giving yet another distinct angle on the fixture (e.g. a higher or more ' +
      'frontal three-quarter than the left/right cuts), so across the set the lamp is seen from clearly ' +
      'different sides — never the same orientation every time',
    view:
      'ONE single cohesive photograph — NEVER a diptych, split-screen, collage or two side-by-side panels. ' +
      'The lit fixture is the focal point — but ONLY through composition and its warm glow, by placing it ' +
      'closer to camera in the foreground and letting the light draw the eye FIRST. CRITICAL: the fixture must ' +
      'stay at its believable, true-to-life real-world size relative to the person and furniture (matching its ' +
      'real scale from the reference) — do NOT enlarge, inflate or oversize it, and it must never look bigger ' +
      'than it realistically is or tower over the seated person; a viewer should read its size as completely ' +
      'natural next to the sofa, chair and people. In the same room a person sits quietly reading at ease, a ' +
      'calm secondary presence, not dominating the frame. When the face is visible it is in sharp focus, a real ' +
      'fully-detailed human face, ABSOLUTELY NO blurring, smudging or pixelation. Candid, unforced, editorial; ' +
      'light is the subject, the person is quiet ambience',
    zoom: 'the fixture placed prominently in the foreground at its natural real-world size (not enlarged), the seated person a smaller secondary element further back, one single frame, the person not looking at the camera. Compose the lamp and the person as ONE balanced, cohesive vignette sharing the same space — do NOT leave a large empty dead gap between them or isolate the lamp alone at the far edge',
    lit: true,
    light:
      'evening, the fixture\'s panels glowing a WARM, cozy amber-white (clearly warm and inviting, NOT cool or ' +
      'plain white), casting a soft warm glow for a cozy lived-in mood',
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

/** 기준 제품 이미지(src/assets/product/{id}.png)를 읽어 base64 로 반환한다. */
function loadProductImage(id) {
  const imgPath = path.join(PROJECT_ROOT, 'src', 'assets', 'product', `${id}.png`);
  if (!fs.existsSync(imgPath)) {
    fail(`기준 제품 이미지를 찾을 수 없습니다: ${imgPath}`);
  }
  return { data: fs.readFileSync(imgPath).toString('base64'), mimeType: 'image/png', path: imgPath };
}

/* ------------------------------------------------------------------ *
 * 5. 프롬프트 조립 (레퍼런스 이미지 + 변주 지시)
 * ------------------------------------------------------------------ */

function buildPrompt(product, recipe) {
  const lightLine = recipe.lit
    ? `Lighting: ${recipe.light}. The emitted light is roughly ${describeKelvin(product.kelvin)}.`
    : `Lighting: ${recipe.light}.`;

  // 컷마다 다른 배경을 고른다(없으면 폴백). DESK 는 product.id 오프셋을 더해 제품마다 다른 배경이 걸리게 한다.
  const backgrounds = SPACE_BY_TYPE[product.type] || DEFAULT_BACKGROUNDS;
  const bgOffset = product.type === 'DESK' ? product.id : 0;
  let setting = backgrounds[((recipe.bg ?? 0) + bgOffset) % backgrounds.length];
  if (recipe.withPerson) {
    const person = PEOPLE[product.id % PEOPLE.length];
    setting +=
      `, with ${person} naturally present in the scene (seated, reading or relaxing), shown candidly and not ` +
      'looking at the camera';
  }

  // DESK 제품은 절대 크기(cm)로 작게 못 박고, 시각적 스케일 단서 오브젝트는 컷·제품마다 다양화한다(머그만 반복 방지).
  let scaleNote = null;
  if (product.type === 'DESK') {
    const slugIndex = CUT_RECIPES.findIndex((r) => r.slug === recipe.slug);
    const scaleObj = SCALE_OBJECTS[(product.id + Math.max(0, slugIndex)) % SCALE_OBJECTS.length];
    const propRule =
      `Use ${scaleObj} as the main size cue, plus one or two other distinctive props that suit this particular ` +
      'room. IMPORTANT: vary the styling widely from shot to shot and AVOID the boring cliché of a coffee mug ' +
      'and a stack of books — do not lean on mugs or book stacks as the default desk props.';
    scaleNote =
      recipe.scale === 'medium'
        ? `Scale (keep it a SMALL table lamp): the fixture is a modest tabletop lamp about 25-30 cm tall. ` +
          `${propRule} It is clearly smaller than the seated person (its top well below their shoulders) and is ` +
          'never floor furniture or a room divider — but not a tiny trinket either.'
        : `Scale (ABSOLUTE TOP PRIORITY — the fixture must look SMALL, a hard requirement): this is a small desk ` +
          `accessory you can pick up in one hand, only about 18-22 cm / 7-9 in tall. ${propRule} The fixture ` +
          'must read as a small tabletop object, with the surface, those props and any person all clearly large ' +
          'next to it and a seated person dwarfing it. It is emphatically NOT floor furniture, a room divider or ' +
          'a shelf unit — if in doubt, smaller.';
  }

  return [
    // 레퍼런스 이미지가 제품 외형을 정의한다 — 제품은 동일하게 유지하고, 실제 공간에 배치한다.
    'Use the provided image as the exact product reference. Keep the fixture itself — its shape, proportions, ' +
      'color, material and finish — 100% identical to the reference. Do not redesign it or add/remove parts. ' +
      'Match the exact finish and colour of the reference: if the fixture is matte black it stays matte black in ' +
      'every cut — do NOT render it as silver, chrome, grey, brushed metal or any glossy metallic finish (and ' +
      'do not recolour it the other way either). Only the luminous diffuser emits light; the body keeps its colour. ' +
      'Reproduce the light-emitting head/diffuser with the SAME depth, thickness and profile as the reference — ' +
      'match its real form exactly, whether that is a thin flat recessed panel, a flat disc, a glowing edge ' +
      'strip, or a gently domed lens. Do NOT add depth or curvature it does not have (never turn a thin flat ' +
      'fixture into a deep drum or a bulging dome), and do NOT flatten or hollow out a form that does have them. ' +
      'Keep any wall/ceiling mount or backplate as slim and minimal as in the reference — do not add or thicken ' +
      'a bulky mounting plate, bracket or housing that the reference does not show. ' +
      'Render the fixture at a realistic real-world scale relative to the room and furniture — a believable size, ' +
      'neither oversized nor shrunken (e.g. a flush ceiling light reads as a moderate disc, not a huge panel). ' +
      'Place this exact fixture naturally into the interior described below, as it would really be installed.',
    `Setting: the fixture is ${setting}.`,
    // 인물 컷이 아니면 사람을 절대 넣지 않는다(모델이 배경에 임의로 사람을 추가하는 것 방지).
    recipe.withPerson
      ? null
      : 'People: NO people anywhere in the frame — the room is completely empty of people, with no figures in the background or foreground.',
    scaleNote,
    `Installation: ${INSTALL_BY_TYPE[product.type] || 'The fixture is placed as it would really be installed.'}`,
    `Variation: ${recipe.view}. Camera: ${recipe.camera || 'a natural editorial vantage'}. Framing: ${recipe.zoom}; square 1:1.`,
    lightLine,
    `Style: ${STYLE}`,
  ].filter(Boolean).join('\n');
}

/* ------------------------------------------------------------------ *
 * 6. CLI 파싱 · 검증
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { count: 4, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--product') args.product = Number(argv[++i]);
    else if (a === '--count') args.count = Number(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--no-person') args.noPerson = true;
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

async function generateImage(ai, prompt, refImage) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    // 레퍼런스 제품 이미지 + 변주 지시 텍스트를 함께 보낸다(image-to-image).
    contents: [
      { inlineData: { mimeType: refImage.mimeType, data: refImage.data } },
      { text: prompt },
    ],
    config: {
      responseModalities: ['Image'],
      // imageSize 는 SDK 값 '1K'|'2K'|'4K'. 1024px ≈ '1K'.
      // 현재 이 프리뷰 모델은 imageSize 를 무시하고 1K 를 반환하는 알려진 이슈가 있다(js-genai #1461).
      // outputMimeType 은 Developer API 에서 미지원 → 생략하고, 저장 시 반환 mimeType 으로 확장자를 맞춘다.
      imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    throw new Error('응답에 이미지가 없습니다. 프롬프트나 모델 응답을 확인하세요.');
  }
  return {
    bytes: Buffer.from(imagePart.inlineData.data, 'base64'),
    mimeType: imagePart.inlineData.mimeType || 'image/png',
  };
}

/** mimeType → 파일 확장자 (실제 포맷과 확장자가 어긋나지 않게). */
function extFor(mimeType) {
  if (/jpe?g/.test(mimeType)) return 'jpg';
  if (/webp/.test(mimeType)) return 'webp';
  return 'png';
}

/* ------------------------------------------------------------------ *
 * 8. 메인
 * ------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.product || Number.isNaN(args.product)) {
    fail('--product <id> 는 필수입니다. 예: --product 1');
  }

  const product = loadProduct(args.product);
  const refImage = loadProductImage(args.product); // 변주의 기준이 되는 실제 제품 이미지

  // --only <slug[,slug]> 가 있으면 해당 컷만 (count 무시) 재생성한다. 다른 컷은 건드리지 않는다.
  let recipes;
  if (args.only) {
    const wanted = args.only.split(',').map((s) => s.trim()).filter(Boolean);
    recipes = wanted.map((slug) => CUT_RECIPES.find((r) => r.slug === slug)).filter(Boolean);
    const known = CUT_RECIPES.map((r) => r.slug).join(', ');
    if (recipes.length !== wanted.length) {
      fail(`--only 에 알 수 없는 slug 가 있습니다. 사용 가능한 slug: ${known}`);
    }
  } else {
    recipes = selectRecipes(args.count);
  }

  // --no-person: 인물 컷(withPerson)을 인물 없는 차분한 스타일링 룸샷으로 대체한다(같은 slug 유지).
  if (args.noPerson) {
    recipes = recipes.map((r) =>
      r.withPerson
        ? {
            ...r,
            withPerson: false,
            view:
              'a calm, styled editorial room shot of the space with NO people anywhere in the frame — just the ' +
              'fixture as a quiet focal point among a few tasteful props in a believable, lived-in room; light ' +
              'is the subject',
            zoom: 'medium-wide, the fixture comfortably in frame within its room, no person present',
          }
        : r
    );
  }

  const outDir = path.resolve(
    PROJECT_ROOT,
    args.out || path.join('generated', 'lumenstate', String(args.product))
  );

  console.log(`\n● ${product.title} (id ${product.id}, ${product.type})`);
  console.log(`  기준 이미지: ${path.relative(PROJECT_ROOT, refImage.path)}`);
  console.log(`  컷 수: ${recipes.length}  →  ${outDir}\n`);

  // dry-run: 프롬프트만 순차 출력하고 종료.
  if (args.dryRun) {
    for (const recipe of recipes) {
      console.log(`── ${recipe.slug} ──────────────────────────────`);
      console.log(buildPrompt(product, recipe));
      console.log('');
    }
    console.log('\n(dry-run: 실제 생성은 하지 않았습니다. 기준 이미지를 레퍼런스로 사용합니다.)\n');
    return;
  }

  // 실제 생성 전 전제조건(키 + 패키지)을 먼저 확정해 크레딧·시간을 낭비하지 않는다.
  requireApiKey();
  const ai = await createClient();
  fs.mkdirSync(outDir, { recursive: true });

  // 컷들은 서로 독립적이므로 병렬로 생성한다(한 컷이 실패해도 나머지는 계속).
  console.log(`  ${recipes.length}개 컷 병렬 생성 중…\n`);
  const results = await Promise.all(
    recipes.map(async (recipe) => {
      const prompt = buildPrompt(product, recipe);
      try {
        const { bytes, mimeType } = await generateImage(ai, prompt, refImage);
        const outPath = path.join(outDir, `${product.id}-${recipe.slug}.${extFor(mimeType)}`);
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
