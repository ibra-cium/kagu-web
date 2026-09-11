# Kagu Web — Modern Bangalish (BNLang v2) Web IDE & C Transpiler

[![Version](https://img.shields.io/badge/BNLang-v2.1-f5b731.svg)](https://github.com/ibra-cium/kagu-web)
[![Deployment](https://img.shields.io/badge/Live%20App-kagu--web--one.vercel.app-1b8b54.svg)](https://kagu-web-one.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-72c6f2.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20WebAssembly-9bdd74.svg)](https://kagu-web-one.vercel.app/)

**Kagu Web** is an advanced, high-performance in-browser IDE, C transpiler, and tree-walking interpreter for **BNLang (Bangalish programming language)**. Designed for modern developers, language enthusiasts, and students, Kagu provides instant, client-side compilation, AST evaluation, and real-time C code inspection with zero backend dependencies.

---

## 🌐 Live Deployments
- **Production Web App**: [https://kagu-web-one.vercel.app/](https://kagu-web-one.vercel.app/)
- **GitHub Pages Mirror**: [https://ibra-cium.github.io/kagu-web/](https://ibra-cium.github.io/kagu-web/)

---

## ⚡ Key Capabilities

- **Zero-Backend Client-Side Execution**: Runs pure JavaScript and WebAssembly builds compiled via Emscripten. All parsing, evaluation, and execution take place locally in the browser with 100% privacy and zero server latency.
- **Real-Time C Transpiler**: Transpiles Bangalish AST directly into clean, optimized ANSI C code on the fly.
- **Interactive Stdin Console**: Native emulation of terminal input streams (`nao()`) with live pauses and prompt resumption.
- **Developer-Grade Editor**: Intelligent syntax highlighting, auto-completion for BNLang keywords, bracket matching, line numbering, symbol helper toolbar, and word wrap.
- **Dual Responsive Layout**: Desktop side-by-side split panels with custom drag dividers and mobile-optimized segmented tabs.
- **Dhaka Cityscape Ambience**: Signature cultural visual motif featuring Louis Kahn's Parliament, Shahid Minar, and animated Dhaka Metro Rail (MRT Line 6).

---

## 📖 BNLang v2 Language Grammar & Syntax

BNLang brings native Bengali phonetics (Bangalish) into a rigorous, C-family strongly-typed syntax:

### 1. Types & Data Structures
| BNLang Keyword | Equivalent C Type | Description |
|---|---|---|
| `shongkha` | `int` | Integer numbers (`shongkha x = 10;`) |
| `doshomik` | `float` | Floating-point decimals (`doshomik pi = 3.14159;`) |
| `lekha` | `char[100]` | String literals (`lekha name = "Dhaka";`) |
| `okkhor` | `char` | Single characters (`okkhor c = 'A';`) |
| `sorbochho(N)` | `[N]` | Fixed-size arrays (`shongkha arr sorbochho(5);`) |
| `pointer` | `*` | Pointer type declaration (`shongkha pointer p;`) |
| `faka` | `NULL` | Null pointer constant |

### 2. Operators & Pointer Mechanics
- **Address-of**: `x.erthikana()` (equivalent to `&x`)
- **Dereference**: `p.erman()` (equivalent to `*p`)
- **Logical Words**: `ebong` (`&&`), `tasara` (`||`), `ulto` (`!`)
- **Compound Assignment**: `+=`, `-=`, `*=`, `/=`, `%=`, `++`, `--`

### 3. Control Flow & Functions
```c
// Conditionals
jodi (boyos >= 18 ebong citizen == 1) {
    dekhao("Eligible to vote\n");
} nahole {
    dekhao("Not eligible\n");
}

// Loops
chalao (shongkha i = 0; i < 5; i++) {
    dekhao("Count: ", i, "\n");
}

jotokkhon (x < 10) {
    x++;
}

// Functions
kaj shongkha jog(shongkha a, shongkha b) {
    ferot a + b;
}
```

---

## 🛠️ Architecture

```
kagu-web/
├── index.html        # Modern IDE interface, SEO metadata, JSON-LD Schema.org
├── style.css         # Rickshaw Dhaka Night theme, layout, responsive breakpoints
├── bnlang.js         # Core Emscripten / WebAssembly BNLang compiler & runtime
├── js/
│   └── highlight.js  # Lexical analyzer & syntax highlighter
├── assets/           # Logos, Dhaka SVG artwork, favicons, OG preview cards
├── examples/         # Canonical BNLang v2 sample programs
├── robots.txt        # Search crawler directives
├── sitemap.xml       # Search engine indexing sitemap
└── manifest.json     # PWA / Web application manifest
```

---

## 💻 Local Development

Run locally using any static file server (no build step or backend required):

```bash
# Using Python
python -m http.server 8000

# Using Node / npx
npx serve .
```

Open `http://localhost:8000` in your web browser.

---

## 📄 Author & License

Maintained by [Ibrahim (ibra-cium)](https://github.com/ibra-cium). Distributed under the MIT License.
