# OE Services — Website Handoff

A complete, working static website for OE Services (licensed electrical & general
contractor — NV, CA, AZ). Built as plain HTML/CSS/JavaScript with **no build step
and no dependencies** — open `index.html` in a browser and it runs.

This package is a reference implementation / starting point. Everything works as-is;
the notes below flag the few things a developer will likely want to wire up or adjust.

---

## How to run it

It's a static site. Any of these work:

- **Quickest:** double-click `index.html` (works from disk for the home page).
- **Recommended for the estimator** (because it loads `.js`/`.css` via relative paths):
  serve the folder over HTTP. From this directory:
  ```
  python3 -m http.server 8080
  ```
  then open http://localhost:8080
- **Deploy:** drag the whole folder into Vercel / Netlify, or upload its contents to
  any web host. No server-side code required.

---

## File structure

```
/
├── index.html                 ← Home page (animated, marketing)
├── estimators/
│   └── estimate.html          ← The unified estimator (all 5 services)
├── assets/
│   ├── site.css               ← Shared design system (colors, type, layout, animation)
│   ├── estimator.js           ← PRICING ENGINE — all five service models + regional logic
│   ├── estimator-ui.js        ← Estimator UI controller (steps, validation, rendering)
│   └── oe-logo-2026.png       ← Logo
├── robots.txt
├── sitemap.xml
└── README.md                  ← this file
```

The site is intentionally just **two pages**. One estimator handles all five trades
(electrical, HVAC, roofing, kitchen & bath, ADU) instead of five separate pages.

---

## What the estimator does

A 5-step flow on `estimators/estimate.html`:

1. **Your info** — uniform for every service: first name, last name, phone, email,
   street, city, state, ZIP. (Phone auto-formats; ZIP auto-detects state + pricing region.)
2. **Service** — pick one of the five trades.
3. **Details** — service-specific questions (size, type, scope, etc.).
4. **Estimate** — an all-in price range with an itemized breakdown.
5. **Done** — confirmation + summary.

**Deep links:** the home page links to the estimator with a preselected service via
`?service=...`, e.g. `estimators/estimate.html?service=roofing`. Valid values:
`electrical`, `hvac`, `roofing`, `kitchen-bath`, `adu`.

---

## Pricing logic (in `assets/estimator.js`)

All pricing lives in this one file. Five models:

| Service        | Model                                                                 |
|----------------|-----------------------------------------------------------------------|
| Electrical     | Component line-items (low/high each), summed                          |
| HVAC & Energy  | Component line-items (low/high each), summed                          |
| Roofing        | Per-sq-ft by material × pitch × stories × layers × property × region |
| Kitchen & Bath | Scope tiers (minor / mid / full gut) × region                        |
| ADU            | Per-sq-ft by ADU type × site complexity × region (CA/NV/AZ rates)    |

**Regional pricing:** every estimate is scaled by a cost index based on the customer's
ZIP code (`resolveZip()` near the top of the file). Las Vegas, LA, Bay Area, Phoenix,
etc. each have their own multiplier. ZIPs outside NV/CA/AZ fall back to sane defaults.

**High-bias (important — this is intentional):** displayed estimates are deliberately
weighted toward the **top** of the modeled cost range, per the client's request. Two
knobs at the very top of `estimator.js` control this:

```js
var FLOOR_BIAS = 0.78; // raises the LOW end 78% of the way toward the high end
var CEIL_BIAS  = 1.06; // nudges the HIGH end up 6%
```

Lower `FLOOR_BIAS` toward `0` for wider/lower ranges; raise toward `1` for tighter/higher
ranges. Example with current values: a Las Vegas panel upgrade displays ~**$4,800–$5,800**.

To change actual base prices, edit the `ELECTRICAL` / `HVAC` component tables,
`ROOF_BASE`, `KITCHEN`/`BATH`, or `ADU_RATE` in the same file.

---

## ⚠️ TO WIRE UP: lead submission

Right now the form **does not send leads anywhere** — step 5 just shows a confirmation
screen. There is a clearly-marked hook in `assets/estimator-ui.js` (search for
`submission hook`). Drop your endpoint there, e.g.:

```js
fetch('/api/lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(S)   // S holds all collected fields + the result
});
```

The `S` object contains: `first, last, phone, email, street, city, state, zip,
service, details{}, result{}`. Connect it to email, a CRM, a spreadsheet, or a
form service (Formspree, Basin, etc.) — whatever the client uses.

---

## Things the developer may want to adjust

- **Logo path / domain:** canonical URLs and OG tags reference
  `https://www.oeservices.us/`. Update if the live domain differs.
- **Phone / email:** `(805) 503-2787` and `ahernandez@oeservices.us` appear in the nav
  and footer of both pages.
- **Fonts:** loaded from Google Fonts (Sora, Barlow, Barlow Condensed). Self-host if
  preferred.
- **Old URLs:** the previous site used `/estimators/electrical.html`, `/hvac.html`, etc.
  Point those at `estimators/estimate.html?service=...` (301 redirects) so existing
  links/SEO carry over.
- **Accessibility & analytics:** no analytics or cookie banner is included — add per
  the client's requirements.

---

## Notes

- Estimates are preliminary and meant to be confirmed at a free on-site visit (the UI
  says this). They are marketing/ballpark figures, not binding quotes.
- No personal data is stored or transmitted until you wire up the submission hook above.
- Tested across all five services end-to-end (form flow, validation, ZIP→region pricing,
  phone formatting, estimate rendering).

© 2026 OE Services LLC.
