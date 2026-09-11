// BNLang v2.1 Syntax Highlighter
const TYPES = new Set(['shongkha', 'doshomik', 'lekha', 'okkhor', 'pointer']);
const CONTROL = new Set(['jodi', 'nahole', 'jotokkhon', 'chalao', 'thamo', 'ferot', 'kaj']);
const LOGIC = new Set(['ebong', 'tasara', 'ulto', 'sotti', 'mittha']);
const IO = new Set(['dekhao', 'nao']);
const BUILTINS = new Set(['sorbochho', 'erthikana', 'erman', 'faka', 'lomba', 'ghor']);

function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function classifyWord(word) {
    if (TYPES.has(word)) return 'hl-type';
    if (CONTROL.has(word)) return 'hl-control';
    if (LOGIC.has(word)) return 'hl-logic';
    if (IO.has(word)) return 'hl-io';
    if (BUILTINS.has(word)) return 'hl-builtin';
    return 'hl-ident';
}

const MASTER_RE = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)|([^\s\w"']+)|([ \t\r\n]+)/g;

function highlightSource(source) {
    let html = '';
    let lastIndex = 0;
    MASTER_RE.lastIndex = 0;
    let match;

    while ((match = MASTER_RE.exec(source)) !== null) {
        if (match.index > lastIndex) {
            html += escapeHtml(source.slice(lastIndex, match.index));
        }
        lastIndex = match.index + match[0].length;

        const raw = match[0];
        const escaped = escapeHtml(raw);

        if (match[1] !== undefined) {
            html += '<span class="hl-comment">' + escaped + '</span>';
        } else if (match[2] !== undefined) {
            html += '<span class="hl-string">' + escaped + '</span>';
        } else if (match[3] !== undefined) {
            html += '<span class="hl-number">' + escaped + '</span>';
        } else if (match[4] !== undefined) {
            const cls = classifyWord(raw);
            html += '<span class="' + cls + '">' + escaped + '</span>';
        } else if (match[5] !== undefined) {
            html += '<span class="hl-punct">' + escaped + '</span>';
        } else {
            html += raw;
        }
    }

    if (lastIndex < source.length) {
        html += escapeHtml(source.slice(lastIndex));
    }

    return html;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { highlightSource, classifyWord, TYPES, CONTROL, LOGIC, IO, BUILTINS };
}
