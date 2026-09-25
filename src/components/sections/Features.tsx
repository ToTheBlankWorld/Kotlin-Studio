import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { features } from '../../data/features';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { SectionHeader } from '../SectionHeader';
import { CodeBlock } from '../CodeBlock';
import { Reveal } from '../Reveal';
import './features.css';

export function Features() {
  const stageRef = usePhoneStage<HTMLDivElement>('features', 0.2);
  const [open, setOpen] = useState<string | null>(features[0].id);

  const totals = useMemo(
    () => Object.fromEntries(features.map((f) => [f.id, f.code.length])),
    [],
  );

  return (
    <div ref={stageRef} className="features-wrap">
      <section className="section features" aria-labelledby="features-title">
        <div className="section__inner">
          <SectionHeader
            num="05"
            eyebrow="Language toolkit"
            title="What the compiler takes off your plate."
            titleId="features-title"
            lead="Seven capabilities that show up in almost every Android file. Open one to see the exact code shape it produces."
            split
          />

          <div className="fgrid">
            {features.map((f) => {
              const isOpen = open === f.id;
              return (
                <motion.article
                  key={f.id}
                  layout
                  transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                  className={`fcard ${isOpen ? 'is-open' : ''}`.trim()}
                >
                  <span className="panel__glow" aria-hidden="true" />
                  <button
                    className="fcard__head"
                    aria-expanded={isOpen}
                    aria-controls={`fbody-${f.id}`}
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    data-cursor="link"
                  >
                    <span className="fcard__idx mono">{f.index}</span>
                    <span className="fcard__titles">
                      <span className="fcard__title">{f.title}</span>
                      <span className="fcard__sub mono">{f.subtitle}</span>
                    </span>
                    <span className="fcard__plus" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`fbody-${f.id}`}
                        className="fcard__body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="fcard__inner">
                          <p className="fcard__body-text">{f.body}</p>
                          <div className="fcard__code">
                            <CodeBlock code={f.code} revealed={totals[f.id]} gutter={false} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <p className="features__foot mono">
              07 of 07 · every example compiles against Kotlin 2.1 / AGP 8.7
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
