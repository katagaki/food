# One-Pan Food

A static single-page recipe app. Recipe data lives in `recipes/` as JSON, step illustrations in `img/` as SVG. All site content is English only. The site title is "One-Pan Food"; individual recipe titles do not repeat the "One-Pan" wording.

## Copy style rules

- Never use em-dashes anywhere: not in site copy, code comments, or this file. Use a period, comma, or colon instead.
- Avoid AI-writing tropes in general: no "it's not X, it's Y" constructions, no breathless adjectives, no rule-of-three padding. Write plainly, like a good cookbook.
- All user-facing text is English.

## UI rules

- Ingredients and tools both render as tiles: a shared 44 px icon, a name, and the amount or nothing, grouped under headings that carry a colored left rule. Tools group into "Required" and "Optional" rather than labelling each row, so the tile never repeats what its heading already says.
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

Ingredient icons in `img/ingredients/` and tool icons in `img/tools/` are a separate, smaller format:

- `viewBox="0 0 48 48"`, square, transparent, with `role="img"` and an `aria-label` naming the ingredient.
- Same palette and flat fills as the step art, but no ground shadow and no gradients: at 44 px they only add noise.
- One shape reading clearly at a glance, built from a handful of paths. The recipe text carries the detail, the icon only has to be recognisable.
- Named for the thing, not the recipe, since the file is shared: `garlic.svg`, not `garlic-fried-rice-garlic.svg`.

## Recipe data rules

All recipe JSON is fetched through `getJSON` in `js/app.js`, which passes `cache: "no-cache"` so the browser revalidates every time. Without it a stale `recipes/index.json` hides newly added recipes until a hard refresh.

Every file in `recipes/` follows one shape. Keys appear in the order listed, and optional keys are written only when they apply.

- Recipe file: `id`, `title`, `time`, `serves`, `tried`, `ingredients`, `tools`, `steps`, `troubleshooting`. `tried` is written only when the recipe has been cooked, as `true`; leave it out otherwise.
- `recipes/index.json` entry: `id`, `file`, `title`, `time`, `serves`, `tried`, `keywords`. The `id`, `title`, `time`, `serves`, and `tried` values must match the recipe file exactly.
- `time` reads like "15 min". `serves` is a plain count such as "1" or "1 to 2". Write ranges with the word "to", never a dash.
- `ingredients` has three sections in this order: `supermarket`, `general`, `optional`. A section is written only when it holds entries, so a recipe with nothing optional has no `optional` key at all. Each entry is `item`, `icon`, `amount`, `note`.
  - `supermarket` renders as "Fresh and chilled" and holds the perishables: fresh vegetables, meat, seafood, dairy, bread, eggs, kimchi, and the frozen bag that lives in the same trip. `general` renders as "From the pantry" and holds everything shelf-stable, including packed rice, spaghetti, curry roux, bouillon, sake, oil, soy sauce, salt, and sugar. `optional` holds anything that can be skipped, whichever of the other two it would otherwise sit in. The JSON keys stay as they are; only the headings read differently.
  - `icon` points at a shared square icon in `img/ingredients/`, written as a full path such as `img/ingredients/garlic.svg`. Icons are shared across recipes and across wordings: every pepper uses `pepper.svg`, both bacons use `bacon.svg`, and packed rice and raw rice both use `rice.svg`. Reuse an existing icon rather than adding a near-duplicate, and only draw a new one for an ingredient the set genuinely does not cover.
  - `amount` carries the quantity only: "150 g", "1/2", "2 tbsp", or a lowercase vague measure such as "to taste", "a pinch", "a little". Prep work ("finely diced", "thinly sliced") belongs in `note`, not in `amount`.
  - `note` is a full sentence with a period. Write one only when it changes what you buy: which version to pick, whether a substitute works, or what an optional ingredient adds if you go and get it. Notes that narrate the method ("Used in two goes", "Minced", "Stirred in at the end") do not belong here, because the steps already say it. Most ingredients need no note at all.
- `tools` entries are `name`, `icon`, `required`, `note`. The first three are always present and `required` is `true` or `false`. The main pan names its size, for example "Frying pan (about 24 cm)".
  - `note` is written only when it tells you the tool can be skipped or swapped, or when an optional one is worth getting out: "A mug is fine", "Carrot skin is edible, so you can skip peeling", "Skip it if you buy the cheese already grated". A note saying what the tool is obviously for ("For the onion", "For heating the packed rice") does not belong, and most tools carry no note at all.
  - `icon` points at a shared icon in `img/tools/`, the same way ingredient icons work: every frying pan uses `pan.svg`, every spatula `spatula.svg`, and small, large and donburi bowls all use `bowl.svg`.
- `steps` entries are `title`, `points`, `hint`, `image`. `title` is a short imperative phrase ("Brown pork"), `points` holds 2 to 3 sentences, `hint` is optional background, and `image` is `img/<id>-<step number>.svg`, numbered from 1.
- `troubleshooting` entries are `problem` and `solution`. `problem` is a short symptom with no closing period, written in the third person ("The rice turned mushy") or as a want without the pronoun ("Want it more filling"). `solution` is one to three full sentences.

## Commit message rules

- Single line only. No body, no trailers.
- Keep it short (under about 60 characters) and in the imperative mood: "Add pork bowl recipe", not "Added" or "Adds".
- No prefixes like `feat:`/`fix:`, no emoji, no issue references.
- Commit and push to `main` whenever a meaningful unit of work is complete.
