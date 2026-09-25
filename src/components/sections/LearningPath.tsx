import { useMemo, useRef, useState } from 'react';
import { learningPath } from '../../data/pipeline';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { useScrollProgress } from '../../hooks/useInView';
import { SectionHeader } from '../SectionHeader';
import { Reveal } from '../Reveal';
import './path.css';

export function LearningPath() {
  const stageRef = usePhoneStage<HTMLDivElement>('path', 0.18);
  const listRef = useRef<HTMLOListElement>(null);
  const progress = useScrollProgress(listRef);
  const [filter, setFilter] = useState<string>('all');

  const tags = useMemo(
    () => Array.from(new Set(learningPath.map((s) => s.tag))),
    [],
  );

  const t = progress * (learningPath.length + 1.4);
  const fill = Math.min(1, Math.max(0, t / learningPath.length));

  return (
    <div ref={stageRef} className="path-wrap">
      <section id="path" className="section path" aria-labelledby="path-title">
        <div className="section__inner">
          <SectionHeader
            num="08"
            eyebrow="Learning path"
            title="Ten steps from syntax to store."
            titleId="path-title"
            lead="A route that mirrors how the toolchain actually fits together — each step assumes the one before it."
            split
          />

          <div className="path__layout">
            <aside className="path__aside">
              <div className="path__sticky">
                <Reveal>
                  <div className="panel path__meter">
                    <div className="panel__bar">
                      <span className="mono">progress</span>
                      <span className="path__pct mono">
                        {String(Math.round(fill * 100)).padStart(3, '0')}%
                      </span>
                    </div>
                    <div className="path__track">
                      <span style={{ transform: `scaleY(${fill})` }} />
                    </div>
                    <div className="path__count">
                      <strong className="mono">{learningPath.length}</strong>
                      <span>stages</span>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <div className="path__filters">
                    <span className="path__filters-label mono">filter</span>
                    <div className="path__chips">
                      <button
                        className={`chipbtn ${filter === 'all' ? 'is-on' : ''}`}
                        onClick={() => setFilter('all')}
                        data-cursor="link"
                      >
                        all
                      </button>
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          className={`chipbtn ${filter === tag ? 'is-on' : ''}`}
                          onClick={() => setFilter(filter === tag ? 'all' : tag)}
                          data-cursor="link"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </aside>

            <ol
              className="path__list"
              ref={listRef}
              style={{ ['--fill' as string]: fill }}
            >
              {learningPath.map((s, i) => {
                const reached = i < t;
                const dim = filter !== 'all' && s.tag !== filter;
                return (
                  <li
                    key={s.n}
                    className={`path__step ${reached ? 'is-reached' : ''} ${dim ? 'is-dim' : ''}`.trim()}
                  >
                    <span className="path__node" aria-hidden="true" />
                    <span className="path__n mono">{s.n}</span>
                    <div className="path__body">
                      <h3 className="path__title">{s.title}</h3>
                      <p className="path__blurb">{s.blurb}</p>
                    </div>
                    <span className="path__tag mono">{s.tag}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}
