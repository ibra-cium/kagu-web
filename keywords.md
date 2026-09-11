# BNLang Keywords (v2.1)

This file is the single source of truth for the lexer's keyword table. `compiler/src/keywords.c` must match it exactly, and `tests/unit/test_keywords.c` checks every row.

`keywords.c` holds **two** tables and every new keyword goes in both:

- `ALIASES[]` — one row per accepted spelling, searched by `keyword_lookup`.
- `CANONICAL[]` — one row per keyword with its C output, used by `keyword_suggest` and `keyword_to_c`.

Adding a word to `ALIASES[]` only is the usual mistake: the keyword works, but it never appears as a spelling suggestion and `keyword_to_c` returns an empty string for it.

## Keywords

| BNLang | Accepted aliases | C output | Token type | Since |
|---|---|---|---|---|
| `shongkha` | songkha, sonkha | `int` | T_TYPE_INT | v1 |
| `doshomik` | doshmik | `float` | T_TYPE_FLOAT | v1 |
| `lekha` | lekha | `char[100]` | T_TYPE_STR | v1 |
| `dekhao` | dekhaw, dekhao | `printf` | T_PRINT | v1 |
| `nao` | nao, neo | `scanf` | T_INPUT | v1 |
| `jodi` | zodi, jodi | `if` | T_IF | v1 |
| `nahole` | nahle, na hole | `else` | T_ELSE | v1 |
| `jotokkhon` | jotokhon | `while` | T_WHILE | v1 |
| `chalao` | chalaw | `for` | T_FOR | v1 |
| `kaj` | kaj | *(function)* | T_FUNC | v1 |
| `ferot` | ferot, firot | `return` | T_RETURN | v1 |
| `thamo` | thamo, thamao | `break` | T_BREAK | v1 |
| `sotti` | sotti | `1` | T_TRUE | v1 |
| `mittha` | mitthya | `0` | T_FALSE | v1 |
| `ebong` | abong | `&&` | T_AND | **v2** |
| `tasara` | tachara | `\|\|` | T_OR | **v2** |
| `ulto` | ulta | `!` | T_BANG | **v2** |
| `sorbochho` | sorbocho, sorbochcho | *(array size marker)* | T_ARRSIZE | **v2** |
| `pointer` | pointar | `*` (declaration) | T_POINTER | **v2** |
| `erthikana` | thikana | `&` | T_ADDR | **v2** |
| `erman` | man | `*` (dereference) | T_DEREF | **v2** |
| `faka` | fanka | `NULL` | T_NULL | **v2** |
| `lomba` | lomba | *(array length)* | T_LENGTH | **v2** |
| `okkhor` | okhor, akkhor | `char` | T_TYPE_CHAR | **v2.1** |
| `ghor` | — | *(print precision)* | T_PRECISION | **v2.1** |

All of the above are **reserved words**. They cannot be used as variable or function names. Using one produces:

```
Line N: "erman" akta keyword, variable name hisebe kaj korbe na.
```

Lookup is case-sensitive. The language is lowercase.

## Operators

Operators are symbols. The only exception is the three logical operators, which accept a word form as well — see PRD §3.3 for why.

| Symbol | Word form | Token | Where it can appear |
|---|---|---|---|
| `+` `-` `*` `/` `%` | — | T_PLUS, T_MINUS, T_STAR, T_SLASH, T_MOD | expressions |
| `>` `<` `>=` `<=` `==` `!=` | — | T_GT, T_LT, T_GTE, T_LTE, T_EQ, T_NEQ | expressions |
| `&&` | `ebong` | T_AND | expressions |
| `\|\|` | `tasara` | T_OR | expressions |
| `!` | `ulto` | T_BANG | expressions |
| `=` | — | T_ASSIGN | **statements only** |
| `+=` `-=` `*=` `/=` `%=` | — | T_PLUS_EQ, T_MINUS_EQ, T_STAR_EQ, T_SLASH_EQ, T_MOD_EQ | **statements only** |
| `++` `--` | — | T_INC, T_DEC | **statements only, postfix only** |
| `[` `]` | — | T_LBRACKET, T_RBRACKET | array indexing |
| `.` | — | T_DOT | only before `erthikana()`, `erman()`, `lomba()` or `ghor()` |
| `( ) { } ; ,` | — | T_LPAREN … T_COMMA | punctuation |

### Maximal munch

The lexer must try the longest match first:

| Input | Correct tokens | Wrong |
|---|---|---|
| `++` | T_INC | T_PLUS T_PLUS |
| `+=` | T_PLUS_EQ | T_PLUS T_ASSIGN |
| `+` | T_PLUS | |
| `--` | T_DEC | T_MINUS T_MINUS |
| `-=` | T_MINUS_EQ | |
| `-` | T_MINUS | |
| `*=` | T_STAR_EQ | T_STAR T_ASSIGN |
| `*` | T_STAR | |
| `/=` | T_SLASH_EQ | T_SLASH T_ASSIGN |
| `/` | T_SLASH | |
| `%=` | T_MOD_EQ | T_MOD T_ASSIGN |
| `%` | T_MOD | |
| `>=` | T_GTE | T_GT T_ASSIGN |
| `==` | T_EQ | T_ASSIGN T_ASSIGN |

Order inside the `+` case: check `+`, then `=`, then fall through. Same shape for `-`. For `*`, `/`, `%`: check `=` then fall back.

## Suggestion behaviour

`keyword_suggest` returns the closest canonical keyword when the Levenshtein distance is 1 or 2 and the word is at least 3 characters long.

| Input | Expected |
|---|---|
| `jodi` | T_IF |
| `zodi` | T_IF |
| `ebong` | T_AND |
| `abong` | T_AND |
| `sorbochho` | T_ARRSIZE |
| `erthikana` | T_ADDR |
| `total` | T_IDENT, no suggestion |
| `jdi` | T_IDENT, suggests `jodi` |
| `ebng` | T_IDENT, suggests `ebong` |
| `pointr` | T_IDENT, suggests `pointer` |
| `x` | T_IDENT, no suggestion (too short) |

Watch for collisions the new keywords introduce:

- `man` is an alias of `erman`, and `naam` is a common variable name. They are distance 2 apart, but `naam` resolves as an identifier first because alias lookup runs before suggestion, so no suggestion is produced. There is a test case for this.
- `okhor` (alias of `okkhor`) and `ghor` are distance 2 apart and both landed in v2.1. Add a unit test proving `ghor` still resolves to `T_PRECISION` and does **not** suggest `okhor`.

## Pointers and References (v2)

| BNLang | C equivalent | Bangalish biboron |
|---|---|---|
| `shongkha pointer p = x.erthikana();` | `int *p = &x;` | `x` er memory thikana pointer `p` te rakha hoy. |
| `dekhao(p.erman());` | `printf("%d", *p);` | Pointer `p` je memory dekhaiche tar man print kora hoy. |
| `p.erman() = 10;` | `*p = 10;` | Pointer `p` je variable dekhaiche tar bhitore 10 man rakha hoy. |
| `shongkha pointer q = faka;` | `int *q = NULL;` | Pointer `q` ke khali (NULL) hisebe set kora hoy. |
| `shongkha pointer p = talika[i].erthikana();` | `int *p = &talika[i];` | Talikar `i` number ghorer thikana `p` te rakha hoy. |
| `kaj shongkha bodlao(shongkha pointer a, shongkha pointer b)` | `int bodlao(int *a, int *b)` | Function e pointer parameter pathiye pass-by-reference kora jay. |
| `nao(p.erman());` | `scanf("%d", p);` | Pointer `p` je ghore ache sherasheri sheikhane input neya hoy. |

## Differences from C

- **Assignment is a statement**: `x = 5;` ebong compound assignment `+=`, `-=` statement hisebe kaj kore, expression e boshe na.
- **Postfix only for `++` and `--`**: `i++` ba `i--` deya jabe, kintu `++i` ba `--i` shuru te deya jabe na.
- **Array bounds checking**: Talika (array) er bounds browser IDE ba interpreter e check kora hoy (bhul index e runtime error dey), kintu compiled C code e bounds check thake na.
- **Print precision with `.ghor(n)`**: `dekhao()` er bhitore `doshomik` shongkhar shathe `.ghor(n)` bebohar kore doshomik-er por koy ghor dekhabe ta nirdharon kora jay (default 2 ghor). C te eta format specifier `%.<n>f` hisebe emit hoy.
- **String comparison with `==` and `!=`**: `lekha` type-er string tulona korte `==` ebong `!=` bebohar kora jay (shorasheri duita `lekha` ba `lekha` ar string literal). C te eta `strcmp(a, b) == 0` ba `strcmp(a, b) != 0` te lower hoy, pointer address tulona kore na.
- **String copy**: `lekha` variable onno `lekha` variable ba string value diye initialize ba assign kora jay (`lekha a = b;` ba `a = b;`). C te eta length-guarded `strncpy` diye copy hoy.
- **Division by zero guard**: Shunno (0 ba 0.0) diye bhag ba modulo kora hole literal thakle compile-time error dey (`Line N: shunno diye bhag kora jabe na.`). Variable divisor hole runtime-e interpreter ebong compiled C duita backend-ei guard error print kore non-zero (1) exit status-e bondho hoy.
