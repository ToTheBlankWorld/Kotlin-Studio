import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { countChars, renderTokens, sliceTokens, tokenizeKotlin } from '../lib/highlight';

interface CodeBlockProps {
  code: string;
  gutter?: boolean;
  highlight?: number[];
  /** number of characters revealed — enables the typing effect */
  revealed?: number;
  showCaret?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  gutter = true,
  highlight,
  revealed,
  showCaret = false,
  className = '',
}: CodeBlockProps) {
  const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);
  const tokenized = useMemo(() => lines.map((l) => tokenizeKotlin(l)), [lines]);

  const rendered: ReactNode[] = useMemo(() => {
    let budget = revealed ?? Infinity;
    let caretAt = -1;

    return tokenized.map((tokens, i) => {
      const total = countChars(tokens);
      const take = Math.min(budget, total);
      const visible = sliceTokens(tokens, take);
      if (budget > 0 && take > 0 && take < total) caretAt = i;
      if (budget > 0 && take === 0 && total > 0 && caretAt === -1 && i === 0) caretAt = i;
      budget -= total;

      const isCaretLine = caretAt === i && showCaret;
      return (
        <span
          key={i}
          className={`code__line ${highlight?.includes(i + 1) ? 'is-hl' : ''}`.trim()}
        >
          {renderTokens(visible)}
          {isCaretLine ? <span className="caret" /> : null}
        </span>
      );
    });
  }, [tokenized, revealed, highlight, showCaret]);

  return <code className={`code ${gutter ? 'code--gutter' : ''} ${className}`.trim()}>{rendered}</code>;
}

export function CodeFrame({
  title,
  actions,
  children,
  className = '',
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`code-frame ${className}`.trim()}>
      <div className="code-frame__bar">
        <span className="code-frame__dots" aria-hidden="true">
          <i style={{ background: '#ff5f57' }} />
          <i style={{ background: '#febc2e' }} />
          <i style={{ background: '#28c840' }} />
        </span>
        <span>{title}</span>
        {actions ? <span style={{ marginLeft: 'auto' }}>{actions}</span> : null}
      </div>
      <div className="code-frame__body">{children}</div>
    </div>
  );
}

/** Code whose lines slide in one after another. */
export function AnimatedCode({
  code,
  stagger = 0.055,
  gutter = true,
  className = '',
}: {
  code: string;
  stagger?: number;
  gutter?: boolean;
  className?: string;
}) {
  const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);

  return (
    <code className={`code ${gutter ? 'code--gutter' : ''} ${className}`.trim()}>
      {lines.map((line, i) => {
        const tokens = tokenizeKotlin(line);
        return (
          <motion.span
            key={`${i}-${line}`}
            className="code__line"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * stagger, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          >
            {tokens.length ? renderTokens(tokens) : '\u00A0'}
          </motion.span>
        );
      })}
    </code>
  );
}
