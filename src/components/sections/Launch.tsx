import { useEffect, useRef, useState } from 'react';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { prefersReducedMotion, sleep } from '../../lib/math';
import { store, useStore } from '../../store';
import { Reveal, RevealWords } from '../Reveal';
import './launch.css';

const SPECS: [string, string][] = [
  ['minSdk', '26'],
  ['targetSdk', '35'],
  ['language', 'Kotlin 2.1.0'],
  ['ui toolkit', 'Compose M3'],
  ['plugin', 'AGP 8.7'],
  ['artifact', '4.2 MB'],
];

const TRACE: [string, string][] = [
  ['ActivityThread → handleLaunchActivity', 'process'],
  ['Application.onCreate()', '12 ms'],
  ['MainActivity.onCreate(savedInstanceState)', '8 ms'],
  ['setContent { MaterialTheme { … } }', 'frame 1'],
];

export function Launch() {
  const stageRef = usePhoneStage<HTMLDivElement>('launch', 0.42);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const playedRef = useRef(false);
  const [tab, setTab] = useState(store.get().tab);
  const liveTab = useStore((s) => s.tab);

  useEffect(() => setTab(liveTab), [liveTab]);

  /* Replay the install → launch beat once when the device is first revealed. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || playedRef.current) return;
        playedRef.current = true;
        obs.disconnect();
        const fast = prefersReducedMotion();
        void (async () => {
          store.set({ screen: 'launcher', progress: 0 });
          await sleep(fast ? 160 : 1500);
          store.set({ screen: 'app', build: 'success', tab: 'builds' });
          await sleep(fast ? 60 : 400);
        })();
      },
      { threshold: 0.45 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={(el) => {
        rootRef.current = el;
        stageRef.current = el;
      }}
      className="launch-wrap"
    >
      <section id="android" className="launch" aria-labelledby="launch-title">
        <div className="launch__grid">
          <header className="launch__cell launch__cell--tl">
            <Reveal>
              <span className="eyebrow">
                <span className="sec-num">03</span>On device
              </span>
            </Reveal>
            <RevealWords className="h2" id="launch-title" text="It launches like native." delay={0.08} />
            <Reveal delay={0.24}>
              <p className="lead launch__lead">
                The manifest entry point resolves, the framework calls your Kotlin, and the
                first composition paints. Everything you just built is now an Android app.
              </p>
            </Reveal>
          </header>

          <div className="launch__cell launch__cell--tr">
            <Reveal delay={0.12}>
              <div className="panel specs">
                <div className="panel__bar">
                  <span className="mono">device profile</span>
                  <span className="specs__dot" aria-hidden="true" />
                </div>
                <dl className="specs__list">
                  {SPECS.map(([k, v]) => (
                    <div className="specs__row" key={k}>
                      <dt>{k}</dt>
                      <dd className="mono">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <div className="launch__cell launch__cell--bl">
            <Reveal delay={0.16}>
              <div className="trace">
                <span className="trace__title mono">LAUNCH TRACE</span>
                <ol className="trace__list">
                  {TRACE.map(([line, meta], i) => (
                    <li key={line} className="trace__line" style={{ ['--i' as string]: i }}>
                      <span className="trace__mark" aria-hidden="true" />
                      <span className="trace__code mono">{line}</span>
                      <span className="trace__meta mono">{meta}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>

          <div className="launch__cell launch__cell--br">
            <Reveal delay={0.2}>
              <div className="panel controls">
                <div className="panel__bar">
                  <span className="mono">drive the device</span>
                  <span className="controls__state mono">tab: {liveTab}</span>
                </div>
                <div className="controls__body">
                  <p className="controls__hint">
                    The screen is interactive — tap the bottom navigation, or drive it from here.
                  </p>
                  <div className="controls__btns">
                    {(
                      [
                        ['builds', 'Builds'],
                        ['insights', 'Insights'],
                        ['run', 'Run'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        className={`chipbtn ${tab === id ? 'is-on' : ''}`}
                        onClick={() => store.set({ tab: id })}
                        data-cursor="link"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
