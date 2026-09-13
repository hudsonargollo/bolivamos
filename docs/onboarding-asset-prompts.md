# BoliVibes onboarding asset prompts

Use these in Nano Banana, ChatGPT image generation, or another image model. Keep output as transparent PNG or WEBP when possible, 1024x1024 for spot illustrations and 1290x2796 for phone mock/splash backgrounds.

## Global style lock

Use this style preface for every prompt:

BoliVibes brand illustration style: warm Bolivian clay aesthetic, matte terracotta and cream surfaces, soft rounded geometric shapes, Santa Cruz de la Sierra nightlife and culture, colors #C04A2F terracotta red, #E2792F orange, #E3A52F golden yellow, #8BA672 sage, #F4EEE2 cream, #33302C charcoal. Friendly, premium but local, not corporate SaaS. Use bold simple silhouettes, soft shadows, no photorealism, no gradients that feel neon/cyberpunk, no emoji, no fake text, no logos except the provided BoliVibes pin icon if uploaded as reference.

## 1. Animated splash logo layers

Prompt:
Create a layered app splash illustration for BoliVibes. Center the uploaded BoliVibes pin icon as the hero object, floating slightly above a matte clay plaza. Behind it, use a simplified Santa Cruz skyline with rounded clay towers, palm silhouettes, and small golden event lights. Use transparent background around the composition. Make it suitable for animation: clear separable layers for pin icon, glow halo, skyline, plaza shadow, and small spark lights. Warm clay palette only: terracotta, orange, golden yellow, sage, cream, charcoal. No text.

Negative prompt:
No generic map pins, no sunburst replacing the provided icon, no neon purple/blue, no photorealistic buildings, no readable text, no people, no clutter.

## 2. Personal account onboarding illustration

Prompt:
Illustrate a BoliVibes personal user discovering Santa Cruz nightlife on their phone. Show a stylized hand holding a phone with abstract event cards, music notes as simple vector shapes, food and culture pins around a warm city plaza. Use soft clay 3D/flat hybrid shapes, rounded cards, terracotta and cream surfaces, sage highlights. The mood is welcoming and social, but privacy-respecting. No readable text.

Negative prompt:
No clubbing clichés, no alcohol focus, no crowded faces, no fake UI text, no emoji icons.

## 3. Business / venue owner onboarding illustration

Prompt:
Illustrate a BoliVibes business account for a local venue owner. Show a warm storefront/bar/café facade made from clay-like geometric shapes, a small dashboard card floating nearby with abstract chart blocks and event pins, and a subtle line of visitors moving toward the venue. Use Santa Cruz local flavor: palm leaves, colonial arch hints, terracotta walls, cream paper cards, sage accents. Professional, approachable, freemium growth tool. No readable text.

Negative prompt:
No corporate office, no laptop-only SaaS scene, no dollar bills, no fake brand names, no busy charts.

## 4. Preferences screen category illustration

Prompt:
Create five small matching spot icons for BoliVibes onboarding preferences: live music, nightlife, gastronomy, cultural events, historical/traditional places. Each icon should be a matte clay object on transparent background, consistent stroke/shape language, rounded forms, using the BoliVibes palette. They should feel like collectible clay badges, not emojis.

Negative prompt:
No emoji style, no thin line icons, no photorealism, no text labels.

## 5. Privacy / trust screen illustration

Prompt:
Create a trust and privacy illustration for BoliVibes. Show a warm shield shape protecting small event cards and friend connection dots, in clay materials and cream paper textures. Include subtle lock and eye-off concepts as abstract shapes, not literal scary security icons. Friendly, calm, transparent, user-controlled. No text.

Negative prompt:
No cyber security blue, no hacker imagery, no warning triangles, no aggressive lock visuals.

## 6. First-run background pattern

Prompt:
Create a seamless BoliVibes background pattern for onboarding screens. Use small abstract clay motifs: map pins, palm leaves, ticket stubs, music notes, food plates, stars, and rounded plaza tiles. Very subtle low-contrast pattern on cream background, mobile app safe, not distracting behind text. Use #F4EEE2 background with terracotta, sage, orange, golden yellow at low opacity.

Negative prompt:
No dense pattern, no high contrast, no readable text, no logo repetition unless very subtle.

## Implementation notes

- Export transparent WEBP/PNG for spot art.
- Keep key subject centered with 15% safe margin.
- Avoid text inside generated art; app UI should render text natively for localization and accessibility.
- Use separate layers where animation is planned: logo, halo, shadow, background, spark lights.
- Test every image on a 390px-wide iPhone screen in light and dark mode.
