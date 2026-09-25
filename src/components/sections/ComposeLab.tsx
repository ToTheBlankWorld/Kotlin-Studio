import { useEffect, useRef, useState } from 'react';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { store, useStore, ACCENTS } from '../../store';
import { tokenizeKotlin } from '../../lib/highlight';
import { SectionHeader } from '../SectionHeader';
import { Reveal } from '../Reveal';
import './compose.css';

const NAMES = ['Android', 'Compose', 'Kotlin', 'Developer'];

function highlight(src: string) {
  return tokenizeKotlin(src).map((tk, i) => (
    <span key={i} className={`tk-${tk.c}`}>
      {tk.t}
    </span>
  ));
}

export function ComposeLab() {
  const stageRef = usePhoneStage<HTMLDivElement>('compose', 0.35);
  const sectionRef = useRef<HTMLElement | null>(null);
  const compose = useStore((s) => s.compose);
  const [recs, setRecs] = useState(0);

  /* Own the screen while this section is on stage. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const s = store.get();
        if (entries[0].isIntersecting) {
          if (s.screen !== 'compose') store.set({ screen: 'compose' });
        } else if (s.screen === 'compose') {
          store.set({ screen: 'app' });
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (store.get().screen === 'compose') store.set({ screen: 'app' });
    };
  }, []);

  const patch = (p: Partial<typeof compose>) => {
    store.set({ compose: { ...store.get().compose, ...p } });
    setRecs((r) => r + 1);
  };

  const code = `@Composable
fun Greeting(name: String) {
  Text(
    text = "Hello, $name!",
    color = ${compose.dark ? 'MaterialTheme.colorScheme.onSurface' : 'Color.Black'},
    style = MaterialTheme.typography.headlineMedium
  )
  ${compose.button ? 'Button(onClick = { tap() }) { Text("Continue") }' : '// button hidden'}
}`;

  return (
    <div
      ref={(el) => {
        sectionRef.current = el;
        stageRef.current = el;
      }}
      className="compose-wrap"
    >
      <section id="compose" className="section compose" aria-labelledby="compose-title">
        <div className="section__inner compose__inner">
          <SectionHeader
            num="04"
            eyebrow="Jetpack Compose"
            title="State in, pixels out."
            titleId="compose-title"
            lead="A composable is a function of state. Change the state below and watch the preview recompose — no XML, no findViewById, no manual invalidation."
          />

          <div className="compose__layout">
            <div className="compose__stack">
              <Reveal delay={0.1}>
                <div className="panel">
                  <div className="panel__bar">
                    <span className="mono">state holder</span>
                    <span className="compose__recs mono">{recs} recompositions</span>
                  </div>

                  <div className="cfield">
                    <label className="cfield__label mono" htmlFor="compose-name">
                      name
                    </label>
                    <div className="cfield__row">
                      <input
                        id="compose-name"
                        className="cinput"
                        value={compose.text}
                        maxLength={16}
                        onChange={(e) => patch({ text: e.target.value })}
                        data-cursor="text"
                      />
                      <button
                        className="chipbtn"
                        onClick={() =>
                          patch({
                            text: NAMES[(NAMES.indexOf(compose.text) + 1) % NAMES.length],
                          })
                        }
                        data-cursor="link"
                      >
                        Swap
                      </button>
                    </div>
                  </div>

                  <div className="cfield">
                    <span className="cfield__label mono">materialTheme</span>
                    <div className="cfield__row">
                      <button
                        className={`switch ${compose.dark ? 'is-on' : ''}`}
                        role="switch"
                        aria-checked={compose.dark}
                        aria-label="Dark theme"
                        onClick={() => patch({ dark: !compose.dark })}
                        data-cursor="link"
                      >
                        <span className="switch__knob" />
                      </button>
                      <span className="cfield__name">dark theme</span>

                      <button
                        className={`switch ${compose.button ? 'is-on' : ''}`}
                        role="switch"
                        aria-checked={compose.button}
                        aria-label="Show button"
                        onClick={() => patch({ button: !compose.button })}
                        data-cursor="link"
                      >
                        <span className="switch__knob" />
                      </button>
                      <span className="cfield__name">show button</span>
                    </div>
                  </div>

                  <div className="cfield">
                    <span className="cfield__label mono">colorScheme.primary</span>
                    <div className="swatches">
                      {ACCENTS.map((c, i) => (
                        <button
                          key={c}
                          className={`swatch ${compose.accent === i ? 'is-on' : ''}`}
                          style={{ background: c }}
                          aria-label={`Accent ${i + 1}`}
                          aria-pressed={compose.accent === i}
                          onClick={() => patch({ accent: i })}
                          data-cursor="link"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="cfield cfield--last">
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => patch({ pulse: compose.pulse + 1 })}
                      data-cursor="link"
                    >
                      Trigger recomposition
                    </button>
                    <span className="cfield__note mono">pulse {compose.pulse}</span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.22}>
                <pre className="compose__code" aria-label="Composable source">
                  <code>{highlight(code)}</code>
                </pre>
              </Reveal>
            </div>

            <div className="compose__side">
              <Reveal delay={0.3}>
                <div className="sidenote">
                  <span className="sidenote__k mono">hotspot</span>
                  <p>
                    Tap the status bar on the device (or the switch here) to flip the theme —
                    the same state drives both the preview and this panel.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.38}>
                <div className="sidenote">
                  <span className="sidenote__k mono">why it is fast</span>
                  <p>
                    Compose records which slots read which state and redraws only those nodes,
                    instead of diffing a whole view tree.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
