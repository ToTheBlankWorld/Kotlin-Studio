import type { ReactNode } from 'react';
import { Reveal, RevealWords } from './Reveal';

interface SectionHeaderProps {
  num: string;
  eyebrow: string;
  title: string;
  lead?: string;
  split?: boolean;
  titleId?: string;
  children?: ReactNode;
}

export function SectionHeader({
  num,
  eyebrow,
  title,
  lead,
  split,
  titleId,
  children,
}: SectionHeaderProps) {
  return (
    <header className={`sec-head ${split ? 'sec-head--split' : ''}`.trim()}>
      <div className="stack" style={{ gap: 18 }}>
        <Reveal>
          <span className="eyebrow">
            <span className="sec-num">{num}</span>
            {eyebrow}
          </span>
        </Reveal>
        <RevealWords id={titleId} className="h2" text={title} delay={0.08} />
        {lead ? (
          <Reveal delay={0.24}>
            <p className="lead">{lead}</p>
          </Reveal>
        ) : null}
      </div>
      {children}
    </header>
  );
}
