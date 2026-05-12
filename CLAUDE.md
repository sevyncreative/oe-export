# OE Services — Project Map for AI Editing

## What this is
Static HTML/CSS/JS site for OE Services LLC (contractor estimator tools). No build pipeline, no npm, no framework. Files are served as-is.

## File structure

```
/
├── index.html            # Homepage (services grid, stats, reviews, FAQ, full footer)
├── electrical.html       # Electrical estimator (267 lines — structure only)
├── hvac.html             # HVAC estimator (254 lines — structure only)
├── kitchen-bath.html     # Kitchen & Bath estimator (327 lines — structure only)
├── adu.html              # ADU & Commercial Build-Out estimator (389 lines — structure only)
├── roofing.html          # Roofing estimator (already clean, uses estimator.js)
└── assets/
    ├── styles.css        # Shared design system (CSS vars, typography, nav, homepage sections)
    ├── estimator-form.css# Shared CSS for electrical.html + hvac.html estimator UI
    ├── kitchen-bath.css  # CSS specific to kitchen-bath.html
    ├── adu.css           # CSS specific to adu.html (dark theme)
    ├── nav.js            # Programmatic mobile nav drawer (used by ALL pages)
    ├── estimator.js      # OE.Wizard multi-step form controller (used by roofing.html)
    ├── electrical.js     # Pricing logic for electrical.html
    ├── hvac.js           # Pricing logic for hvac.html
    ├── kitchen-bath.js   # Pricing + photo/video/maps logic for kitchen-bath.html
    ├── adu.js            # Pricing + Formspree submit logic for adu.html
    └── oe-logo-2026.png  # Logo (used by nav + footer on all pages)
```

## Design system (styles.css)
- **Brand blue**: `#1D6FA4`  
- **Brand dark**: `#1a1a1a`  
- **Green (rebates)**: `#1a6e3f`  
- **Font stack**: Barlow (body), Barlow Condensed (headings), Bebas Neue (display)
- CSS custom properties live in `styles.css :root`
- The `.foot` class (homepage footer) is in `styles.css`
- The `.site-footer` class (estimator pages) is in `estimator-form.css`
- The `.footer` class (adu.html) is in `adu.css`

## Which file to edit for which change

| Task | File(s) to edit |
|------|----------------|
| Change nav links or mobile menu | `assets/nav.js` |
| Change homepage content/layout | `index.html` |
| Change electrical pricing or rebates | `assets/electrical.js` |
| Change HVAC pricing or rebates | `assets/hvac.js` |
| Change kitchen/bath pricing or bundle logic | `assets/kitchen-bath.js` |
| Change ADU/commercial pricing | `assets/adu.js` |
| Change roofing estimator logic | `roofing.html` (inline) + `assets/estimator.js` |
| Change estimator form UI (both elec + hvac) | `assets/estimator-form.css` |
| Change kitchen-bath estimator UI | `assets/kitchen-bath.css` |
| Change ADU estimator UI | `assets/adu.css` |
| Change global typography/colors | `assets/styles.css` |
| Change HTML structure of an estimator | edit the specific `*.html` file |

## Conventions
- Vanilla JS only — `var`/`let`/`const`, no modules, no bundler
- Global state objects named `S` (electrical, hvac) or `S` (adu)
- `window.OE` namespace used in `estimator.js` (roofing only)
- No inline `<style>` or `<script>` blocks in any HTML file (they were extracted)
- `kitchen-bath.html` retains the Google Maps Places API `<script>` tag in HTML (required for the `callback=initGoogleMaps` async pattern)
- CSS class naming: camelCase IDs, kebab-case classes

## Do NOT edit
- `chats/` — conversation logs, not source code
- `project/` — duplicate directory, ignore
- `assets/oe-logo-2026.png` — binary asset
