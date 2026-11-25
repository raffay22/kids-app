"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GroceryModel } from "@/components/trolley/GroceryModel";
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

function Limb({
  length,
  radius = 0.045,
  color,
}: {
  length: number;
  radius?: number;
  color: string;
}) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, Math.max(0.02, length - radius * 2), 4, 8]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

function HumanChild({
  shopper,
  travelRef,
}: {
  shopper: ShopperChoice;
  travelRef: React.MutableRefObject<number>;
}) {
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const boy = shopper === "boy";
  const skin = "#f3c2a0";
  const shirt = boy ? "#2563eb" : "#ec4899";
  const bottoms = boy ? "#1e3a8a" : "#be185d";
  const hair = boy ? "#4a2c17" : "#7c2d12";
  const shoe = boy ? "#0f172a" : "#be185d";

  useFrame(() => {
    const moving = travelRef.current !== 0;
    const swing = moving ? Math.sin(performance.now() / 170) * 0.55 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
  });

  return (
    <group position={[0, 0, 0.42]}>
      <group ref={leftLeg} position={[-0.09, 0.5, 0]}>
        <Limb length={0.24} radius={0.05} color={bottoms} />
        <mesh position={[0, -0.28, 0.03]}>
          <boxGeometry args={[0.09, 0.06, 0.14]} />
          <meshStandardMaterial color={shoe} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.09, 0.5, 0]}>
        <Limb length={0.24} radius={0.05} color={bottoms} />
        <mesh position={[0, -0.28, 0.03]}>
          <boxGeometry args={[0.09, 0.06, 0.14]} />
          <meshStandardMaterial color={shoe} />
        </mesh>
      </group>

      <mesh position={[0, 0.58, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.1, 5, 10]} />
        <meshStandardMaterial color={bottoms} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.22, 6, 12]} />
        <meshStandardMaterial color={shirt} roughness={0.55} />
      </mesh>

      <group position={[-0.18, 0.98, 0.02]} rotation={[1.35, 0.15, 0.35]}>
        <Limb length={0.46} radius={0.04} color={skin} />
        <mesh position={[0, -0.46, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group position={[0.18, 0.98, 0.02]} rotation={[1.35, -0.15, -0.35]}>
        <Limb length={0.46} radius={0.04} color={skin} />
        <mesh position={[0, -0.46, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      <mesh position={[0, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.16, 24, 18]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>
      <mesh position={[-0.15, 1.18, 0]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0.15, 1.18, 0]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, 1.14, -0.14]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#e7a888" />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <group key={x} position={[x, 1.2, -0.13]}>
          <mesh>
            <sphereGeometry args={[0.028, 12, 10]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, -0.018]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.08, -0.145]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.045, 0.008, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#9f1239" />
      </mesh>

      {boy ? (
        <mesh position={[0, 1.28, 0.01]} scale={[1.05, 0.55, 1.05]} castShadow>
          <sphereGeometry args={[0.155, 18, 12]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
      ) : (
        <group>
          <mesh position={[0, 1.26, 0.03]} scale={[1.08, 0.7, 1.12]} castShadow>
            <sphereGeometry args={[0.16, 18, 14]} />
            <meshStandardMaterial color={hair} roughness={0.75} />
          </mesh>
          <mesh position={[0.02, 1.02, 0.1]} castShadow>
            <capsuleGeometry args={[0.045, 0.22, 4, 8]} />
            <meshStandardMaterial color={hair} roughness={0.75} />
          </mesh>
          <mesh position={[0.1, 1.3, -0.02]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshStandardMaterial color="#fb7185" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function ShopperRig({
  shopper,
  trolleyZRef,
  travelRef,
  cartBounceKey,
  landedItems,
  renderCartItem,
}: {
  shopper: ShopperChoice;
  trolleyZRef: React.MutableRefObject<number>;
  travelRef: React.MutableRefObject<number>;
  cartBounceKey: number;
  landedItems: TrolleyShelfItem[];
  /** Coin shop can pass premium toy meshes; trolley keeps grocery defaults. */
  renderCartItem?: (item: TrolleyShelfItem, scale: number) => ReactNode;
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
      <HumanChild shopper={shopper} travelRef={travelRef} />
      {landedItems.map((item, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return (
          <group
            key={item.id}
            position={[-0.2 + col * 0.13, 0.5, -1.05 + row * 0.16]}
          >
            {renderCartItem ? (
              renderCartItem(item, 0.38)
            ) : (
              <GroceryModel shape={item.shape} color={item.color} scale={0.38} />
            )}
          </group>
        );
      })}
    </group>
  );
}
