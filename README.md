# OE Services — Website Handoff

A complete, working static website for OE Services (licensed electrical & general
contractor — NV, CA, AZ). Built as plain HTML/CSS/JavaScript with **no build step
and no dependencies** — open `index.html` in a browser and it runs.

This package is a reference implementation / starting point. Everything works as-is;
the notes below flag the few things a developer will likely want to wire up or adjust.

---

## ⭐ What changed in this revision (May 2026)

Summary of the updates made on top of the original handoff — see the relevant sections
below for detail:

- **New "Commercial" estimator** (`?service=commercial`) — its own per-sq-ft platform
  (build-out / renovation / tenant improvement / commercial electrical), same customer
  info + format as the other forms.
- **New "Not Sure Yet" path** (`?service=not-sure`) — custom-inquiry flow with project
  description, **photo upload (up to 10)** and a **25-second video upload**, plus a clear
  "send a personal inquiry → reply within 24 hrs or referral to our contractor network"
  message. Does not show an auto price.
- **Electrical:** removed Rewire/Troubleshoot; split panel upgrade into **Standard
  (100–225A)** and **400A** (existing feeds reused, same location).
- **Bug fix:** the kitchen/bath "minor" → address-line error is resolved; address now
  collects/renders correctly and the whole render path is null-safe.
- **Pricing:** Kitchen/Bath "mid" tier removed (now minor / high-mid / full gut);
  HVAC +35%/+25%; windows +45%/+15%; roofing +35% low (all types) + 25% on the lowest tier.
- **Roofing size calculator** added to step 3 (length × width × pitch → auto-fills sqft).
- **SEO/AI:** sitemap, JSON-LD offer catalog, and FAQ updated to include commercial and
  the custom-inquiry process.
- **Legal disclaimers:** preliminary/ballpark "not a quote or binding offer" language
  added under the price on the estimate screen, on the confirmation screen, and in both
  page footers; estimates stated valid for 30 days; the homepage "what you'd actually pay"
  line was softened. **See the "Legal disclaimer" section below — have your attorney /
  the NV, CA, AZ contractor boards review this wording before launch.**

⚠️ The two pre-launch to-dos from the original handoff still apply (proof/review content
and the lead-submission hook) — see the marked sections below.

---

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

The site is intentionally just **two pages**. One estimator handles all services
(electrical, HVAC, roofing, kitchen & bath, ADU, commercial, and a "Not Sure Yet"
custom-inquiry path) instead of separate pages per trade.

---

## What the estimator does

A 5-step flow on `estimators/estimate.html`:

1. **Your info** — uniform for every service: first name, last name, phone, email,
   street, city, state, ZIP. (Phone auto-formats; ZIP auto-detects state + pricing region.)
2. **Service** — pick one of seven options (see below).
3. **Details** — service-specific questions (size, type, scope, etc.).
4. **Estimate** — an all-in price range with an itemized breakdown. (For "Not Sure Yet"
   this becomes a "Personal review" summary instead of a price — see below.)
5. **Done** — confirmation + summary.

**Deep links:** the home page links to the estimator with a preselected service via
`?service=...`, e.g. `estimators/estimate.html?service=commercial`. Valid values:
`electrical`, `hvac`, `roofing`, `kitchen-bath`, `adu`, `commercial`, `not-sure`.

---

## Pricing logic (in `assets/estimator.js`)

All pricing lives in this one file. Models:

| Service        | Model                                                                 |
|----------------|-----------------------------------------------------------------------|
| Electrical     | Component line-items (low/high each), summed                          |
| HVAC & Energy  | Component line-items (low/high each), summed                          |
| Roofing        | Per-sq-ft by material × pitch × stories × layers × property × region |
| Kitchen & Bath | Scope tiers (minor / high-mid / full gut) × region                   |
| ADU            | Per-sq-ft by ADU type × site complexity × region (CA/NV/AZ rates)    |
| Commercial     | Per-sq-ft by project type × build complexity × region                |
| Not Sure Yet   | No price — collects a custom inquiry + photos/video for human review  |

**Recent pricing/scope changes (already applied in this build):**
- **Electrical:** "Rewire / Troubleshoot" removed. Panel upgrade is now split into
  **Main Panel Upgrade — Standard (100–225A)** and **Main Panel Upgrade — 400A Service**
  (higher cost, same location). Both assume the existing overhead/underground service
  feed is reused with no modifications. Edit `mpu_standard` / `mpu_400a` in the
  `ELECTRICAL` table to adjust.
- **HVAC (`hvac_new`, `hvac_replace`, `insulation`):** low end +35%, high end +25%
  (baked into the component tables, so it applies across all regions).
- **Energy-efficient windows (`windows`):** low end +45%, high end +15%.
- **Roofing (`ROOF_BASE`):** every type's lower-end per-sq-ft rate +35%, and the
  lowest-cost tier (asphalt) raised an additional +25% across its range.
- **Kitchen & Bath:** the "mid" tier was removed; the model now uses
  `minor` / `high-mid` / `major`, emphasizing the low and high-mid numbers.
- **Commercial:** new `COMM_RATE` per-sq-ft table (new build-out, renovation, tenant
  improvement, commercial electrical) × `COMM_CX` finish multiplier × region.

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

## SEO, Google Maps & AI search — what's done and what's left

**Built into the site (done):**
- Unique titles + meta descriptions, canonical tags, Open Graph + Twitter cards, one
  `<h1>` per page, descriptive alt text, theme color, geo meta.
- **Structured data (JSON-LD):** `GeneralContractor` / LocalBusiness (with services,
  service area, hours, payment, rating), `WebSite`, `FAQPage` (home), and
  `BreadcrumbList` + `Service` (estimator). This is the single biggest lever for Google
  rich results AND for AI engines (ChatGPT, Perplexity, Google AI Overviews) citing the
  business accurately.
- `sitemap.xml` (home, estimator, and all 5 service deep-links) + `robots.txt` that
  explicitly allows the major AI/search crawlers.

**DEV must finish before launch:**
- In the `GeneralContractor` schema (top of `index.html`), replace `ratingValue` and
  `reviewCount` with real values once reviews exist. **The business is service-area only
  (no public storefront)** — the schema is already set up correctly for this with a
  `serviceArea` GeoCircle (centered on Las Vegas, ~560km radius covering NV/CA/AZ) and
  `areaServed`. **Do NOT add a `streetAddress`/storefront** — listing a fake or empty
  address can get a Google Business Profile suppressed.
- Update every `https://www.oeservices.us/...` URL if the live domain differs (canonical,
  OG, sitemap, schema `@id`/`url`).
- Submit `sitemap.xml` in Google Search Console + Bing Webmaster Tools after launch.

**NOT something the website can do by itself — the owner must do this:**
- **Google Maps / the local "map pack" comes from a verified Google Business Profile**,
  not the website. At google.com/business, set it up as a **Service-Area Business (SAB)**:
  hide the address, define service areas (NV/CA/AZ cities/regions you cover), choose
  categories ("Electrician", "HVAC Contractor", "Roofing Contractor", "General
  Contractor"), add photos, and collect reviews. The site's `serviceArea` schema
  reinforces this but cannot replace it.
- Keep Name + Phone identical across the site, Google, Yelp, and directories. (For a SAB
  there's no public address to match — just keep name/phone consistent everywhere.)

---

## ⚠️ REPLACE BEFORE LAUNCH: proof & credibility content

The home page is now built as a **sales tool**, which means it leans on social proof.
To avoid shipping anything false, every unverified claim is a clearly-marked
`[REPLACE: ...]` placeholder with a dashed yellow outline on screen. **Search the
codebase for `[REPLACE` and `placeholder` and swap in real content before launch:**

- **Hero star line** (`index.html`): real average rating + review count.
- **Proof bar** (4 stats): projects completed, average rating, years in business.
  (States licensed = 3 is real and already filled in.)
- **Reviews section** (3 cards + verify link): real customer quotes, names, cities,
  and a link to your Google/Yelp profile so visitors can verify.
- **Financing** (home page strip + a nudge on the estimate screen): financing **is
  offered**, so the copy is written confidently. Edit the wording if your exact terms
  differ (e.g. a specific lender or APR), but no deletion is needed.

If you have nothing real for a given placeholder yet, **remove that block** rather than
inventing numbers — an honest site with fewer claims converts better than one that feels
fake. The dashed outlines and yellow `[REPLACE]` tags are styled only to be obvious during
editing; they should all be gone before go-live.

The estimate result screen (step 4 of the estimator) is the key conversion moment — it now
reframes the price as "all-in, no surprises," lists what's included, offers an optional
financing nudge, and ends with a strong "Lock my price — book my free visit" CTA. That is
intentional; keep that momentum if you restyle it.

---

## ⚖️ Legal disclaimer (preliminary-pricing language)

Because the estimator displays a price range (and pricing is intentionally biased toward
the high end), the site includes disclaimer language stating that estimates are
**preliminary, ballpark figures — not a quote, bid, or binding offer**, that final
pricing is set only in a **written, signed scope of work after an on-site assessment**,
that it can change with site conditions / permits / materials / scope, that **no price is
binding until a written agreement is signed by both parties**, and that estimates are
**valid for 30 days**.

It appears in four places:
- **Estimate result screen** (`#est-disclaimer`, under the price) — text is set in
  `assets/estimator-ui.js`; the priced flow and the "Not Sure Yet" flow use slightly
  different wording (the latter doesn't show a number).
- **Confirmation screen** (step 5) — fuller paragraph under the summary.
- **Footer of `estimators/estimate.html`** — persistent.
- **Footer of `index.html`** — persistent.

To edit the wording, search for `est-disclaimer` (HTML + JS) and the footer
`<span>` blocks. The "30 days" validity and the softened homepage hero line
("A realistic all-in range — not a teaser rate…") can be changed the same way.

> **Not legal advice.** This is conventional protective language, not attorney-drafted
> copy. OE is licensed in **NV, CA and AZ**, each of which has its own home-improvement /
> contractor contract requirements (e.g. CA CSLB rules on down payments and contract
> terms). Have an attorney or the relevant state board review this language — and any
> actual contract — before go-live.

---

## ⚠️ TO WIRE UP: lead submission

Right now the form **does not send leads anywhere** — step 5 just shows a confirmation
screen. There is a clearly-marked hook in `assets/estimator-ui.js` (search for
`submission hook`, inside `renderConfirm()`).

The `S` object contains: `first, last, phone, email, street, city, state, zip,
service, details{}, result{}` **and `media{ photos:[File], video:File }`** (the photos
and 25-second video collected in the "Not Sure Yet" flow).

For text-only leads you can post JSON. **But because of the photo/video uploads, use
`FormData` (multipart)** so the files come through — example is in the code comment:

```js
var fd = new FormData();
fd.append('lead', JSON.stringify({
  first:S.first, last:S.last, phone:S.phone, email:S.email,
  street:S.street, city:S.city, state:S.state, zip:S.zip,
  service:S.service, details:S.details, result:S.result
}));
S.media.photos.forEach(function (f, i) { fd.append('photo_' + i, f); });
if (S.media.video) fd.append('video', S.media.video);
fetch('/api/lead', { method:'POST', body: fd });
```

Connect it to email, a CRM, a spreadsheet, or a form service (Formspree, Basin, etc.) —
whatever the client uses. Note: form services that don't accept file uploads will need
the JSON-only variant plus a separate file host, or a backend endpoint that accepts
multipart.

**"Not Sure Yet" / custom inquiries:** this path intentionally does **not** show an
auto-generated price (it shows a "Personal review" summary). The owner has committed to
either sending a personal estimate or, **within 24 hours**, telling the customer it's
outside what OE services and referring them to the contractor network. Make sure these
leads are routed somewhere a human checks promptly.

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
