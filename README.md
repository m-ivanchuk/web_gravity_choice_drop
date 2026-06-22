# Choice Drop 🎈 (ﾉ◕ヮ◕)ﾉ*:・ﾟ✧

An incredibly cute, lightweight, and **100% offline-ready** decision randomizer built with HTML5 Canvas and Tailwind CSS. Input your options, press start, and watch custom candy-styled dots drop through a randomized plinko-like level to let gravity choose the winner!

---

## Features 🌟

- **Kawaii Pop-Candy Design**: Cozy light cream backgrounds, pastel gradients, bold outlines, and interactive 2D flat shadows (Neo-Brutalism style).
- **Gravity Physics Simulation**: A real-time canvas-based race. Dots slide, bounce off borders, collide with each other, and drop down through randomly generated holes across 35 platforms!
- **Interactive Sticker-like UI**: Rounded input cards and buttons that visually press down on hover or click.
- **Live Leaderboard Stats**: Toggleable overlay showing real-time drop progress for each option.
- **Purely Offline & Portable**: Compiled styles require zero internet connection. Run it on planes, subways, or anywhere offline. Perfectly scaled for mobile screens (e.g., iPhone) using local previewers like *Documents by Readdle*, *Koder*, *Textastic*, or *HTML Viewer Q*.

---

## Tech Stack 🛠️

- **Structure**: Semantic HTML5
- **Styling**: Tailwind CSS (compiled into a standalone, minified `styles.css` file)
- **Logic**: Vanilla ES6 JavaScript (Physics loops, 2D collisions, and Canvas rendering)
- **Typography**: Fredoka & Nunito (Google Fonts with clean Apple system fallbacks for true offline mode)

---

## Quick Start 🚀

Running the application locally is extremely simple:

1. Clone or download this repository.
2. Open **`index.html`** in any web browser.
3. *That's it!* No terminal commands, servers, or compilers required.

### 📱 Setting it up on iOS (iPhone/iPad):
1. Compress the project folder into a `.zip` archive.
2. Send it to your iPhone using **AirDrop** or **iCloud Files**.
3. Open a local file viewer (we recommend **Documents by Readdle** or **HTML Viewer Q**).
4. Extract the folder and tap **`index.html`** to play.

---

## File Structure 📁

```text
stitch_gravity_choice_drop/
├── index.html       # Setup views, race arena, and results dialog
├── app.js           # Physics engine, dot collisions, floor generator, and game loop
├── input.css        # Custom CSS rules, dot grids, and kawaii animations
├── styles.css       # Standalone, compiled Tailwind stylesheet
└── tailwind.config.js # Theme config for custom pastel colors, custom borders, and fonts
```

---

## Style System 🎨

- **Cream Canvas**: `#faf7f2`
- **Thick Outlines / Text**: `#2f2d29` (with a solid `2.5px` border width)
- **Pastel Colors**:
  - 🍬 Pink: `#ffdbe0` (accent & main buttons)
  - 🌿 Mint: `#cbeee4` (start buttons & finish zone)
  - 💧 Blue: `#cbe6f6` (stats buttons & back keys)
  - 🍌 Yellow: `#fef0be` (announcement blocks & floors)
- **Flat 2D Shadow Offset**: `4px 4px 0px #2f2d29`
