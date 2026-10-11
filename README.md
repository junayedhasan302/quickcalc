# ⚡ QuickCalc

**QuickCalc** is a lightweight Chrome extension that brings everyday calculations, unit conversions, physics references, and quick search into one convenient popup.

## ✨ Features

- 🧮 **Calculator** — Perform calculations with arithmetic operators, powers, square roots, and mathematical constants.
- 🔄 **Unit Converter** — Convert length, mass, volume, temperature, time, speed, area, and energy.
- 🧪 **Physics & Math References** — Quickly access useful scientific constants and mathematical formulas.
- 🔎 **Universal Search** — Search built-in references or evaluate mathematical expressions.
- 📋 **One-Tap Copy** — Copy reference values and formulas directly to the clipboard.
- 🌗 **Dark & Light Themes** — Switch between themes with your preference saved locally.
- ⚡ **Offline Support** — Use built-in references, conversions, and calculations without an external API.

## 🛠️ Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Math.js
- Chrome Extension Manifest V3

## 📂 Project Structure

```text
quickcalc/
├── public/
│   └── manifest.json
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Google Chrome

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/quickcalc.git
cd quickcalc
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

The production build will be generated in the `dist/` directory.

## 🧩 Install as a Chrome Extension

1. Run `npm run build`.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project's `dist/` folder.
6. Pin QuickCalc to the Chrome toolbar for convenient access.

## 📋 Usage

- Open the extension from the Chrome toolbar.
- Use the Calculator tab for everyday calculations.
- Select a category in Convert to change measurement units.
- Open Physics to browse constants and formulas.
- Use Search to find references or calculate expressions.
- Click a reference card to copy its associated value or formula.

## 🔐 Privacy

QuickCalc is designed to work locally using built-in references and calculations. It does not require an external API for its core features.

The extension stores the selected theme in local storage. Review the implementation and manifest permissions before publishing to confirm the final privacy disclosures.

## 🗺️ Roadmap

- [ ] Improve calculator keyboard support
- [ ] Add more scientific functions
- [ ] Expand unit conversion categories
- [ ] Improve reference search
- [ ] Publish on the Chrome Web Store

## 🤝 Contributing

Suggestions, bug reports, and contributions are welcome. Feel free to open an issue or submit a pull request.

## 📄 License

A license has not been selected yet. Add a `LICENSE` file before distributing the project under an open-source license.

---

**QuickCalc — Fast, simple, useful.**
