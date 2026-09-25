import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Magnetic } from './Magnetic';

const LINKS = [
  { id: 'overview', label: 'Overview' },
  { id: 'kotlin', label: 'Kotlin' },
  { id: 'code', label: 'Code' },
  { id: 'build', label: 'Build' },
  { id: 'android', label: 'Android' },
  { id: 'compose', label: 'Compose' },
  { id: 'path', label: 'Learning Path' },
];

export const SECTION_LINKS = LINKS;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('overview');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 20);
      const line = 140;
      let current = LINKS[0].id;
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = l.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => document.body.classList.remove('nav-open');
  }, [open]);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`.trim()}>
        <nav className="nav__inner" aria-label="Primary">
          <a className="nav__logo" href="#overview" onClick={go('overview')} data-cursor="link">
            <span className="nav__mark" aria-hidden="true" />
            <span>KOTLIN</span>
            <span className="nav__sep">/</span>
            <span>ANDROID</span>
          </a>

          <div className="nav__links">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                className={`nav__link ${active === l.id ? 'is-active' : ''}`.trim()}
                data-cursor="link"
                aria-current={active === l.id ? 'true' : undefined}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="nav__cta">
            <Magnetic strength={0.24}>
              <a className="btn btn--primary btn--sm" href="#code" onClick={go('code')} data-cursor="link">
                Start Building <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
          </div>

          <button
            className="nav__burger"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
            data-cursor="link"
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                data-cursor="link"
              >
                {l.label}
                <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              </motion.a>
            ))}
            <div className="mobile-menu__foot">
              <a className="btn btn--primary" href="#code" onClick={go('code')} data-cursor="link">
                Start Building <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="progress-rail" aria-hidden="true">
      <div className="progress-rail__fill" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

export function SkipLink(): ReactNode {
  return (
    <a
      className="sr-only"
      href="#overview"
      onFocus={(e) => e.currentTarget.classList.remove('sr-only')}
      onBlur={(e) => e.currentTarget.classList.add('sr-only')}
    >
      Skip to content
    </a>
  );
}
