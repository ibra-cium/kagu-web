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
├── problems.html     # Problem list: ID, Bangla title, level, solved status
├── problem.html      # Problem statement & online judge editor interface
├── style.css         # Rickshaw Dhaka Night theme, layout, responsive breakpoints
├── bnlang.js         # Core Emscripten / WebAssembly BNLang compiler & runtime
├── js/
│   ├── highlight.js  # Lexical analyzer & syntax highlighter
│   ├── types.js      # Type definitions and helper functions
│   ├── judge.js      # Test runner, comparator (exact/float), verdict resolution
│   └── judge-worker.js # Web Worker executing code with isolated timeouts
├── problems/         # Problem definitions (JSON) & index.json
├── solutions/        # Reference solutions (*.bnl) for all problems
├── tools/
│   ├── probe.js      # Engine probe verifying data types, precision, and worker runtime
│   └── validate.js   # Automated test suite validating all problems and verdicts
├── assets/           # Logos, Dhaka SVG artwork, favicons, OG preview cards
├── examples/         # Canonical BNLang v2 sample programs
├── robots.txt        # Search crawler directives
├── sitemap.xml       # Search engine indexing sitemap
└── manifest.json     # PWA / Web application manifest
```

---

## 🏆 Problems / Online Judge

Kagu Web includes a fully static, client-side online judge inspired by platforms like beecrowd and Codeforces.

### Key Features
- **Zero Backend Required**: Runs tests inside a sandboxed Web Worker (`js/judge-worker.js`).
- **Standard Verdicts**:
  - `Accepted (AC)`: Output passes exact or floating-point comparison.
  - `Wrong Answer (WA)`: Output does not match expected output.
  - `Presentation Error (PE)`: Output matches expected only when all whitespace is removed.
  - `Time Limit Exceeded (TLE)`: Worker execution exceeds `timeLimitMs` or triggers interpreter loop limit (1,000,000 iterations).
  - `Compilation Error (CE)`: Syntax, lexical, or semantic compile-time errors.
  - `Runtime Error (RE)`: Unhandled runtime errors (e.g., unexpected EOF on input).
- **Protected Hidden Tests**: Only sample tests show side-by-side I/O on failure; hidden tests remain confidential.
- **Progress Tracking**: Solved status (`kagu.judge.solved`) and code autosave (`kagu.judge.code.<id>`) persist in browser `localStorage`.

### How to Add a New Problem
1. **Choose an ID** (e.g. `1006`).
2. **Create `problems/1006.json`**:
   ```json
   {
     "id": 1006,
     "title": "প্রবলেমের শিরোনাম",
     "level": "Beginner",
     "statement": "সমস্যার বিস্তারিত বিবরণ...",
     "inputSpec": "ইনপুট বিবরণ...",
     "outputSpec": "আউটপুট বিবরণ...",
     "note": "ঐচ্ছিক নোট...",
     "samples": [
       { "in": "10 20\n", "out": "30\n" }
     ],
     "tests": [
       { "in": "0 0\n", "out": "0\n" },
       { "in": "100 500\n", "out": "600\n" }
     ],
     "checker": "exact",
     "timeLimitMs": 2000
   }
   ```
   *For float checkers, use `"checker": "float"` and set `"floatTolerance": 0.01`.*
3. **Add entry to `problems/index.json`**:
   ```json
   { "id": 1006, "title": "প্রবলেমের শিরোনাম", "level": "Beginner" }
   ```
4. **Create reference solution `solutions/1006.bnl`**:
   ```bnl
   shongkha a = 0;
   shongkha b = 0;
   nao(a);
   nao(b);
   dekhao(a + b, "\n");
   ```
5. **Run test validation**:
   ```bash
   node tools/validate.js
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

