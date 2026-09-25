const fs = require('fs');
const path = require('path');

// Load bnlang.js in Node
const bnlangPath = path.resolve(__dirname, '../bnlang.js');
const code = fs.readFileSync(bnlangPath, 'utf8') + ';globalThis.createBNLang=createBNLang;';
eval(code);

async function run() {
    const mod = await createBNLang();
    const cInFn = mod.cwrap('bnlang_compile_with_input', 'number', ['string', 'string']);
    const cFn = mod.cwrap('bnlang_compile', 'number', ['string']);

    function compileAndRun(src, stdin = '') {
        const ptr = cInFn ? cInFn(src, stdin) : cFn(src);
        const resJson = mod.UTF8ToString(ptr);
        mod._bnlang_free(ptr);
        return JSON.parse(resJson);
    }

    console.log('=== Probe Results ===');

    // 1. doshomik printing & precision
    console.log('\n--- 1. doshomik printing ---');
    const p1a = compileAndRun(`
doshomik a = 7.5;
dekhao(a, "\\n");
`);
    console.log('7.5 default dekhao:', JSON.stringify(p1a.output), 'ok:', p1a.ok, 'errors:', p1a.errors);

    const p1b = compileAndRun(`
doshomik a = 7.5;
dekhao(a.ghor(2), "\\n");
`);
    console.log('7.5 with .ghor(2):', JSON.stringify(p1b.output), 'ok:', p1b.ok, 'errors:', p1b.errors);

    const p1c = compileAndRun(`
doshomik a = 7.0;
dekhao(a, "\\n");
dekhao(a.ghor(2), "\\n");
`);
    console.log('7.0 default & ghor(2):', JSON.stringify(p1c.output));

    const p1d = compileAndRun(`
doshomik a = 7.54321;
dekhao(a, "\\n");
dekhao(a.ghor(0), "\\n");
dekhao(a.ghor(1), "\\n");
dekhao(a.ghor(2), "\\n");
dekhao(a.ghor(4), "\\n");
`);
    console.log('7.54321 variations:', JSON.stringify(p1d.output));

    // 2. Integer division & modulo
    console.log('\n--- 2. Integer division & modulo ---');
    const p2 = compileAndRun(`
shongkha a = 7 / 2;
shongkha b = 10 % 3;
dekhao(a, "\\n", b, "\\n");
`);
    console.log('7 / 2 and 10 % 3:', JSON.stringify(p2.output), 'ok:', p2.ok, 'errors:', p2.errors);

    // 3. nao(x) where x is doshomik and input is integer like "5" or "5.5"
    console.log('\n--- 3. nao(x) for doshomik ---');
    const p3a = compileAndRun(`
doshomik x = 0.0;
nao(x);
dekhao(x, "\\n");
`, "5\n");
    console.log('nao(x) with input "5":', JSON.stringify(p3a.output), 'ok:', p3a.ok, 'errors:', p3a.errors);

    const p3b = compileAndRun(`
doshomik x = 0.0;
nao(x);
dekhao(x, "\\n");
`, "5.5\n");
    console.log('nao(x) with input "5.5":', JSON.stringify(p3b.output), 'ok:', p3b.ok, 'errors:', p3b.errors);

    // 3c. nao(x) when reading two doshomik or shongkha
    const p3c = compileAndRun(`
doshomik b = 0.0;
doshomik h = 0.0;
nao(b);
nao(h);
doshomik area = 0.5 * b * h;
dekhao(area, "\\n");
`, "5 3\n");
    console.log('nao(b), nao(h) with "5 3":', JSON.stringify(p3c.output), 'ok:', p3c.ok, 'errors:', p3c.errors);

    // 4. Web Worker compatibility check
    console.log('\n--- 4. Web Worker compatibility check ---');
    // Let's inspect what global variables bnlang.js uses:
    // It checks: globalThis.document?.currentScript?.src
    // ENVIRONMENT_IS_WEB = true; ENVIRONMENT_IS_WORKER = false;
    // Let's test what happens in an environment mimicking a Worker:
    // in Worker: self !== undefined, document === undefined, importScripts exists.
    const workerScope = {
        self: {},
        console: console,
        performance: globalThis.performance,
        // no document
    };
    try {
        const vm = require('vm');
        const script = new vm.Script(code);
        const context = vm.createContext(workerScope);
        script.runInContext(context);
        const workerMod = await workerScope.createBNLang();
        const testPtr = workerMod.cwrap('bnlang_compile', 'number', ['string'])('dekhao("Worker OK\\n");');
        const res = JSON.parse(workerMod.UTF8ToString(testPtr));
        console.log('Worker simulation result:', res.output.trim());
    } catch (e) {
        console.error('Worker simulation failed:', e);
    }
}

run().catch(console.error);
