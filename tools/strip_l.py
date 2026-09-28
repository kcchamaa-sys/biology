"""One-off helper: turn L(en, zh) calls into just the English argument."""
import re, sys

def skip_str(s, i):
    q = s[i]; i += 1
    while i < len(s):
        c = s[i]
        if c == '\\': i += 2; continue
        if q == '`' and c == '$' and s[i+1] == '{':
            i = skip_until(s, i + 2, '}') + 1; continue
        if c == q: return i + 1
        i += 1
    raise ValueError("unterminated string")

def skip_until(s, i, closer):
    """Scan from i until an unnested closer char (or top-level comma if closer==',)'). Returns index of stop char."""
    depth = 0
    while i < len(s):
        c = s[i]
        if c in '"\'`': i = skip_str(s, i); continue
        if c == '/' and s[i+1] == '/':  # line comment
            i = s.index('\n', i); continue
        if c in '([{': depth += 1
        elif c in ')]}':
            if depth == 0 and c in closer: return i
            depth -= 1
        elif c == ',' and depth == 0 and ',' in closer: return i
        i += 1
    raise ValueError("no closer")

def strip(src):
    out, i = [], 0
    pat = re.compile(r'(?<![\w.$])L\(')
    while True:
        m = pat.search(src, i)
        if not m: out.append(src[i:]); break
        start = m.end()
        if src.startswith('...', start):  # L(...arr) spread: leave for manual edit
            out.append(src[i:start]); i = start; continue
        a_end = skip_until(src, start, ',)')
        if src[a_end] != ',':
            out.append(src[i:start]); i = start; continue
        b_end = skip_until(src, a_end + 1, ')')
        out.append(src[i:m.start()]); out.append(src[start:a_end].strip()); i = b_end + 1
    return ''.join(out)

for f in sys.argv[1:]:
    s = open(f).read()
    for _ in range(5):
        n = strip(s)
        if n == s: break
        s = n
    open(f, 'w').write(s)
    print(f, 'remaining L(', len(re.findall(r'(?<![\w.$])L\(', s)))
