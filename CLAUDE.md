# One-Pan Food

A static single-page recipe app. Recipe data lives in `recipes/` as JSON, step illustrations in `img/` as SVG. All site content is English only. The site title is "One-Pan Food"; individual recipe titles do not repeat the "One-Pan" wording.

## Copy style rules

- Never use em-dashes anywhere: not in site copy, code comments, or this file. Use a period, comma, or colon instead.
- Avoid AI-writing tropes in general: no "it's not X, it's Y" constructions, no breathless adjectives, no rule-of-three padding. Write plainly, like a good cookbook.
- All user-facing text is English.

## UI rules

- All text is non-selectable (`user-select: none` on `body`), except the recipe content itself: `.content .page` re-enables selection with `user-select: text`. Keep any new UI (sidebar, buttons, empty states) non-selectable.
- Links and clickable controls use the default cursor. Never use `cursor: pointer`.
- The sidebar recipe list is sorted and filtered in `js/app.js` on every render, so do not rely on the order in `recipes/index.json`. The default sort is alphabetical by title, ascending. The Quickest sort reads `time` as a minute count and falls back to title on a tie, and entries with an unreadable `time` go last. The Human tested filter keeps only entries with `tried`.
- On mobile (720px and below) there is no drawer and no homepage: the sidebar recipe list is the root view, and opening a recipe pushes the recipe view in from the right like a navigation stack (`body.recipe-open`), with a fixed back button to pop it. Desktop keeps the permanent sidebar plus content layout.

## SVG style rules

Step illustrations in `img/` share one visual language:

- Flat, colorful shapes with fills, not line art. Use soft gradients and a subtle ground shadow (an `<ellipse>` at about 25% black) for depth.
- `viewBox="0 0 200 150"`, transparent background (the page card supplies the dark backdrop), and a `role="img"` plus `aria-label` describing the scene.
- Shared palette: pan gray `#5c6066` to `#3c4046` with rim `#6f747b`, wooden handle `#a97142`, flame orange `#ff832b`/`#ffb000`, butter `#f1c21b`, carrot `#ff832b`, onion cream `#f3dfae`/`#e8c66a`, curry `#a4693a`, shrimp `#fa7368`, rice and plate whites `#f0ece4` to `#ffffff`, water blue `#33b1ff`, steam `#aab6c0`.
- Recurring elements (pan, flames, steam, timer badge) should look the same across all illustrations.
- Text inside SVGs is minimal, English, generic `sans-serif` (for example timer digits or "HEAT OFF").

## Recipe data rules

All recipe JSON is fetched through `getJSON` in `js/app.js`, which passes `cache: "no-cache"` so the browser revalidates every time. Without it a stale `recipes/index.json` hides newly added recipes until a hard refresh.

Every file in `recipes/` follows one shape. Keys appear in the order listed, and optional keys are written only when they apply.

- Recipe file: `id`, `title`, `time`, `serves`, `tried`, `ingredients`, `tools`, `steps`, `troubleshooting`. `tried` is written only when the recipe has been cooked, as `true`; leave it out otherwise.
- `recipes/index.json` entry: `id`, `file`, `title`, `time`, `serves`, `tried`, `keywords`. The `id`, `title`, `time`, `serves`, and `tried` values must match the recipe file exactly.
- `time` reads like "15 min". `serves` is a plain count such as "1" or "1 to 2". Write ranges with the word "to", never a dash.
- `ingredients` has exactly two sections, `toBuy` and `fromThePantry`. Each entry is `item`, `amount`, `note`, `optional`.
  - `amount` carries the quantity only: "150 g", "1/2", "2 tbsp", or a lowercase vague measure such as "to taste", "a pinch", "a little". Prep work ("finely diced", "thinly sliced") belongs in `note`, not in `amount`.
  - `note` is a full sentence with a period. `optional` is written only when the ingredient can be skipped, as `true`.
- `tools` entries are `name`, `required`, `note`. All three are always present, `required` is `true` or `false`, and `note` is a full sentence saying what the tool is for. The main pan names its size, for example "Frying pan (about 24 cm)".
- `steps` entries are `title`, `points`, `hint`, `image`. `title` is a short imperative phrase ("Brown pork"), `points` holds 2 to 3 sentences, `hint` is optional background, and `image` is `img/<id>-<step number>.svg`, numbered from 1.
- `troubleshooting` entries are `problem` and `solution`. `problem` is a short symptom with no closing period, written in the third person ("The rice turned mushy") or as a want without the pronoun ("Want it more filling"). `solution` is one to three full sentences.

## Commit message rules

- Single line only. No body, no trailers.
- Keep it short (under about 60 characters) and in the imperative mood: "Add pork bowl recipe", not "Added" or "Adds".
- No prefixes like `feat:`/`fix:`, no emoji, no issue references.
- Commit and push to `main` whenever a meaningful unit of work is complete.
