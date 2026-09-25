import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { Magnetic } from '../Magnetic';
import { RevealWords, Reveal } from '../Reveal';
import './hero.css';

const TELEMETRY = [
  { k: 'KOTLIN', v: '2.1.0', state: 'ok' },
  { k: 'BUILD SUCCESS', v: '6s', state: 'ok' },
  { k: 'APK READY', v: '4.2 MB', state: 'ok' },
];

export function Hero() {
  const stageRef = usePhoneStage('hero', 0.05);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 180);
    return () => clearTimeout(t);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="overview" className="section hero" ref={stageRef} aria-labelledby="hero-title">
      <div className="section__inner hero__inner">
        <div className="hero__copy">
          <Reveal delay={0.1}>
            <span className="eyebrow">Android Development / Kotlin</span>
          </Reveal>

          <h1 className="display hero__title" id="hero-title">
            <RevealWords text="Kotlin." delay={0.22} step={0.08} />
            <span className="hero__title-line">
              <RevealWords text="Build Android" delay={0.42} step={0.055} />
            </span>
            <span className="hero__title-line">
              <RevealWords text="with confidence." delay={0.58} step={0.055} />
            </span>
          </h1>

          <Reveal delay={0.9}>
            <p className="lead hero__lead">
              From expressive, null-safe code to a signed APK running on a device — one
              continuous toolchain. This is how Kotlin becomes an Android application.
            </p>
          </Reveal>

          <div className="hero__cta">
            <Reveal delay={1.05}>
              <Magnetic strength={0.3}>
                <a className="btn btn--primary" href="#kotlin" onClick={go('kotlin')} data-cursor="link">
                  <span className="btn__sheen" />
                  Explore Kotlin
                </a>
              </Magnetic>
            </Reveal>
            <Reveal delay={1.15}>
              <Magnetic strength={0.3}>
                <a className="btn btn--ghost" href="#code" onClick={go('code')} data-cursor="link">
                  See it in action
                  <span aria-hidden="true">↓</span>
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal delay={1.3}>
            <ul className="hero__chips" aria-label="Kotlin highlights">
              <li className="tag">Null-safe</li>
              <li className="tag">Coroutines</li>
              <li className="tag">JVM bytecode</li>
              <li className="tag">Jetpack Compose</li>
            </ul>
          </Reveal>
        </div>

        <div className="hero__stage" aria-hidden="true">
          <motion.div
            className="telemetry"
            initial={{ opacity: 0, x: 24 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 1.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="telemetry__head mono">PIPELINE STATUS</span>
            <ul>
              {TELEMETRY.map((t, i) => (
                <motion.li
                  key={t.k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 1.5 + i * 0.13, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="telemetry__dot" />
                  <span className="telemetry__k">{t.k}</span>
                  <span className="telemetry__v">{t.v}</span>
                </motion.li>
              ))}
            </ul>
            <span className="telemetry__line" />
          </motion.div>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span className="mono">SCROLL</span>
        <span className="hero__scroll-rail" />
      </div>
    </section>
  );
}
