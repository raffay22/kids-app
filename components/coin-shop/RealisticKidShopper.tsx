"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  capsule,
  ellipsoid,
  mesh as sdfMesh,
  noise3,
  rgb,
  smax,
  smin,
  sphere,
  ssub,
} from "@/components/trolley/sculpt/sdf";
import type { ShopperChoice, TrolleyShelfItem } from "@/utils/trolleyCatalog";

const DEG = THREE.MathUtils.degToRad;
const sculptCache = new Map<string, THREE.BufferGeometry>();

function mixColor(a: number[], b: number[], t: number): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function smoothStep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function getSculptedGeometry(
  key: string,
  fn: (p: number[]) => number,
  bounds: [[number, number, number], [number, number, number]],
  step: number,
  colorFn?: (p: number[]) => number[],
): THREE.BufferGeometry {
  const hit = sculptCache.get(key);
  if (hit) return hit;
  const geo = sdfMesh(fn, bounds, step, colorFn ?? null);
  sculptCache.set(key, geo);
  return geo;
}

type KidLookConfig = {
  skin: string;
  shirt: string;
  jacket: string;
  pants: string;
  shoes: string;
  hair: string;
  iris: string;
  accent: string;
};

const BOY_CONFIG: KidLookConfig = {
  skin: "#f1b896",
  shirt: "#38bdf8",
  jacket: "#1d4ed8",
  pants: "#1e293b",
  shoes: "#ef4444",
  hair: "#3b2314",
  iris: "#4a3222",
  accent: "#facc15",
};

const GIRL_CONFIG: KidLookConfig = {
  skin: "#f4bfa0",
  shirt: "#fdf2f8",
  jacket: "#ec4899",
  pants: "#7e22ce",
  shoes: "#f43f5e",
  hair: "#5c2c16",
  iris: "#1d4ed8",
  accent: "#f472b6",
};

function useKidSculptParts(shopper: ShopperChoice) {
  const cfg = shopper === "boy" ? BOY_CONFIG : GIRL_CONFIG;
  return useMemo(() => {
    const S = rgb(cfg.skin);
    const SH = rgb(cfg.shirt);
    const JK = rgb(cfg.jacket);
    const PA = rgb(cfg.pants);
    const SO = rgb(cfg.shoes);
    const HA = rgb(cfg.hair);

    // 1. Organic child torso with jacket & shirt collar
    const torsoGeo = getSculptedGeometry(
      `kid-torso-${shopper}`,
      (p) => {
        let d = ellipsoid(p, [0, 0.31, 0], [0.175, 0.165, 0.118]);
        d = smin(d, ellipsoid(p, [0, 0.12, 0.01], [0.16, 0.16, 0.112]), 0.075);
        d = smin(d, ellipsoid(p, [0, -0.03, 0], [0.162, 0.1, 0.108]), 0.065);
        d = smin(d, capsule(p, [-0.155, 0.4, -0.005], [0.155, 0.4, -0.005], 0.058), 0.065);
        d = smin(d, capsule(p, [0, 0.43, -0.005], [0, 0.56, 0.0], 0.05, 0.046), 0.045);
        return d;
      },
      [
        [-0.25, -0.15, -0.15],
        [0.25, 0.6, 0.16],
      ],
      0.012,
      (p) => {
        const neck = ellipsoid(p, [0, 0.52, 0.03], [0.075, 0.08, 0.08]);
        const centerV = Math.abs(p[0]) < 0.055 && p[2] > 0.03 ? 1 : 0;
        const shirtOrJacket = mixColor(JK, SH, centerV);
        const top = mixColor(shirtOrJacket, S, smoothStep(0.01, -0.01, neck));
        return mixColor(PA, top, smoothStep(0.0, 0.03, p[1]));
      },
    );

    // 2. Sculpted child head with cheeks, nose, ears, eye sockets, and warm smile
    const headGeo = getSculptedGeometry(
      `kid-head-${shopper}`,
      (p) => {
        let d = ellipsoid(p, [0, 0.155, -0.004], [0.122, 0.136, 0.126]);
        // Cute chubby toddler/child cheeks
        d = smin(d, ellipsoid(p, [0, 0.08, 0.035], [0.106, 0.086, 0.098]), 0.05);
        d = smin(d, ellipsoid(p, [0, 0.024, 0.062], [0.048, 0.034, 0.04]), 0.038);
        for (const s of [-1, 1]) {
          // Chubby cheek apples
          d = smin(d, ellipsoid(p, [s * 0.06, 0.082, 0.078], [0.044, 0.036, 0.036]), 0.032);
          // Ears
          d = smin(d, ellipsoid(p, [s * 0.12, 0.112, -0.005], [0.02, 0.035, 0.025]), 0.014);
          // Eye sockets
          d = ssub(d, sphere(p, [s * 0.046, 0.13, 0.118], 0.027), 0.016);
        }
        // Cute button nose
        d = smin(d, capsule(p, [0, 0.124, 0.11], [0, 0.095, 0.126], 0.011, 0.016), 0.018);
        d = smin(d, sphere(p, [0, 0.09, 0.124], 0.018), 0.015);
        // Smiling lips & mouth dimple
        d = smin(d, ellipsoid(p, [0, 0.05, 0.112], [0.03, 0.012, 0.014]), 0.012);
        d = ssub(d, capsule(p, [-0.028, 0.048, 0.124], [0.028, 0.048, 0.124], 0.0045), 0.005);
        return smin(d, capsule(p, [0, -0.04, -0.005], [0, 0.05, 0.005], 0.048), 0.038);
      },
      [
        [-0.16, -0.06, -0.15],
        [0.16, 0.31, 0.17],
      ],
      0.0075,
      (p) => {
        // Subtle rosy cheek blush in vertex colors
        const blushL = Math.hypot(p[0] + 0.065, p[1] - 0.082, p[2] - 0.095);
        const blushR = Math.hypot(p[0] - 0.065, p[1] - 0.082, p[2] - 0.095);
        const blush = Math.max(
          smoothStep(0.045, 0.01, blushL),
          smoothStep(0.045, 0.01, blushR),
        );
        return mixColor(S, [0.96, 0.52, 0.58], blush * 0.38);
      },
    );

    // 3. Sculpted hair: Boy keeps his exact sporty quiff; Girl gets lush flowing shoulder-length hair with side-swept bangs
    const hairGeo =
      shopper === "boy"
        ? getSculptedGeometry(
            `kid-hair-boy`,
            (p) => {
              let d = ellipsoid(p, [0, 0.175, -0.014], [0.132, 0.146, 0.138]);
              const line = 0.052 + 0.16 * Math.min(1, Math.max(0, (p[2] + 0.04) / 0.15));
              d = smax(d, -(p[1] - line), 0.02);
              // Sporty front quiff wave
              d = smin(d, ellipsoid(p, [0.02, 0.275, 0.065], [0.092, 0.048, 0.08]), 0.04);
              d += 0.005 * noise3(p[0] * 38, p[1] * 24, p[2] * 38);
              for (const s of [-1, 1]) {
                d = Math.min(
                  d,
                  capsule(
                    p,
                    [s * 0.024, 0.168, 0.125],
                    [s * 0.068, 0.172, 0.114],
                    0.007,
                    0.0055,
                  ),
                );
              }
              return d;
            },
            [
              [-0.17, 0.02, -0.17],
              [0.17, 0.34, 0.17],
            ],
            0.0085,
            () => HA,
          )
        : getSculptedGeometry(
            `kid-hair-girl-flowing-v3`,
            (p) => {
              // Full crown & top volume
              let d = ellipsoid(p, [0, 0.185, -0.016], [0.136, 0.148, 0.142]);
              // Carve out the front face window so eyes, cheeks, nose, and smile are 100% clear
              const faceCut = ellipsoid(p, [0, 0.095, 0.075], [0.106, 0.112, 0.095]);
              d = ssub(d, faceCut, 0.018);

              // Soft side-swept curtain bangs sitting neatly above the eyebrows
              d = smin(
                d,
                capsule(p, [-0.09, 0.205, 0.078], [-0.012, 0.242, 0.104], 0.032, 0.026),
                0.025,
              );
              d = smin(
                d,
                capsule(p, [0.012, 0.242, 0.104], [0.09, 0.202, 0.078], 0.026, 0.032),
                0.025,
              );

              // Face-framing side locks draping down past the ears to the shoulders
              for (const s of [-1, 1]) {
                d = smin(
                  d,
                  capsule(
                    p,
                    [s * 0.122, 0.165, 0.015],
                    [s * 0.132, -0.035, 0.008],
                    0.036,
                    0.026,
                  ),
                  0.028,
                );
              }

              // Lush wavy back hair cascade flowing smoothly down over the back & shoulders
              for (const x of [-0.095, -0.048, 0, 0.048, 0.095]) {
                const waveZ = Math.cos(x * 24) * 0.01;
                d = smin(
                  d,
                  capsule(
                    p,
                    [x * 0.92, 0.16, -0.075],
                    [x * 1.12, -0.085, -0.112 + waveZ],
                    0.046,
                    0.038,
                  ),
                  0.032,
                );
              }

              // Subtle silky hair strand texture
              d += 0.0032 * noise3(p[0] * 48, p[1] * 18, p[2] * 48);

              // Sculpted eyebrows
              for (const s of [-1, 1]) {
                d = Math.min(
                  d,
                  capsule(
                    p,
                    [s * 0.024, 0.168, 0.125],
                    [s * 0.068, 0.172, 0.114],
                    0.0068,
                    0.0052,
                  ),
                );
              }
              return d;
            },
            [
              [-0.18, -0.14, -0.18],
              [0.18, 0.35, 0.17],
            ],
            0.0085,
            () => HA,
          );

    // 4. Upper arm
    const uarmGeo = getSculptedGeometry(
      `kid-uarm-${shopper}`,
      (p) =>
        smin(
          capsule(p, [0, 0, 0], [0, -0.24, 0], 0.046, 0.038),
          capsule(p, [0, 0, 0], [0, -0.14, 0], 0.058, 0.052),
          0.02,
        ),
      [
        [-0.08, -0.29, -0.08],
        [0.08, 0.07, 0.08],
      ],
      0.009,
      (p) => mixColor(S, JK, smoothStep(-0.15, -0.13, p[1])),
    );

    // 5. Forearm + sculpted hand & thumb
    const farmGeoL = getSculptedGeometry(
      `kid-farm-L-${shopper}`,
      (p) => {
        let d = capsule(p, [0, 0, 0], [0, -0.2, 0.005], 0.037, 0.03);
        d = smin(d, ellipsoid(p, [0, -0.25, 0.008], [0.039, 0.05, 0.022]), 0.025);
        d = smin(d, capsule(p, [0.026, -0.23, 0.018], [0.038, -0.27, 0.035], 0.012, 0.01), 0.012);
        return d;
      },
      [
        [-0.07, -0.33, -0.06],
        [0.07, 0.05, 0.07],
      ],
      0.009,
      () => S,
    );

    const farmGeoR = getSculptedGeometry(
      `kid-farm-R-${shopper}`,
      (p) => {
        let d = capsule(p, [0, 0, 0], [0, -0.2, 0.005], 0.037, 0.03);
        d = smin(d, ellipsoid(p, [0, -0.25, 0.008], [0.039, 0.05, 0.022]), 0.025);
        d = smin(d, capsule(p, [-0.026, -0.23, 0.018], [-0.038, -0.27, 0.035], 0.012, 0.01), 0.012);
        return d;
      },
      [
        [-0.07, -0.33, -0.06],
        [0.07, 0.05, 0.07],
      ],
      0.009,
      () => S,
    );

    // 6. Thigh
    const thighGeo = getSculptedGeometry(
      `kid-thigh-${shopper}`,
      (p) => capsule(p, [0, 0, 0], [0, -0.36, 0.005], 0.076, 0.056),
      [
        [-0.09, -0.44, -0.09],
        [0.09, 0.09, 0.09],
      ],
      0.011,
      () => PA,
    );

    // 7. Shin + sneaker shoe
    const shinGeo = getSculptedGeometry(
      `kid-shin-${shopper}`,
      (p) => {
        let d = capsule(p, [0, 0, 0], [0, -0.33, -0.005], 0.054, 0.044);
        d = smin(d, ellipsoid(p, [0, -0.38, 0.045], [0.056, 0.048, 0.115]), 0.038);
        return smax(d, -(p[1] + 0.425), 0.01);
      },
      [
        [-0.08, -0.44, -0.09],
        [0.08, 0.06, 0.18],
      ],
      0.01,
      (p) => {
        if (p[1] < -0.395) return [0.97, 0.97, 0.98]; // White rubber sneaker sole
        if (p[1] < -0.31) return SO; // Sneaker body
        return PA;
      },
    );

    return {
      cfg,
      torsoGeo,
      headGeo,
      hairGeo,
      uarmGeo,
      farmGeoL,
      farmGeoR,
      thighGeo,
      shinGeo,
    };
  }, [shopper, cfg]);
}

/**
 * Articulated 3D Human Kid (Boy or Girl) built from organic SDF surface-nets meshes
 * with blinking eyelids, glossy eyes that track targets, pigtails/skirt for Girl,
 * varsity hoodie/cap details for Boy, and natural walking/pushing/celebrating kinematics.
 */
export function SculptedKidCharacter({
  shopper,
  travelRef,
  celebrateKey = 0,
  lookSide = 0,
  mode = "pushing",
}: {
  shopper: ShopperChoice;
  travelRef?: React.MutableRefObject<number>;
  celebrateKey?: number;
  /** -1 = look at left shelf, 0 = look ahead, +1 = look at right shelf */
  lookSide?: number;
  /** "pushing" = hands on trolley bar facing -Z; "preview" = facing +Z waving in character picker */
  mode?: "pushing" | "preview";
}) {
  const parts = useKidSculptParts(shopper);
  const rootRef = useRef<THREE.Group>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const shLRef = useRef<THREE.Group>(null);
  const elLRef = useRef<THREE.Group>(null);
  const shRRef = useRef<THREE.Group>(null);
  const elRRef = useRef<THREE.Group>(null);
  const hipLRef = useRef<THREE.Group>(null);
  const knLRef = useRef<THREE.Group>(null);
  const hipRRef = useRef<THREE.Group>(null);
  const knRRef = useRef<THREE.Group>(null);
  const lidLRef = useRef<THREE.Mesh>(null);
  const lidRRef = useRef<THREE.Mesh>(null);
  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);

  const walkPhase = useRef(0);
  const celebrateTimer = useRef(0);
  const smoothLookYaw = useRef(0);

  useEffect(() => {
    if (celebrateKey > 0) {
      celebrateTimer.current = 1.15;
    }
  }, [celebrateKey]);

  const skinMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.48,
        sheen: 0.42,
        sheenRoughness: 0.65,
        sheenColor: new THREE.Color("#ffd6c2"),
        clearcoat: 0.08,
        clearcoatRoughness: 0.5,
      }),
    [],
  );

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime();
    const dir = travelRef?.current ?? 0;
    const isMoving = dir !== 0;

    if (isMoving) {
      walkPhase.current += dt * (dir < 0 ? 7.8 : -7.8);
    } else {
      // Gently settle walk phase toward nearest rest stance
      walkPhase.current = THREE.MathUtils.lerp(walkPhase.current, 0, Math.min(1, dt * 6));
    }

    if (celebrateTimer.current > 0) {
      celebrateTimer.current = Math.max(0, celebrateTimer.current - dt);
    }

    const ph = walkPhase.current;
    const stride = isMoving ? 1 : 0;
    const s = Math.sin(ph) * stride;
    const breathe = Math.sin(t * 2.4) * 0.012;
    const celeb = celebrateTimer.current > 0 ? Math.sin(celebrateTimer.current * Math.PI * 3) : 0;

    // Blink every ~3.4 seconds
    const blinkCycle = t % 3.4;
    const blink =
      blinkCycle < 0.14 ? Math.sin((blinkCycle / 0.14) * Math.PI) : 0;

    // Target head look yaw (-1 left shelf, +1 right shelf, or curious idle glance)
    const idleLook = isMoving ? Math.sin(t * 1.1) * 8 : Math.sin(t * 0.85) * 14;
    const targetYaw = lookSide !== 0 ? -lookSide * 28 : idleLook;
    smoothLookYaw.current = THREE.MathUtils.lerp(
      smoothLookYaw.current,
      targetYaw,
      Math.min(1, dt * 6),
    );

    // 1. Hips vertical bounce & lateral sway
    if (hipsRef.current) {
      const walkBob = isMoving ? Math.abs(Math.cos(ph)) * 0.028 : breathe * 0.5;
      const jumpBob = celebrateTimer.current > 0 ? Math.abs(celeb) * 0.09 : 0;
      hipsRef.current.position.y = 0.78 - walkBob + jumpBob;
      hipsRef.current.position.x = isMoving ? Math.cos(ph) * 0.015 : Math.sin(t * 1.2) * 0.008;
    }

    // 2. Spine lean & twist
    if (spineRef.current) {
      const forwardLean = mode === "pushing" ? (isMoving ? 8 : 4) : 0;
      spineRef.current.rotation.set(
        DEG(forwardLean + breathe * 60),
        DEG(s * 5),
        DEG(isMoving ? Math.cos(ph) * 2.5 : Math.sin(t * 1.2) * 1.5),
      );
    }

    // 3. Head & Eyes
    if (headRef.current) {
      const headPitch = mode === "pushing" ? (lookSide !== 0 ? 4 : -3) : Math.sin(t * 1.8) * 3;
      headRef.current.rotation.set(
        DEG(headPitch),
        DEG(smoothLookYaw.current),
        DEG(Math.sin(t * 1.4) * 3),
      );
    }
    if (eyeLRef.current && eyeRRef.current) {
      const eyeYaw = DEG(smoothLookYaw.current * 0.25);
      eyeLRef.current.rotation.y = eyeYaw;
      eyeRRef.current.rotation.y = eyeYaw;
    }
    if (lidLRef.current && lidRRef.current) {
      const lidRot = 0.1 + blink * 1.25;
      lidLRef.current.rotation.x = lidRot;
      lidRRef.current.rotation.x = lidRot;
    }

    // 4. Arms: either gripping the trolley handlebar (with celebration wave) or waving in preview
    if (shLRef.current && elLRef.current && shRRef.current && elRRef.current) {
      if (mode === "preview") {
        // Preview mode: left hand on hip / relaxed, right hand waving happily at the player!
        shLRef.current.rotation.set(DEG(-8), DEG(0), DEG(-14));
        elLRef.current.rotation.set(DEG(-22), 0, 0);
        const wave = Math.sin(t * 5.2) * 22;
        shRRef.current.rotation.set(DEG(-115), DEG(12), DEG(32 + wave * 0.4));
        elRRef.current.rotation.set(DEG(-45 - wave), 0, 0);
      } else if (celebrateTimer.current > 0) {
        // Happy two-hand cheer when a toy is purchased!
        const cheer = Math.sin(t * 14) * 18;
        shLRef.current.rotation.set(DEG(-125), 0, DEG(-24 - cheer));
        elLRef.current.rotation.set(DEG(-35), 0, 0);
        shRRef.current.rotation.set(DEG(-125), 0, DEG(24 + cheer));
        elRRef.current.rotation.set(DEG(-35), 0, 0);
      } else {
        // Gripping the trolley handlebar naturally
        shLRef.current.rotation.set(DEG(-48), DEG(6), DEG(-8));
        elLRef.current.rotation.set(DEG(-32), 0, 0);
        shRRef.current.rotation.set(DEG(-48), DEG(-6), DEG(8));
        elRRef.current.rotation.set(DEG(-32), 0, 0);
      }
    }

    // 5. Legs: full human walking stride
    if (hipLRef.current && knLRef.current && hipRRef.current && knRRef.current) {
      const hipSwingL = s * 30;
      const hipSwingR = -s * 30;
      const kneeBendL = Math.max(0, -Math.sin(ph + 0.65)) * 46 * stride + 4;
      const kneeBendR = Math.max(0, Math.sin(ph + 0.65)) * 46 * stride + 4;

      hipLRef.current.rotation.set(DEG(-hipSwingL), 0, DEG(-2));
      knLRef.current.rotation.set(DEG(kneeBendL), 0, 0);
      hipRRef.current.rotation.set(DEG(-hipSwingR), 0, DEG(2));
      knRRef.current.rotation.set(DEG(kneeBendR), 0, 0);
    }
  });

  // In "pushing" mode, rotate 180 deg around Y so the child faces -Z (down the supermarket aisle)
  const facingY = mode === "pushing" ? Math.PI : 0;

  return (
    <group
      ref={rootRef}
      position={mode === "pushing" ? [0, 0, 0.36] : [0, -0.58, 0]}
      rotation={[0, facingY, 0]}
      scale={mode === "pushing" ? 0.92 : 1.05}
    >
      <group ref={hipsRef} position={[0, 0.78, 0]}>
        {/* Girl's flared pleated skirt */}
        {shopper === "girl" && (
          <group position={[0, 0.01, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.145, 0.22, 0.22, 24]} />
              <meshPhysicalMaterial
                color="#f472b6"
                roughness={0.55}
                sheen={0.6}
                sheenColor="#fbcfe8"
              />
            </mesh>
            <mesh position={[0, -0.095, 0]}>
              <torusGeometry args={[0.215, 0.012, 8, 24]} />
              <meshStandardMaterial color="#fdf2f8" />
            </mesh>
          </group>
        )}

        {/* Spine & Torso */}
        <group ref={spineRef} position={[0, 0.04, 0]}>
          <mesh geometry={parts.torsoGeo} material={skinMaterial} castShadow receiveShadow />

          {/* Cute Kid Backpack */}
          <group position={[0, 0.25, -0.12]}>
            <RoundedBox args={[0.24, 0.26, 0.11]} radius={0.04} smoothness={3} castShadow>
              <meshPhysicalMaterial
                color={shopper === "boy" ? "#f59e0b" : "#a855f7"}
                roughness={0.4}
                clearcoat={0.4}
              />
            </RoundedBox>
            <RoundedBox
              args={[0.18, 0.12, 0.04]}
              radius={0.02}
              position={[0, -0.04, -0.055]}
              castShadow
            >
              <meshPhysicalMaterial
                color={shopper === "boy" ? "#38bdf8" : "#f472b6"}
                roughness={0.35}
              />
            </RoundedBox>
          </group>

          {/* Head */}
          <group ref={headRef} position={[0, 0.54, 0]}>
            <mesh geometry={parts.headGeo} material={skinMaterial} castShadow receiveShadow />
            <mesh geometry={parts.hairGeo} material={skinMaterial} castShadow receiveShadow />

            {/* Glossy 3D Eyeballs with Iris, Pupil, Dual Catchlights & Blinking Eyelids */}
            {([-1, 1] as const).map((s) => (
              <group key={s}>
                <group
                  ref={s < 0 ? eyeLRef : eyeRRef}
                  position={[s * 0.046, 0.13, 0.098]}
                >
                  <mesh>
                    <sphereGeometry args={[0.024, 24, 18]} />
                    <meshPhysicalMaterial color="#ffffff" roughness={0.12} clearcoat={1} />
                  </mesh>
                  <mesh position={[0, 0, 0.0235]}>
                    <circleGeometry args={[0.0125, 24]} />
                    <meshStandardMaterial color={parts.cfg.iris} roughness={0.25} />
                  </mesh>
                  <mesh position={[0, 0, 0.0238]}>
                    <circleGeometry args={[0.0065, 20]} />
                    <meshBasicMaterial color="#090d16" />
                  </mesh>
                  {/* Primary & Secondary Eye Sparkle Catchlights */}
                  <mesh position={[0.004, 0.0045, 0.0241]}>
                    <circleGeometry args={[0.0028, 12]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                  <mesh position={[-0.003, -0.0035, 0.0241]}>
                    <circleGeometry args={[0.0014, 10]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
                {/* Upper Blinking Eyelid */}
                <mesh
                  ref={s < 0 ? lidLRef : lidRRef}
                  position={[s * 0.046, 0.13, 0.098]}
                  rotation={[0.1, 0, 0]}
                >
                  <sphereGeometry args={[0.0255, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
                  <meshPhysicalMaterial
                    color={parts.cfg.skin}
                    roughness={0.5}
                    sheen={0.35}
                    sheenColor="#ffd6c2"
                  />
                </mesh>
              </group>
            ))}

            {/* Warm happy smile arc */}
            <mesh position={[0, 0.052, 0.122]} rotation={[0.2, 0, Math.PI]}>
              <torusGeometry args={[0.022, 0.0038, 8, 18, Math.PI]} />
              <meshStandardMaterial color="#be123c" roughness={0.4} />
            </mesh>

            {/* Girl's Cute 3D Pink Alice Headband & Ribbon Bow over her flowing hair */}
            {shopper === "girl" && (
              <group position={[0, 0.16, -0.005]}>
                {/* Curved Pink Headband */}
                <mesh rotation={[0.18, 0, 0]} castShadow>
                  <torusGeometry args={[0.136, 0.013, 12, 32, Math.PI]} />
                  <meshPhysicalMaterial color="#f43f5e" roughness={0.3} clearcoat={0.85} />
                </mesh>
                {/* Cute Side Ribbon Bow on Headband */}
                <group position={[0.11, 0.115, 0.03]} rotation={[0.15, -0.25, -0.55]}>
                  <mesh>
                    <sphereGeometry args={[0.018, 12, 10]} />
                    <meshPhysicalMaterial color="#fb7185" roughness={0.3} clearcoat={0.8} />
                  </mesh>
                  <mesh position={[-0.024, 0.004, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.022, 0.036, 12]} />
                    <meshPhysicalMaterial color="#f43f5e" roughness={0.3} clearcoat={0.85} />
                  </mesh>
                  <mesh position={[0.024, 0.004, 0]} rotation={[0, 0, -Math.PI / 2]}>
                    <coneGeometry args={[0.022, 0.036, 12]} />
                    <meshPhysicalMaterial color="#f43f5e" roughness={0.3} clearcoat={0.85} />
                  </mesh>
                </group>
              </group>
            )}

            {/* Boy's Sporty Two-Tone Cap Crown & Visor */}
            {shopper === "boy" && (
              <group position={[0, 0.22, 0]}>
                <mesh position={[0, 0.02, -0.01]} scale={[1.04, 0.65, 1.08]} castShadow>
                  <sphereGeometry args={[0.128, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                  <meshPhysicalMaterial color="#2563eb" roughness={0.4} clearcoat={0.3} />
                </mesh>
                <mesh position={[0, -0.01, -0.11]} rotation={[-0.22, 0, 0]} castShadow>
                  <boxGeometry args={[0.14, 0.016, 0.09]} />
                  <meshPhysicalMaterial color="#facc15" roughness={0.35} />
                </mesh>
              </group>
            )}
          </group>

          {/* Left Arm */}
          <group ref={shLRef} position={[-0.19, 0.4, -0.005]}>
            <mesh geometry={parts.uarmGeo} material={skinMaterial} castShadow receiveShadow />
            <group ref={elLRef} position={[0, -0.24, 0]}>
              <mesh geometry={parts.farmGeoL} material={skinMaterial} castShadow receiveShadow />
            </group>
          </group>

          {/* Right Arm */}
          <group ref={shRRef} position={[0.19, 0.4, -0.005]}>
            <mesh geometry={parts.uarmGeo} material={skinMaterial} castShadow receiveShadow />
            <group ref={elRRef} position={[0, -0.24, 0]}>
              <mesh geometry={parts.farmGeoR} material={skinMaterial} castShadow receiveShadow />
            </group>
          </group>
        </group>

        {/* Left Leg */}
        <group ref={hipLRef} position={[-0.085, -0.03, 0]}>
          <mesh geometry={parts.thighGeo} material={skinMaterial} castShadow receiveShadow />
          <group ref={knLRef} position={[0, -0.36, 0.005]}>
            <mesh geometry={parts.shinGeo} material={skinMaterial} castShadow receiveShadow />
          </group>
        </group>

        {/* Right Leg */}
        <group ref={hipRRef} position={[0.085, -0.03, 0]}>
          <mesh geometry={parts.thighGeo} material={skinMaterial} castShadow receiveShadow />
          <group ref={knRRef} position={[0, -0.36, 0.005]}>
            <mesh geometry={parts.shinGeo} material={skinMaterial} castShadow receiveShadow />
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Realistic Amazon-style Supermarket Shopping Trolley with spinning wheels,
 * chrome wire basket, front bumper guards, safety seat flap, and handlebar.
 */
function AmazonSupermarketTrolley({
  travelRef,
}: {
  travelRef: React.MutableRefObject<number>;
}) {
  const wheelRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, dt) => {
    const dir = travelRef.current;
    if (dir === 0) return;
    const spin = dir * dt * 14;
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x += spin;
    });
  });

  const wires: ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const y = 0.38 + i * 0.09;
    wires.push(
      <mesh key={`sl-${i}`} position={[-0.34, y, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.82, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.14} />
      </mesh>,
      <mesh key={`sr-${i}`} position={[0.34, y, -0.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.82, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.14} />
      </mesh>,
      <mesh key={`fr-${i}`} position={[0, y, -1.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.68, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.14} />
      </mesh>,
      <mesh key={`bk-${i}`} position={[0, y, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.68, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.14} />
      </mesh>,
    );
  }
  // Vertical basket ribs
  for (let i = 0; i < 5; i++) {
    const z = -0.46 - i * 0.185;
    wires.push(
      <mesh key={`vl-${i}`} position={[-0.34, 0.56, z]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.38, 6]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.18} />
      </mesh>,
      <mesh key={`vr-${i}`} position={[0.34, 0.56, z]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.38, 6]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.88} roughness={0.18} />
      </mesh>,
      <mesh key={`fl-${i}`} position={[0, 0.36, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.66, 6]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.16} />
      </mesh>,
    );
  }

  return (
    <group>
      {wires}
      {/* Lower chassis tray */}
      <mesh position={[0, 0.2, -0.82]} castShadow>
        <boxGeometry args={[0.62, 0.028, 0.76]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.82} roughness={0.22} />
      </mesh>
      {/* Amazon-orange front bumper guard & side corner guards */}
      <RoundedBox args={[0.72, 0.075, 0.06]} radius={0.02} position={[0, 0.36, -1.24]} castShadow>
        <meshPhysicalMaterial color="#f97316" roughness={0.3} clearcoat={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.56, 0.11, 0.04]} radius={0.015} position={[0, 0.76, -1.24]} castShadow>
        <meshPhysicalMaterial color="#f59e0b" roughness={0.3} clearcoat={0.8} />
      </RoundedBox>
      {/* 4 Spinning Caster Wheels */}
      {[
        [-0.28, -1.1],
        [0.28, -1.1],
        [-0.28, -0.54],
        [0.28, -0.54],
      ].map(([x, z], idx) => (
        <group
          key={`${x}-${z}`}
          position={[x, 0.095, z]}
          ref={(el) => {
            wheelRefs.current[idx] = el;
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.045, 18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.65} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.036, 0.036, 0.052, 12]} />
            <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Handlebar struts & ergonomic red/orange grip bar */}
      <mesh position={[-0.31, 0.62, -0.26]} rotation={[-0.32, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.56, 10]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.15} />
      </mesh>
      <mesh position={[0.31, 0.62, -0.26]} rotation={[-0.32, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.56, 10]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.92} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.87, -0.14]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.68, 16]} />
        <meshPhysicalMaterial color="#ef4444" roughness={0.28} clearcoat={0.85} />
      </mesh>
    </group>
  );
}

/**
 * Full 3D Kid + Amazon Trolley Rig for the 30-row Mega Mart.
 * Smoothly follows X and Z coordinates, banks/rotates into Left and Right path turns,
 * turns head toward selected shelf toys, and animates celebratory jumps on purchases.
 */
export default function RealisticKidShopper({
  shopper,
  trolleyXRef,
  trolleyZRef,
  travelRef,
  cartBounceKey,
  landedItems,
  lookSide = 0,
  renderCartItem,
}: {
  shopper: ShopperChoice;
  trolleyXRef: React.MutableRefObject<number>;
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  cartBounceKey: number;
  landedItems: TrolleyShelfItem[];
  lookSide?: number;
  renderCartItem?: (item: TrolleyShelfItem, scale: number) => ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const bounce = useRef(0);
  const prevX = useRef(0);
  const prevZ = useRef(2.55);
  const smoothYaw = useRef(0);

  useEffect(() => {
    if (cartBounceKey > 0) bounce.current = 1;
  }, [cartBounceKey]);

  useFrame((_, dt) => {
    const node = group.current;
    if (!node) return;
    let y = 0;
    if (bounce.current > 0) {
      y = Math.sin((1 - bounce.current) * Math.PI * 2) * 0.08;
      bounce.current = Math.max(0, bounce.current - dt * 1.6);
    }

    const curX = trolleyXRef.current;
    const curZ = trolleyZRef.current;
    const dx = curX - prevX.current;
    const dz = curZ - prevZ.current;
    prevX.current = curX;
    prevZ.current = curZ;

    // Calculate steering yaw when turning into Left Path or Right Path
    if (Math.abs(dx) > 0.0005 || Math.abs(dz) > 0.0005) {
      const targetYaw = Math.atan2(-dx, -dz) * 0.55;
      smoothYaw.current = THREE.MathUtils.lerp(
        smoothYaw.current,
        THREE.MathUtils.clamp(targetYaw, -0.65, 0.65),
        Math.min(1, dt * 8),
      );
    } else {
      smoothYaw.current = THREE.MathUtils.lerp(smoothYaw.current, 0, Math.min(1, dt * 6));
    }

    node.position.set(curX, y, curZ);
    node.rotation.y = smoothYaw.current;
  });

  return (
    <group ref={group}>
      <group position={[0, 0, -0.08]} scale={1.12}>
        <AmazonSupermarketTrolley travelRef={travelRef} />
      </group>
      <SculptedKidCharacter
        shopper={shopper}
        travelRef={travelRef}
        celebrateKey={cartBounceKey}
        lookSide={lookSide}
        mode="pushing"
      />
      {landedItems.map((item, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4) % 4;
        const layer = Math.floor(index / 16);
        return (
          <group
            key={`${item.id}-${index}`}
            position={[-0.21 + col * 0.14, 0.48 + layer * 0.14, -1.06 + row * 0.16]}
          >
            {renderCartItem ? renderCartItem(item, 0.36) : null}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Interactive 3D Character Portrait Canvas for the Boy / Girl selection cards
 * so the player sees real 3D animated human kids instead of 2D emojis.
 */
export function KidCharacterPreviewCanvas({ shopper }: { shopper: ShopperChoice }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.25, 1.85], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.5, 4, 3]} intensity={1.45} />
      <directionalLight position={[-2, 2, -1]} intensity={0.45} color="#bfdbfe" />
      <SculptedKidCharacter shopper={shopper} mode="preview" />
      <ContactShadows position={[0, -0.58, 0]} opacity={0.4} scale={2.5} blur={2} far={2} />
    </Canvas>
  );
}
