"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GroceryModel, ShelfLabel } from "@/components/trolley/GroceryModel";
import ShopperRig from "@/components/trolley/ShopperRig";
import {
  AISLE_SPAN,
  arrangeShelf,
  shelfSlot,
  type ShopperChoice,
  type TrolleyShelfItem,
} from "@/utils/trolleyCatalog";

export type AisleWorldProps = {
  letters: string[];
  itemsBySection: TrolleyShelfItem[][];
  previewLetters?: string[];
  previewItems?: TrolleyShelfItem[][];
  collectedIds: Set<string>;
  landedItems: TrolleyShelfItem[];
  cartBounceKey: number;
  shopper: ShopperChoice;
  travelRef: React.MutableRefObject<number>;
  gateZRef: React.MutableRefObject<number>;
  paywallRef: React.MutableRefObject<boolean>;
  reduceMotion: boolean;
  onPick: (item: TrolleyShelfItem) => void;
  onLanded: (item: TrolleyShelfItem) => void;
  onSection: (index: number) => void;
  onBlocked: () => void;
  onFinish: () => void;
  onPaywall: () => void;
};

function Floor({ length, startZ }: { length: number; startZ: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tilesX = 10;
  const tilesZ = Math.max(12, Math.ceil(length / 0.7));

  useEffect(() => {
    const board = mesh.current;
    if (!board) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let i = 0;
    for (let z = 0; z < tilesZ; z++) {
      for (let x = 0; x < tilesX; x++) {
        dummy.position.set((x - (tilesX - 1) / 2) * 0.68, 0, startZ - z * 0.7);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.updateMatrix();
        board.setMatrixAt(i, dummy.matrix);
        color.set((x + z) % 2 === 0 ? "#f3ecdf" : "#ddd4c6");
        board.setColorAt(i, color);
        i++;
      }
    }
    board.instanceMatrix.needsUpdate = true;
    if (board.instanceColor) board.instanceColor.needsUpdate = true;
  }, [tilesX, tilesZ, startZ]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, tilesX * tilesZ]}
      receiveShadow
    >
      <planeGeometry args={[0.68, 0.68]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
}

function ShelfBank({ x, z }: { x: number; z: number }) {
  const side = x < 0 ? -1 : 1;
  const plankX = x - side * 0.2;
  return (
    <group>
      <mesh position={[x, 1.02, z]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 1.9, 6.1]} />
        <meshStandardMaterial color="#8a4b1f" roughness={0.82} />
      </mesh>
      <mesh position={[plankX, 0.08, z]} receiveShadow>
        <boxGeometry args={[0.72, 0.1, 5.9]} />
        <meshStandardMaterial color="#6b3a16" roughness={0.86} />
      </mesh>
      {[0.46, 1.36].map((y) => (
        <mesh key={y} position={[plankX, y, z]} castShadow receiveShadow>
          <boxGeometry args={[0.78, 0.07, 5.9]} />
          <meshStandardMaterial color="#e0a15a" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function LetterBeacon({
  letter,
  position,
}: {
  letter: string;
  position: [number, number, number];
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 170px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, 128, 136);
    const next = new THREE.CanvasTexture(canvas);
    next.needsUpdate = true;
    return next;
  }, [letter]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;
  return (
    <mesh position={position}>
      <planeGeometry args={[0.34, 0.34]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

function GroceryPickup({
  item,
  position,
  collected,
  trolleyZRef,
  reduceMotion,
  onPick,
  onLanded,
}: {
  item: TrolleyShelfItem;
  position: [number, number, number];
  collected: boolean;
  trolleyZRef: React.MutableRefObject<number>;
  reduceMotion: boolean;
  onPick: (item: TrolleyShelfItem) => void;
  onLanded: (item: TrolleyShelfItem) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const phase = useRef<"idle" | "shake" | "fly" | "done">("idle");
  const shakeLeft = useRef(0);
  const flyT = useRef(0);
  const origin = useRef(new THREE.Vector3(...position));
  const scratch = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    const node = group.current;
    if (!node || phase.current === "done") return;
    if (phase.current === "shake") {
      shakeLeft.current -= dt;
      node.rotation.z = Math.sin(shakeLeft.current * 46) * 0.45;
      if (shakeLeft.current <= 0) {
        phase.current = "idle";
        node.rotation.z = 0;
      }
    }
    if (phase.current === "fly") {
      const duration = reduceMotion ? 0.28 : 0.72;
      flyT.current += dt;
      const u = Math.min(flyT.current / duration, 1);
      const ease = 1 - (1 - u) ** 3;
      scratch.current.set(0, 0.72, trolleyZRef.current - 0.95);
      node.position.lerpVectors(origin.current, scratch.current, ease);
      node.position.y += Math.sin(u * Math.PI) * (reduceMotion ? 0.25 : 0.85);
      const s = 1 - ease * 0.45;
      node.scale.setScalar(s);
      if (u >= 1) {
        phase.current = "done";
        node.visible = false;
        onLanded(item);
      }
    }
  });

  if (collected && phase.current === "idle") return null;

  return (
    <group ref={group} position={position}>
      <group scale={1.32}>
        <GroceryModel shape={item.shape} color={item.color} word={item.word} />
      </group>
      <ShelfLabel word={item.word} />
      <mesh
        position={[0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          if (phase.current === "fly" || phase.current === "done") return;
          if (!item.isTarget) {
            phase.current = "shake";
            shakeLeft.current = 0.42;
            onPick(item);
            return;
          }
          phase.current = "fly";
          flyT.current = 0;
          if (group.current) origin.current.copy(group.current.position);
          onPick(item);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[1.15, 1.15, 1.05]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rig({
  trolleyZRef,
  travelRef,
}: {
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
}) {
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera }, dt) => {
    const z = trolleyZRef.current;
    const bob = travelRef.current !== 0 ? Math.sin(performance.now() / 160) * 0.03 : 0;
    desired.current.set(0, 1.78 + bob, z + 3.25);
    camera.position.lerp(desired.current, 1 - Math.exp(-dt * 6));
    look.current.set(0, 1.08, z - 2.7);
    camera.lookAt(look.current);
  });
  return null;
}

function Walker({
  trolleyZRef,
  travelRef,
  gateZRef,
  paywallRef,
  letterCount,
  reduceMotion,
  onSection,
  onBlocked,
  onFinish,
  onPaywall,
}: {
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  gateZRef: React.MutableRefObject<number>;
  paywallRef: React.MutableRefObject<boolean>;
  letterCount: number;
  reduceMotion: boolean;
  onSection: (index: number) => void;
  onBlocked: () => void;
  onFinish: () => void;
  onPaywall: () => void;
}) {
  const sectionRef = useRef(0);
  const blockedAt = useRef(0);
  const finished = useRef(false);
  const onSectionRef = useRef(onSection);
  const onBlockedRef = useRef(onBlocked);
  const onFinishRef = useRef(onFinish);
  const onPaywallRef = useRef(onPaywall);
  onSectionRef.current = onSection;
  onBlockedRef.current = onBlocked;
  onFinishRef.current = onFinish;
  onPaywallRef.current = onPaywall;

  useFrame((_, dt) => {
    const direction = travelRef.current;
    if (direction === 0) return;
    const speed = reduceMotion ? 3.1 : 1.85;
    const gate = gateZRef.current;
    const backLimit = 2.55;
    const next = trolleyZRef.current + direction * dt * speed;
    if (direction < 0 && next < gate) {
      trolleyZRef.current = gate;
      const now = performance.now();
      if (now - blockedAt.current > 1700) {
        blockedAt.current = now;
        if (paywallRef.current) {
          onPaywallRef.current();
        } else if (gate < -AISLE_SPAN * letterCount) {
          if (!finished.current) {
            finished.current = true;
            onFinishRef.current();
          }
        } else {
          onBlockedRef.current();
        }
      }
    } else if (direction > 0 && next > backLimit) {
      trolleyZRef.current = backLimit;
    } else {
      trolleyZRef.current = next;
    }

    const nextSection = Math.max(
      0,
      Math.min(letterCount - 1, Math.floor((0.8 - trolleyZRef.current) / AISLE_SPAN)),
    );
    if (nextSection !== sectionRef.current) {
      sectionRef.current = nextSection;
      onSectionRef.current(nextSection);
    }
  });

  return null;
}

function AisleScene(props: AisleWorldProps) {
  const trolleyZRef = useRef(2.55);
  const startZ = 8;
  const bayCount = props.letters.length + (props.previewLetters?.length ?? 0);
  const endZ = -bayCount * AISLE_SPAN - 6;
  const length = startZ - endZ;
  const midZ = (startZ + endZ) / 2;

  useEffect(() => {
    const stop = () => {
      props.travelRef.current = 0;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [props.travelRef]);

  return (
    <>
      <color attach="background" args={["#9fb0c8"]} />
      <fog attach="fog" args={["#9fb0c8", 22, 48]} />
      <hemisphereLight args={["#f8fafc", "#94a3b8", 0.85]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Floor length={length} startZ={startZ} />
      <mesh position={[-3.2, 1.18, midZ]} receiveShadow>
        <boxGeometry args={[0.08, 2.36, length]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      <mesh position={[3.2, 1.18, midZ]} receiveShadow>
        <boxGeometry args={[0.08, 2.36, length]} />
        <meshStandardMaterial color="#ffe4e6" />
      </mesh>
      <mesh position={[-3.16, 2.32, midZ]}>
        <boxGeometry args={[0.16, 0.08, length]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[3.16, 2.32, midZ]}>
        <boxGeometry args={[0.16, 0.08, length]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 2.4, midZ]}>
        <boxGeometry args={[6.5, 0.1, length]} />
        <meshStandardMaterial color="#d5deea" />
      </mesh>
      {Array.from({ length: Math.ceil(length / 3.2) }, (_, index) => (
        <mesh key={`light-${index}`} position={[0, 2.28, startZ - 1.2 - index * 3.2]}>
          <boxGeometry args={[1.05, 0.045, 1.7]} />
          <meshStandardMaterial
            color="#fffef6"
            emissive="#fff3c4"
            emissiveIntensity={1.8}
          />
        </mesh>
      ))}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, midZ]}
        onPointerDown={(event) => {
          event.stopPropagation();
          props.travelRef.current = -1;
        }}
      >
        <planeGeometry args={[6.2, length]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {[...props.letters, ...(props.previewLetters ?? [])].map((letter, section) => {
            const zMid = -3.37 - section * AISLE_SPAN;
            const items =
              section < props.letters.length
                ? (props.itemsBySection[section] ?? [])
                : (props.previewItems?.[section - props.letters.length] ?? []);
        return (
          <group key={`${letter}-${section}`}>
            <ShelfBank x={-2.08} z={zMid} />
            <ShelfBank x={2.08} z={zMid} />
            <LetterBeacon letter={letter} position={[-1.22, 2.12, zMid + 2.2]} />
            <mesh position={[0, 2.32, zMid]}>
              <boxGeometry args={[0.7, 0.05, 2.6]} />
              <meshStandardMaterial
                color="#fffbeb"
                emissive="#fff7d6"
                emissiveIntensity={1.6}
              />
            </mesh>
            <pointLight
              position={[0, 2.2, zMid]}
              intensity={6}
              distance={9}
              decay={2}
              color="#fff6d8"
            />
            {arrangeShelf(items).map((item, index) => (
              <GroceryPickup
                key={item.id}
                item={item}
                position={shelfSlot(index, section)}
                collected={props.collectedIds.has(item.id)}
                trolleyZRef={trolleyZRef}
                reduceMotion={props.reduceMotion}
                onPick={props.onPick}
                onLanded={props.onLanded}
              />
            ))}
          </group>
        );
      })}

      <ShopperRig
        shopper={props.shopper}
        trolleyZRef={trolleyZRef}
        travelRef={props.travelRef}
        cartBounceKey={props.cartBounceKey}
        landedItems={props.landedItems}
      />
      <Rig trolleyZRef={trolleyZRef} travelRef={props.travelRef} />
      <Walker
        trolleyZRef={trolleyZRef}
        travelRef={props.travelRef}
        gateZRef={props.gateZRef}
        paywallRef={props.paywallRef}
        letterCount={props.letters.length}
        reduceMotion={props.reduceMotion}
        onSection={props.onSection}
        onBlocked={props.onBlocked}
        onFinish={props.onFinish}
        onPaywall={props.onPaywall}
      />
    </>
  );
}

export default function AisleWorld(props: AisleWorldProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.78, 5.8], fov: 58, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <AisleScene {...props} />
    </Canvas>
  );
}
