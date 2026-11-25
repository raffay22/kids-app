"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { GroceryShape } from "@/utils/trolleyCatalog";

function Mat({
  color,
  roughness = 0.42,
}: {
  color: string;
  roughness?: number;
}) {
  return (
    <meshStandardMaterial color={color} roughness={roughness} metalness={0.04} />
  );
}

export function GroceryModel({
  shape,
  color,
  scale = 1,
}: {
  shape: GroceryShape;
  color: string;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      {shape === "apple" && (
        <>
          <mesh castShadow>
            <sphereGeometry args={[0.2, 20, 16]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.08, 6]} />
            <Mat color="#5b3a1a" roughness={0.7} />
          </mesh>
        </>
      )}
      {shape === "berry" && (
        <>
          <mesh position={[-0.06, 0, 0]} castShadow>
            <sphereGeometry args={[0.1, 12, 10]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0.07, 0.02, 0.02]} castShadow>
            <sphereGeometry args={[0.1, 12, 10]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.08, -0.05]} castShadow>
            <sphereGeometry args={[0.09, 12, 10]} />
            <Mat color={color} />
          </mesh>
        </>
      )}
      {shape === "banana" && (
        <mesh rotation={[0.2, 0, 0.7]} scale={[0.16, 0.42, 0.16]} castShadow>
          <sphereGeometry args={[1, 16, 12]} />
          <Mat color={color} />
        </mesh>
      )}
      {shape === "carton" && (
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.38, 0.26]} />
          <Mat color={color} roughness={0.55} />
        </mesh>
      )}
      {shape === "bottle" && (
        <>
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.28, 12]} />
            <Mat color={color} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.1, 8]} />
            <Mat color={color} roughness={0.25} />
          </mesh>
        </>
      )}
      {shape === "can" && (
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.28, 16]} />
          <Mat color={color} roughness={0.28} metalness={0.35} />
        </mesh>
      )}
      {shape === "box" && (
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.32, 0.18]} />
          <Mat color={color} roughness={0.6} />
        </mesh>
      )}
      {shape === "loaf" && (
        <mesh scale={[1, 0.72, 0.7]} castShadow>
          <sphereGeometry args={[0.2, 16, 12]} />
          <Mat color={color} roughness={0.7} />
        </mesh>
      )}
      {shape === "bag" && (
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.14, 0.3, 10]} />
          <Mat color={color} roughness={0.75} />
        </mesh>
      )}
      {shape === "cone" && (
        <mesh position={[0, 0.02, 0]} castShadow>
          <coneGeometry args={[0.12, 0.36, 12]} />
          <Mat color={color} />
        </mesh>
      )}
      {shape === "cylinder" && (
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.32, 12]} />
          <Mat color={color} />
        </mesh>
      )}
      {shape === "leaf" && (
        <mesh rotation={[0.4, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.18, 12, 8]} />
          <Mat color={color} />
        </mesh>
      )}
      {shape === "egg" && (
        <mesh scale={[0.85, 1.15, 0.85]} castShadow>
          <sphereGeometry args={[0.16, 16, 12]} />
          <Mat color={color} roughness={0.35} />
        </mesh>
      )}
      {shape === "donut" && (
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.12, 0.06, 10, 18]} />
          <Mat color={color} />
        </mesh>
      )}
      {shape === "pizza" && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 20]} />
            <Mat color="#fde68a" />
          </mesh>
          <mesh position={[0.05, 0.04, 0.02]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[-0.06, 0.04, -0.02]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <Mat color={color} />
          </mesh>
        </>
      )}
      {shape === "ice" && (
        <>
          <mesh position={[0, -0.08, 0]}>
            <coneGeometry args={[0.08, 0.2, 10]} />
            <Mat color="#f3d2a4" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 12]} />
            <Mat color={color} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function ShelfLabel({ word }: { word: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 512, 128);
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.beginPath();
    ctx.roundRect(8, 16, 496, 96, 28);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.font = "800 92px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, 256, 66, 480);
    const next = new THREE.CanvasTexture(canvas);
    next.needsUpdate = true;
    return next;
  }, [word]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, -0.58, 0.16]}>
      <planeGeometry args={[1.15, 0.34]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
