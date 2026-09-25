const fs = require('fs');
const path = require('path');
const { evaluateResult } = require('../js/judge.js');

// Load BNLang in Node
const bnlangPath = path.resolve(__dirname, '../bnlang.js');
const code = fs.readFileSync(bnlangPath, 'utf8') + ';globalThis.createBNLang=createBNLang;';
eval(code);

async function main() {
    console.log('=== Kagu Online Judge Validator ===\n');

    const mod = await createBNLang();
    const cInFn = mod.cwrap('bnlang_compile_with_input', 'number', ['string', 'string']);
    const cFn = mod.cwrap('bnlang_compile', 'number', ['string']);

    function compileAndRun(src, stdin = '') {
        const start = performance.now();
        const ptr = cInFn ? cInFn(src, stdin) : cFn(src);
        const duration = Math.max(1, Math.round(performance.now() - start));
        const resJson = mod.UTF8ToString(ptr);
        mod._bnlang_free(ptr);
        return { res: JSON.parse(resJson), duration };
    }

    let allPassed = true;

    // 1. Validate all reference solutions against samples + hidden tests
    const problemsIndex = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../problems/index.json'), 'utf8'));

    for (const probInfo of problemsIndex) {
        const pId = probInfo.id;
        const probPath = path.resolve(__dirname, `../problems/${pId}.json`);
        const solPath = path.resolve(__dirname, `../solutions/${pId}.bnl`);

        if (!fs.existsSync(probPath) || !fs.existsSync(solPath)) {
            console.error(`❌ Missing problem or solution file for ID ${pId}`);
            allPassed = false;
            continue;
        }

        const problem = JSON.parse(fs.readFileSync(probPath, 'utf8'));
        const solCode = fs.readFileSync(solPath, 'utf8');

        const allTests = [
            ...(problem.samples || []).map((s, idx) => ({ ...s, name: `Sample ${idx + 1}` })),
            ...(problem.tests || []).map((t, idx) => ({ ...t, name: `Hidden Test ${idx + 1}` }))
        ];

        console.log(`Checking Problem ${problem.id} — "${problem.title}" (${allTests.length} tests)...`);
        let probOk = true;

        for (const test of allTests) {
            const { res, duration } = compileAndRun(solCode, test.in || '');
            const evalRes = evaluateResult(
                res,
                test.out || '',
                problem.checker || 'exact',
                problem.floatTolerance || 0.01
            );

            if (!evalRes.pass || evalRes.verdict !== 'Accepted') {
                console.error(`  ❌ [${test.name}] FAILED: Verdict=${evalRes.verdict}`);
                console.error(`     Input:    ${JSON.stringify(test.in)}`);
                console.error(`     Expected: ${JSON.stringify(test.out)}`);
                console.error(`     Actual:   ${JSON.stringify(res.output || '')}`);
                if (res.errors && res.errors.length) {
                    console.error(`     Errors:   ${JSON.stringify(res.errors)}`);
                }
                probOk = false;
                allPassed = false;
                break;
            }
        }

        if (probOk) {
            console.log(`  ✓ Problem ${problem.id}: All ${allTests.length} tests Accepted!`);
        }
    }

    // 2. Validate Edge Cases and Verdicts
    console.log('\n--- Checking Edge & Negative Test Verdicts ---');

    // Negative 1: 1001 printing "hello world" -> Wrong Answer
    {
        const badCode = 'dekhao("hello world\\n");';
        const { res } = compileAndRun(badCode, '');
        const evalRes = evaluateResult(res, "Hello World\n", 'exact');
        if (evalRes.verdict === 'Wrong Answer') {
            console.log('  ✓ 1001 "hello world" -> Wrong Answer (Expected)');
        } else {
            console.error(`  ❌ Expected Wrong Answer, got ${evalRes.verdict}`);
            allPassed = false;
        }
    }

    // Negative 2: 1001 printing "Hello  World" (two spaces) -> Presentation Error
    {
        const peCode = 'dekhao("Hello  World\\n");';
        const { res } = compileAndRun(peCode, '');
        const evalRes = evaluateResult(res, "Hello World\n", 'exact');
        if (evalRes.verdict === 'Presentation Error') {
            console.log('  ✓ 1001 "Hello  World" (two spaces) -> Presentation Error (Expected)');
        } else {
            console.error(`  ❌ Expected Presentation Error, got ${evalRes.verdict}`);
            allPassed = false;
        }
    }

    // Negative 3: 1003 using only shongkha -> Wrong Answer
    {
        const intCode = `
shongkha b = 0;
shongkha h = 0;
nao(b);
nao(h);
shongkha area = b * h / 2;
dekhao(area, "\\n");
`;
        const { res } = compileAndRun(intCode, '5 3\n');
        const evalRes = evaluateResult(res, "7.50\n", 'float', 0.01);
        if (evalRes.verdict === 'Wrong Answer') {
            console.log('  ✓ 1003 with shongkha (5*3/2 = 7 vs 7.50) -> Wrong Answer (Expected)');
        } else {
            console.error(`  ❌ Expected Wrong Answer, got ${evalRes.verdict}`);
            allPassed = false;
        }
    }

    // Negative 4: Infinite loop -> Time Limit Exceeded
    {
        const infCode = `
shongkha x = 1;
jotokkhon (x > 0) {
    x = x + 1;
}
`;
        const { res } = compileAndRun(infCode, '');
        const evalRes = evaluateResult(res, "any\n", 'exact');
        if (evalRes.verdict === 'Time Limit Exceeded') {
            console.log('  ✓ Infinite jotokkhon loop -> Time Limit Exceeded (Expected)');
        } else {
            console.error(`  ❌ Expected Time Limit Exceeded, got ${evalRes.verdict}: ${JSON.stringify(res.errors)}`);
            allPassed = false;
        }
    }

    // Negative 5: Syntax error -> Compilation Error
    {
        const syntaxErrCode = 'shongkha x = ;';
        const { res } = compileAndRun(syntaxErrCode, '');
        const evalRes = evaluateResult(res, "any\n", 'exact');
        if (evalRes.verdict === 'Compilation Error') {
            console.log(`  ✓ Syntax error -> Compilation Error (Expected: "${evalRes.message}")`);
        } else {
            console.error(`  ❌ Expected Compilation Error, got ${evalRes.verdict}`);
            allPassed = false;
        }
    }

    console.log('\n=======================================');
    if (allPassed) {
        console.log('🎉 ALL VALIDATION CHECKS PASSED SUCCESSFULLY!');
        process.exit(0);
    } else {
        console.error('❌ VALIDATION FAILED!');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error in validation:', err);
    process.exit(1);
});
