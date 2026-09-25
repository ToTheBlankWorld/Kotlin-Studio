import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { pipeline } from '../../data/pipeline';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { clamp } from '../../lib/math';
import { RevealWords, Reveal } from '../Reveal';
import './pipeline.css';

const GAP = 36;

export function Pipeline() {
  const stageRef = usePhoneStage<HTMLDivElement>('pipeline', 0.3);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 880px)');

  const [progress, setProgress] = useState(0);
  const [stageW, setStageW] = useState(300);

  useLayoutEffect(() => {
    const update = () => {
      setStageW(isMobile ? 300 : Math.min(320, Math.max(240, window.innerWidth * 0.21)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollable = rect.height - vh;
        setProgress(scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  const centers = pipeline.map((_, i) => i * (stageW + GAP) + stageW / 2);
  const first = centers[0];
  const last = centers[centers.length - 1];
  const packetX = first + (last - first) * progress;
  const vpW = viewportRef.current?.clientWidth ?? 800;
  const translate = isMobile ? 0 : -(packetX - vpW * 0.4);
  const done = progress > 0.9;

  return (
    <div ref={stageRef} className="pipeline-wrap">
      <section
        id="build"
        className="pipeline"
        ref={sectionRef}
        aria-labelledby="pipeline-title"
      >
        <div className="pipeline__sticky">
          <div className="pipeline__inner">
            <header className="pipeline__head">
              <RevealWords id="pipeline-title" className="h2" text="From source to signed package." delay={0.05} />
              <Reveal delay={0.2}>
                <p className="lead pipeline__lead">
                  Six stages, one continuous graph. Scroll to move the payload through it.
                </p>
              </Reveal>
              <div className="pipeline__meta mono" aria-hidden="true">
                <span>SCROLL-LINKED</span>
                <span className="pipeline__meta-bar">
                  <span style={{ transform: `scaleX(${progress})` }} />
                </span>
                <span>{String(Math.round(progress * 100)).padStart(3, '0')}%</span>
              </div>
            </header>

            <div className="pipeline__viewport" ref={viewportRef}>
              <div
                className="pipeline__track"
                style={{
                  transform: `translate3d(${translate}px,0,0)`,
                  width: centers[centers.length - 1] + stageW / 2,
                }}
              >
                <span className="pipeline__line" aria-hidden="true" />
                <span
                  className="pipeline__packet"
                  aria-hidden="true"
                  style={{ left: packetX }}
                >
                  <span className="pipeline__packet-core" />
                  <span className="pipeline__packet-glow" />
                </span>

                {pipeline.map((s, i) => {
                  const active = packetX >= centers[i] - stageW * 0.25;
                  const passed = packetX >= centers[i] + stageW * 0.2;
                  return (
                    <article
                      key={s.id}
                      className={`pstage ${active ? 'is-active' : ''} ${passed ? 'is-passed' : ''}`.trim()}
                      style={{ left: centers[i] - stageW / 2, width: stageW }}
                    >
                      <span className="pstage__idx mono">{s.index}</span>
                      <span className="pstage__node" aria-hidden="true" />
                      <div className="pstage__body">
                        <h3 className="pstage__title">{s.title}</h3>
                        <span className="pstage__tool mono">{s.tool}</span>
                        <p className="pstage__desc">{s.description}</p>
                        {s.code ? <pre className="pstage__code mono">{s.code}</pre> : null}
                        <span className="pstage__metric mono">{s.metric}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <motion.div
              className="pipeline__status"
              initial={false}
              animate={{ opacity: done ? 1 : 0, y: done ? 0 : 16 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden={!done}
            >
              <span className="pipeline__status-ok mono">BUILD SUCCESSFUL</span>
              <span className="pipeline__status-file mono">app-debug.apk · 4.2 MB</span>
              <span className="pipeline__status-next mono">→ next: Android device</span>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
