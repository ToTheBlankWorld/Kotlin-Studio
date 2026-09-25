import { useState } from 'react';
import { motion } from 'framer-motion';
import { concepts } from '../../data/concepts';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { SectionHeader } from '../SectionHeader';
import { AnimatedCode, CodeFrame } from '../CodeBlock';
import { Reveal } from '../Reveal';
import './concepts.css';

export function Concepts() {
  const stageRef = usePhoneStage('concepts', 0.3);
  const [active, setActive] = useState(0);
  const concept = concepts[active];

  return (
    <section id="kotlin" className="section concepts" ref={stageRef} aria-labelledby="concepts-title">
      <div className="section__inner">
        <SectionHeader
          num="01"
          eyebrow="What is Kotlin"
          title="What makes Kotlin different?"
          titleId="concepts-title"
          lead="Six properties of the language that change how Android code is written — each with the code that proves it."
          split
        />

        <div className="concepts__grid">
          <div className="concepts__list" role="tablist" aria-label="Kotlin concepts">
            {concepts.map((c, i) => {
              const isActive = i === active;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`concept-row ${isActive ? 'is-active' : ''}`.trim()}
                  onClick={() => setActive(i)}
                  data-cursor="link"
                >
                  <span className="concept-row__idx mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="concept-row__label">{c.label}</span>
                  <span className="concept-row__arrow" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="concepts__panel">
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="stack"
              style={{ gap: 22 }}
            >
              <div className="stack" style={{ gap: 10 }}>
                <h3 className="h3">{concept.title}</h3>
                <p className="muted" style={{ maxWidth: '58ch', fontSize: '0.98rem' }}>
                  {concept.body}
                </p>
              </div>

              <CodeFrame
                title={`${concept.id}.kt`}
                actions={<span className="tag">Kotlin</span>}
              >
                <AnimatedCode code={concept.code} stagger={0.05} />
              </CodeFrame>

              <p className="concept-note mono">
                <span aria-hidden="true">›</span> {concept.note}
              </p>
            </motion.div>
          </div>
        </div>

        <Reveal delay={0.1}>
          <p className="concepts__footnote mono">
            Kotlin is a general-purpose JVM language from JetBrains. Android has been
            Kotlin-first since 2019 — Android Studio ships the Kotlin standard library,
            kapt/KSP and Compose tooling by default.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
