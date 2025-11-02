# Ezzah Enterprises

Small static site scaffold for Ezzah Enterprises — supplier of receipt rolls (thermal, bond and custom sizes).

Files in this repo (added/updated):

- `index.html` — site with hero, product showcase, order form and contact form.
- `styles.css` — responsive styling.
- `script.js` — client-side validation and submit-to-Formspree logic.

# Ezzah Enterprises — Static site

This repository contains a small, responsive static site for Ezzah Enterprises (supplier of thermal receipt rolls). It includes a product showcase, an order form and a contact form. Both forms are wired to use Formsubmit (https://formsubmit.co).

Files
- `index.html` — landing page and forms
- `styles.css` — site styling and animations
- `script.js` — client-side validation, modal + confetti UX, and form submission logic

Preview locally:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Replace the `action` attributes on the forms in `index.html` with your Formsubmit address (for example `https://formsubmit.co/you@domain.com`) if needed.


Notes
