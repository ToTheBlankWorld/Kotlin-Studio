import { useEffect } from 'react';
import { store } from './store';
import { bindPointer } from './lib/pointer';
import { useDeviceTier, usePrefersReducedMotion } from './hooks/useMediaQuery';
import { PhoneScene } from './phone/PhoneScene';
import { Cursor } from './components/Cursor';
import { Nav, ScrollProgress, SkipLink } from './components/Nav';
import { ApkFlight } from './components/overlays/ApkFlight';
import { Hero } from './components/sections/Hero';
import { Concepts } from './components/sections/Concepts';
import { Playground } from './components/sections/Playground';
import { Pipeline } from './components/sections/Pipeline';
import { Launch } from './components/sections/Launch';
import { ComposeLab } from './components/sections/ComposeLab';
import { Features } from './components/sections/Features';
import { Comparison } from './components/sections/Comparison';
import { Terminal } from './components/sections/Terminal';
import { LearningPath } from './components/sections/LearningPath';
import { Final } from './components/sections/Final';

export default function App() {
  const reduced = usePrefersReducedMotion();
  const tier = useDeviceTier();

  useEffect(() => {
    bindPointer();
    store.set({ reducedMotion: reduced, tier });
  }, [reduced, tier]);

  useEffect(() => {
    const t = setTimeout(() => store.set({ screen: 'app', build: 'success' }), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SkipLink />
      <div className="bg-field" aria-hidden="true" />
      <PhoneScene />
      <div className="shell">
        <Nav />
        <main>
          <Hero />
          <Concepts />
          <Playground />
          <Pipeline />
          <Launch />
          <ComposeLab />
          <Features />
          <Comparison />
          <Terminal />
          <LearningPath />
          <Final />
        </main>
      </div>
      <ApkFlight />
      <ScrollProgress />
      <Cursor />
      <div className="noise" aria-hidden="true" />
    </>
  );
}
