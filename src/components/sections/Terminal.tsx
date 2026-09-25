import { useEffect, useRef, useState } from 'react';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { terminalCommands } from '../../data/code';
import { prefersReducedMotion, sleep } from '../../lib/math';
import { installOnDevice, rectCenter } from '../../lib/sequence';
import { SectionHeader } from '../SectionHeader';
import { Reveal } from '../Reveal';
import './terminal.css';

interface Line {
  t: string;
  k?: 'cmd' | 'out' | 'ok' | 'err' | 'dim';
}

const SUGGESTED = [
  './gradlew assembleDebug',
  'adb install app-debug.apk',
  'kotlin --version',
  './gradlew build',
];

const PROMPT = 'developer@kotlin-studio:~/app$';

export function Terminal() {
  const stageRef = usePhoneStage<HTMLDivElement>('terminal', 0.3);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aliveRef = useRef(true);
  const busyRef = useRef(false);

  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { t: 'Kotlin 2.1.0 / Android Studio Ladybug · type a command or pick one below', k: 'dim' },
  ]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const push = (t: string, k?: Line['k']) => setLines((p) => [...p, { t, k }]);

  const exec = async (raw: string) => {
    const cmd = raw.trim();
    if (!cmd || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setValue('');
    push(cmd, 'cmd');

    if (cmd === 'clear') {
      setLines([]);
      busyRef.current = false;
      setBusy(false);
      return;
    }

    const fast = prefersReducedMotion();
    const out = terminalCommands[cmd];

    if (!out) {
      await sleep(fast ? 30 : 220);
      push(`sh: 1: ${cmd.split(' ')[0]}: not found`, 'err');
      push('try one of the suggested commands below', 'dim');
      busyRef.current = false;
      setBusy(false);
      return;
    }

    for (const l of out) {
      await sleep(fast ? 40 : 170 + Math.random() * 130);
      if (!aliveRef.current) return;
      push(l || ' ', l === '' ? 'dim' : l.includes('BUILD SUCCESSFUL') ? 'ok' : 'out');
    }

    if (cmd === './gradlew assembleDebug') {
      await sleep(fast ? 100 : 420);
      if (!aliveRef.current) return;
      push('Installing APK on device…', 'dim');
      await installOnDevice(rectCenter(bodyRef.current));
      if (!aliveRef.current) return;
      push('Success — app-debug.apk launched', 'ok');
    } else if (cmd === 'adb install app-debug.apk') {
      await sleep(fast ? 100 : 300);
      if (!aliveRef.current) return;
      await installOnDevice(rectCenter(bodyRef.current));
      if (!aliveRef.current) return;
      push('Activity started: com.example.kotlinstudio/.MainActivity', 'ok');
    }

    busyRef.current = false;
    setBusy(false);
  };

  return (
    <div ref={stageRef} className="terminal-wrap">
      <section className="section terminal" aria-labelledby="terminal-title">
        <div className="section__inner">
          <SectionHeader
            num="07"
            eyebrow="Command line"
            title="The same build, from a shell."
            titleId="terminal-title"
            lead="Gradle and adb are the machinery behind the RUN button. Drive them by hand — the device reacts to what you type."
            split
          />

          <div className="shell-window">
            <div className="shell-window__bar">
              <span className="ide__dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="shell-window__title mono">zsh — kotlin-studio — 96×24</span>
              <span className="shell-window__badge mono">{busy ? 'busy' : 'idle'}</span>
            </div>

            <div
              className="shell-window__body"
              ref={bodyRef}
              onClick={() => inputRef.current?.focus()}
              data-cursor="text"
            >
              {lines.map((l, i) => (
                <div key={i} className={`shl shl--${l.k ?? 'out'}`}>
                  {l.t}
                </div>
              ))}
              {!busy && value === '' ? <span className="shl__blink" /> : null}
            </div>

            <form
              className="shell-window__input"
              onSubmit={(e) => {
                e.preventDefault();
                void exec(value);
              }}
            >
              <span className="shell-window__prompt mono">{PROMPT}</span>
              <input
                ref={inputRef}
                className="shell-window__field mono"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal command"
                placeholder="type a command…"
              />
            </form>
          </div>

          <div className="shell-hints">
            <Reveal delay={0.08}>
              <span className="shell-hints__label mono">suggested</span>
            </Reveal>
            <div className="shell-hints__row">
              {SUGGESTED.map((c, i) => (
                <Reveal key={c} delay={0.12 + i * 0.06}>
                  <button
                    className="shell-chip mono"
                    onClick={() => void exec(c)}
                    disabled={busy}
                    data-cursor="link"
                  >
                    <span className="shell-chip__p" aria-hidden="true">
                      $
                    </span>
                    {c}
                  </button>
                </Reveal>
              ))}
            </div>
            <p className="shell-hints__note mono">
              `clear` wipes the buffer · assembleDebug flies the APK onto the device
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
