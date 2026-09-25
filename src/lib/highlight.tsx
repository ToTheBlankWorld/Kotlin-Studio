export interface Token {
  /** token text */
  t: string;
  /** css class suffix, e.g. "kw" -> .tk-kw */
  c: string;
}

const KEYWORDS = new Set([
  'package', 'import', 'class', 'object', 'interface', 'fun', 'val', 'var', 'if', 'else',
  'when', 'for', 'while', 'do', 'return', 'break', 'continue', 'in', 'is', 'as', 'this',
  'super', 'null', 'true', 'false', 'try', 'catch', 'finally', 'throw', 'typealias',
  'constructor', 'init', 'companion', 'enum', 'sealed', 'data', 'interface', 'where',
  'try', 'do', 'else', 'if',
]);

const MODIFIERS = new Set([
  'public', 'private', 'protected', 'internal', 'open', 'abstract', 'final', 'annotation',
  'const', 'suspend', 'override', 'lateinit', 'vararg', 'inline', 'noinline', 'crossinline',
  'reified', 'operator', 'infix', 'external', 'by', 'get', 'set', 'out', 'var',
]);

const CONTROL = new Set(['break', 'continue', 'return', 'throw']);

type Rule = { re: RegExp; c: string };

const RULES: Rule[] = [
  { re: /^\/\/[^\n]*/, c: 'com' },
  { re: /^\/\*[\s\S]*?\*\//, c: 'com' },
  { re: /^@[\w.]+/, c: 'ann' },
  { re: /^"(?:\\.|[^"\\])*"/, c: 'str' },
  { re: /^'(?:\\.|[^'\\])*'/, c: 'str' },
  { re: /^\b\d[\d_]*(?:\.\d+)?[fFlLdD]?\b/, c: 'num' },
  { re: /^\b[A-Z][A-Za-z0-9_]*\b/, c: 'type' },
  { re: /^\b[a-z_][A-Za-z0-9_]*(?=\s*\()/, c: 'fn' },
  { re: /^[A-Za-z_][A-Za-z0-9_]*/, c: 'id' },
  { re: /^(?:==|!=|<=|>=|&&|\|\||\?\?|->|::|\+=|-=|\*=|\/=|[+\-*/%<>=!?:.&|])/, c: 'op' },
  { re: /^[,;(){}[\]]/, c: 'punc' },
  { re: /^\s+/, c: 'ws' },
  { re: /^./, c: 'txt' },
];

export function tokenizeKotlin(code: string): Token[] {
  const out: Token[] = [];
  let rest = code;
  let guard = 0;

  while (rest.length && guard++ < 6000) {
    let matched = false;
    for (const rule of RULES) {
      const m = rule.re.exec(rest);
      if (!m || m[0].length === 0) continue;
      let text = m[0];
      let cls = rule.c;

      if (cls === 'id') {
        if (KEYWORDS.has(text)) cls = 'kw';
        else if (MODIFIERS.has(text)) cls = 'mod';
        else if (CONTROL.has(text)) cls = 'kw';
        else cls = 'var';
      }
      if (cls === 'str' && /\$\{/.test(text)) cls = 'str tpl';

      out.push({ t: text, c: cls });
      rest = rest.slice(text.length);
      matched = true;
      break;
    }
    if (!matched) break;
  }
  return out;
}

export function countChars(tokens: Token[]): number {
  return tokens.reduce((n, tk) => n + tk.t.length, 0);
}

/** Slice a token stream down to `n` visible characters (for typing effects). */
export function sliceTokens(tokens: Token[], n: number): Token[] {
  const out: Token[] = [];
  let budget = n;
  for (const tk of tokens) {
    if (budget <= 0) break;
    if (tk.t.length <= budget) {
      out.push(tk);
      budget -= tk.t.length;
    } else {
      out.push({ t: tk.t.slice(0, budget), c: tk.c });
      budget = 0;
    }
  }
  return out;
}

export function renderTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((tk, i) =>
    tk.c === 'ws' ? (
      <span key={i}>{tk.t}</span>
    ) : (
      <span key={i} className={`tk-${tk.c.replace(/\s+/g, ' tk-')}`}>
        {tk.t}
      </span>
    ),
  );
}
