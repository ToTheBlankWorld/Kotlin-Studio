import type { MouseEvent } from 'react';
import { usePhoneStage } from '../../hooks/usePhoneStage';
import { Magnetic } from '../Magnetic';
import { Reveal, RevealWords } from '../Reveal';
import { SECTION_LINKS } from '../Nav';
import './final.css';

const META = ['kotlin 2.1.0', 'agp 8.7', 'min sdk 26', 'compose m3', 'gradle 8.11'];

export function Final() {
  const stageRef = usePhoneStage<HTMLDivElement>('final', 0.3);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={stageRef} className="final-wrap">
      <section id="final" className="final" aria-labelledby="final-title">
        <div className="final__inner">
          <Reveal>
            <span className="eyebrow">09 / Ship it</span>
          </Reveal>
          <RevealWords
            id="final-title"
            className="display final__title"
            text="Now go build it."
            delay={0.06}
            step={0.07}
          />
          <Reveal delay={0.34}>
            <p className="lead final__lead">
              You have the language, the toolchain and the device. Open Android Studio, run
              <span className="mono final__cmd"> ./gradlew assembleDebug</span>, and watch the
              same path light up on your own phone.
            </p>
          </Reveal>

          <div className="final__cta">
            <Reveal delay={0.44}>
              <Magnetic strength={0.3}>
                <a className="btn btn--primary" href="#code" onClick={go('code')} data-cursor="link">
                  <span className="btn__sheen" />
                  Run the build again
                </a>
              </Magnetic>
            </Reveal>
            <Reveal delay={0.52}>
              <Magnetic strength={0.3}>
                <a
                  className="btn btn--ghost"
                  href="#path"
                  onClick={go('path')}
                  data-cursor="link"
                >
                  See the learning path
                  <span aria-hidden="true">→</span>
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal delay={0.6}>
            <ul className="final__meta" aria-label="Toolchain versions">
              {META.map((m) => (
                <li key={m} className="mono">
                  {m}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo">
              <span className="logo-mark" aria-hidden="true">
                K
              </span>
              <span className="logo-type">
                KOTLIN <i>/</i> ANDROID
              </span>
            </span>
            <p>
              An interactive walkthrough of how Kotlin source becomes a running Android
              application — language, Gradle, DEX, APK and the device.
            </p>
          </div>

          <nav className="footer__col" aria-label="Sections">
            <span className="footer__k mono">on this page</span>
            <ul>
              {SECTION_LINKS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={go(s.id)} data-cursor="link">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <span className="footer__k mono">toolchain</span>
            <ul className="mono">
              <li>kotlinc 2.1.0 · K2</li>
              <li>Android Gradle Plugin 8.7</li>
              <li>d8 / aapt2 / apksigner</li>
              <li>Jetpack Compose M3</li>
            </ul>
          </div>

          <div className="footer__col">
            <span className="footer__k mono">device</span>
            <ul className="mono">
              <li>minSdk 26 · targetSdk 35</li>
              <li>arm64-v8a / armeabi-v7a</li>
              <li>app-debug.apk · 4.2 MB</li>
              <li>signed v1 + v2</li>
            </ul>
          </div>
        </div>

        <div className="footer__bar">
          <span className="mono">Built with Kotlin for Android</span>
          <span className="mono footer__dot">·</span>
          <span className="mono">Educational demo — no network, no tracking</span>
        </div>
      </footer>
    </div>
  );
}
