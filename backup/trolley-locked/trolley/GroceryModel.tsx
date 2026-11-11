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
            <sphereGeometry args={[0.2, 24, 18]} />
            <Mat color={color} roughness={0.32} />
          </mesh>
          <mesh position={[0, 0.16, 0.08]} scale={[1, 0.45, 0.7]}>
            <sphereGeometry args={[0.07, 12, 8]} />
            <Mat color="#166534" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.018, 0.09, 6]} />
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
        <group rotation={[0.4, 0.2, 0.5]}>
          {[0, 1, 2, 3, 4].map((step) => (
            <mesh
              key={step}
              position={[step * 0.07, Math.sin(step * 0.55) * 0.08, 0]}
              scale={[0.07, 0.09 - step * 0.008, 0.07]}
              castShadow
            >
              <sphereGeometry args={[1, 12, 10]} />
              <Mat color={step === 4 ? "#a16207" : color} />
            </mesh>
          ))}
        </group>
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
        <>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.34, 0.18]} />
            <Mat color={color} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.02, 0.092]}>
            <boxGeometry args={[0.2, 0.12, 0.01]} />
            <Mat color="#fffdf8" roughness={0.4} />
          </mesh>
        </>
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
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[0.13, 0.055, 12, 20]} />
            <Mat color="#f6d7a7" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <torusGeometry args={[0.13, 0.04, 10, 20]} />
            <Mat color={color} roughness={0.28} />
          </mesh>
        </group>
      )}
      {shape === "pizza" && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
            <Mat color="#f6d7a7" />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
            <Mat color="#dc2626" roughness={0.4} />
          </mesh>
          {[
            [0.06, 0.05],
            [-0.05, 0.04],
            [0.01, -0.06],
          ].map(([x, z]) => (
            <mesh key={`${x}-${z}`} position={[x, 0.05, z]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <Mat color={color} />
            </mesh>
          ))}
        </>
      )}
      {shape === "cupcake" && (
        <>
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.08, 0.16, 14]} />
            <Mat color="#fde68a" />
          </mesh>
          <mesh position={[0, 0.06, 0]} castShadow>
            <sphereGeometry args={[0.12, 16, 12]} />
            <Mat color={color} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <Mat color="#ef4444" />
          </mesh>
        </>
      )}
      {shape === "chocolate" && (
        <>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.14, 0.2]} />
            <Mat color={color} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.04, 0.02]}>
            <boxGeometry args={[0.01, 0.08, 0.16]} />
            <Mat color="#3f1d0b" roughness={0.5} />
          </mesh>
          <mesh position={[0.08, 0.04, 0.02]}>
            <boxGeometry args={[0.01, 0.08, 0.16]} />
            <Mat color="#3f1d0b" roughness={0.5} />
          </mesh>
        </>
      )}
      {shape === "teddy" && (
        <>
          <mesh position={[0, -0.08, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 12]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <sphereGeometry args={[0.11, 16, 12]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[-0.08, 0.16, 0]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0.08, 0.16, 0]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.05, 0.09]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <Mat color="#fde68a" />
          </mesh>
          <mesh position={[-0.035, 0.1, 0.09]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <Mat color="#1e293b" roughness={0.3} />
          </mesh>
          <mesh position={[0.035, 0.1, 0.09]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <Mat color="#1e293b" roughness={0.3} />
          </mesh>
        </>
      )}
      {shape === "ball" && (
        <mesh castShadow>
          <sphereGeometry args={[0.18, 20, 16]} />
          <Mat color={color} roughness={0.35} />
        </mesh>
      )}
      {shape === "toy" && (
        <>
          <mesh position={[0, -0.04, 0]} castShadow>
            <boxGeometry args={[0.28, 0.16, 0.16]} />
            <Mat color={color} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.12, 0.1, 0.1]} />
            <Mat color="#f8fafc" />
          </mesh>
        </>
      )}
      {shape === "ice" && (
        <>
          <mesh position={[0, -0.1, 0]} castShadow>
            <coneGeometry args={[0.07, 0.22, 12]} />
            <Mat color="#f3d2a4" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 12]} />
            <Mat color={color} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.07, 14, 10]} />
            <Mat color="#fbcfe8" roughness={0.25} />
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
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, 512, 220);
    ctx.strokeStyle = "#c2410c";
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, 496, 204);
    ctx.fillStyle = "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const parts = word.trim().split(/\s+/);
    if (parts.length === 1) {
      ctx.font = "800 86px sans-serif";
      ctx.fillText(word, 256, 112, 470);
    } else {
      ctx.font = "800 72px sans-serif";
      ctx.fillText(parts[0], 256, 78, 470);
      ctx.fillText(parts.slice(1).join(" "), 256, 152, 470);
    }
    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    next.needsUpdate = true;
    return next;
  }, [word]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={[0, -0.16, 0.9]} renderOrder={3}>
      <planeGeometry args={[0.78, 0.3]} />
      <meshBasicMaterial map={texture} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}
