// Web Worker for executing BNLang submissions in an isolated thread
importScripts('../bnlang.js');

let modPromise = null;
let cInFn = null;
let cFn = null;
let mod = null;

function getModule() {
    if (!modPromise) {
        modPromise = createBNLang().then(m => {
            mod = m;
            try {
                cInFn = mod.cwrap('bnlang_compile_with_input', 'number', ['string', 'string']);
            } catch (e) {}
            cFn = mod.cwrap('bnlang_compile', 'number', ['string']);
            return mod;
        });
    }
    return modPromise;
}

// Eagerly initialize compiler engine
getModule().catch(err => {
    console.error('Worker failed to initialize BNLang engine:', err);
});

self.onmessage = async (e) => {
    const { id, code, stdin } = e.data;
    try {
        const m = await getModule();
        const start = performance.now();
        const ptr = cInFn ? cInFn(code, stdin !== undefined ? stdin : '') : cFn(code);
        const duration = Math.max(1, Math.round(performance.now() - start));
        const resJson = m.UTF8ToString(ptr);
        m._bnlang_free(ptr);
        const res = JSON.parse(resJson);
        self.postMessage({ id, ok: true, result: res, duration });
    } catch (err) {
        self.postMessage({ id, ok: false, error: err.message, duration: 0 });
    }
};
