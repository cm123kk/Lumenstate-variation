/**
 * Lumenstate Product Image Generator
 *
 * Gemini API (Nano Banana 2)를 사용하여 제품 이미지를 생성하는 스크립트.
 *
 * 생성 워크플로우:
 *   1. Day 이미지를 텍스트 프롬프트로 생성
 *   2. Day 이미지를 레퍼런스로 + Night 프롬프트로 Night 이미지 생성
 *   → 동일 제품 형태의 일관된 Day/Night 쌍 보장
 *
 * Usage:
 *   node scripts/generate-product-images.mjs                  # 전체 제품 Day→Night 순차 생성
 *   node scripts/generate-product-images.mjs --ids 1,2,3      # 특정 제품만
 *   node scripts/generate-product-images.mjs --mode day        # Day만 생성
 *   node scripts/generate-product-images.mjs --mode night      # Night만 (기존 Day 이미지 레퍼런스)
 *   node scripts/generate-product-images.mjs --dry-run         # 프롬프트만 출력
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
const OUTPUT_DIR = path.join(ROOT, 'src/assets/product');
const DELAY_MS = 3000;

// ---------- Common Style Constants ----------

const STYLE = {
  dayBg: '#E8E5E1',
  nightBg: '#12100E',
  emissionColor: '#FFC66E',
  colorTemp: '3800K',
  aspectRatio: '3:4',
  resolution: '2K',
};

// ---------- Camera Angles (설치 방식별 대칭 구도) ----------

const CAMERA_ANGLES = {
  'flush-mount': 'Viewed from directly below, looking straight up at the ceiling-mounted product. The product appears as a perfect geometric shape with complete bilateral symmetry. No perspective distortion, no tilted angle.',
  'wall-mount': 'Viewed perfectly straight-on, perpendicular to the wall surface. The product is a real physical 3D object mounted on the wall — subtle depth, edge thickness, and material dimensionality are visible. Perfect bilateral symmetry.',
  'floor-standing': 'Viewed straight-on from the front at eye level. Perfect bilateral symmetry along the vertical axis. No tilted or angled perspective.',
  'freestanding': 'Viewed straight-on from the front at eye level. Perfect bilateral symmetry. No tilted or angled perspective.',
};

// ---------- Product Specifications ----------

const PRODUCTS = [
  {
    id: 1,
    form: 'circular ceiling ring',
    mounting: 'flush-mount',
    fillRatio: 60,
    formDetail: 'A circular ring mounted flush to the ceiling, viewed from directly below looking straight up. The ring appears as a perfect geometric circle — matte black outer ring frame with a large circular white frosted glass diffuser filling the interior. Diameter ~40cm. Viewed from below, it reads as a pure circle within a circle: a black annulus framing a white disc. Perfect radial symmetry.',
    lightPatternDetail: 'Warm amber light radiates downward from the frosted diffuser inside the ring. The inner surface of the ring catches a subtle warm reflection. A soft pool of light appears on the surface below. The ring frame becomes a dark silhouette framing the glowing disc.',
  },
  {
    id: 2,
    form: 'parabolic arc floor lamp',
    mounting: 'floor-standing',
    fillRatio: 70,
    formDetail: 'A large arc floor lamp. Thin black metal rod (diameter ~8mm) rises from a small rectangular black stone base (~20cm wide). CRITICAL ARC GEOMETRY: The rod forms a WIDE, GENTLE arc — like a quarter of a very large circle (radius ~150cm). The curve starts near-vertical at the base, then bends GRADUALLY and CONTINUOUSLY rightward in a smooth, broad sweep. The horizontal span of the arc is approximately EQUAL to the lamp height (~180cm wide, ~180cm tall). The rod descends gently at the far end and terminates in a small horizontal light bar (~15cm wide) that hangs at roughly 140cm height. The arc is NOT a tight Gothic arch — it is a wide, open, mathematically smooth curve like the Castiglioni Arco lamp silhouette. Think of bending a thin steel rod into a perfect quarter-circle. No sharp bend point, no kink, uniform curvature throughout.',
    lightPatternDetail: 'The small horizontal light bar at the arc\'s end emits warm amber light downward. A focused pool of warm light appears on the floor beneath the bar. The thin arc rod is barely visible against the dark background. The stone base catches minimal reflected light.',
  },
  {
    id: 3,
    form: 'horizontal rectangular wall sconce',
    mounting: 'wall-mount',
    fillRatio: 45,
    formDetail: 'A wide horizontal rectangle mounted flat on a wall, viewed perfectly straight-on. Matte white frosted glass front face (~30cm wide x 8cm tall) with a thin black metal frame border (~2mm) and a narrow horizontal black slit running across the center. The frosted glass surface has subtle internal light diffusion — not flat paint, but real translucent glass. Sharp edges with fine chamfers that catch light. Perfect bilateral symmetry.',
    lightPatternDetail: 'Warm amber light washes upward from the top edge and downward from the bottom edge. The central black slit remains dark, creating a striking horizontal division. Light creates a symmetrical glow pattern on the wall above and below the fixture.',
  },
  {
    id: 4,
    form: 'slim horizontal linear wall bar',
    mounting: 'wall-mount',
    fillRatio: 40,
    formDetail: 'A very slim horizontal linear bar mounted on a wall, viewed perfectly straight-on. Two parallel thin black anodized aluminum rails (~40cm wide x 2cm total height) with a narrow white frosted glass strip between them. The frosted glass strip shows subtle translucency and internal light scattering. The metal rails have fine brushed texture. Extremely thin and linear. Perfect bilateral symmetry.',
    lightPatternDetail: 'Warm amber light emanates from the narrow gap between the two parallel rails. Light washes the wall to left and right, creating a wide horizontal glow band. The fixture appears as a thin luminous line floating on the dark wall.',
  },
  {
    id: 5,
    form: 'flat rectangular wall panel',
    mounting: 'wall-mount',
    fillRatio: 40,
    formDetail: 'A vertical rectangular panel mounted flush on a wall, viewed perfectly straight-on. White frosted glass front face (~20cm wide x 28cm tall) with a thin matte black aluminum border frame (~2mm). The frosted glass has subtle depth — not flat paint, but real opaline glass with soft internal light scattering visible as a gentle luminosity gradient from center to edges. The black frame has fine chamfered edges that catch a hairline of light. Perfect bilateral symmetry.',
    lightPatternDetail: 'Warm amber light radiates upward from behind the top edge and downward from behind the bottom edge, washing the wall. The front face remains a dark silhouette. Creates a glowing halo effect around the rectangular perimeter.',
  },
  {
    id: 6,
    form: 'tall vertical cylindrical column',
    mounting: 'floor-standing',
    fillRatio: 70,
    formDetail: 'A tall slender cylinder standing upright on the floor. Matte black metal housing with a continuous vertical frosted panel running the full height of one face. Small circular base (~12cm diameter). Total height ~120cm, diameter ~8cm. A thin black power cord trails from the base.',
    lightPatternDetail: 'The vertical frosted panel glows with warm amber light along its full height. Light radiates outward from the panel face, illuminating the floor on one side. The cylinder creates a tall luminous vertical line in the dark space. The base and top emit subtle downward and upward wash respectively.',
  },
  {
    id: 7,
    form: 'square wall panel with rounded corners',
    mounting: 'wall-mount',
    fillRatio: 40,
    formDetail: 'A square panel with generously rounded corners (~radius 8mm), mounted on a wall, viewed perfectly straight-on. White frosted glass face (~18cm x 18cm) with a subtle matte black aluminum edge border (~2mm). The frosted glass shows soft internal light diffusion — a gentle luminous quality distinct from flat paint. The rounded corners have smooth, precision-machined transitions. The edge border has a fine beveled profile that catches a thin line of light. Perfect bilateral symmetry.',
    lightPatternDetail: 'Warm amber light radiates from all four edges outward onto the wall surface. Creates a dramatic cross-shaped or diamond-shaped glow pattern. The panel face becomes a dark square, while the surrounding wall catches the warm light in all four cardinal directions.',
  },
  {
    id: 8,
    form: 'split disc wall light',
    mounting: 'wall-mount',
    fillRatio: 50,
    formDetail: 'A circular disc (~25cm diameter) mounted on a wall, split horizontally into two equal halves with a precise ~8mm gap running through the exact center. The top half-disc and bottom half-disc are each white frosted opaline glass with thin matte black aluminum edge frames (~2mm). The gap between the two halves reveals darkness — a void cutting through the circle. Each half-disc has subtle convex curvature on its frosted glass surface. The frosted glass shows real translucency and internal light scattering. The precision gap creates geometric tension — a perfect circle interrupted by a single clean cut. Viewed perfectly straight-on. Perfect bilateral symmetry.',
    lightPatternDetail: 'Both half-discs glow with warm amber light from within. The critical visual: warm amber light also emanates from the horizontal gap between the two halves, creating a bright luminous line bisecting the circle. The gap becomes a slit of intense light — as if the circle is cracking open to reveal light within. The wall behind catches a horizontal band of warm light projected through the gap. Creates a dramatic split-sun or eclipse-like effect.',
  },
  {
    id: 9,
    form: 'circular frame with horizontal bisecting bar',
    mounting: 'wall-mount',
    fillRatio: 55,
    formDetail: 'A perfect circle frame (diameter ~30cm, frame thickness ~1.5cm) mounted flat on a wall, with a thin horizontal bar bisecting the circle at its exact center, connecting both sides of the ring. The bar has a small junction node at the center point. All elements are matte black metal. Viewed straight-on.',
    lightPatternDetail: 'Warm amber light fills the interior of the circular frame, radiating outward through a frosted inner surface that spans the full circle. The horizontal bar and frame become dark silhouettes against the glowing disc. Creates a luminous full-moon effect, similar to a solar eclipse with the bar casting a thin shadow line across the illuminated disc.',
  },
  {
    id: 10,
    form: 'tall cylindrical column with frosted body',
    mounting: 'floor-standing',
    fillRatio: 55,
    formDetail: 'A tall cylinder standing upright, like a column or bollard. White frosted glass body (~12cm diameter x 35cm tall) with thin black metal top cap and base ring. Simple, monolithic cylindrical form. No visible seams or joints. Viewed straight-on from the front.',
    lightPatternDetail: 'The entire frosted glass cylinder body glows uniformly with warm amber light. Light radiates in all directions (360 degrees), creating a soft ambient glow. The floor beneath catches a circular pool of warm light. The black top cap and base ring frame the glowing column above and below.',
  },
  {
    id: 11,
    form: 'arch portal wall light',
    mounting: 'wall-mount',
    fillRatio: 40,
    formDetail: 'A pure arch shape mounted on a wall, viewed perfectly straight-on. An open inverted-U form — a semicircular arc on top continuing into two straight vertical legs (~12cm wide x 18cm tall overall). The entire visible surface is ONLY solid matte black anodized aluminum — a single-material bar with a half-round cross section (~1.5cm wide). NO glass, NO white, NO frosted surface, NO translucent material visible from the front. The front face is 100% matte black metal. The two vertical legs end cleanly at the bottom, not connected. A concealed LED strip is hidden on the back side between the frame and the wall, invisible from the front. In this Day image the light is OFF — so it is purely a matte black metal arch sculpture on the wall, nothing else. Perfect bilateral symmetry.',
    lightPatternDetail: 'The hidden LED filament behind the arch frame activates, casting warm amber light onto the wall surface behind and around the arch. The matte black frame itself remains dark — a silhouette — while the wall behind glows with an arch-shaped halo of warm amber light. Light spills from behind the frame edges, creating a dramatic backlit effect. The arch becomes a dark portal outlined by warm light.',
  },
  {
    id: 12,
    form: 'rectangular ceiling panel',
    mounting: 'flush-mount',
    fillRatio: 50,
    formDetail: 'A long rectangular panel mounted flush to the ceiling, viewed from directly below looking straight up. Matte black aluminum outer frame (~45cm wide x 15cm tall, frame width ~1.5cm) with a white frosted glass diffuser filling the interior. The rectangle has an approximately 3:1 aspect ratio — clearly distinct from any circular form. The frosted glass shows subtle internal light scattering and depth — not flat white, but real translucent opaline glass with a gentle luminosity. The black frame has precision-machined edges with fine chamfers catching thin lines of light. Perfect bilateral symmetry.',
    lightPatternDetail: 'The rectangular frosted glass panel glows with warm amber light downward. The elongated shape creates a wide, even wash of amber light below. The 3:1 proportions make it read as a horizontal bar of warm light. The black frame becomes a sharp dark border silhouette. Light on the surface below forms a soft rectangular pool.',
  },
  {
    id: 13,
    form: 'cylindrical bollard',
    mounting: 'floor-standing',
    fillRatio: 55,
    formDetail: 'A vertical cylindrical bollard standing on a circular base plate. White matte body (~10cm diameter x 35cm tall) with a horizontal translucent band near the top (~3cm height). Small circular indicator on the front face. Flat circular base plate extends ~2cm beyond the cylinder diameter.',
    lightPatternDetail: 'The translucent horizontal band near the top glows with warm amber light. Light radiates outward in a 360-degree horizontal ring pattern. The body above and below the band remains in relative shadow. A subtle warm glow appears on the floor around the base plate.',
  },
  {
    id: 14,
    form: 'multi-tier horizontal wall fixture',
    mounting: 'wall-mount',
    fillRatio: 40,
    formDetail: 'Two parallel horizontal rectangular bars stacked vertically on a wall, viewed perfectly straight-on. Each bar is a flat rectangle (~30cm wide x 4cm tall) with sharp 90-degree corners. Matte black aluminum frame borders (~2mm) with white frosted opaline glass front face. The two bars are spaced ~4cm apart, centered on a minimal wall mount bracket. Clean geometric rectangles with no rounded ends, no cylindrical shapes. The frosted glass shows subtle internal light scattering. Perfect bilateral symmetry.',
    lightPatternDetail: 'Warm amber light emanates from each rectangular bar\'s frosted glass face. Light washes the wall above and below the fixture. The two bars create parallel horizontal glow lines with a dark gap between them. The wall behind catches a layered warm wash pattern.',
  },
  {
    id: 15,
    form: 'modular block composition',
    mounting: 'freestanding',
    fillRatio: 45,
    formDetail: 'Five rectangular blocks with rounded corners assembled in an asymmetric grid composition. Each block varies in size (roughly 4x8cm to 8x12cm). Blocks are arranged like an abstract Tetris formation or Mondrian-inspired layout. White frosted faces with black (~3mm) edge frames. The composition stands freely on a surface.',
    lightPatternDetail: 'Each block\'s frosted face glows individually with warm amber light. Different blocks may glow at slightly different intensities, creating depth variation. Light seeps through the gaps between blocks. The overall composition becomes a warm, luminous sculptural cluster. The surface beneath catches a complex warm light pattern from multiple sources.',
  },
  {
    id: 16,
    form: 'cubic pendant',
    mounting: 'flush-mount',
    fillRatio: 45,
    formDetail: 'A cube-shaped pendant light hanging from a single thin matte black cord/rod from the ceiling. The cube (~15cm) has a matte black aluminum frame structure at the top portion and edges, with white frosted opaline glass panels forming the lower portion and sides. The black metal frame wraps around the top and vertical edges like a cage holding the glass cube. Viewed straight-on from the front. The cord extends upward from the center top. Clean, sharp 90-degree geometry. Perfect bilateral symmetry.',
    lightPatternDetail: 'The frosted glass faces of the cube glow with warm amber light from an internal source. Light radiates in all four visible directions through the glass panels. The black frame edges remain as dark geometric lines against the warm glow. A soft pool of warm light falls on the surface below. The cube becomes a floating lantern of warm geometric light.',
  },
  {
    id: 17,
    form: 'hemisphere desk lamp',
    mounting: 'freestanding',
    fillRatio: 40,
    formDetail: 'A hemisphere of white frosted opaline glass (~18cm diameter) placed dome-down on a thin circular matte black aluminum base plate (~20cm diameter, ~5mm thick). The glass dome sits like an inverted bowl on the base — a mushroom or jellyfish silhouette. The frosted glass shows subtle translucency and internal light scattering. The base plate extends slightly beyond the dome edge, creating a thin black ring visible around the bottom. Viewed straight-on from the front at eye level. Perfect radial symmetry.',
    lightPatternDetail: 'The hemisphere glows from within with warm amber light. The curved glass creates a natural gradient — brightest at the apex, softening toward the base where the glass meets the black plate. Light spills out from the gap between the dome edge and the base plate, casting a warm ring of light on the desk surface. A soft, intimate warm glow.',
  },
  {
    id: 18,
    form: 'capsule floor lamp',
    mounting: 'floor-standing',
    fillRatio: 65,
    formDetail: 'A horizontal capsule/pill shape (~20cm wide x 10cm tall) made of white frosted opaline glass, mounted atop a thin vertical matte black aluminum rod (~120cm tall, ~1cm diameter). The rod stands on a small circular base plate (~15cm diameter). The capsule is a rounded rectangle — a rectangle with perfectly semicircular ends, oriented horizontally. The capsule sits centered on top of the rod. The frosted glass shows subtle translucency. Viewed straight-on from the front at eye level. Perfect bilateral symmetry.',
    lightPatternDetail: 'The capsule glows with warm amber light from within, radiating horizontally in both directions. The rounded ends emit softer light, the flat center faces emit the most. The thin black rod below remains dark, making the capsule appear to float. Warm light washes outward to both sides.',
  },
  {
    id: 19,
    form: 'stacked disc wall light',
    mounting: 'wall-mount',
    fillRatio: 45,
    formDetail: 'Three identical circular discs (~18cm diameter, ~1.5cm thick each) mounted on a wall, stacked vertically with ~6mm gaps between them. Each disc is white frosted opaline glass with a thin matte black aluminum edge ring (~2mm). The three discs are aligned on the same vertical center axis, connected by a hidden wall mount bracket behind. The gaps between discs are uniform and precise. Each disc has subtle convex curvature on its frosted glass face. Viewed perfectly straight-on. Perfect bilateral symmetry.',
    lightPatternDetail: 'The gaps between the three stacked discs emit warm amber light — three horizontal lines of light. The disc faces themselves remain as dark silhouettes. Light washes the wall above and below the stack and spills through each gap horizontally. Creates three parallel luminous lines — a rhythmic pattern of light and dark.',
  },
  {
    id: 20,
    form: 'pyramid prism desk lamp',
    mounting: 'freestanding',
    fillRatio: 15,
    formDetail: 'A small, compact square-base pyramid (~10cm base, ~8cm tall) sitting on a surface, viewed straight-on from the front at eye level. A tiny desk object. The pyramid has 4 triangular faces rising from a square base to a single apex point at the top center. Each triangular face is white frosted opaline glass. All edges — the 4 base edges and 4 rising edges meeting at the apex — are thin matte black aluminum frames (~2mm). The black frame lines create a geometric wireframe skeleton holding the glass faces. From this frontal view, the front face is fully visible, with the two side faces angling away symmetrically. The apex point is at the top center of the composition. Small and precious. Perfect bilateral symmetry.',
    lightPatternDetail: 'All frosted glass faces glow with warm amber light from an internal source. The black edge frames create dark geometric lines against the warm glow. The apex is the brightest convergence point. Light washes downward onto the surface below in a square pattern. A luminous geometric solid.',
  },
];

// ---------- Prompt Builders ----------

function buildDayPrompt(product) {
  const camera = CAMERA_ANGLES[product.mounting];
  return `A minimalist ${product.form} lighting fixture. Extreme geometric precision in the tradition of Bauhaus, Dieter Rams, and Suprematist composition. Pure geometric abstraction rendered as a real physical object.

${product.formDetail}

Material: matte black anodized aluminum frame with white frosted glass diffuser.
The light is OFF — the product exists as a pure sculptural geometric object. The diffuser surface is opaque white, showing no illumination.

Background: clean, uniform warm off-white (${STYLE.dayBg}), seamless infinite studio backdrop with no visible horizon line.
Lighting: soft, even studio lighting from directly above. Subtle soft contact shadow beneath the product (opacity 15%, soft edge).

Composition: perfectly centered in frame with mathematical precision. Product fills approximately ${product.fillRatio}% of the image area. Minimum 15% clear padding from all edges (top, bottom, left, right). 3:4 portrait aspect ratio.
Camera: ${camera}

Style: photorealistic product photography with extreme geometric precision. Perfect bilateral symmetry. Apple-level cleanliness. The product is a real physical 3D object — frosted glass shows subtle internal light diffusion and refraction, matte aluminum shows fine micro-grain texture, edges catch soft light highlights. Physical dimensionality is conveyed through material rendering, not camera angle.
No environment, no text, no logos, no lens flare, no bokeh, no color fringing, no people, no furniture, no diagonal view, no angled composition, no 3/4 view, no perspective distortion, no tilted camera, no oblique angle.`;
}

function buildNightPrompt(product) {
  return `Transform this product lighting fixture image into a night/dark mode version. Keep the EXACT same product shape, angle, composition, position, and size.

CRITICAL — Color & Tone Consistency (must be identical across all products):
- Background: uniform deep warm black, exactly ${STYLE.nightBg}. No gradient, no variation, no visible environment. Seamless infinite backdrop.
- Emission color: exactly ${STYLE.colorTemp} color temperature, hex ${STYLE.emissionColor}. Soft amber-white. NOT orange, NOT yellow, NOT pure white.
- Diffuser center brightness: 100% (near white with warm tint).
- Diffuser edge brightness: 80% (amber tone strengthens toward edges).
- Wall/surface ambient reflection: 20-30% brightness, soft amber pool, radius ~1.5x product size.
- Shadow: none (product is the only light source, no external lighting).

Changes to apply:
- Background: change to ${STYLE.nightBg}, uniform and seamless.
- Light state: turn the light ON. The frosted glass diffuser now emits warm ${STYLE.colorTemp} light (${STYLE.emissionColor}).
- Light behavior: ${product.lightPatternDetail}
- The product is the ONLY light source in the entire scene. No studio lighting remains.
- Nearby surfaces catch subtle warm amber reflections from the product (opacity ~25%, soft falloff).
- Matte black aluminum frame remains dark — visible only as a silhouette against the glow.
Keep unchanged: product form, product size, material (matte black aluminum frame), camera angle, centered composition with 15% padding from all edges, aspect ratio.
No text, no logos, no lens flare, no gradient in background, no additional light sources, no people, no furniture, no diagonal view, no angled composition, no perspective distortion.`;
}

function buildBgUnifyDayPrompt() {
  return `Keep the EXACT same product — same shape, size, position, angle, material, lighting, shadow, and every detail. Change ONLY the background.

CRITICAL — Background must be EXACTLY this color:
- Hex: ${STYLE.dayBg}
- RGB: R:232, G:229, B:225
- A warm off-white / light warm gray.

The background must be perfectly uniform, flat, and seamless from edge to edge. No gradient, no horizon line, no floor plane, no visible surface boundary. One single solid color filling every pixel that is not the product or its shadow.

Do NOT alter the product in any way. Do NOT change the lighting on the product. Do NOT change the shadow. Only replace the background color.`;
}

function buildBgUnifyNightPrompt() {
  return `Keep the EXACT same product — same shape, size, position, angle, material, glow, emission, and every detail. Change ONLY the background.

CRITICAL — Background must be EXACTLY this color:
- Hex: ${STYLE.nightBg}
- RGB: R:18, G:16, B:14
- A deep warm black.

The background must be perfectly uniform, flat, and seamless from edge to edge. No gradient, no variation. One single solid color filling every pixel that is not the product or its glow/reflection.

Do NOT alter the product in any way. Do NOT change the glow intensity or color. Do NOT change the ambient reflection on surfaces. Only replace the background color.`;
}

// ---------- Moodboard Scenes ----------

const MOOD_NEGATIVE = 'No stock photo look, no posed model, no smile, no eye contact with camera, no bright saturated colors, no busy backgrounds, no multiple light sources competing, no HDR over-processing, no lens flare, no vignette, no split toning, no teal-and-orange grading.';

function buildMoodboardPrompt(scene) {
  return `This is a reference image of the product. Generate an editorial interior photograph featuring this EXACT product — same shape, proportions, material (matte black aluminum frame, white frosted glass diffuser), and every detail.

Photography style: Kinfolk / Cereal magazine editorial. Muted, desaturated color palette. Subtle film grain. High dynamic range but soft contrast.

Color grading: warm neutral tones. Whites lean slightly warm (#F0EDE8 range). Shadows are warm gray, never pure black. No saturated colors anywhere.

Composition: ${scene.compositionType}. Generous negative space — at least 40% of the frame is empty wall/floor/ceiling. The product and person together occupy no more than 60% of the frame.

Person: ${scene.personDescription}. Face NOT visible (turned away, cropped, or in shadow). The person is part of the environment, not the subject. Natural, unposed posture.

Space: minimalist architecture. White or light warm gray walls. Floors are light concrete, pale wood, or polished stone. Ceiling height ≥ 3m. Furniture is minimal — only what the scene requires.

Lighting: ${scene.lightingDescription}

Scene: ${scene.sceneDescription}

${MOOD_NEGATIVE}`;
}

function buildMoodboardNightPrompt(scene) {
  return `Transform this editorial interior photograph into a night version. Keep the EXACT same composition, camera angle, person pose, person position, product position, furniture placement, and spatial layout.

CRITICAL — Lighting Transition (must be identical across all moodboard night images):
- Remove ALL natural daylight. Windows now show dark night sky — no blue, just warm black darkness.
- The product light is now ON. It is the PRIMARY and DOMINANT light source in the scene.
- Emission color: exactly ${STYLE.colorTemp} color temperature, hex ${STYLE.emissionColor}. Soft amber-white. NOT orange, NOT yellow, NOT pure white.
- Product emission brightness: 100% at diffuser center, 80% at diffuser edges.

CRITICAL — Ambient & Tone Consistency (reference: product dark mode images with #12100E background):
- Overall room darkness: 92-95% dark. The scene is VERY dark — almost all surfaces are near-black.
- Product light illumination radius: ~1.5x product size. Beyond this, surfaces are essentially black.
- Wall/floor ambient tone: deep warm black (#12100E to #1A1816 range). Barely distinguishable from pure black.
- Person visibility: ONLY the hands and immediate work surface lit by the product are visible. The rest of the person's body is a dark silhouette, barely distinguishable from the background.
- Nearby surfaces (desk, floor, wall near product): catch warm amber reflections at 15-20% brightness, tight falloff.
- Distant surfaces: invisible, 2-5% brightness at most. Walls and floor blend into darkness.
- Windows: completely dark, showing only black night sky. No blue, no moonlight.

Color grading: warm, intimate, DARK. Matches the mood of the product night images (#12100E background). Shadows are deep warm black. Film grain slightly more visible than day version.

Scene-specific lighting: ${scene.nightLightingDescription || scene.lightingDescription}

Keep UNCHANGED: composition, camera angle, person pose and position, product position and form, furniture layout, aspect ratio, framing.
Do NOT add any light source that wasn't in the original scene. Do NOT change the person's clothing or posture. Do NOT move any object.

${MOOD_NEGATIVE}`;
}

const MOODBOARD_SCENES = [
  {
    id: 'mood-1',
    productId: 2,
    aspectRatio: '16:9',
    compositionType: 'Side view. Lamp base at frame left edge, arc curves overhead to right. Person in right 1/3 of frame.',
    personDescription: 'A UX designer sitting on a low linen sofa, drawing wireframes in a large sketchbook with a pencil. Bare feet on the concrete floor. Wearing neutral linen clothing',
    lightingDescription: 'Night scene. No natural light — windows show dark sky. The arc lamp is the ONLY light source, emitting warm 3800K amber-white light (#FFC66E) from its horizontal light bar. A focused warm pool illuminates the sketchbook and the person\'s hands. The rest of the room falls into deep warm shadow. The thin black arc rod is barely visible.',
    sceneDescription: 'A minimalist living room with floor-to-ceiling glass windows. Polished concrete floor. A single low sofa. No other furniture. The arc lamp stands beside the sofa, its parabolic curve reaching over the person. A small side table with two stacked books.',
  },
  {
    id: 'mood-2',
    productId: 17,
    aspectRatio: '3:4',
    compositionType: 'Frontal view. Desk centered horizontally in lower 1/3. Person centered. Wall behind fills upper 2/3.',
    personDescription: 'A developer sitting at a wide light oak desk, typing on a laptop. Seen from directly in front. Wearing a simple dark crew-neck sweater. Head slightly bowed toward the screen',
    lightingDescription: 'Daytime. Soft natural daylight enters from a large window on the left side (not directly visible). Even, diffused illumination across the space. No harsh shadows. The hemisphere lamp sits on the desk — light is OFF. The lamp exists as a sculptural design object in the bright space.',
    sceneDescription: 'A minimal home studio. Wide light oak desk (~180cm), a single Wegner-style chair, the hemisphere lamp on the desk to the person\'s left, a laptop, and a single ceramic mug. White walls. Light concrete floor. Nothing else in the room. Ceiling height ~4m. The space feels vast and quiet.',
  },
  {
    id: 'mood-3',
    productId: 11,
    aspectRatio: '3:4',
    compositionType: 'Frontal view, perfect bilateral symmetry. Arch centered on far wall. Person centered below the arch.',
    personDescription: 'An architect sitting casually on the polished concrete floor, leaning back comfortably against the wall beneath the arch. Holding a large hardcover architecture book open on their lap. Wearing a light beige linen shirt and relaxed trousers. Relaxed, contemplative posture',
    lightingDescription: 'Night scene. No ambient light. The arch\'s concealed LED (behind the frame, between frame and wall) emits warm 3800K amber light (#FFC66E) onto the wall surface, creating an arch-shaped halo of warm light. The matte black arch frame itself remains a dark silhouette. The warm glow illuminates the person\'s shoulders, hands, and the open book. The corridor recedes into darkness in both directions.',
    sceneDescription: 'A long, narrow gallery-like corridor. White walls, polished concrete floor. The arch is mounted on the far wall at eye level. No other fixtures, no furniture, no decoration. The architecture is minimal and monumental. The arch\'s warm backlight creates a luminous portal effect — the only island of warmth in an austere space.',
  },
  {
    id: 'mood-4',
    productId: 16,
    aspectRatio: '16:9',
    compositionType: 'Side view. Pendant hangs from top 1/4 of frame, centered. Person at table in lower half, slightly right of center.',
    personDescription: 'An industrial designer standing at a large wooden worktable, assembling a small mockup model with their hands. Seen from the side. Wearing a simple apron over neutral clothing. Focused on the work — head bowed, hands active',
    lightingDescription: 'Late afternoon transitioning to dusk. Warm natural light from a tall window behind the person (backlit, soft). The cubic pendant is ON, emitting warm 3800K amber-white light (#FFC66E) downward. Two light sources merge — golden natural light from behind, warm amber from the pendant above. The pendant\'s glow creates a focused warm pool on the worktable surface.',
    sceneDescription: 'A clean workshop / maker space. High ceiling (~5m), white walls, a single large wooden worktable (~200cm). The cubic pendant hangs from a thin black cord directly above the table. A few neatly arranged tools on the table. A tall window behind fills the background with soft backlight. The space is spare and purposeful.',
  },
  // --- Day Mode, Strict Camera ---
  {
    id: 'mood-5',
    productId: 2,
    brandMoodName: 'arc-lamp-living',
    aspectRatio: '3:2',
    compositionType: 'Perfect 90-degree side view. Camera is exactly perpendicular to the wall, at eye level. CRITICAL COMPOSITION: The person and arc lamp are placed together slightly right of center. The LEFT side and TOP of the frame have generous empty space. Negative space occupies at least 55% of the frame. CRITICAL: The TOP-LEFT CORNER must be COMPLETELY EMPTY — just flat white wall, absolutely NO architectural elements, NO ceiling beams, NO overhangs, NO ledges, NO structural details visible anywhere in the top-left quadrant. This area is reserved for text overlay. No diagonal, no 3/4 angle, no perspective convergence.',
    personDescription: 'A UX designer sitting on a low linen sofa, positioned slightly right of center in the frame. Sketching wireframes in a large sketchbook with a pencil. Bare feet on the light concrete floor. Wearing neutral linen clothing. Seen in perfect profile — a silhouette-like side view',
    lightingDescription: 'Daytime. Bright, even natural daylight pours in from a large floor-to-ceiling window on the RIGHT edge of the frame. Soft diffused light, no harsh shadows. The arc lamp is OFF — it exists as a pure sculptural object. Its matte black frame and white frosted light bar are clearly visible as design objects in the bright space.',
    nightLightingDescription: 'The arc lamp is the ONLY light source. Its horizontal light bar emits warm 3800K (#FFC66E) downward, creating a focused warm pool on the sketchbook and the person\'s hands. The parabolic arc rod is barely visible as a dark curve. The floor-to-ceiling window on the right shows dark night sky.',
    sceneDescription: 'A vast minimalist room with EXTREMELY high ceiling (~10m). The camera is positioned LOW, looking slightly upward, making the wall appear to extend enormously above the person and lamp. The person and sofa occupy only the BOTTOM 40% of the frame — the TOP 60% is entirely empty white wall. Clean flat white wall — one continuous surface with NO architectural details, NO moldings, NO beams, NO recesses. Light polished concrete floor. On the RIGHT EDGE, a large floor-to-ceiling window lets in bright natural daylight. CRITICAL — The arc lamp rod must follow a PERFECT MATHEMATICAL PARABOLIC CURVE — precise, geometrically exact. Thin black rod rises vertically from a square stone base, curves in a perfect parabolic arc, terminating in a horizontal light bar. A single low linen sofa slightly right of center. A small side table with two stacked books. NO other furniture. The left half is empty white wall and pale floor.',
  },
  {
    id: 'mood-6',
    productId: 6,
    brandMoodName: 'column-lamp-studio',
    aspectRatio: '3:4',
    compositionType: 'Perfect 100% frontal view. Camera faces the wall head-on at eye level. The tall cylindrical lamp stands on the left, the person sits on the right. Balanced asymmetry within a frontal frame.',
    personDescription: 'A creative director sitting cross-legged on a low cushion on the floor, reviewing printed photographs spread on the pale wooden floor in front of them. Wearing a light cream linen shirt with rolled-up sleeves and relaxed light trousers. Calm, focused posture — head tilted down toward the prints',
    lightingDescription: 'Daytime. Bright, soft natural daylight enters from a large window on the right side. Even, airy illumination. The tall cylindrical column lamp stands nearby — light is OFF. The frosted vertical panel and matte black body are clearly visible as a sculptural column in the bright space.',
    nightLightingDescription: 'The cylindrical column lamp is the ONLY light source. Its vertical frosted panel glows with warm 3800K (#FFC66E) along its full height, radiating outward. The warm light illuminates the printed photographs on the floor and the person\'s hands. The column becomes a tall luminous vertical line.',
    sceneDescription: 'A minimal creative studio. Pale oak floor, white walls, very high ceiling (~5m). The tall cylindrical column lamp (~120cm) stands upright on the left side of the frame. The person sits on the floor to the right, surrounded by large printed photographs laid out in a grid. No furniture except a low cushion. The space is vast and serene.',
  },
  {
    id: 'mood-7',
    productId: 11,
    brandMoodName: 'arch-light-gallery',
    aspectRatio: '3:4',
    compositionType: 'Perfect 100% frontal view, absolute bilateral symmetry. Camera faces the wall head-on. The arch is centered exactly in the middle of the frame. Person is centered directly below the arch. The composition is perfectly symmetric left-right.',
    personDescription: 'An architect sitting on the polished concrete floor, leaning back against the wall directly beneath the arch. Holding a large hardcover architecture book open on their lap. Wearing light neutral clothing',
    lightingDescription: 'Daytime. Bright, even natural daylight fills the corridor from skylights or high windows (not directly visible). The arch wall light is OFF — it is a pure matte black metal sculpture on the white wall. The black arch frame is clearly visible against the bright white wall.',
    nightLightingDescription: 'The arch\'s concealed LED (behind the frame) is the ONLY light source. It emits warm 3800K (#FFC66E) onto the wall surface behind the arch, creating an arch-shaped halo. The matte black frame remains a dark silhouette. The warm glow illuminates the person\'s shoulders, hands, and the open book.',
    sceneDescription: 'A long, narrow gallery-like corridor. White walls, polished concrete floor. The matte black arch frame is mounted on the far wall at eye level — a pure geometric sculpture. No other fixtures, no furniture, no decoration. The architecture is minimal and monumental. Daylight makes the space feel open and serene.',
  },
  {
    id: 'mood-8',
    productId: 16,
    brandMoodName: 'cube-pendant-workshop',
    aspectRatio: '16:9',
    compositionType: 'Perfect 90-degree side view. Camera is exactly perpendicular to the worktable length. The pendant hangs from the top 1/4 of frame. Person stands at the table in the lower half. No diagonal, no 3/4 angle, no perspective convergence.',
    personDescription: 'An industrial designer standing at a large wooden worktable, assembling a small mockup model with their hands. Seen in perfect profile from the side. Wearing a simple apron over neutral clothing. Head bowed, hands active',
    lightingDescription: 'Daytime. Bright natural daylight from a tall window behind the person (soft backlight) and from the left. Even, airy illumination. The cubic pendant is OFF — it hangs as a geometric sculpture. Its matte black frame edges and white frosted glass faces are clearly visible.',
    nightLightingDescription: 'The cubic pendant is the ONLY light source. Its frosted glass faces glow with warm 3800K (#FFC66E), radiating downward onto the worktable. The pendant creates a focused warm pool on the table surface and the person\'s working hands. The tall window behind shows dark night sky.',
    sceneDescription: 'A clean workshop / maker space. High ceiling (~5m), white walls, a single large wooden worktable (~200cm). The cubic pendant hangs from a thin black cord directly above the table. A few neatly arranged tools on the table. A tall window fills the background with soft natural light. Spare and purposeful.',
  },
  // --- Day Mode, Additional ---
  {
    id: 'mood-9',
    productId: 18,
    brandMoodName: 'capsule-lamp-loft',
    aspectRatio: '16:9',
    compositionType: 'Perfect 90-degree side view. Camera exactly perpendicular to the wall at eye level. The capsule lamp stands on the left 1/3, person on the right 2/3. No perspective convergence.',
    personDescription: 'A photographer sitting on the floor with legs stretched out, leaning against a white wall, reviewing large printed photos spread around them. Wearing a light sand-colored cotton shirt and loose pale trousers. Relaxed, absorbed in the prints',
    lightingDescription: 'Daytime. Bright, even natural daylight from a tall window on the right (partially visible). Soft diffused light fills the space. The capsule floor lamp is OFF — the horizontal frosted glass capsule and thin black vertical rod are clearly visible as a sculptural object.',
    nightLightingDescription: 'The capsule lamp is the ONLY light source. Its horizontal frosted glass capsule glows with warm 3800K (#FFC66E), radiating horizontally in both directions. Warm light illuminates the photographs on the floor and the person\'s lap. The thin black rod disappears into darkness.',
    sceneDescription: 'A minimal loft with very high ceilings (~6m), white brick walls, pale concrete floor. The capsule floor lamp stands upright — its horizontal glass capsule at eye height on a thin black rod. Large format photographs scattered on the floor around the seated person. No furniture. Raw, open, airy.',
  },
  {
    id: 'mood-10',
    productId: 8,
    brandMoodName: 'split-disc-meditation',
    aspectRatio: '3:4',
    compositionType: 'Perfect 100% frontal view. Camera faces the wall head-on. The split disc is mounted on the wall, centered in the upper half of the frame. Person sits below. Perfect bilateral symmetry.',
    personDescription: 'A graphic designer sitting cross-legged on a woven floor mat directly beneath the wall light, sketching in a small notebook with a pencil. Wearing a white linen top and light beige pants. Calm, meditative posture — head slightly bowed',
    lightingDescription: 'Daytime. Soft natural daylight enters from the left. Even, quiet illumination. The split disc wall light is OFF — two white frosted half-discs with the horizontal gap between them are clearly visible against the white wall. A geometric sculpture.',
    nightLightingDescription: 'The split disc is the ONLY light source. Both half-discs glow with warm 3800K (#FFC66E) from within. Warm amber light emanates from the horizontal gap between the two halves, projecting a horizontal band onto the wall. The warm glow illuminates the person\'s notebook and hands below.',
    sceneDescription: 'A minimal meditation/creative room. White plaster walls, light oak floor. The split disc (~25cm) is mounted centered on the wall at about 150cm height. Below it, the person sits on a simple woven mat. A single ceramic cup beside them. Nothing else in the room. Serene and still.',
  },
  {
    id: 'mood-11',
    productId: 20,
    brandMoodName: 'prism-lamp-desk',
    aspectRatio: '16:9',
    compositionType: 'Perfect 90-degree side view. Camera exactly perpendicular to the desk length, at seated eye level. Person seen in perfect profile on the right, desk extends horizontally across the frame. No diagonal, no 3/4 angle, no overhead view.',
    personDescription: 'A product designer seen in perfect side profile, sitting at a desk, leaning slightly forward and sketching geometric forms on paper with a pencil. Wearing a light cream linen shirt with rolled-up sleeves. Calm, focused posture — one hand drawing, the other resting on the desk',
    lightingDescription: 'Daytime. Soft natural daylight from a large window behind the camera. Even, bright illumination across the desk. The pyramid prism desk lamp is OFF — the small glass pyramid with black frame edges sits on the desk as a precious geometric object, clearly visible.',
    nightLightingDescription: 'The pyramid prism is the ONLY light source. All frosted glass faces glow with warm 3800K (#FFC66E) from an internal source. The black edge frames create dark geometric lines against the warm glow. Warm light washes onto the desk surface, illuminating the paper and the person\'s drawing hand.',
    sceneDescription: 'A designer\'s workspace seen from the side. Long light birch desk against a white wall. The small pyramid lamp (~10cm) sits on the desk to the left of the person. Sheets of paper, a ruler, and a few pencils neatly placed. The person sits in a simple wooden chair. White wall behind, light concrete floor below. Minimal and focused.',
  },
];

// ---------- Image Generation ----------

/**
 * Day 이미지 생성: 텍스트 프롬프트만 사용
 */
async function generateDayImage(ai, prompt, outputPath) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: STYLE.aspectRatio,
        imageSize: STYLE.resolution,
      },
    },
  });

  return extractAndSaveImage(response, outputPath);
}

/**
 * Night 이미지 생성: Day 이미지를 레퍼런스로 + Night 프롬프트
 */
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
        aspectRatio: STYLE.aspectRatio,
        imageSize: STYLE.resolution,
      },
    },
  });

  return extractAndSaveImage(response, outputPath);
}

/**
 * 무드보드 이미지 생성: 제품 이미지를 레퍼런스로 + 무드보드 프롬프트 + 커스텀 비율
 */
async function generateMoodboardImage(ai, prompt, refImagePath, outputPath, aspectRatio) {
  const refImageData = fs.readFileSync(refImagePath);
  const base64Image = refImageData.toString('base64');

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
        aspectRatio,
        imageSize: STYLE.resolution,
      },
    },
  });

  return extractAndSaveImage(response, outputPath);
}

/**
 * API 응답에서 이미지 추출 후 파일 저장
 */
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
    ids: null,
    mode: 'both',
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--ids':
        options.ids = args[++i].split(',').map(Number);
        break;
      case '--mode':
        options.mode = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        console.log(`
Lumenstate Product Image Generator

Workflow:
  1. Day image: generated from text prompt only
  2. Night image: Day image as reference + Night transformation prompt

Usage:
  node scripts/generate-product-images.mjs [options]

Options:
  --ids <ids>    Comma-separated product IDs (default: all)
  --mode <mode>  'day', 'night', 'both', 'bg-unify', or 'moodboard' (default: both)
  --dry-run      Print prompts without calling API
  --help         Show this help message

Examples:
  --ids 1,2,3              Generate products 1, 2, 3 (day + night)
  --ids 1,2 --mode day     Generate only day images for products 1, 2
  --mode night             Generate night images using existing day images as reference
`);
        process.exit(0);
    }
  }

  return options;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const products = options.ids
    ? PRODUCTS.filter((p) => options.ids.includes(p.id))
    : PRODUCTS;

  if (products.length === 0) {
    console.error('Error: No matching products found');
    process.exit(1);
  }

  const isMoodboard = options.mode === 'moodboard';
  const isMoodboardNight = options.mode === 'moodboard-night';
  const isBgUnify = options.mode === 'bg-unify';
  const generateDay = !isBgUnify && !isMoodboard && !isMoodboardNight && (options.mode === 'day' || options.mode === 'both');
  const generateNight = !isBgUnify && !isMoodboard && !isMoodboardNight && (options.mode === 'night' || options.mode === 'both');

  // Count total tasks
  let totalTasks = 0;
  if (isMoodboard || isMoodboardNight) totalTasks = MOODBOARD_SCENES.length;
  if (isBgUnify) totalTasks += products.length * 2;
  if (generateDay) totalTasks += products.length;
  if (generateNight) totalTasks += products.length;

  console.log(`\n  Lumenstate Image Generator`);
  console.log(`  Model: ${MODEL}`);
  console.log(`  Resolution: ${STYLE.resolution} (${STYLE.aspectRatio})`);
  console.log(`  Products: ${products.map((p) => p.id).join(', ')}`);
  console.log(`  Mode: ${options.mode}`);
  console.log(`  Workflow: ${isMoodboardNight ? 'Moodboard Night (day mood ref + night prompt)' : isMoodboard ? 'Moodboard (product ref + editorial prompt)' : isBgUnify ? 'Background unify (image ref + bg prompt)' : generateDay && generateNight ? 'Day (text) → Night (day ref + prompt)' : generateDay ? 'Day (text prompt)' : 'Night (day ref + prompt)'}`);
  console.log(`  Tasks: ${totalTasks} images\n`);

  // Dry run
  if (options.dryRun) {
    for (const product of products) {
      if (generateDay) {
        console.log(`${'='.repeat(60)}`);
        console.log(`  Product #${product.id} — DAY MODE (text-to-image)`);
        console.log(`  Output: ${product.id}.png`);
        console.log(`${'='.repeat(60)}\n`);
        console.log(buildDayPrompt(product));
        console.log('\n');
      }
      if (generateNight) {
        console.log(`${'='.repeat(60)}`);
        console.log(`  Product #${product.id} — NIGHT MODE (image ref: ${product.id}.png + prompt)`);
        console.log(`  Output: ${product.id}-1.png`);
        console.log(`${'='.repeat(60)}\n`);
        console.log(buildNightPrompt(product));
        console.log('\n');
      }
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
  let taskIndex = 0;

  // --- Moodboard ---
  if (isMoodboard) {
    const landscapeDir = path.join(ROOT, 'src/assets/landscape');
    if (!fs.existsSync(landscapeDir)) {
      fs.mkdirSync(landscapeDir, { recursive: true });
    }

    // --ids로 씬 번호 필터링 (1-4 → mood-1 ~ mood-4)
    const scenes = options.ids
      ? MOODBOARD_SCENES.filter((s) => options.ids.includes(parseInt(s.id.replace('mood-', ''))))
      : MOODBOARD_SCENES;
    totalTasks = scenes.length;

    for (const scene of scenes) {
      taskIndex++;
      const refPath = path.join(OUTPUT_DIR, `${scene.productId}.png`);
      const outPath = path.join(landscapeDir, `${scene.id}.png`);
      const label = `[${taskIndex}/${totalTasks}] ${scene.id} (product #${scene.productId}, ${scene.aspectRatio})`;
      process.stdout.write(`  ${label} ... `);

      if (!fs.existsSync(refPath)) {
        console.log(`SKIPPED: ${scene.productId}.png not found`);
        failed++;
        if (taskIndex < totalTasks) await sleep(DELAY_MS);
        continue;
      }

      try {
        const prompt = buildMoodboardPrompt(scene);
        const result = await generateMoodboardImage(ai, prompt, refPath, outPath, scene.aspectRatio);
        console.log(`OK (${formatBytes(result.size)}) -> ${scene.id}.png`);
        completed++;
      } catch (error) {
        console.log(`FAILED: ${error.message}`);
        failed++;
      }

      if (taskIndex < totalTasks) await sleep(DELAY_MS);
    }

    console.log(`\n  Done: ${completed} succeeded, ${failed} failed out of ${totalTasks} total`);
    if (completed > 0) {
      console.log(`  Output: ${landscapeDir}/`);
    }
    return;
  }

  // --- Moodboard Night ---
  if (isMoodboardNight) {
    const brandMoodDir = path.join(ROOT, 'src/assets/brand-mood');

    const scenes = options.ids
      ? MOODBOARD_SCENES.filter((s) => s.brandMoodName && options.ids.includes(parseInt(s.id.replace('mood-', ''))))
      : MOODBOARD_SCENES.filter((s) => s.brandMoodName);
    totalTasks = scenes.length;

    for (const scene of scenes) {
      taskIndex++;
      const dayMoodPath = path.join(brandMoodDir, `${scene.brandMoodName}.png`);
      const nightMoodPath = path.join(brandMoodDir, `${scene.brandMoodName}-night.png`);
      const label = `[${taskIndex}/${totalTasks}] ${scene.brandMoodName} night (${scene.aspectRatio})`;
      process.stdout.write(`  ${label} ... `);

      if (!fs.existsSync(dayMoodPath)) {
        console.log(`SKIPPED: ${scene.brandMoodName}.png not found`);
        failed++;
        if (taskIndex < totalTasks) await sleep(DELAY_MS);
        continue;
      }

      try {
        const prompt = buildMoodboardNightPrompt(scene);
        const result = await generateMoodboardImage(ai, prompt, dayMoodPath, nightMoodPath, scene.aspectRatio);
        console.log(`OK (${formatBytes(result.size)}) -> ${scene.brandMoodName}-night.png`);
        completed++;
      } catch (error) {
        console.log(`FAILED: ${error.message}`);
        failed++;
      }

      if (taskIndex < totalTasks) await sleep(DELAY_MS);
    }

    console.log(`\n  Done: ${completed} succeeded, ${failed} failed out of ${totalTasks} total`);
    if (completed > 0) {
      console.log(`  Output: ${brandMoodDir}/`);
    }
    return;
  }

  for (const product of products) {
    const dayPath = path.join(OUTPUT_DIR, `${product.id}.png`);
    const nightPath = path.join(OUTPUT_DIR, `${product.id}-1.png`);

    // --- Background Unify ---
    if (isBgUnify) {
      // Day bg unify
      taskIndex++;
      const dayLabel = `[${taskIndex}/${totalTasks}] Product #${product.id} (bg-unify day)`;
      process.stdout.write(`  ${dayLabel} ... `);
      if (!fs.existsSync(dayPath)) {
        console.log(`SKIPPED: ${product.id}.png not found`);
        failed++;
      } else {
        try {
          const result = await generateNightImage(ai, buildBgUnifyDayPrompt(), dayPath, dayPath);
          console.log(`OK (${formatBytes(result.size)}) -> ${product.id}.png`);
          completed++;
        } catch (error) {
          console.log(`FAILED: ${error.message}`);
          failed++;
        }
      }
      if (taskIndex < totalTasks) await sleep(DELAY_MS);

      // Night bg unify
      taskIndex++;
      const nightLabel = `[${taskIndex}/${totalTasks}] Product #${product.id} (bg-unify night)`;
      process.stdout.write(`  ${nightLabel} ... `);
      if (!fs.existsSync(nightPath)) {
        console.log(`SKIPPED: ${product.id}-1.png not found`);
        failed++;
      } else {
        try {
          const result = await generateNightImage(ai, buildBgUnifyNightPrompt(), nightPath, nightPath);
          console.log(`OK (${formatBytes(result.size)}) -> ${product.id}-1.png`);
          completed++;
        } catch (error) {
          console.log(`FAILED: ${error.message}`);
          failed++;
        }
      }
      if (taskIndex < totalTasks) await sleep(DELAY_MS);
      continue;
    }

    // --- Day ---
    if (generateDay) {
      taskIndex++;
      const label = `[${taskIndex}/${totalTasks}] Product #${product.id} (day)`;
      process.stdout.write(`  ${label} ... `);

      try {
        const result = await generateDayImage(ai, buildDayPrompt(product), dayPath);
        console.log(`OK (${formatBytes(result.size)}) -> ${product.id}.png`);
        completed++;
      } catch (error) {
        console.log(`FAILED: ${error.message}`);
        failed++;
      }

      if (taskIndex < totalTasks) await sleep(DELAY_MS);
    }

    // --- Night (uses day image as reference) ---
    if (generateNight) {
      taskIndex++;
      const label = `[${taskIndex}/${totalTasks}] Product #${product.id} (night <- ${product.id}.png ref)`;
      process.stdout.write(`  ${label} ... `);

      // Check day image exists
      if (!fs.existsSync(dayPath)) {
        console.log(`SKIPPED: day image ${product.id}.png not found (generate day first)`);
        failed++;
        if (taskIndex < totalTasks) await sleep(DELAY_MS);
        continue;
      }

      try {
        const result = await generateNightImage(
          ai,
          buildNightPrompt(product),
          dayPath,
          nightPath
        );
        console.log(`OK (${formatBytes(result.size)}) -> ${product.id}-1.png`);
        completed++;
      } catch (error) {
        console.log(`FAILED: ${error.message}`);
        failed++;
      }

      if (taskIndex < totalTasks) await sleep(DELAY_MS);
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
