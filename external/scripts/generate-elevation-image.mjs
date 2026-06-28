/**
 * Lumenstate Elevation Image Generator
 *
 * 단독주택 정면(Front Elevation) 구도의 브랜드 이미지를 생성하는 스크립트.
 * 대형 통창 너머로 각 방의 인테리어, 인물, Lumenstate 조명 제품이 보이는 구성.
 *
 * 생성 워크플로우:
 *   1. Day 이미지를 텍스트 프롬프트로 생성 (제품 OFF, 자연광)
 *   2. Day 이미지를 레퍼런스로 + Night 프롬프트로 Night 이미지 생성
 *      (제품 ON, 3800K 발광, 어두운 외부)
 *
 * Usage:
 *   node scripts/generate-elevation-image.mjs                # Day → Night 순차 생성
 *   node scripts/generate-elevation-image.mjs --mode day     # Day만 생성
 *   node scripts/generate-elevation-image.mjs --mode night   # Night만 (기존 Day 레퍼런스)
 *   node scripts/generate-elevation-image.mjs --dry-run      # 프롬프트만 출력
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
const OUTPUT_DIR = path.join(ROOT, 'src/assets/elevation');
const ASPECT_RATIO = '16:9';
const RESOLUTION = '2K';

// ---------- Brand Style Constants ----------

const STYLE = {
  dayBg: '#E8E5E1',
  nightBg: '#12100E',
  emissionColor: '#FFC66E',
  colorTemp: '3800K',
};

// ---------- Negative Prompt ----------

const NEGATIVE = 'No stock photo look, no posed model, no smile, no eye contact with camera, no bright saturated colors, no HDR over-processing, no lens flare, no vignette, no split toning, no teal-and-orange grading, no diagonal camera angle, no 3/4 view, no perspective convergence, no fish-eye, no wide-angle distortion, no text, no logos, no watermarks. CRITICAL: No face visible at all — every person must be seen from behind, in pure silhouette, or with head cropped out of frame. No blurred faces, no obscured faces — faces must simply NOT EXIST in the image.';

// ---------- Room Definitions ----------

/**
 * 각 방에 배치할 제품과 인물, 공간 설명.
 * 제품 formDetail은 generate-product-images.mjs의 PRODUCTS에서 요약.
 */
const ROOMS = [
  {
    position: 'ground floor, left bay',
    label: 'Living Room',
    product: {
      id: 2,
      form: 'parabolic arc floor lamp',
      description: 'A large arc floor lamp — thin black metal rod rises from a small rectangular stone base, forming a wide gentle parabolic curve (~180cm span), terminating in a small horizontal light bar at the far end. Matte black metal with white frosted glass light bar.',
    },
    person: 'A person in neutral linen clothing sitting on a low linen sofa, seen from BEHIND — back of head and shoulders visible, facing away from the camera toward the back wall. Sketching in a large notebook on their lap. Bare feet on the concrete floor.',
    interior: 'Polished concrete floor, white plaster walls, ceiling height ~3.5m. A single low linen sofa. A small side table with two stacked books. The arc lamp stands beside the sofa, its curve reaching overhead. Vast negative space above.',
    lightPattern: 'The horizontal light bar at the arc\'s end emits warm amber light downward. A focused pool of warm light illuminates the sketchbook and the person\'s hands. The arc rod is barely visible against the dark background.',
  },
  {
    position: 'ground floor, center bay',
    label: 'Dining',
    product: {
      id: 16,
      form: 'cubic pendant',
      description: 'A cube-shaped pendant light (~15cm) hanging from a thin black cord from the ceiling. Matte black aluminum frame edges with white frosted glass panels on the lower portion and sides.',
    },
    person: 'A person in a dark crew-neck sweater standing at the dining table, seen from BEHIND — back facing the camera, both hands arranging ceramic plates on the table surface. Only the back of the torso and arms visible.',
    interior: 'Light oak dining table (~160cm), two simple wooden chairs. Pale oak floor. The cubic pendant hangs centered above the table. White walls. Minimal — only the table, chairs, and pendant.',
    lightPattern: 'The cube\'s frosted glass faces glow with warm amber light, radiating downward onto the dining table. A soft warm pool illuminates the table surface and ceramic plates. The black frame edges remain as dark geometric lines.',
  },
  {
    position: 'ground floor, right bay',
    label: 'Studio',
    product: {
      id: 6,
      form: 'tall vertical cylindrical column',
      description: 'A tall slender cylinder (~120cm tall, ~8cm diameter) standing upright on a small circular base. Matte black metal body with a continuous vertical frosted glass panel running the full height of one face.',
    },
    person: 'A person in a white linen shirt sitting cross-legged on the floor on a low cushion, seen from BEHIND — back facing the camera, head tilted down toward printed photographs spread on the floor. Only back and shoulders visible.',
    interior: 'Pale oak floor, white walls, ceiling height ~3.5m. The column lamp stands upright to the left. Large printed photographs laid on the floor in a loose grid. No furniture except the cushion. Serene and open.',
    lightPattern: 'The vertical frosted panel glows with warm amber light along its full height, radiating outward. Warm light illuminates the photographs on the floor and the person\'s hands. The column becomes a tall luminous vertical line.',
  },
  {
    position: 'upper floor, left bay',
    label: 'Study',
    product: {
      id: 17,
      form: 'hemisphere desk lamp',
      description: 'A hemisphere of white frosted glass (~18cm diameter) placed dome-down on a thin circular matte black aluminum base plate (~20cm). Mushroom silhouette.',
    },
    person: 'A person in a light cream shirt sitting at the desk, seen from BEHIND — back facing the camera, typing on a laptop. Only the back of head, shoulders, and arms visible.',
    interior: 'Wide light oak desk (~180cm), a single wooden chair. The hemisphere lamp sits on the desk to the person\'s left. A laptop, a single ceramic mug. White walls, light concrete floor. Ceiling height ~3m. Vast and quiet.',
    lightPattern: 'The hemisphere glows from within with warm amber light. Brightest at the apex, softening toward the base. Light spills from the gap between dome and base plate, casting a warm ring on the desk surface.',
  },
  {
    position: 'upper floor, center bay',
    label: 'Gallery Corridor',
    product: {
      id: 11,
      form: 'arch portal wall light',
      description: 'A pure arch shape (~12cm wide x 18cm tall) mounted on a wall. Open inverted-U form — semicircular arc on top continuing into two straight vertical legs. Solid matte black anodized aluminum bar. NO glass visible from front. Concealed LED behind the frame.',
    },
    person: 'A person in light neutral clothing sitting on the polished concrete floor beneath the arch, seen from BEHIND — back leaning against the wall, facing away from the camera. An open architecture book on their lap. Only the back of head and shoulders visible.',
    interior: 'Long narrow gallery-like corridor visible through the window. White walls, polished concrete floor. The arch is mounted on the far wall at eye level. No furniture, no decoration. Minimal and monumental.',
    lightPattern: 'The concealed LED behind the arch frame emits warm amber light onto the wall behind, creating an arch-shaped halo. The matte black frame itself remains dark — a silhouette against the warm glow. A luminous portal effect.',
  },
  {
    position: 'upper floor, right bay',
    label: 'Meditation Room',
    product: {
      id: 8,
      form: 'split disc wall light',
      description: 'A circular disc (~25cm diameter) split horizontally into two equal halves with a precise ~8mm gap. Top and bottom half-discs are white frosted glass with thin matte black edge frames. The gap creates geometric tension.',
    },
    person: 'A person in a white linen top sitting cross-legged on a woven jute mat beneath the wall light, seen from BEHIND — back facing the camera, writing in a small notebook. Only the back of head and shoulders visible.',
    interior: 'White plaster walls, light oak floor. The split disc is mounted centered on the wall at ~150cm height. Below it, the person on a simple woven mat. A single ceramic cup beside them. Nothing else. Serene and still.',
    lightPattern: 'Both half-discs glow with warm amber light from within. Warm amber light also emanates from the horizontal gap, projecting a horizontal band onto the wall. The person\'s notebook and hands catch warm light from above.',
  },
];

// ---------- Architecture Variants ----------

const VARIANTS = {
  default: {
    name: 'default',
    label: 'Plaster House',
    filePrefix: 'elevation',
    architecture: `A perfectly frontal, orthographic-style photograph of a modern single-family house. The camera is perfectly perpendicular to the facade — absolutely NO perspective convergence, NO vanishing point, NO foreshortening. The image reads like an architectural elevation drawing rendered as a photorealistic photograph.

House silhouette: two-story, flat roof with minimal ~30cm overhang. Clean rectangular massing — one primary rectangular volume. The facade is divided into 6 large window bays: 3 on the ground floor, 3 on the upper floor. A thin horizontal floor slab visually separates the two levels.

Material: smooth white plaster exterior walls matching the warm off-white tone (${STYLE.dayBg}). Window frames are thin dark steel (~3cm), matching the matte black aluminum of the products inside. Minimal concrete base/plinth (~20cm visible). Flat roof edge is a thin dark steel fascia.

Windows: each bay has a single large floor-to-ceiling glazing panel. Each window is approximately 3m wide x 3m tall, revealing a fully visible interior room. The windows are perfectly clean — no reflections, no glare — as if the glass is invisible, like a dollhouse section. Through each window, the interior is clearly and completely visible.

The house fills approximately 85% of the frame width and 75% of the frame height. Above: a strip of overcast, muted warm gray sky. Below: a minimal strip of pale concrete ground/pathway. No landscaping, no trees, no cars, no street elements.`,
  },

  glass: {
    name: 'glass',
    label: 'Glass Pavilion',
    filePrefix: 'elevation-glass',
    architecture: `A perfectly frontal, orthographic-style photograph of a modern glass pavilion house. The camera is perfectly perpendicular to the facade — absolutely NO perspective convergence, NO vanishing point, NO foreshortening. The image reads like an architectural elevation drawing rendered as a photorealistic photograph.

House silhouette: two-story with dramatically high ceilings (~5m per floor, ~10m total height). A single monolithic rectangular volume — tall and grand in proportion, emphasizing verticality. Flat roof with a razor-thin dark steel fascia edge (~5cm). The floor slab between levels is a thin exposed concrete band (~15cm) running horizontally across the full width.

Material: the ENTIRE facade is floor-to-ceiling glass — a continuous glass curtain wall from ground to roof. The structural elements are ultra-minimal: thin dark steel mullions (~2cm wide) divide the glass into 6 bays (3 per floor). Vertical mullions run the full height of each floor. There are NO solid walls on the facade — it is 95% glass, 5% thin dark steel structure. A slim concrete plinth base (~10cm visible). The overall effect is a transparent glass box — the interior is the architecture.

Windows/Glass: the entire facade IS the window. Each bay is a single uninterrupted glass panel (~3.5m wide x 5m tall). The glass is perfectly clean and invisible — zero reflection, zero glare — as if there is no glass at all. The interiors are FULLY and COMPLETELY visible, like looking into an open dollhouse or a theater stage. The thin dark steel mullions create a subtle 2x3 grid, but the dominant impression is one continuous transparent surface.

The dramatically high ceilings (~5m per floor) create a sense of monumental scale. Each room has vast vertical space above the furniture and people — at least 2m of empty wall/air above head height. This vertical generosity is a key visual feature.

The house fills approximately 85% of the frame width and 80% of the frame height. Above: a narrow strip of overcast, muted warm gray sky. Below: a minimal strip of pale concrete ground. No landscaping, no trees, no cars, no street elements.`,
  },
  open: {
    name: 'open',
    label: 'Open Glass House',
    filePrefix: 'elevation-open',
    openPlan: true,
    architecture: `A perfectly frontal, orthographic-style photograph of a modern single-family house. The camera is perfectly perpendicular to the facade — absolutely NO perspective convergence, NO vanishing point, NO foreshortening. The image reads like an architectural elevation drawing rendered as a photorealistic photograph.

House silhouette: a single-story structure with a GRAND ARCHED ROOF. The roof is a single continuous smooth arc — a barrel vault or parabolic arch spanning the full width of the house. The arch rises from ground level on both sides and peaks at approximately 12m at the center. The silhouette reads as a pure, elegant arch — like a Quonset hut refined into high architecture, or a minimal cathedral. The arch profile is smooth and continuous with NO flat sections, NO ridges, NO gables. Thin dark steel frame outlines the arch edge. A slender concrete plinth base (~15cm) runs the full width.

CRITICAL FRAMING — the ENTIRE house silhouette including the full arch peak, both side edges touching the ground, and the base must be COMPLETELY visible within the frame with generous breathing room on ALL sides. The house is a complete sculptural object sitting in the landscape — absolutely NO cropping whatsoever.

CRITICAL — the facade is ONE SINGLE UNBROKEN glass wall that follows the arch shape from ground to peak and back down. There are NO mullions, NO vertical dividers, NO partitions. The glass fills the entire arch opening as one continuous curved transparent surface. The glass is perfectly clean and invisible — zero reflection, zero glare — as if the arch is completely open to the viewer.

Interior: ONE vast cathedral-like open space with NO interior walls, NO partitions. The arched ceiling soars to ~12m at the apex. The back wall follows the same arch curve — a continuous smooth white plaster surface (~${STYLE.dayBg}). The floor is polished pale concrete running unbroken across the full width. The enormous vertical volume dwarfs everything inside — furniture and the single person appear very small against the monumental arched white wall, with 8-10m of empty curved wall visible above.

The interior is almost entirely EMPTY. In the center of the vast floor, a single large wooden worktable (~3m wide). One solitary artist sits at the table, working. One or two Lumenstate lighting products illuminate the scene — nothing more. The rest of the enormous arched space is bare concrete floor and white curved wall. The overwhelming emptiness, silence, and scale dominate — one small human at a table, alone in a cathedral of light.

The house fills approximately 65% of the frame width and 60% of the frame height. Above: a wide strip of overcast, muted warm gray sky visible around the arch. Below: a generous strip of pale concrete ground. Both sides of the arch have clear empty space where the roof curves down to meet the ground. No landscaping, no trees, no cars.`,
  },
};

// ---------- Open Plan Zone Definitions ----------

const OPEN_ZONES = [
  {
    position: 'center of the space',
    label: 'Artist Studio',
    product: {
      id: 2,
      form: 'parabolic arc floor lamp',
      description: 'A large arc floor lamp — thin black metal rod rises from a small rectangular stone base, forming a wide gentle parabolic curve (~180cm span), terminating in a small horizontal light bar at the far end. Matte black metal with white frosted glass light bar. The arc lamp stands beside the table, its curve reaching over the work surface.',
    },
    person: 'A solitary artist in a white linen shirt and light trousers, sitting at the large worktable on a simple wooden chair, seen from BEHIND — back facing the camera. They are carefully reviewing and arranging large printed photographs and sketches spread across the table. The person appears VERY small and alone in the enormous arched space — dwarfed by the 12m ceiling soaring above. A quiet, contemplative figure absorbed in solitary creative work.',
    furniture: 'A single large wooden worktable (~3m wide, light oak) positioned at the center of the vast floor. One simple wooden chair. Printed photographs, sketches, and a few pencils spread across the table surface. A ceramic mug. Nothing else in the entire space — the rest of the enormous arched floor is completely bare polished concrete.',
    lightPattern: 'The horizontal light bar at the arc\'s end emits warm amber light downward, creating a focused warm pool that illuminates the entire worktable surface, the photographs, and the artist\'s hands and shoulders. Beyond this pool of light, the vast space falls into darkness.',
  },
];

// ---------- Prompt Builders ----------

function buildArchitectureSection(variant) {
  return variant.architecture;
}

function buildOpenZoneSection(zone, mode) {
  const personLine = zone.person
    ? `\nPerson: ${zone.person}`
    : '\nNo person in this zone — the space is unoccupied, quiet, still.';

  if (mode === 'day') {
    return `${zone.position} — ${zone.label}:
${zone.furniture}
Product: ${zone.product.description} Facing the camera in its canonical frontal view. Light is OFF — a pure sculptural object.${personLine}`;
  }

  const personNight = zone.person
    ? ' The person is mostly a silhouette, only hands and immediate surface lit.'
    : ' The unoccupied furniture catches subtle warm reflections.';

  return `${zone.position} — ${zone.label}:
Same layout and positions maintained. ${zone.furniture}
Product: ${zone.product.description} Light is now ON. ${zone.lightPattern}
The product is the ONLY light source for this zone. Surfaces near the product catch warm amber reflections (20-30%).${personNight}`;
}

function buildRoomSection(room, mode) {
  if (mode === 'day') {
    return `${room.position} — ${room.label}:
Through this window, the room interior is visible in PERFECT 100% FRONTAL VIEW — the camera looks straight through the window, perpendicular to the back wall. The back wall is seen perfectly flat and head-on. All furniture, the product, and the person are arranged PARALLEL to the back wall — NO diagonal placement, NO angled furniture, NO rotated objects. Every element reads as a flat elevation, like a theater stage set viewed from the audience.

${room.interior}

Product: ${room.product.description} Placed facing the camera in its canonical frontal view — perfectly symmetric, no rotation. The light is OFF — the product exists as a pure sculptural object. The diffuser is opaque white, no illumination.

Person: ${room.person}

The room is lit by soft natural daylight. Warm neutral tones. The interior reads as a self-contained Kinfolk magazine editorial frame within the window.`;
  }

  return `${room.position} — ${room.label}:
Through this window, the EXACT same room layout, person pose, product position, and perfect frontal composition are maintained. ${room.interior}

Product: ${room.product.description} The light is now ON. ${room.lightPattern}

The product is the ONLY light source in this room. Overall room darkness: 90-95%. Only surfaces near the product catch warm amber reflections (20-30% brightness). The person is mostly a silhouette — only hands and immediate work surface are lit by the product's warm glow. Walls and floor fade to deep warm black (${STYLE.nightBg}).`;
}

function buildDayPrompt(variant) {
  const architecture = buildArchitectureSection(variant);

  if (variant.openPlan) {
    const zones = OPEN_ZONES.map((z) => buildOpenZoneSection(z, 'day')).join('\n\n');

    return `${architecture}

--- ZONE DETAILS (6 activity zones within the single open space, from left to right) ---

The scene is viewed in PERFECT FRONTAL VIEW — the table, chair, lamp, and person are arranged PARALLEL to the curved back wall, like a theater stage. NO diagonal placement.

${zones}

--- PHOTOGRAPHY STYLE ---

Photography: Kinfolk / Cereal magazine editorial. Photorealistic. Warm neutral color palette — whites lean slightly warm (#F0EDE8 range). Subtle film grain. Soft contrast. Muted, desaturated tones.

Daylight: soft, even overcast daylight. The arched glass facade makes the interior feel like a luminous cathedral. Bright, airy, monumental. The soaring 12m arched ceiling dominates — vast curved white wall above, one small table and one solitary artist below. The emptiness is the composition.

The image captures solitude and scale — one artist, one table, one lamp, alone in an enormous arched glass pavilion.

Aspect ratio: 16:9 landscape.
Camera: perfectly frontal orthographic elevation — no perspective, no angle, no tilt.

${NEGATIVE}`;
  }

  const rooms = ROOMS.map((room) => buildRoomSection(room, 'day')).join('\n\n');

  return `${architecture}

--- ROOM DETAILS (each room visible through its window bay) ---

${rooms}

--- PHOTOGRAPHY STYLE ---

Photography: Kinfolk / Cereal magazine editorial. Photorealistic. Warm neutral color palette — whites lean slightly warm (#F0EDE8 range). Subtle film grain. Soft contrast. Muted, desaturated tones throughout.

Daylight: soft, even overcast daylight. No harsh shadows on the facade or interior. The overall image feels bright, airy, serene.

Each room's interior reads as a distinct editorial vignette, but together they form one cohesive architectural portrait. The house is a living organism — six windows, six intimate moments of daily life with light.

Aspect ratio: 16:9 landscape.
Camera: perfectly frontal orthographic elevation — no perspective, no angle, no tilt.

${NEGATIVE}`;
}

function buildNightPrompt(variant) {
  if (variant && variant.openPlan) {
    const zones = OPEN_ZONES.map((z) => buildOpenZoneSection(z, 'night')).join('\n\n');

    return `Transform this house photograph into a night version. Keep the EXACT same architecture, interior layout, person poses, product positions, and furniture. Nothing moves — only the lighting changes.

--- EXTERIOR CHANGES ---
Sky: deep warm black, matching ${STYLE.nightBg}. No stars, no moon — just darkness.
Ground: barely visible, deep warm gray.
The thin roof slab and concrete plinth are barely visible as dark silhouettes. The single unbroken glass wall becomes a luminous panorama — six pools of warm amber light within one dark interior volume.

--- INTERIOR CHANGES (per zone) ---

The interior is now very dark overall (92-95% dark). The arched back wall and floor fade to deep warm black (${STYLE.nightBg}). The single arc lamp creates one island of warm amber light at the center — illuminating only the table and the artist. The rest of the enormous arched space is near-total darkness.

${zones}

--- LIGHTING CONSISTENCY ---

CRITICAL — The arc lamp emission color: ${STYLE.colorTemp} color temperature, hex ${STYLE.emissionColor}. Soft amber-white. NOT orange, NOT yellow, NOT pure white.

One single pool of warm light in a vast dark vault — the artist's table is the only illuminated point. The arched ceiling and walls disappear into darkness, barely hinted at by the faintest warm reflections at the edges.

--- PHOTOGRAPHY STYLE ---

Photography: Kinfolk / Cereal editorial, night version. Warm, intimate, deeply atmospheric. The arched house is a dark silhouette with one small warm glow at its center — like a single candle in a cathedral.

Keep UNCHANGED: house form, interior layout, person poses, product positions, furniture, camera angle (frontal orthographic), aspect ratio (16:9).

${NEGATIVE}`;
  }

  const rooms = ROOMS.map((room) => buildRoomSection(room, 'night')).join('\n\n');

  return `Transform this house elevation photograph into a night version. Keep the EXACT same house architecture, window positions, room layouts, person poses, product positions, and furniture placement. Nothing moves — only the lighting changes.

--- EXTERIOR CHANGES ---
Sky: deep warm black, matching ${STYLE.nightBg}. No stars, no moon — just darkness.
Ground: barely visible, deep warm gray.
House exterior walls: very dark, lit only by warm amber light spilling outward from the windows onto the facade surface. The plaster catches soft warm reflections near each window.
The house becomes a dark silhouette punctuated by six glowing amber windows.

--- INTERIOR CHANGES (per room) ---

${rooms}

--- LIGHTING CONSISTENCY ---

CRITICAL — All 6 rooms must use the EXACT same emission color: ${STYLE.colorTemp} color temperature, hex ${STYLE.emissionColor}. Soft amber-white. NOT orange, NOT yellow, NOT pure white.

Each product's warm glow spills outward through its window, casting warm amber light patches on the exterior facade surface — this is the primary way the house is lit at night.

--- PHOTOGRAPHY STYLE ---

Photography: Kinfolk / Cereal editorial, night version. Warm, intimate, deeply atmospheric. Film grain slightly more visible than day version. Overall the image is very dark — the warm windows are the only sources of light and life.

The house at night is a constellation of warm amber windows — each room a small universe of intimate light.

Keep UNCHANGED: house form, window positions, room contents, person poses, product positions, furniture, camera angle (frontal orthographic), aspect ratio (16:9).

${NEGATIVE}`;
}

// ---------- Image Generation ----------

async function generateDayImage(ai, prompt, outputPath) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: ASPECT_RATIO,
        imageSize: RESOLUTION,
      },
    },
  });

  return extractAndSaveImage(response, outputPath);
}

async function generateNightImage(ai, prompt, dayImagePath, outputPath) {
  const dayImageData = fs.readFileSync(dayImagePath);
  const base64Image = dayImageData.toString('base64');

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image,
            },
          },
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

  return extractAndSaveImage(response, outputPath);
}

function extractAndSaveImage(response, outputPath) {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error('No response parts received from API');
  }

  for (const part of parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, 'base64');
      fs.writeFileSync(outputPath, buffer);
      return { success: true, size: buffer.length };
    }
  }

  throw new Error('No image data in response');
}

// ---------- CLI ----------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'both',
    variant: 'default',
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
    case '--mode':
      options.mode = args[++i];
      break;
    case '--variant':
      options.variant = args[++i];
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--help':
      console.log(`
Lumenstate Elevation Image Generator

Generates a front-elevation photograph of a modern house
with Lumenstate products visible through each window.

Workflow:
  1. Day image: text prompt → full house in daylight (products OFF)
  2. Night image: Day image ref + night prompt (products ON, 3800K glow)

Usage:
  node scripts/generate-elevation-image.mjs [options]

Options:
  --mode <mode>       'day', 'night', or 'both' (default: both)
  --variant <name>    'default' (plaster) or 'glass' (glass pavilion) (default: default)
  --dry-run           Print prompts without calling API
  --help              Show this help message

Examples:
  --variant glass              Glass pavilion house (day + night)
  --variant glass --mode day   Glass pavilion, day only
`);
      process.exit(0);
    }
  }

  return options;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

// ---------- Main ----------

async function main() {
  const options = parseArgs();

  const variant = VARIANTS[options.variant];
  if (!variant) {
    console.error(`Error: unknown variant "${options.variant}". Use: ${Object.keys(VARIANTS).join(', ')}`);
    process.exit(1);
  }

  const generateDay = options.mode === 'day' || options.mode === 'both';
  const generateNightMode = options.mode === 'night' || options.mode === 'both';

  const dayPath = path.join(OUTPUT_DIR, `${variant.filePrefix}-day.png`);
  const nightPath = path.join(OUTPUT_DIR, `${variant.filePrefix}-night.png`);

  const totalTasks = (generateDay ? 1 : 0) + (generateNightMode ? 1 : 0);

  console.log(`\n  Lumenstate Elevation Image Generator`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Variant: ${variant.label}`);
  console.log(`  Aspect Ratio: ${ASPECT_RATIO}`);
  console.log(`  Resolution: ${RESOLUTION}`);
  const zones = variant.openPlan ? OPEN_ZONES : ROOMS;
  console.log(`  ${variant.openPlan ? 'Zones' : 'Rooms'}: ${zones.length} (${zones.map((r) => r.label).join(', ')})`);
  console.log(`  Products: ${zones.map((r) => `#${r.product.id} ${r.product.form}`).join(', ')}`);
  console.log(`  Mode: ${options.mode}`);
  console.log(`  Tasks: ${totalTasks} images\n`);

  // Dry run
  if (options.dryRun) {
    if (generateDay) {
      console.log(`${'='.repeat(60)}`);
      console.log(`  ELEVATION [${variant.label}] — DAY MODE (text-to-image)`);
      console.log(`  Output: ${variant.filePrefix}-day.png`);
      console.log(`${'='.repeat(60)}\n`);
      console.log(buildDayPrompt(variant));
      console.log('\n');
    }
    if (generateNightMode) {
      console.log(`${'='.repeat(60)}`);
      console.log(`  ELEVATION [${variant.label}] — NIGHT MODE (image ref + prompt)`);
      console.log(`  Output: ${variant.filePrefix}-night.png`);
      console.log(`${'='.repeat(60)}\n`);
      console.log(buildNightPrompt(variant));
      console.log('\n');
    }
    console.log('Dry run complete. No API calls were made.');
    return;
  }

  // Ensure output dir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let completed = 0;
  let failed = 0;

  // --- Day ---
  if (generateDay) {
    process.stdout.write(`  [1] ${variant.label} Day ... `);
    try {
      const result = await generateDayImage(ai, buildDayPrompt(variant), dayPath);
      console.log(`OK (${formatBytes(result.size)}) -> ${variant.filePrefix}-day.png`);
      completed++;
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
      failed++;
    }
  }

  // --- Night ---
  if (generateNightMode) {
    const taskNum = generateDay ? 2 : 1;
    process.stdout.write(`  [${taskNum}] ${variant.label} Night <- ${variant.filePrefix}-day.png ref ... `);

    if (!fs.existsSync(dayPath)) {
      console.log(`SKIPPED: ${variant.filePrefix}-day.png not found (generate day first)`);
      failed++;
    } else {
      try {
        const result = await generateNightImage(ai, buildNightPrompt(variant), dayPath, nightPath);
        console.log(`OK (${formatBytes(result.size)}) -> ${variant.filePrefix}-night.png`);
        completed++;
      } catch (error) {
        console.log(`FAILED: ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n  Done: ${completed} succeeded, ${failed} failed out of ${totalTasks} total`);
  if (completed > 0) {
    console.log(`  Output: ${OUTPUT_DIR}/`);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
