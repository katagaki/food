# One-Pan Food

A static single-page recipe app. Recipe data lives in `recipes/` as JSON, step illustrations in `img/` as SVG. The original reference pages are in `orig/` (Japanese; the site itself is English only). The site title is "One-Pan Food"; individual recipe titles do not repeat the "One-Pan" wording.

## Copy style rules

- Never use em-dashes anywhere: not in site copy, code comments, or this file. Use a period, comma, or colon instead.
- Avoid AI-writing tropes in general: no "it's not X, it's Y" constructions, no breathless adjectives, no rule-of-three padding. Write plainly, like a good cookbook.
- All user-facing text is English.

## SVG style rules

Step illustrations in `img/` share one visual language:

- Flat, colorful shapes with fills, not line art. Use soft gradients and a subtle ground shadow (an `<ellipse>` at about 25% black) for depth.
- `viewBox="0 0 200 150"`, transparent background (the page card supplies the dark backdrop), and a `role="img"` plus `aria-label` describing the scene.
- Shared palette: pan gray `#5c6066` to `#3c4046` with rim `#6f747b`, wooden handle `#a97142`, flame orange `#ff832b`/`#ffb000`, butter `#f1c21b`, carrot `#ff832b`, onion cream `#f3dfae`/`#e8c66a`, curry `#a4693a`, shrimp `#fa7368`, rice and plate whites `#f0ece4` to `#ffffff`, water blue `#33b1ff`, steam `#aab6c0`.
- Recurring elements (pan, flames, steam, timer badge) should look the same across all illustrations.
- Text inside SVGs is minimal, English, generic `sans-serif` (for example timer digits or "HEAT OFF").

## Commit message rules

- Single line only. No body, no trailers.
- Keep it short (under about 60 characters) and in the imperative mood: "Add pork bowl recipe", not "Added" or "Adds".
- No prefixes like `feat:`/`fix:`, no emoji, no issue references.
- Commit and push to `main` whenever a meaningful unit of work is complete.
