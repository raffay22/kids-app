"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import PremiumToyModel from "@/components/coin-shop/PremiumToyModel";
import RealisticKidShopper from "@/components/coin-shop/RealisticKidShopper";
import {
  CROSSROADS_INTERVAL,
  JUNCTION_COUNT,
  MART_DEPARTMENTS,
  PATH_SHIFT_X,
  SHOP_ROWS,
  blockAisleX,
  junctionZ,
  rowZ,
  shopGateZ,
  toyPosition,
  type MartPathChoice,
  type ShopToy,
} from "@/utils/coinShop";
import type { ShopperChoice, TrolleyShelfItem } from "@/utils/trolleyCatalog";

/**
 * Polished supermarket terrazzo tile floor spanning the entire 30-row Mega Mart
 * including Left Wing, Center Hall, and Right Wing corridors.
 */
function MartFloor({ length, startZ }: { length: number; startZ: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tilesX = 22;
  const tilesZ = Math.max(20, Math.ceil(length / 0.85));

  useEffect(() => {
    const board = mesh.current;
    if (!board) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let i = 0;
    for (let z = 0; z < tilesZ; z++) {
      for (let x = 0; x < tilesX; x++) {
        dummy.position.set((x - (tilesX - 1) / 2) * 0.85, 0, startZ - z * 0.85);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        board.setMatrixAt(i, dummy.matrix);
        const isChecker = (x + z) % 2 === 0;
        color.set(isChecker ? "#f8fafc" : "#e2e8f0");
        board.setColorAt(i, color);
        i++;
      }
    }
    board.instanceMatrix.needsUpdate = true;
    if (board.instanceColor) board.instanceColor.needsUpdate = true;
  }, [tilesX, tilesZ, startZ]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, tilesX * tilesZ]} receiveShadow>
      <planeGeometry args={[0.84, 0.84]} />
      <meshStandardMaterial roughness={0.35} metalness={0.08} />
    </instancedMesh>
  );
}

const signTextureCache = new Map<string, THREE.CanvasTexture>();

function useSignTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const hit = signTextureCache.get(key);
    if (hit) return hit;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    draw(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    signTextureCache.set(key, tex);
    return tex;
  }, [key, width, height, draw]);
}

/**
 * Clean Wooden 2-Tier Supermarket Shelf Bank for each row (Left or Right side).
 * Lower shelf plank at y = 0.46 (holds toy at y = 0.58) and Upper shelf plank at y = 1.36 (holds toy at y = 1.48).
 */
function MartGondolaBay({
  x,
  z,
  side,
  rowNumber,
  accentColor,
}: {
  x: number;
  z: number;
  side: -1 | 1;
  rowNumber: number;
  accentColor: string;
}) {
  const isLeft = side < 0;
  const plankX = x - side * 0.2;

  const badgeTex = useSignTexture(
    `row-badge-${rowNumber}-${accentColor}`,
    256,
    96,
    (ctx, w, h) => {
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`ROW ${rowNumber}`, w / 2, h / 2 + 2);
    },
  );

  return (
    <group>
      {/* Wooden Shelf Backboard */}
      <mesh position={[x, 1.02, z]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1.9, 2.95]} />
        <meshPhysicalMaterial
          color="#7a421c"
          roughness={0.78}
          clearcoat={0.15}
          clearcoatRoughness={0.7}
        />
      </mesh>
      {/* Row Number Sign Badge at Top of Shelf */}
      {badgeTex && (
        <mesh
          position={[x - side * 0.14, 1.84, z]}
          rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.68, 0.22]} />
          <meshBasicMaterial map={badgeTex} />
        </mesh>
      )}
      {/* Bottom Wooden Base */}
      <mesh position={[plankX, 0.08, z]} receiveShadow>
        <boxGeometry args={[0.72, 0.1, 2.85]} />
        <meshPhysicalMaterial color="#5c3214" roughness={0.84} />
      </mesh>
      {/* Lower Plank (y = 0.46) & Upper Plank (y = 1.36) — each holds a buyable 3D Toy + Price Tag */}
      {[0.46, 1.36].map((y) => (
        <mesh key={y} position={[plankX, y, z]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.07, 2.85]} />
          <meshPhysicalMaterial
            color="#d59a52"
            roughness={0.42}
            clearcoat={0.35}
            clearcoatRoughness={0.45}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Cross-Aisle Junction rendered after every 4 rows (Rows 4, 8, 12, 16, 20, 24, 28).
 * Shows an overhead illuminated Mart Junction Signboard, Left Wing & Right Wing archway portals,
 * and clickable 3D Floor Directional Arrow Pads ("⬅️ LEFT PATH" & "RIGHT PATH ➡️").
 */
function CrossroadsJunction({
  junctionIndex,
  centerX,
  chosenPath,
  isCurrentJunction,
  onChoosePath,
}: {
  junctionIndex: number;
  centerX: number;
  chosenPath?: MartPathChoice;
  isCurrentJunction: boolean;
  onChoosePath: (junctionIndex: number, choice: MartPathChoice) => void;
}) {
  const z = junctionZ(junctionIndex);
  const nextDept =
    MART_DEPARTMENTS[Math.min(MART_DEPARTMENTS.length - 1, junctionIndex + 1)];

  const overheadTex = useSignTexture(
    `junction-sign-${junctionIndex}-${chosenPath ?? "none"}`,
    1024,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, w - 14, h - 14);

      ctx.fillStyle = "#facc15";
      ctx.font = "900 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`MART CROSSROADS #${junctionIndex + 1} · ${nextDept.title}`, w / 2, 74);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "800 42px sans-serif";
      ctx.fillText("⬅️ LEFT AISLE PATH", w * 0.25, 175);

      ctx.fillStyle = "#4ade80";
      ctx.fillText("RIGHT AISLE PATH ➡️", w * 0.75, 175);
    },
  );

  const leftPadTex = useSignTexture(`pad-left-${chosenPath === "left"}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = chosenPath === "left" ? "#0284c7" : "#0369a1";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#bae6fd";
    ctx.lineWidth = 14;
    ctx.strokeRect(7, 7, w - 14, h - 14);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⬅️ LEFT PATH", w / 2, h / 2);
  });

  const rightPadTex = useSignTexture(
    `pad-right-${chosenPath === "right"}`,
    512,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = chosenPath === "right" ? "#16a34a" : "#15803d";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#bbf7d0";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, w - 14, h - 14);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 56px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("RIGHT PATH ➡️", w / 2, h / 2);
    },
  );

  return (
    <group position={[centerX, 0, z]}>
      {/* Cross-Corridor Coloured Floor Stripe */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <planeGeometry args={[12.5, 2.2]} />
        <meshStandardMaterial
          color={isCurrentJunction ? "#fef3c7" : "#e0f2fe"}
          roughness={0.4}
        />
      </mesh>

      {/* Overhead Hanging Supermarket Crossroads Signboard */}
      {overheadTex && (
        <group position={[0, 2.65, 0]}>
          <mesh>
            <boxGeometry args={[4.6, 0.92, 0.12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0, 0.065]}>
            <planeGeometry args={[4.48, 0.84]} />
            <meshBasicMaterial map={overheadTex} />
          </mesh>
        </group>
      )}

      {/* Clickable 3D Floor Arrow Pad: LEFT PATH */}
      {leftPadTex && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-1.15, 0.025, 0.15]}
          onClick={(e) => {
            e.stopPropagation();
            onChoosePath(junctionIndex, "left");
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[1.85, 0.88]} />
          <meshBasicMaterial map={leftPadTex} />
        </mesh>
      )}

      {/* Clickable 3D Floor Arrow Pad: RIGHT PATH */}
      {rightPadTex && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[1.15, 0.025, 0.15]}
          onClick={(e) => {
            e.stopPropagation();
            onChoosePath(junctionIndex, "right");
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[1.85, 0.88]} />
          <meshBasicMaterial map={rightPadTex} />
        </mesh>
      )}
    </group>
  );
}

function PriceTag({ toy, onPick }: { toy: ShopToy; onPick: (toy: ShopToy) => void }) {
  const texture = useSignTexture(
    `price-tag-${toy.id}-${toy.price}`,
    512,
    220,
    (ctx, w, h) => {
      ctx.fillStyle = "#fffbeb";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, w - 16, h - 16);
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 54px sans-serif";
      ctx.fillText(toy.name, 256, 66, 470);
      const gap = 64;
      let coinX = 256 - ((toy.price - 1) * gap) / 2;
      for (let i = 0; i < toy.price; i++) {
        ctx.beginPath();
        ctx.fillStyle = "#facc15";
        ctx.arc(coinX, 152, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#b45309";
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = "#fef3c7";
        ctx.arc(coinX - 6, 144, 7, 0, Math.PI * 2);
        ctx.fill();
        coinX += gap;
      }
    },
  );

  if (!texture) return null;
  const isLeft = toy.slot % 2 === 0;
  // Angle the price tag slightly toward the central aisle so it is easy to read and tap
  const tagRotY = isLeft ? 0.32 : -0.32;
  const tagOffsetX = isLeft ? 0.22 : -0.22;

  return (
    <mesh
      position={[tagOffsetX, -0.22, 0.36]}
      rotation={[-0.12, tagRotY, 0]}
      renderOrder={3}
      onClick={(event) => {
        event.stopPropagation();
        onPick(toy);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[0.92, 0.38]} />
      <meshBasicMaterial map={texture} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

function ToyPickup({
  toy,
  position,
  collected,
  selected,
  trolleyXRef,
  trolleyZRef,
  reduceMotion,
  onSelect,
  onLanded,
}: {
  toy: ShopToy;
  position: [number, number, number];
  collected: boolean;
  selected: boolean;
  trolleyXRef: React.MutableRefObject<number>;
  trolleyZRef: React.MutableRefObject<number>;
  reduceMotion: boolean;
  onSelect: (toy: ShopToy) => void;
  onLanded: (toy: ShopToy) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const prevCollected = useRef(collected);
  const phase = useRef<"idle" | "fly">("idle");
  const flyT = useRef(0);
  const origin = useRef(new THREE.Vector3(...position));
  const scratch = useRef(new THREE.Vector3());

  useEffect(() => {
    origin.current.set(...position);
    if (phase.current === "idle" && group.current) {
      group.current.position.set(...position);
    }
  }, [position]);

  useEffect(() => {
    // Only trigger the fly-to-trolley arc when transitioning from uncollected -> collected during gameplay
    if (collected && !prevCollected.current && phase.current === "idle") {
      phase.current = "fly";
      flyT.current = 0;
      if (group.current) origin.current.copy(group.current.position);
    }
    prevCollected.current = collected;
  }, [collected]);

  useFrame((_, dt) => {
    const node = group.current;
    if (!node) return;
    if (phase.current === "fly") {
      const duration = reduceMotion ? 0.28 : 0.72;
      flyT.current += dt;
      const u = Math.min(flyT.current / duration, 1);
      const ease = 1 - (1 - u) ** 3;
      scratch.current.set(trolleyXRef.current, 0.72, trolleyZRef.current - 0.95);
      node.position.lerpVectors(origin.current, scratch.current, ease);
      node.position.y += Math.sin(u * Math.PI) * (reduceMotion ? 0.25 : 0.85);
      node.scale.setScalar(1 - ease * 0.45);
      if (u >= 1) {
        // Restock the display item on the shelf immediately so the shelf is never left empty!
        phase.current = "idle";
        node.position.copy(origin.current);
        node.scale.setScalar(1);
        onLanded(toy);
      }
    }
  });

  const isLeft = toy.slot % 2 === 0;

  return (
    <group ref={group} position={position}>
      {selected && (
        <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.24, 0.34, 28]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      )}
      <Float
        speed={reduceMotion ? 0 : selected ? 2.2 : 1.1}
        rotationIntensity={reduceMotion ? 0 : selected ? 0.32 : 0.1}
        floatIntensity={reduceMotion ? 0 : selected ? 0.35 : 0.12}
      >
        <group
          scale={1.36}
          rotation={[0, isLeft ? 0.45 : -0.45, 0]}
          ref={(node) => {
            node?.traverse((child) => {
              if (child instanceof THREE.Mesh) child.raycast = () => null;
            });
          }}
        >
          <PremiumToyModel kind={toy.kind} color={toy.color} accent={toy.accent} />
        </group>
      </Float>
      <PriceTag
        toy={toy}
        onPick={(picked) => {
          if (phase.current === "fly") return;
          onSelect(picked);
        }}
      />
      <mesh
        position={[0, 0.02, 0.12]}
        onClick={(event) => {
          event.stopPropagation();
          if (phase.current === "fly") return;
          onSelect(toy);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[0.96, 0.98, 0.82]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/**
 * Camera Rig that smoothly tracks the kid & trolley in both X (Left/Right paths) and Z (30 rows).
 */
function CameraRig({
  trolleyXRef,
  trolleyZRef,
  travelRef,
}: {
  trolleyXRef: React.MutableRefObject<number>;
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
}) {
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const smoothLookX = useRef(0);

  useFrame(({ camera }, dt) => {
    const x = trolleyXRef.current;
    const z = trolleyZRef.current;
    const bob = travelRef.current !== 0 ? Math.sin(performance.now() / 160) * 0.025 : 0;
    desired.current.set(x, 1.88 + bob, z + 3.15);
    camera.position.lerp(desired.current, 1 - Math.exp(-dt * 6.5));
    smoothLookX.current = THREE.MathUtils.lerp(smoothLookX.current, x, 1 - Math.exp(-dt * 7));
    look.current.set(smoothLookX.current, 1.05, z - 3.2);
    camera.lookAt(look.current);
  });
  return null;
}

/**
 * Walker controller: rolls the trolley through all 30 rows,
 * smoothly steers X into the chosen Left or Right path at each 4-row crossroads junction,
 * and alerts the player when arriving at an unchosen crossroads junction.
 */
function MartWalker({
  trolleyXRef,
  trolleyZRef,
  travelRef,
  targetZRef,
  pathChoices,
  reduceMotion,
  onCurrentRowChange,
  onActiveJunctionChange,
}: {
  trolleyXRef: React.MutableRefObject<number>;
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  targetZRef: React.MutableRefObject<number | null>;
  pathChoices: Record<number, MartPathChoice>;
  reduceMotion: boolean;
  onCurrentRowChange: (rowIndex: number) => void;
  onActiveJunctionChange: (junctionIndex: number | null) => void;
}) {
  const lastReportedRow = useRef(-1);
  const lastReportedJunction = useRef<number | null>(null);

  useFrame((_, dt) => {
    let direction = travelRef.current;

    // Auto-walk or fast-jump to a clicked toy, dropdown row, or junction targetZ if set
    if (direction === 0 && targetZRef.current !== null) {
      const diff = targetZRef.current - trolleyZRef.current;
      if (Math.abs(diff) > 8) {
        // Instant jump when using the Row selector across departments (e.g. Music & Art rows)
        trolleyZRef.current = targetZRef.current;
        targetZRef.current = null;
      } else if (Math.abs(diff) < 0.14) {
        trolleyZRef.current = targetZRef.current;
        targetZRef.current = null;
      } else {
        direction = diff < 0 ? -1 : 1;
      }
    } else if (direction !== 0) {
      targetZRef.current = null;
    }

    const speed = reduceMotion ? 4.2 : 3.1;
    const gate = shopGateZ();
    const backLimit = 2.55;

    if (direction !== 0) {
      const nextZ = trolleyZRef.current + direction * dt * speed;
      // Never block forward walking at crossroads — turning Left or Right is 100% optional!
      if (direction < 0 && nextZ < gate) trolleyZRef.current = gate;
      else if (direction > 0 && nextZ > backLimit) trolleyZRef.current = backLimit;
      else trolleyZRef.current = nextZ;
    }

    // Determine which 4-row block the trolley is currently in, and smoothly steer X
    const curZ = trolleyZRef.current;
    let activeBlock = 0;
    for (let b = 0; b < Math.ceil(SHOP_ROWS / CROSSROADS_INTERVAL); b++) {
      const bStart = rowZ(b * CROSSROADS_INTERVAL) + 1.8;
      if (curZ <= bStart) activeBlock = b;
    }
    const desiredX = blockAisleX(activeBlock, pathChoices);
    trolleyXRef.current = THREE.MathUtils.lerp(
      trolleyXRef.current,
      desiredX,
      1 - Math.exp(-dt * 5.5),
    );

    // Find nearest row (0..29)
    let nearestRow = 0;
    let bestDist = Infinity;
    for (let r = 0; r < SHOP_ROWS; r++) {
      const d = Math.abs(curZ - rowZ(r));
      if (d < bestDist) {
        bestDist = d;
        nearestRow = r;
      }
    }
    if (nearestRow !== lastReportedRow.current) {
      lastReportedRow.current = nearestRow;
      onCurrentRowChange(nearestRow);
    }

    // Check if the trolley is currently near any crossroads junction (0..6)
    let nearJunction: number | null = null;
    for (let j = 0; j < JUNCTION_COUNT; j++) {
      const jz = junctionZ(j);
      if (Math.abs(curZ - jz) < 2.15) {
        nearJunction = j;
        break;
      }
    }
    if (nearJunction !== lastReportedJunction.current) {
      lastReportedJunction.current = nearJunction;
      onActiveJunctionChange(nearJunction);
    }
  });

  return null;
}

function SavingBank({ pulse }: { pulse: number }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const glow = useRef(0);

  useEffect(() => {
    glow.current = 1;
  }, [pulse]);

  useFrame((_, dt) => {
    const node = ref.current;
    if (!node) return;
    node.position.copy(camera.position);
    node.quaternion.copy(camera.quaternion);
    node.translateX(-0.92);
    node.translateY(-0.72);
    node.translateZ(-1.75);
    if (glow.current > 0) glow.current = Math.max(0, glow.current - dt * 1.4);
    const bump = glow.current > 0 ? Math.sin((1 - glow.current) * Math.PI) * 0.08 : 0;
    node.scale.setScalar(0.42 + bump);
  });

  return (
    <group
      ref={(node) => {
        ref.current = node;
        node?.traverse((child) => {
          if (child instanceof THREE.Mesh) child.raycast = () => null;
        });
      }}
    >
      <pointLight color="#fbbf24" intensity={3.2} distance={2.4} />
      <mesh position={[0, -0.08, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 16]} />
        <meshStandardMaterial color="#d97706" emissive="#b45309" emissiveIntensity={0.2} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.2, 0.04]} castShadow>
        <sphereGeometry args={[0.2, 18, 14]} />
        <meshStandardMaterial color="#d97706" roughness={0.55} />
      </mesh>
      <mesh position={[-0.14, 0.36, 0.02]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0.14, 0.36, 0.02]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh position={[0, 0.16, 0.16]} scale={[1, 0.75, 0.7]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <mesh position={[0, 0.14, 0.22]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshStandardMaterial color="#431407" />
      </mesh>
      <mesh position={[-0.06, 0.24, 0.16]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[0.06, 0.24, 0.16]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[0, 0.44, 0.02]}>
        <boxGeometry args={[0.18, 0.035, 0.05]} />
        <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}

export type ToyShopWorldProps = {
  toys: ShopToy[];
  collectedIds: Set<string>;
  selectedId: string | null;
  landedItems: TrolleyShelfItem[];
  bankPulse: number;
  reduceMotion: boolean;
  travelRef: React.MutableRefObject<number>;
  targetZRef: React.MutableRefObject<number | null>;
  pathChoices: Record<number, MartPathChoice>;
  activeJunction: number | null;
  shopper: ShopperChoice;
  onSelect: (toy: ShopToy) => void;
  onLanded: (toy: ShopToy) => void;
  onCurrentRowChange: (rowIndex: number) => void;
  onActiveJunctionChange: (junctionIndex: number | null) => void;
  onChoosePath: (junctionIndex: number, choice: MartPathChoice) => void;
};

function ShopScene({
  toys,
  collectedIds,
  selectedId,
  landedItems,
  bankPulse,
  reduceMotion,
  travelRef,
  targetZRef,
  pathChoices,
  activeJunction,
  shopper,
  onSelect,
  onLanded,
  onCurrentRowChange,
  onActiveJunctionChange,
  onChoosePath,
}: ToyShopWorldProps) {
  const trolleyXRef = useRef(0);
  const trolleyZRef = useRef(2.55);

  const startZ = 8;
  const endZ = shopGateZ() - 8;
  const length = startZ - endZ;
  const midZ = (startZ + endZ) / 2;

  const selectedToy = useMemo(
    () => toys.find((t) => t.id === selectedId) ?? null,
    [toys, selectedId],
  );
  const lookSide = selectedToy ? (selectedToy.slot % 2 === 0 ? -1 : 1) : 0;

  return (
    <>
      <color attach="background" args={["#cbd5e1"]} />
      {/* Far distance fog so 15–20+ rows ahead are clearly visible down the mega-mart */}
      <fog attach="fog" args={["#cbd5e1", 38, 125]} />
      {/* 100% Offline-safe Mega-Mart Lighting (Zero external HDR/CDN download) */}
      <hemisphereLight args={["#fffdf0", "#94a3b8", 0.95]} />
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.65}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.55} color="#bfdbfe" />
      <directionalLight position={[0, 6, 8]} intensity={0.5} color="#fff7ed" />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={28} blur={2.2} far={12} />

      <MartFloor length={length} startZ={startZ} />

      {/* Outer Mega-Mart Perimeter Walls & Skylight Ceiling */}
      <mesh position={[-8.8, 1.8, midZ]} receiveShadow>
        <boxGeometry args={[0.16, 3.6, length]} />
        <meshStandardMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[8.8, 1.8, midZ]} receiveShadow>
        <boxGeometry args={[0.16, 3.6, length]} />
        <meshStandardMaterial color="#fce7f3" />
      </mesh>
      <mesh position={[0, 3.55, midZ]}>
        <boxGeometry args={[18, 0.12, length]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Overhead Supermarket LED Light Panels along all 3 halls */}
      {Array.from({ length: Math.ceil(length / 4.5) }, (_, index) => {
        const lz = startZ - 1.5 - index * 4.5;
        return (
          <group key={`ceiling-row-${index}`}>
            {[-PATH_SHIFT_X, 0, PATH_SHIFT_X].map((lx) => (
              <mesh key={lx} position={[lx, 3.45, lz]}>
                <boxGeometry args={[1.25, 0.045, 2.1]} />
                <meshStandardMaterial
                  color="#fffef6"
                  emissive="#fff3c4"
                  emissiveIntensity={1.6}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* 30 Continuous Rows of Left & Right Wooden 2-Tier Supermarket Shelves */}
      {Array.from({ length: SHOP_ROWS }, (_, rowIdx) => {
        const z = rowZ(rowIdx);
        const block = Math.floor(rowIdx / CROSSROADS_INTERVAL);
        const centerX = blockAisleX(block, pathChoices);
        const dept = MART_DEPARTMENTS[Math.min(MART_DEPARTMENTS.length - 1, block)];
        return (
          <group key={`row-${rowIdx}`}>
            <MartGondolaBay
              x={centerX - 2.08}
              z={z}
              side={-1}
              rowNumber={rowIdx + 1}
              accentColor={dept.color}
            />
            <MartGondolaBay
              x={centerX + 2.08}
              z={z}
              side={1}
              rowNumber={rowIdx + 1}
              accentColor={dept.color}
            />
          </group>
        );
      })}

      {/* Cross-Aisle Junctions every 4 rows (Rows 4, 8, 12, 16, 20, 24, 28) */}
      {Array.from({ length: JUNCTION_COUNT }, (_, jIdx) => {
        const centerX = blockAisleX(jIdx, pathChoices);
        return (
          <CrossroadsJunction
            key={`junction-${jIdx}`}
            junctionIndex={jIdx}
            centerX={centerX}
            chosenPath={pathChoices[jIdx]}
            isCurrentJunction={activeJunction === jIdx}
            onChoosePath={onChoosePath}
          />
        );
      })}

      {/* 60 Unique Interactive 3D Shelf Items (2 per row across all 30 rows) */}
      {toys.map((toy) => {
        const pos = toyPosition(toy, pathChoices);
        return (
          <ToyPickup
            key={toy.id}
            toy={toy}
            position={pos}
            collected={collectedIds.has(toy.id)}
            selected={selectedId === toy.id}
            trolleyXRef={trolleyXRef}
            trolleyZRef={trolleyZRef}
            reduceMotion={reduceMotion}
            onSelect={(picked) => {
              // Automatically roll trolley up to the picked toy's row if far away
              const targetRowZ = rowZ(picked.section) + 1.45;
              if (Math.abs(trolleyZRef.current - targetRowZ) > 0.65) {
                targetZRef.current = targetRowZ;
              }
              onSelect(picked);
            }}
            onLanded={onLanded}
          />
        );
      })}

      {/* Realistic 3D Boy / Girl Human Kid pushing the Amazon Supermarket Trolley */}
      <RealisticKidShopper
        shopper={shopper}
        trolleyXRef={trolleyXRef}
        trolleyZRef={trolleyZRef}
        travelRef={travelRef}
        cartBounceKey={landedItems.length}
        landedItems={landedItems}
        lookSide={lookSide}
        renderCartItem={(item, cartScale) => {
          const toy = toys.find((t) => t.id === item.id);
          if (!toy) return null;
          return (
            <PremiumToyModel
              kind={toy.kind}
              color={toy.color}
              accent={toy.accent}
              scale={cartScale}
            />
          );
        }}
      />

      <CameraRig
        trolleyXRef={trolleyXRef}
        trolleyZRef={trolleyZRef}
        travelRef={travelRef}
      />
      <MartWalker
        trolleyXRef={trolleyXRef}
        trolleyZRef={trolleyZRef}
        travelRef={travelRef}
        targetZRef={targetZRef}
        pathChoices={pathChoices}
        reduceMotion={reduceMotion}
        onCurrentRowChange={onCurrentRowChange}
        onActiveJunctionChange={onActiveJunctionChange}
      />
      <SavingBank pulse={bankPulse} />
    </>
  );
}

export default function ToyShopWorld(props: ToyShopWorldProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.88, 5.7], fov: 56, near: 0.1, far: 160 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
    >
      <ShopScene {...props} />
    </Canvas>
  );
}
