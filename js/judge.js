/**
 * Kagu Web Judge Engine
 * Provides test execution, output comparison (exact & float), and verdict resolution.
 */

function normalizeLines(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n+$/, '');
}

function stripAllWhitespace(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/\s+/g, '');
}

function compareExact(actual, expected) {
    const actNorm = normalizeLines(actual);
    const expNorm = normalizeLines(expected);

    if (actNorm === expNorm) {
        return { pass: true, verdict: 'Accepted' };
    }

    if (stripAllWhitespace(actual) === stripAllWhitespace(expected)) {
        return { pass: false, verdict: 'Presentation Error' };
    }

    return { pass: false, verdict: 'Wrong Answer' };
}

function compareFloat(actual, expected, tolerance = 0.01) {
    const actTokens = (actual || '').trim().split(/\s+/).filter(t => t.length > 0);
    const expTokens = (expected || '').trim().split(/\s+/).filter(t => t.length > 0);

    if (actTokens.length !== expTokens.length) {
        return { pass: false, verdict: 'Wrong Answer' };
    }

    for (let i = 0; i < actTokens.length; i++) {
        const a = actTokens[i];
        const b = expTokens[i];

        const aNum = Number(a);
        const bNum = Number(b);
        const aIsNum = !isNaN(aNum) && a.trim() !== '';
        const bIsNum = !isNaN(bNum) && b.trim() !== '';

        if (aIsNum && bIsNum) {
            if (Math.abs(parseFloat(a) - parseFloat(b)) > tolerance) {
                return { pass: false, verdict: 'Wrong Answer' };
            }
        } else {
            if (a !== b) {
                return { pass: false, verdict: 'Wrong Answer' };
            }
        }
    }

    return { pass: true, verdict: 'Accepted' };
}

function evaluateResult(res, expectedOutput, checker = 'exact', floatTolerance = 0.01) {
    // 1. Check for compiler or runtime errors
    if (!res.ok && res.errors && res.errors.length > 0) {
        // Non-runtime error -> Compilation Error
        const nonRuntime = res.errors.find(e => e.kind !== 'runtime');
        if (nonRuntime) {
            return {
                pass: false,
                verdict: 'Compilation Error',
                error: nonRuntime,
                message: `Line ${nonRuntime.line || 1}: ${nonRuntime.message || 'Compilation error'}`
            };
        }

        // Runtime error -> check if loop limit exceeded
        const runtime = res.errors.find(e => e.kind === 'runtime') || res.errors[0];
        const msg = runtime.message || '';
        if (msg.includes('loop 1,000,000 barer beshi ghureche') || msg.includes('barer beshi ghureche')) {
            return {
                pass: false,
                verdict: 'Time Limit Exceeded',
                error: runtime,
                message: runtime.message
            };
        }

        return {
            pass: false,
            verdict: 'Runtime Error',
            error: runtime,
            message: runtime.message
        };
    }

    // 2. Output comparison
    const actualOutput = res.output || '';
    if (checker === 'float') {
        const comp = compareFloat(actualOutput, expectedOutput, floatTolerance);
        return {
            pass: comp.pass,
            verdict: comp.verdict,
            actual: actualOutput,
            expected: expectedOutput
        };
    } else {
        const comp = compareExact(actualOutput, expectedOutput);
        return {
            pass: comp.pass,
            verdict: comp.verdict,
            actual: actualOutput,
            expected: expectedOutput
        };
    }
}

class JudgeClient {
    constructor(workerPath = 'js/judge-worker.js') {
        this.workerPath = workerPath;
        this.worker = null;
        this.msgCounter = 0;
    }

    getWorker() {
        if (!this.worker) {
            this.worker = new Worker(this.workerPath);
        }
        return this.worker;
    }

    resetWorker() {
        if (this.worker) {
            try { this.worker.terminate(); } catch (e) {}
            this.worker = null;
        }
    }

    executeSingle(code, stdin, timeLimitMs = 2000) {
        return new Promise((resolve) => {
            const worker = this.getWorker();
            const id = ++this.msgCounter;
            let finished = false;

            const timer = setTimeout(() => {
                if (finished) return;
                finished = true;
                this.resetWorker();
                resolve({
                    timedOut: true,
                    duration: timeLimitMs,
                    verdict: 'Time Limit Exceeded',
                    error: { message: `Time limit of ${timeLimitMs}ms exceeded` }
                });
            }, timeLimitMs);

            const handleMsg = (e) => {
                if (e.data && e.data.id === id) {
                    if (finished) return;
                    finished = true;
                    clearTimeout(timer);
                    worker.removeEventListener('message', handleMsg);
                    worker.removeEventListener('error', handleErr);
                    resolve({
                        timedOut: false,
                        duration: e.data.duration || 1,
                        ok: e.data.ok,
                        result: e.data.result,
                        error: e.data.error
                    });
                }
            };

            const handleErr = (err) => {
                if (finished) return;
                finished = true;
                clearTimeout(timer);
                worker.removeEventListener('message', handleMsg);
                worker.removeEventListener('error', handleErr);
                this.resetWorker();
                resolve({
                    timedOut: false,
                    duration: 0,
                    ok: false,
                    error: err.message || 'Worker execution error'
                });
            };

            worker.addEventListener('message', handleMsg);
            worker.addEventListener('error', handleErr);

            worker.postMessage({ id, code, stdin });
        });
    }

    async runJudge(problem, code, options = {}) {
        const { isSampleOnly = false, onProgress = null } = options;
        const sampleList = (problem.samples || []).map((s, idx) => ({
            ...s,
            isSample: true,
            sampleNum: idx + 1,
            testNum: idx + 1
        }));

        let testsToRun = [];
        if (isSampleOnly) {
            testsToRun = sampleList;
        } else {
            const hiddenList = (problem.tests || []).map((t, idx) => ({
                ...t,
                isSample: false,
                testNum: sampleList.length + idx + 1
            }));
            testsToRun = [...sampleList, ...hiddenList];
        }

        const results = [];
        let finalVerdict = 'Accepted';
        let totalDuration = 0;

        for (let i = 0; i < testsToRun.length; i++) {
            const test = testsToRun[i];
            const execRes = await this.executeSingle(code, test.in || '', problem.timeLimitMs || 2000);
            totalDuration += execRes.duration || 0;

            let evalRes;
            if (execRes.timedOut) {
                evalRes = {
                    pass: false,
                    verdict: 'Time Limit Exceeded',
                    duration: execRes.duration,
                    message: `Time limit exceeded (${problem.timeLimitMs || 2000}ms)`
                };
            } else if (!execRes.ok) {
                evalRes = {
                    pass: false,
                    verdict: 'Runtime Error',
                    duration: execRes.duration,
                    message: execRes.error || 'Execution error'
                };
            } else {
                evalRes = evaluateResult(
                    execRes.result,
                    test.out || '',
                    problem.checker || 'exact',
                    problem.floatTolerance || 0.01
                );
                evalRes.duration = execRes.duration;
            }

            const testResult = {
                testNum: test.testNum,
                isSample: test.isSample,
                sampleNum: test.sampleNum,
                pass: evalRes.pass,
                verdict: evalRes.verdict,
                duration: evalRes.duration,
                message: evalRes.message,
                input: test.isSample ? test.in : undefined,
                expected: test.isSample ? test.out : undefined,
                actual: test.isSample ? (evalRes.actual || (execRes.result ? execRes.result.output : '')) : undefined,
                error: evalRes.error
            };

            results.push(testResult);
            if (onProgress) onProgress(testResult, i, testsToRun.length);

            // Stop at first failing test
            if (!evalRes.pass) {
                finalVerdict = evalRes.verdict;
                break;
            }
        }

        return {
            verdict: finalVerdict,
            results,
            totalDuration,
            totalTests: testsToRun.length,
            passedTests: results.filter(r => r.pass).length
        };
    }
}

// Support both Node.js (for tools/validate.js) and Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        normalizeLines,
        stripAllWhitespace,
        compareExact,
        compareFloat,
        evaluateResult,
        JudgeClient
    };
} else if (typeof window !== 'undefined') {
    window.JudgeClient = JudgeClient;
    window.normalizeLines = normalizeLines;
    window.stripAllWhitespace = stripAllWhitespace;
    window.compareExact = compareExact;
    window.compareFloat = compareFloat;
    window.evaluateResult = evaluateResult;
}
