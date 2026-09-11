// KEEP IN SYNC WITH compiler/src/json_out.c

/**
 * TokenType enum string representation mirroring compiler/src/json_out.c
 * @typedef {'T_TYPE_INT' | 'T_TYPE_FLOAT' | 'T_TYPE_STR' | 'T_TYPE_CHAR' | 'T_PRINT' | 'T_INPUT' | 'T_IF' | 'T_ELSE' | 'T_WHILE' | 'T_FOR' | 'T_FUNC' | 'T_RETURN' | 'T_BREAK' | 'T_TRUE' | 'T_FALSE' | 'T_IDENT' | 'T_NUMBER' | 'T_STRING' | 'T_CHAR_LIT' | 'T_PLUS' | 'T_MINUS' | 'T_STAR' | 'T_SLASH' | 'T_MOD' | 'T_ASSIGN' | 'T_EQ' | 'T_NEQ' | 'T_LT' | 'T_LTE' | 'T_GT' | 'T_GTE' | 'T_AND' | 'T_OR' | 'T_BANG' | 'T_LPAREN' | 'T_RPAREN' | 'T_LBRACE' | 'T_RBRACE' | 'T_SEMICOLON' | 'T_COMMA' | 'T_LENGTH' | 'T_PRECISION' | 'T_EOF' | 'T_UNKNOWN'} TokenType
 *
 * @typedef {'lexical' | 'syntax' | 'semantic' | 'runtime' | 'unknown'} ErrorKind
 *
 * @typedef {Object} CompileError
 * @property {ErrorKind} kind
 * @property {number} line
 * @property {number} col
 * @property {string} message
 * @property {string | null} suggestion
 *
 * @typedef {Object} Token
 * @property {TokenType} type
 * @property {string} lexeme
 * @property {number} line
 * @property {number} col
 *
 * @typedef {Object} CompilerTimings
 * @property {number} lex
 * @property {number} parse
 * @property {number} semantic
 * @property {number} codegen
 *
 * @typedef {Object} CompilationResult
 * @property {boolean} ok
 * @property {string} c_code
 * @property {string} output
 * @property {CompileError[]} errors
 * @property {Token[]} tokens
 * @property {string} ast
 * @property {CompilerTimings} timing_ms
 */

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
}
