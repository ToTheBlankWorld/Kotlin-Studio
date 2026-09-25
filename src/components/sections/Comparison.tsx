import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { comparison } from '../../data/pipeline';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { SectionHeader } from '../SectionHeader';
import { Reveal } from '../Reveal';
import './comparison.css';

function rich(text: string) {
  return text.split('`').map((part, i) =>
    i % 2 ? (
      <code key={i} className="cmp__code-inline">
        {part}
      </code>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function Comparison() {
  const stageRef = usePhoneStage<HTMLDivElement>('compare', 0.18);
  const [open, setOpen] = useState<string | null>(comparison[0].area);

  return (
    <div ref={stageRef} className="compare-wrap">
      <section className="section compare" aria-labelledby="compare-title">
        <div className="section__inner">
          <SectionHeader
            num="06"
            eyebrow="Before / after"
            title="Same app, less ceremony."
            titleId="compare-title"
            lead="What changes when a Java + XML Android codebase moves to Kotlin — line by line, with the code that replaces it."
            split
          />

          <div className="cmp">
            <div className="cmp__head" aria-hidden="true">
              <span className="cmp__hcell cmp__hcell--area mono">area</span>
              <span className="cmp__hcell cmp__hcell--old mono">imperative + xml</span>
              <span className="cmp__hcell cmp__hcell--new mono">kotlin + compose</span>
            </div>

            {comparison.map((row) => {
              const isOpen = open === row.area;
              return (
                <div key={row.area} className={`cmp__row ${isOpen ? 'is-open' : ''}`.trim()}>
                  <button
                    className="cmp__area"
                    aria-expanded={isOpen}
                    aria-controls={`cmp-${row.area.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setOpen(isOpen ? null : row.area)}
                    data-cursor="link"
                  >
                    <span className="cmp__area-t">{row.area}</span>
                    <span className="cmp__chev" aria-hidden="true" />
                  </button>

                  <div className="cmp__cell cmp__cell--old">
                    <span className="cmp__mobile-label mono">imperative + xml</span>
                    <p>{rich(row.traditional)}</p>
                  </div>

                  <div className="cmp__cell cmp__cell--new">
                    <span className="cmp__mobile-label mono">kotlin + compose</span>
                    <p>{rich(row.modern)}</p>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`cmp-${row.area.replace(/\s+/g, '-').toLowerCase()}`}
                        className="cmp__codes"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="cmp__codes-inner">
                          <pre className="cmp__pre cmp__pre--old">
                            <code>{row.traditionalCode}</code>
                          </pre>
                          <pre className="cmp__pre cmp__pre--new">
                            <code>{row.modernCode}</code>
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <p className="cmp__foot mono">
              select a row to reveal the two implementations side by side
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
