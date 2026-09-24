# Roots — A Drug-Free Society Awareness Site

A single-metaphor ("Roots") awareness site for teens, young adults, and parents. Pure HTML/CSS/vanilla JS — no build step, no frameworks, no external JS libraries.

## Files

```
index.html      Markup for all 9 sections
styles.css      All styling (CSS variables, no preprocessor)
script.js       All interactivity (vanilla JS, no dependencies)
assets/         (reserved — all art is inline SVG, so currently empty)
```

## Run locally

No build step needed. Either:

- Open `index.html` directly in a browser, or
- From this folder, run a tiny local server (recommended, since some browsers restrict `file://`):
  ```
  python3 -m http.server 8080
  ```
  then visit `http://localhost:8080`.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `roots-site`).
2. Push these files to the repo root (or to a `/docs` folder — see step 4):
   ```
   git init
   git add .
   git commit -m "Roots: drug-free society awareness site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/roots-site.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**. Pick branch `main` and folder `/ (root)` (or `/docs` if you used that instead).
5. Save. GitHub will publish at:
   ```
   https://<your-username>.github.io/roots-site/
   ```
   (First deploy can take 1–2 minutes.)

## Design notes

- **Metaphor:** Roots — the idea that a life is something you grow, and every choice is a nutrient or a drain. It threads through the hero, the "Why People Start" flip cards, the pledge ("plant my pledge"), and the footer copy.
- **Palette:** terracotta `#C86A4A`, sage `#7A9B76`, cream `#F5EFE6`, charcoal `#2B2B28`, marigold `#E8A33D` — warm and organic, deliberately avoiding blue/violet gradients.
- **Type:** Fraunces (serif, display/headings) + Inter (sans, body/UI), loaded from Google Fonts.
- **Illustrations:** all inline, hand-built SVG (blobs, icons, seed/root marks) — no stock photography.
- **Accessibility:** semantic landmarks, skip link, visible focus rings, `aria-live` pledge counter, tablist/tabpanel pattern for Find Help and the carousel, a real focus trap in the modal, and full `prefers-reduced-motion` support (disables blob animation, flip transitions, reveal-on-scroll, and counter animation).
- **Performance:** everything is one small HTML/CSS/JS bundle with inline SVG art (no image requests), so it loads fast even on constrained connections. Fonts are the only external request.

## Content sources (Stats section)

- National Institute on Drug Abuse, *Principles of Adolescent Substance Use Disorder Treatment* (2014)
- SAMHSA, *Recovery and Recovery Support* (2023)
- CDC Youth Risk Behavior Survey (2023 summary)
- SAMHSA National Helpline (1-800-662-4357)

These are cited inline in the UI (hover/tap each stat card) and should be reviewed/updated with current figures before a production launch.

## Disclaimer

This site is educational and does not provide medical advice. It links out to SAMHSA's national helpline and treatment locator for real, professional help. In an emergency, always direct people to call 911 (or their local emergency number).
