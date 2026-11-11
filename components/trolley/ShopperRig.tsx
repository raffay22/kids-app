"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { GroceryModel } from "@/components/trolley/GroceryModel";
import { Human } from "@/components/trolley/sculpt/human";
import type { ShopperChoice, TrolleyShelfItem } from "@/utils/trolleyCatalog";

function MetalRod({
  position,
  args,
  rotation,
}: {
  position: [number, number, number];
  args: [number, number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.16} />
    </mesh>
  );
}

function WireCart() {
  const wires: ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const y = 0.38 + i * 0.09;
    wires.push(
      <MetalRod
        key={`side-l-${i}`}
        position={[-0.32, y, -0.82]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.012, 0.012, 0.78, 6]}
      />,
      <MetalRod
        key={`side-r-${i}`}
        position={[0.32, y, -0.82]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.012, 0.012, 0.78, 6]}
      />,
      <MetalRod
        key={`front-${i}`}
        position={[0, y, -1.2]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.012, 0.012, 0.64, 6]}
      />,
      <MetalRod
        key={`back-${i}`}
        position={[0, y, -0.44]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.012, 0.012, 0.64, 6]}
      />,
    );
  }
  for (let i = 0; i < 4; i++) {
    const z = -0.55 - i * 0.2;
    wires.push(
      <MetalRod
        key={`floor-${i}`}
        position={[0, 0.36, z]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.012, 0.012, 0.6, 6]}
      />,
    );
  }

  return (
    <group>
      {wires}
      <mesh position={[0, 0.22, -0.82]} castShadow>
        <boxGeometry args={[0.58, 0.025, 0.7]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.25} />
      </mesh>
      {[
        [-0.26, -1.08],
        [0.26, -1.08],
        [-0.26, -0.56],
        [0.26, -0.56],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0.1, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.04, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.05, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
      <MetalRod position={[-0.28, 0.62, -0.28]} args={[0.016, 0.016, 0.55, 8]} />
      <MetalRod position={[0.28, 0.62, -0.28]} args={[0.016, 0.016, 0.55, 8]} />
      <mesh position={[0, 0.9, -0.08]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.62, 12]} />
        <meshStandardMaterial color="#e11d48" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.78, -1.22]}>
        <boxGeometry args={[0.5, 0.08, 0.04]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

function SculptedKid({
  shopper,
  travelRef,
}: {
  shopper: ShopperChoice;
  travelRef: React.MutableRefObject<number>;
}) {
  const human = useMemo(() => {
    const girl = shopper === "girl";
    return new Human({
      skin: girl ? "#F0C0A8" : "#E4B08E",
      shirt: girl ? "#EC4899" : "#3E7CC9",
      pants: girl ? "#F9A8D4" : "#243049",
      shoes: girl ? "#FFFFFF" : "#F4F4F5",
      hair: girl ? "#7C2D12" : "#3A2618",
      iris: girl ? "#4C1D95" : "#3F2E22",
      longHair: girl,
      scale: 0.82,
      face: true,
    });
  }, [shopper]);

  useFrame(() => {
    const moving = travelRef.current !== 0;
    const swing = moving ? Math.sin(performance.now() / 180) : 0;
    human.pose({
      shL: [78, 8, 22],
      shR: [78, -8, 22],
      elL: 42,
      elR: 42,
      hipL: [swing * 24, 0, 2],
      hipR: [-swing * 24, 0, 2],
      knL: Math.max(0, -swing) * 36 + 8,
      knR: Math.max(0, swing) * 36 + 8,
      spine: [8, 0, 0],
      head: [8, 0, 0],
    });
  });

  return (
    <group position={[0, 0, 0.28]} rotation={[0, Math.PI, 0]}>
      <primitive object={human.group} />
    </group>
  );
}

export default function ShopperRig({
  shopper,
  trolleyZRef,
  travelRef,
  cartBounceKey,
  landedItems,
}: {
  shopper: ShopperChoice;
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  cartBounceKey: number;
  landedItems: TrolleyShelfItem[];
}) {
  const group = useRef<THREE.Group>(null);
  const bounce = useRef(0);

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
    node.position.set(0, y, trolleyZRef.current);
  });

  return (
    <group ref={group}>
      <group position={[0, 0, -0.08]} scale={1.12}>
        <WireCart />
      </group>
      <SculptedKid shopper={shopper} travelRef={travelRef} />
      {landedItems.map((item, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <group
            key={item.id}
            position={[-0.2 + col * 0.13, 0.5, -1.05 + row * 0.16]}
          >
            <GroceryModel shape={item.shape} color={item.color} word={item.word} scale={0.38} />
          </group>
        );
      })}
    </group>
  );
}
