import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { store, useStore, frame, type Tab } from '../store';
import { STAGES, MOBILE_STAGES, type StagePose } from './stages';
import {
  PHONE,
  createDotTexture,
  createGlowTexture,
  createStudioCanvas,
  roundedPlane,
  slabGeometry,
} from './geometry';
import { SH, SW, drawPhoneScreen, getHotspots, screenTiming } from './screen';
import { pointerNDC, pointerState } from '../lib/pointer';
import { damp } from '../lib/math';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { installOnDevice, runBuild } from '../lib/sequence';

/* ------------------------------------------------------------------ */
/* environment                                                         */
/* ------------------------------------------------------------------ */

/** Shared with the <Canvas camera> props below. */
const CAM_FOV = 32;
const CAM_Z = 6.4;
const HALF_TAN = Math.tan((CAM_FOV * Math.PI) / 360);

/**
 * Poses are authored against a wide desktop frame; on narrower frames the
 * authored x can push the device past the right edge. Slide it back in just
 * far enough to keep the whole silhouette on screen. Parked poses (x >= 3)
 * are left alone so they stay parked.
 */
function fitToViewport(pose: StagePose, width: number, height: number, camZ: number) {
  const x = pose.pos[0];
  if (x <= 0 || x >= 3) return x;
  const halfW = (camZ - pose.pos[2]) * HALF_TAN * (width / Math.max(1, height));
  const halfPhone =
    0.5 *
    pose.scale *
    (Math.abs(Math.cos(pose.rot[1])) * PHONE.w + Math.abs(Math.sin(pose.rot[1])) * PHONE.d);
  const maxX = halfW - 0.18 - halfPhone;
  return maxX > 0 ? Math.min(x, maxX) : x;
}

function StudioEnv() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const tex = new THREE.CanvasTexture(createStudioCanvas());
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(tex);
    scene.environment = target.texture;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      tex.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#c8d4ff', '#06060a', 0.42]} />
      <directionalLight
        position={[2.6, 6.8, 3.9]}
        intensity={2.5}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={26}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4.4, 1.4, -2.4]} intensity={1.85} color="#8b5cff" />
      <directionalLight position={[4.6, -1.6, -3.2]} intensity={1.15} color="#ff8a3d" />
      <pointLight position={[0, 0.1, 1.8]} intensity={1.35} color="#9db2ff" distance={7} decay={2} />
    </>
  );
}

function ShadowFloor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.06, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <shadowMaterial transparent opacity={0.34} color="#000000" />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* particles + halo                                                    */
/* ------------------------------------------------------------------ */

function Particles({ count, reduced }: { count: number; reduced: boolean }) {
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color('#7f52ff'), new THREE.Color('#41d4ff'), new THREE.Color('#ff8a3d'), new THREE.Color('#ffffff')];
    for (let i = 0; i < count; i++) {
      const r = 2.4 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.5;
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.75;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1.2;
      const c = palette[Math.floor(Math.random() * palette.length)];
      const dim = 0.35 + Math.random() * 0.65;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;
    }
    return { positions, colors };
  }, [count]);

  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(createDotTexture());
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => tex.dispose(), [tex]);
  const ref = useRef<THREE.Points>(null);

  useFrame((state, dt) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += dt * 0.026;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.11) * 0.05;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.036}
        map={tex}
        transparent
        opacity={0.7}
        depthWrite={false}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function Halo() {
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(createGlowTexture(256, '140,100,255'));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <mesh position={[0, 0, -0.55]}>
      <planeGeometry args={[4.4, 6]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* the device                                                          */
/* ------------------------------------------------------------------ */

function ScreenSurface({
  active,
  reduced,
  meshRef,
}: {
  active: boolean;
  reduced: boolean;
  meshRef: RefObject<THREE.Mesh | null>;
}) {
  const gl = useThree((s) => s.gl);

  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = SW;
    c.height = SH;
    return c;
  }, []);

  const ctx = useMemo(() => canvas.getContext('2d', { alpha: false })!, [canvas]);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    return t;
  }, [canvas, gl]);

  useEffect(() => () => texture.dispose(), [texture]);

  const sigRef = useRef('');
  const timeRef = useRef({ last: 0 });

  useFrame(() => {
    const now = performance.now();
    const s = store.get();
    const sig = [
      s.screen, s.tab, s.runPhase, s.progress, s.runProgress, s.build,
      s.compose.text, s.compose.button, s.compose.dark, s.compose.accent, s.compose.pulse,
    ].join('|');
    const dirty = sig !== sigRef.current;
    const { local } = screenTiming(s, now);
    const entrance = local < (s.screen === 'launcher' ? 6 : 1.7);
    const busy =
      (s.screen === 'install' && s.progress < 1) ||
      (s.tab === 'run' && s.runPhase === 'running');
    const ambient = active && !reduced && s.screen === 'launcher';
    const throttled = now - timeRef.current.last > 42;

    if (dirty || entrance || busy || (ambient && throttled)) {
      drawPhoneScreen(ctx, s, now, { active, reduced });
      texture.needsUpdate = true;
      sigRef.current = sig;
      timeRef.current.last = now;
    }
  });

  const w = PHONE.w - PHONE.bezel * 2;
  const h = PHONE.h - PHONE.bezel * 2;

  return (
    <mesh ref={meshRef} position={[0, 0, PHONE.d / 2 + 0.0015]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} color="#e9edf5" toneMapped={false} />
    </mesh>
  );
}

function PhoneModel({
  active,
  reduced,
  shadows,
  screenRef,
}: {
  active: boolean;
  reduced: boolean;
  shadows: boolean;
  screenRef: RefObject<THREE.Mesh | null>;
}) {
  const geos = useMemo(() => {
    const body = slabGeometry(PHONE.w, PHONE.h, PHONE.d, PHONE.r, 0.018);
    const back = roundedPlane(PHONE.w - 0.016, PHONE.h - 0.016, PHONE.r - 0.008);
    const plate = slabGeometry(0.3, 0.38, 0.026, 0.075, 0.008);
    const button = slabGeometry(0.05, 0.17, 0.016, 0.008, 0.005);
    const buttonLong = slabGeometry(0.05, 0.26, 0.016, 0.008, 0.005);
    return { body, back, plate, button, buttonLong };
  }, []);

  useEffect(
    () => () => {
      Object.values(geos).forEach((g) => g.dispose());
    },
    [geos],
  );

  const lensOuter = useMemo(() => new THREE.CylinderGeometry(0.062, 0.062, 0.03, 40), []);
  const lensGlass = useMemo(() => new THREE.SphereGeometry(0.05, 24, 16), []);
  const punch = useMemo(() => new THREE.CircleGeometry(0.017, 32), []);

  useEffect(
    () => () => {
      lensOuter.dispose();
      lensGlass.dispose();
      punch.dispose();
    },
    [lensOuter, lensGlass, punch],
  );

  const sw = PHONE.w - PHONE.bezel * 2;
  const sh = PHONE.h - PHONE.bezel * 2;
  void sw;

  return (
    <group>
      {/* chassis */}
      <mesh geometry={geos.body} castShadow={shadows} receiveShadow={shadows}>
        <meshPhysicalMaterial
          color="#24262d"
          metalness={0.92}
          roughness={0.31}
          clearcoat={0.6}
          clearcoatRoughness={0.18}
          envMapIntensity={1.45}
        />
      </mesh>

      {/* back glass */}
      <mesh geometry={geos.back} position={[0, 0, -PHONE.d / 2 - 0.0015]} rotation-y={Math.PI}>
        <meshPhysicalMaterial
          color="#0d0e13"
          metalness={0.35}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* camera island */}
      <group position={[-0.19, 0.5, -PHONE.d / 2 - 0.02]} rotation-y={Math.PI}>
        <mesh geometry={geos.plate} castShadow={shadows}>
          <meshPhysicalMaterial color="#171922" metalness={0.7} roughness={0.3} envMapIntensity={1.2} />
        </mesh>
        {[
          [-0.06, 0.1],
          [0.07, -0.09],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, -0.022]} rotation-x={Math.PI / 2}>
            <mesh geometry={lensOuter}>
              <meshStandardMaterial color="#0a0b10" metalness={0.95} roughness={0.22} envMapIntensity={1.6} />
            </mesh>
            <mesh geometry={lensGlass} position={[0, 0.014, 0]} scale={[1, 0.42, 1]}>
              <meshPhysicalMaterial color="#05060c" metalness={0.2} roughness={0.05} clearcoat={1} envMapIntensity={2.4} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.07, 0.11, -0.018]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.024, 0.024, 0.014, 24]} />
          <meshStandardMaterial color="#3a3d47" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* side buttons */}
      <mesh
        geometry={geos.button}
        position={[PHONE.w / 2 + 0.004, 0.18, 0]}
        rotation-y={Math.PI / 2}
        castShadow={shadows}
      >
        <meshStandardMaterial color="#2c2f37" metalness={0.95} roughness={0.25} envMapIntensity={1.4} />
      </mesh>
      <mesh
        geometry={geos.buttonLong}
        position={[PHONE.w / 2 + 0.004, -0.09, 0]}
        rotation-y={Math.PI / 2}
        castShadow={shadows}
      >
        <meshStandardMaterial color="#2c2f37" metalness={0.95} roughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {/* screen */}
      <ScreenSurface active={active} reduced={reduced} meshRef={screenRef} />
      {/* punch-hole camera */}
      <mesh geometry={punch} position={[0, sh / 2 - 0.048, PHONE.d / 2 + 0.004]}>
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>
      {/* cover glass */}
      <mesh position={[0, 0, PHONE.d / 2 + 0.006]}>
        <planeGeometry args={[PHONE.w - 0.008, PHONE.h - 0.008]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          color="#ffffff"
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          envMapIntensity={3}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* rig: stages, motion, interaction                                    */
/* ------------------------------------------------------------------ */

function handleHotspot(id: string) {
  const s = store.get();
  if (id.startsWith('tab:')) {
    store.set({ tab: id.slice(4) as Tab });
    return;
  }
  if (id === 'fab' || id === 'run') {
    store.set({ tab: 'run' });
    void runBuild();
    return;
  }
  if (id === 'open') {
    store.set({ screen: 'app', build: 'success', tab: 'builds' });
    return;
  }
  if (id === 'open-app') {
    void installOnDevice();
    return;
  }
  if (id === 'compose-btn') {
    store.set({ compose: { ...s.compose, pulse: s.compose.pulse + 1 } });
    return;
  }
  if (id === 'compose-bar') {
    store.set({ compose: { ...s.compose, dark: !s.compose.dark } });
  }
}

function PhoneRig({
  isMobile,
  reduced,
  shadows,
}: {
  isMobile: boolean;
  reduced: boolean;
  shadows: boolean;
}) {
  const stage = useStore((s) => s.stage);
  const screenActive = useStore((s) => s.screen !== 'off');

  const root = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const anchor = useRef<THREE.Object3D>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const uv = useRef<THREE.Vector2 | null>(null);
  const impulse = useRef(0);
  const prevScreen = useRef(store.get().screen);
  const prevBuild = useRef(store.get().build);

  const pose: StagePose = (isMobile ? MOBILE_STAGES : STAGES)[stage];

  const smooth = useRef({
    px: STAGES.hidden.pos[0],
    py: 0,
    pz: 0,
    rx: 0,
    ry: -0.6,
    rz: 0,
    s: 0.85,
  });

  const camera = useThree((s) => s.camera);

  useEffect(
    () =>
      store.subscribe(() => {
        const s = store.get();
        if (!s.reducedMotion) {
          if (s.screen === 'app' && prevScreen.current !== 'app') impulse.current = 1;
          if (s.build === 'installed' && prevBuild.current !== 'installed')
            impulse.current = Math.max(impulse.current, 0.4);
        }
        prevScreen.current = s.screen;
        prevBuild.current = s.build;
      }),
    [],
  );

  const _v = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const m = smooth.current;

    m.px = damp(
      m.px,
      fitToViewport(pose, state.size.width, state.size.height, state.camera.position.z),
      2.7,
      dt,
    );
    m.py = damp(m.py, pose.pos[1], 2.7, dt);
    m.pz = damp(m.pz, pose.pos[2], 2.7, dt);
    m.rx = damp(m.rx, pose.rot[0], 3.1, dt);
    m.ry = damp(m.ry, pose.rot[1], 3.1, dt);
    m.rz = damp(m.rz, pose.rot[2], 3.1, dt);
    m.s = damp(m.s, pose.scale, 2.7, dt);

    impulse.current = damp(impulse.current, 0, 2.8, dt);

    if (root.current) {
      root.current.position.set(m.px, m.py, m.pz);
      root.current.scale.setScalar(m.s);
    }

    const mx = pointerState.active ? pointerNDC.x : 0;
    const my = pointerState.active ? pointerNDC.y : 0;
    const calm = reduced ? 0.15 : 1;

    if (inner.current) {
      const floatY = reduced ? 0 : Math.sin(t * 0.5) * 0.032;
      const floatR = reduced ? 0 : Math.sin(t * 0.38 + 1.1) * 0.01;
      inner.current.position.y = floatY;
      inner.current.rotation.x =
        m.rx + impulse.current * 0.08 - my * 0.13 * calm + (reduced ? 0 : Math.cos(t * 0.42) * 0.009);
      inner.current.rotation.y = m.ry + mx * 0.22 * calm + impulse.current * 0.2 + floatR;
      inner.current.rotation.z = m.rz + (reduced ? 0 : Math.sin(t * 0.34) * 0.008);
      inner.current.scale.setScalar(1 + impulse.current * 0.04);
    }

    const targetCamX = reduced || isMobile ? 0 : mx * 0.16;
    const targetCamY = reduced || isMobile ? 0 : my * 0.11;
    camera.position.x = damp(camera.position.x, targetCamX, 2.4, dt);
    camera.position.y = damp(camera.position.y, targetCamY, 2.4, dt);

    // project the screen centre to viewport pixels for the APK flight
    if (anchor.current) {
      anchor.current.getWorldPosition(_v);
      _v.project(camera);
      frame.phoneScreenPx.x = (_v.x * 0.5 + 0.5) * window.innerWidth;
      frame.phoneScreenPx.y = (-_v.y * 0.5 + 0.5) * window.innerHeight;
    }

    // hover raycast against the invisible interaction plane
    if (screenRef.current && pointerState.active && screenActive) {
      ndc.set(pointerNDC.x, pointerNDC.y);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(screenRef.current, false);
      uv.current = hit.length > 0 && hit[0].uv ? hit[0].uv.clone() : null;
    } else {
      uv.current = null;
    }
    pointerState.phoneHover = uv.current !== null;
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const cur = uv.current;
      if (!cur) return;
      const el = e.target as HTMLElement | null;
      if (el && el.closest('button, a, input, textarea, select, [data-interactive]')) return;
      const x = cur.x * SW;
      const y = (1 - cur.y) * SH;
      const spots = getHotspots(store.get());
      const hit = spots.find(
        (sp) => x >= sp.x && x <= sp.x + sp.w && y >= sp.y && y <= sp.y + sp.h,
      );
      if (hit) handleHotspot(hit.id);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  return (
    <group ref={root}>
      <group ref={inner}>
        <Halo />
        <PhoneModel
          active={screenActive}
          reduced={reduced}
          shadows={shadows}
          screenRef={screenRef}
        />
        <group ref={anchor} position={[0, 0, PHONE.d / 2 + 0.02]} />
        {shadows && <ShadowFloor />}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* scene                                                               */
/* ------------------------------------------------------------------ */

export function PhoneScene() {
  const reduced = useStore((s) => s.reducedMotion);
  const tier = useStore((s) => s.tier);
  const stage = useStore((s) => s.stage);
  const isMobile = useMediaQuery('(max-width: 880px)');

  const [pageHidden, setPageHidden] = useState(false);
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const onVis = () => setPageHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (stage !== 'hidden' && !pageHidden) {
      setAlive(true);
      return;
    }
    const t = setTimeout(() => setAlive(false), 1600);
    return () => clearTimeout(t);
  }, [stage, pageHidden]);

  const dpr: [number, number] =
    tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.6] : [1, 1];
  const shadows = tier !== 'low';
  const particles = tier === 'high' ? 420 : tier === 'medium' ? 190 : 80;
  const frameloop = alive && !pageHidden ? 'always' : 'never';

  return (
    <div className="canvas-layer">
      <Canvas
        dpr={dpr}
        shadows={shadows}
        frameloop={frameloop}
        camera={{ fov: CAM_FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
        gl={{
          antialias: tier !== 'low',
          alpha: true,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <StudioEnv />
          <Lights shadows={shadows} />
          <Particles count={particles} reduced={reduced} />
          <PhoneRig isMobile={isMobile} reduced={reduced} shadows={shadows} />
        </Suspense>
      </Canvas>
    </div>
  );
}
