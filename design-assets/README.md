# Design V2 assets

Four original AI-generated decorative photographs created with OpenAI image generation on 2026-09-09 for this implementation. They are illustrative scenes, not photographs of listed practices, destinations or product reviews. No manufacturer product photographs, logos or stock images were copied.

- hero-dog-alpine-lake: golden retriever beside a calm alpine lake, mountains, natural daylight.
- travel-human-dog-sunset: adult hiker and dog overlooking mountains at sunset.
- play-dog-alpine-lake: dog playing outdoors near a lake.
- health-dog-home: relaxed dog in a warm home interior.

Original PNG sources are stored here; `npm run design:images` creates responsive AVIF and WebP files in public/images/brand. BrandImage loads decorative images with empty alt text; the adjacent text supplies the meaning. Generated scenes must never be represented as a real listed business or independent product test.

Fonts: Manrope Variable and Kalam Regular, vendored from the @fontsource-variable/manrope and @fontsource/kalam npm packages version 5.3.0. Both are self-hosted WOFF2; OFL licenses are in licenses/fonts. No requests to Google Fonts occur.
