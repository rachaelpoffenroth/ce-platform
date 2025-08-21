# CE Platform — Slides + Player

This commit adds:
- `/slides` — instructor slide generator with theme & layout switcher (Noir Gold, Constellations, Biz Clean).
- `/player.html` + `/assets/aic_certificate_template.pdf` — static demo player with seat-time, quiz, and certificate.
- `content/courses/EC-AB-001/` — course source (Markdown + quiz).
- GitHub Action `.github/workflows/build-slides.yml` — generates `exports/EC-AB-001-slides.pdf` automatically (artifact).

## Local usage
- Open `slides/index.html` → pick theme/layout → Ctrl/Cmd+P to export.
- Open `player.html` → run the seat-time + quiz flow and test certificate.

## CI (GitHub Actions)
- On every push to `slides/**` or the course markdown, the action renders a PDF via Playwright and uploads it as a build artifact.
