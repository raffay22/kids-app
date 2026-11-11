"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GroceryModel } from "@/components/trolley/GroceryModel";
import ShopperRig from "@/components/trolley/ShopperRig";
import { shopGateZ, toyPosition, type ShopToy } from "@/utils/coinShop";
import { AISLE_SPAN } from "@/utils/trolleyCatalog";
import type { TrolleyShelfItem } from "@/utils/trolleyCatalog";

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
    <instancedMesh ref={mesh} args={[undefined, undefined, tilesX * tilesZ]} receiveShadow>
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

function PriceTag({ toy, onPick }: { toy: ShopToy; onPick: (toy: ShopToy) => void }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fffbeb";
    ctx.fillRect(0, 0, 512, 220);
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 496, 204);
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 58px sans-serif";
    ctx.fillText(toy.name, 256, 68, 470);
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
    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
    return next;
  }, [toy.name, toy.price]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;
  return (
    <mesh
      position={[0, -0.28, 0.42]}
      renderOrder={3}
      onClick={(event) => {
        event.stopPropagation();
        onPick(toy);
      }}
      onPointerDown={(event) => {
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
      <planeGeometry args={[0.88, 0.36]} />
      <meshBasicMaterial map={texture} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

function ToyPickup({
  toy,
  collected,
  selected,
  trolleyZRef,
  reduceMotion,
  onSelect,
  onLanded,
}: {
  toy: ShopToy;
  collected: boolean;
  selected: boolean;
  trolleyZRef: React.MutableRefObject<number>;
  reduceMotion: boolean;
  onSelect: (toy: ShopToy) => void;
  onLanded: (toy: ShopToy) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const alreadyHome = useRef(collected);
  const phase = useRef<"idle" | "shake" | "fly" | "done">("idle");
  const shakeLeft = useRef(0);
  const flyT = useRef(0);
  const origin = useRef(new THREE.Vector3(...toyPosition(toy)));
  const scratch = useRef(new THREE.Vector3());
  const position = toyPosition(toy);

  useEffect(() => {
    if (!collected || phase.current !== "idle") return;
    phase.current = "fly";
    flyT.current = 0;
    if (group.current) origin.current.copy(group.current.position);
  }, [collected]);

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
      node.scale.setScalar(1 - ease * 0.45);
      if (u >= 1) {
        phase.current = "done";
        node.visible = false;
        onLanded(toy);
      }
    }
  });

  if (alreadyHome.current) return null;

  return (
    <group ref={group} position={position}>
      {selected && (
        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.3, 24]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      )}
      <group
        scale={1.32}
        ref={(node) => {
          node?.traverse((child) => {
            if (child instanceof THREE.Mesh) child.raycast = () => null;
          });
        }}
      >
        <GroceryModel shape={toy.shape} color={toy.color} word={toy.word} />
      </group>
      <PriceTag
        toy={toy}
        onPick={(picked) => {
          if (phase.current === "fly" || phase.current === "done") return;
          onSelect(picked);
        }}
      />
      <mesh
        position={[0, -0.05, 0.12]}
        onClick={(event) => {
          event.stopPropagation();
          if (phase.current === "fly" || phase.current === "done") return;
          onSelect(toy);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
          if (phase.current === "fly" || phase.current === "done") return;
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
        <boxGeometry args={[0.9, 0.95, 0.72]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Rig({ trolleyZRef, travelRef }: { trolleyZRef: React.MutableRefObject<number>; travelRef: React.MutableRefObject<number> }) {
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
  reduceMotion,
}: {
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  reduceMotion: boolean;
}) {
  useFrame((_, dt) => {
    const direction = travelRef.current;
    if (direction === 0) return;
    const speed = reduceMotion ? 3.1 : 1.85;
    const gate = shopGateZ();
    const backLimit = 2.55;
    const next = trolleyZRef.current + direction * dt * speed;
    if (direction < 0 && next < gate) trolleyZRef.current = gate;
    else if (direction > 0 && next > backLimit) trolleyZRef.current = backLimit;
    else trolleyZRef.current = next;
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

function ShopScene({
  toys,
  collectedIds,
  selectedId,
  landedItems,
  bankPulse,
  reduceMotion,
  travelRef,
  onSelect,
  onLanded,
}: {
  toys: ShopToy[];
  collectedIds: Set<string>;
  selectedId: string | null;
  landedItems: TrolleyShelfItem[];
  bankPulse: number;
  reduceMotion: boolean;
  travelRef: React.MutableRefObject<number>;
  onSelect: (toy: ShopToy) => void;
  onLanded: (toy: ShopToy) => void;
}) {
  const trolleyZRef = useRef(2.55);
  const bayCount = Math.max(1, toys.reduce((max, toy) => Math.max(max, toy.section + 1), 1));
  const startZ = 8;
  const endZ = -bayCount * AISLE_SPAN - 6;
  const length = startZ - endZ;
  const midZ = (startZ + endZ) / 2;

  return (
    <>
      <color attach="background" args={["#9fb0c8"]} />
      <fog attach="fog" args={["#9fb0c8", 22, 48]} />
      <hemisphereLight args={["#f8fafc", "#94a3b8", 0.85]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} castShadow />
      <Floor length={length} startZ={startZ} />
      <mesh position={[-3.2, 1.18, midZ]} receiveShadow>
        <boxGeometry args={[0.08, 2.36, length]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      <mesh position={[3.2, 1.18, midZ]} receiveShadow>
        <boxGeometry args={[0.08, 2.36, length]} />
        <meshStandardMaterial color="#ffe4e6" />
      </mesh>
      <mesh position={[0, 2.4, midZ]}>
        <boxGeometry args={[6.5, 0.1, length]} />
        <meshStandardMaterial color="#d5deea" />
      </mesh>
      {Array.from({ length: Math.ceil(length / 3.2) }, (_, index) => (
        <mesh key={`light-${index}`} position={[0, 2.28, startZ - 1.2 - index * 3.2]}>
          <boxGeometry args={[1.05, 0.045, 1.7]} />
          <meshStandardMaterial color="#fffef6" emissive="#fff3c4" emissiveIntensity={1.8} />
        </mesh>
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, midZ]}
        onPointerDown={(event) => {
          event.stopPropagation();
          travelRef.current = -1;
        }}
      >
        <planeGeometry args={[6.2, length]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {Array.from({ length: bayCount }, (_, section) => {
        const zMid = -3.37 - section * AISLE_SPAN;
        return (
          <group key={section}>
            <ShelfBank x={-2.08} z={zMid} />
            <ShelfBank x={2.08} z={zMid} />
          </group>
        );
      })}
      {toys.map((toy) => (
        <ToyPickup
          key={toy.id}
          toy={toy}
          collected={collectedIds.has(toy.id)}
          selected={selectedId === toy.id}
          trolleyZRef={trolleyZRef}
          reduceMotion={reduceMotion}
          onSelect={onSelect}
          onLanded={onLanded}
        />
      ))}
      <ShopperRig
        shopper="girl"
        trolleyZRef={trolleyZRef}
        travelRef={travelRef}
        cartBounceKey={landedItems.length}
        landedItems={landedItems}
      />
      <Rig trolleyZRef={trolleyZRef} travelRef={travelRef} />
      <Walker trolleyZRef={trolleyZRef} travelRef={travelRef} reduceMotion={reduceMotion} />
      <SavingBank pulse={bankPulse} />
    </>
  );
}

export default function ToyShopWorld(props: {
  toys: ShopToy[];
  collectedIds: Set<string>;
  selectedId: string | null;
  landedItems: TrolleyShelfItem[];
  bankPulse: number;
  reduceMotion: boolean;
  travelRef: React.MutableRefObject<number>;
  onSelect: (toy: ShopToy) => void;
  onLanded: (toy: ShopToy) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 1.78, 5.8], fov: 58, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ShopScene {...props} />
    </Canvas>
  );
}
