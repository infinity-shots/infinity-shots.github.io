# Infinity Shots

**Chunk-wise Learning for Infinite Multi-Shot Audio-Video Generation**

A static research project website with 27 complete video examples across 14 scene categories. The page opens with four capability chapters: long-form storytelling, characters across shots, shot-level direction, and audio-visual generation. Nine representative films include timestamped prompt cues that open the viewer at the selected shot. The 14-genre explorer and full collection follow. The default collection contains 21 selected films.

- `index.html` / `cinematic.html`: dark page (default).
- `hy.html`: alternate light page.
- `capabilities.js` / `capabilities.css`: capability chapters and timestamped examples.
- `data.js`: scene metadata and bilingual prompts.
- `assets/`: videos and posters.

The modern TV drama category features **An identity revealed**; the historical martial arts drama category features **Swords and lightning**. These examples sit within the scene explorer and collection. The video viewer supports synchronized prompts and chunk navigation where recorded chunk boundaries are available. A continuous seek slider supports mouse, touch and keyboard. Range-capable hosts stream directly; other hosts load the selected video into a temporary Blob for reliable seeking. No build or dependency installation is required.

## Local preview

Run `python3 -m http.server 8000` in this directory, then open `http://localhost:8000/`.

## GitHub Pages

The included workflow deploys this static directory on pushes to `main`. Select **GitHub Actions** as the Pages source in repository settings. All asset references are relative, so both an account site and a project site are supported.
