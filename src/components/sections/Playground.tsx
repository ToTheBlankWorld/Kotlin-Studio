import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { appCode, gradleOutput } from '../../data/code';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { countChars, tokenizeKotlin } from '../../lib/highlight';
import { prefersReducedMotion, sleep } from '../../lib/math';
import { installOnDevice, rectCenter } from '../../lib/sequence';
import { store } from '../../store';
import { SectionHeader } from '../SectionHeader';
import { CodeBlock } from '../CodeBlock';
import { ApkGlyph } from '../overlays/ApkFlight';
import { Reveal } from '../Reveal';
import './playground.css';

type Phase = 'idle' | 'typing' | 'ready' | 'building' | 'apk' | 'done';

const STEPS = ['Source', 'Compile', 'Package', 'APK', 'Install', 'Launch'];

interface TLine {
  t: string;
  kind?: 'ok' | 'dim';
}

export function Playground() {
  const stageRef = usePhoneStage('playground', 0.25);
  const rootRef = useRef<HTMLElement | null>(null);
  const apkRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const startedRef = useRef(false);

  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<TLine[]>([]);
  const [step, setStep] = useState(0);

  const total = useMemo(() => countChars(tokenizeKotlin(appCode)), []);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  /* typewriter on first sight */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || startedRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return;
        startedRef.current = true;
        obs.disconnect();
        setPhase('typing');
        const fast = prefersReducedMotion();
        if (fast) {
          setRevealed(total);
          setPhase('ready');
          return;
        }
        const dur = 2400;
        const t0 = performance.now();
        const tick = () => {
          if (!aliveRef.current) return;
          const p = Math.min(1, (performance.now() - t0) / dur);
          const eased = p < 1 ? 1 - Math.pow(1 - p, 2.2) : 1;
          setRevealed(Math.round(eased * total));
          if (p < 1) requestAnimationFrame(tick);
          else setPhase('ready');
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [total]);

  const run = useCallback(async () => {
    if (phase === 'building' || phase === 'apk') return;
    if (revealed < total) setRevealed(total);

    setPhase('building');
    setLines([]);
    setStep(1);
    store.set({ build: 'building' });

    const speed = prefersReducedMotion() ? 0.16 : 1;
    for (const l of gradleOutput) {
      await sleep(l.d * speed);
      if (!aliveRef.current) return;
      setLines((prev) => [...prev, { t: l.t, kind: l.kind as 'ok' | 'dim' | undefined }]);
      if (l.t.includes('compileDebugKotlin')) setStep(2);
      if (l.t.includes('packageDebug')) setStep(3);
    }

    store.set({ build: 'success' });
    setPhase('apk');
    setStep(4);
    await sleep(prefersReducedMotion() ? 150 : 700);
    if (!aliveRef.current) return;

    await installOnDevice(rectCenter(apkRef.current));
    if (!aliveRef.current) return;
    setStep(5);
    setPhase('done');
  }, [phase, revealed, total]);

  const reset = () => {
    setPhase(revealed >= total ? 'ready' : 'idle');
    setLines([]);
    setStep(0);
    store.set({ build: 'idle' });
  };

  const running = phase === 'building';
  const stepIndex = phase === 'done' ? STEPS.length : step;

  return (
    <section
      id="code"
      className="section playground"
      ref={(el) => {
        rootRef.current = el;
        stageRef.current = el;
      }}
      aria-labelledby="playground-title"
    >
      <div className="section__inner playground__inner">
        <div className="playground__head">
          <SectionHeader
            num="02"
            eyebrow="Code Playground"
            title="Write it. Run it. Watch it ship."
            titleId="playground-title"
            lead="A real Gradle task graph sits between your Kotlin and the device. Press RUN and follow every stage."
          />
          <Reveal delay={0.15} className="playground__aside">
            <span className="chip chip--live">Toolchain ready</span>
            <span className="mono playground__aside-text">Kotlin 2.1 · AGP 8.7 · compileSdk 35</span>
          </Reveal>
        </div>

        <div className="playground__grid">
          <div className="ide" data-running={running ? 'true' : 'false'} data-phase={phase}>
            <div className="ide__bar">
              <span className="ide__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="ide__file mono">MainActivity.kt</span>
              <span className="ide__badge mono">app / src / main</span>
              <button
                className="ide__run"
                onClick={() => void run()}
                disabled={running || phase === 'apk'}
                data-cursor="link"
              >
                <span className="ide__run-icon" aria-hidden="true" />
                {running ? 'BUILDING' : phase === 'done' ? 'RE-RUN' : 'RUN'}
              </button>
            </div>

            <div className="ide__body">
              <CodeBlock code={appCode} revealed={revealed} showCaret={phase === 'typing'} />
            </div>

            <span className="ide__progress" aria-hidden="true">
              <span style={{ transform: `scaleX(${stepIndex / STEPS.length})` }} />
            </span>

            <AnimatePresence initial={false}>
              {lines.length > 0 && (
                <motion.div
                  className="ide__term"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="term__bar">
                    <i style={{ background: '#ff5f57' }} />
                    <i style={{ background: '#febc2e' }} />
                    <i style={{ background: '#28c840' }} />
                    <span className="term__title">gradle — kotlin-studio</span>
                  </div>
                  <div className="term__body">
                    {lines.map((l, i) => (
                      <div
                        key={i}
                        className={`term__line ${l.kind === 'ok' ? 'term__line--ok' : 'term__line--dim'}`}
                      >
                        {l.t || '\u00A0'}
                      </div>
                    ))}
                    {running ? <span className="term__cursor" /> : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="playground__after">
            <AnimatePresence>
              {(phase === 'apk' || phase === 'done') && (
                <motion.div
                  ref={apkRef}
                  className="apk-card"
                  initial={{ opacity: 0, y: 26, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                >
                  <ApkGlyph size={54} />
                  <div className="apk-card__meta">
                    <strong className="mono">app-debug.apk</strong>
                    <span className="mono">4.2 MB · signed · v1+v2</span>
                  </div>
                  <div className="apk-card__state mono">
                    {phase === 'apk' ? 'READY' : 'INSTALLED'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  className="launch-badge"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <span className="launch-badge__check" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path
                        d="m3.5 8.5 3 3 6-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong>Kotlin Studio</strong> is running — tap the device screen to use it.
                  </span>
                  <button className="btn btn--ghost btn--sm" onClick={reset} data-cursor="link">
                    Reset
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="rail" aria-label="Build stages">
            <span className="rail__title mono">SEQUENCE</span>
            <ol className="steps">
              {STEPS.map((s, i) => {
                const state = i < stepIndex ? 'done' : i === stepIndex ? 'now' : 'todo';
                return (
                  <li key={s} className={`step step--${state}`}>
                    <span className="step__dot" aria-hidden="true" />
                    <span className="step__label">{s}</span>
                  </li>
                );
              })}
            </ol>
            <p className="rail__hint mono">
              {phase === 'done'
                ? 'Device screen is live →'
                : 'Every stage is mirrored on the device.'}
            </p>
          </aside>
        </div>

        <div className="playground__device" aria-hidden="true">
          <span className="mono">DEVICE</span>
        </div>
      </div>
    </section>
  );
}
