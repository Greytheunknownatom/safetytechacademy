# SafetyTech Academy — static site

Plain HTML/CSS/JS, no build step. Pages: index, about, solutions, resources, contact (+ privacy, 404).

## Deploy
- **Netlify (recommended):** drag the folder onto app.netlify.com/drop. The forms use Netlify Forms (`data-netlify`) and are detected automatically; submissions appear under Site → Forms.
- Any static host works, but forms need a backend there. In `assets/config.js` set `formMode: 'demo'` to simulate success without sending anything.

## Before going live
- Replace bracketed placeholders: company number, registered office, [Your Name], [City, UK], LinkedIn URL.
- Replace the draft text in `privacy.html`.
- Decide on the hidden stats row on the home page (remove `hidden` in index.html once the figures are confirmed).
- Wire checklist delivery (Netlify form -> email automation) and add the real PDF.

## Images
Swap imagery by replacing files in `assets/img/` (same names) — see `assets/img/README.md` for sizes. `assets/pattern.jpg` and `assets/stripe.png` are built from the design frame.
