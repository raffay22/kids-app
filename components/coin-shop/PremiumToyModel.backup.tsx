"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { PremiumToyKind } from "@/utils/coinShop";

function Plastic({
  color,
  roughness = 0.22,
  metalness = 0.05,
  clearcoat = 0.85,
  clearcoatRoughness = 0.18,
  envMapIntensity = 1.35,
}: {
  color: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      sheen={0.55}
      sheenRoughness={0.45}
      sheenColor="#ffffff"
      envMapIntensity={envMapIntensity}
    />
  );
}

function SoftFur({ color, roughness = 0.92 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      sheen={1}
      sheenRoughness={0.28}
      sheenColor="#fff7ed"
      clearcoat={0.08}
      clearcoatRoughness={0.7}
      envMapIntensity={0.45}
    />
  );
}

function Metal({
  color,
  metalness = 0.92,
  roughness = 0.18,
}: {
  color: string;
  metalness?: number;
  roughness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      clearcoat={0.35}
      clearcoatRoughness={0.2}
      envMapIntensity={1.6}
    />
  );
}

function Glass({ color = "#93c5fd" }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.05}
      metalness={0.05}
      transmission={0.72}
      thickness={0.35}
      ior={1.45}
      transparent
      opacity={0.92}
      envMapIntensity={1.8}
    />
  );
}

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 256) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function useSoccerTexture(accent: string) {
  return useMemo(
    () =>
      canvasTexture((ctx, size) => {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = accent;
        const cells = 5;
        const cell = size / cells;
        for (let y = 0; y < cells; y++) {
          for (let x = 0; x < cells; x++) {
            if ((x + y) % 2 === 0) {
              ctx.beginPath();
              ctx.moveTo((x + 0.5) * cell, y * cell + 4);
              ctx.lineTo(x * cell + 4, (y + 0.55) * cell);
              ctx.lineTo((x + 0.5) * cell, (y + 1) * cell - 4);
              ctx.lineTo((x + 1) * cell - 4, (y + 0.55) * cell);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }),
    [accent],
  );
}

function useBookTexture(color: string, accent: string) {
  return useMemo(
    () =>
      canvasTexture((ctx, size) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = accent;
        ctx.fillRect(18, 28, size - 36, 36);
        ctx.fillStyle = "#fffbeb";
        ctx.font = "bold 42px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("STORY", size / 2, 56);
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(size / 2, size * 0.62, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(size / 2, size * 0.48);
        ctx.lineTo(size * 0.62, size * 0.7);
        ctx.lineTo(size * 0.38, size * 0.7);
        ctx.closePath();
        ctx.fill();
      }),
    [color, accent],
  );
}

function useBlockLetter(letter: string, face: string) {
  return useMemo(
    () =>
      canvasTexture((ctx, size) => {
        ctx.fillStyle = face;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "rgba(15,23,42,0.25)";
        ctx.lineWidth = 10;
        ctx.strokeRect(8, 8, size - 16, size - 16);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 160px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, size / 2, size / 2 + 8);
      }, 128),
    [letter, face],
  );
}

/** High-detail procedural toys for the coin shop (coin-shop only — not trolley). */
export default function PremiumToyModel({
  kind,
  color,
  accent,
  scale = 1,
}: {
  kind: PremiumToyKind;
  color: string;
  accent: string;
  scale?: number;
}) {
  const soccerMap = useSoccerTexture(accent);
  const bookMap = useBookTexture(color, accent);
  const blockA = useBlockLetter("A", color);
  const blockB = useBlockLetter("B", accent);
  const blockC = useBlockLetter("C", "#fbbf24");

  return (
    <group scale={scale}>
      {kind === "teddy" && (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <sphereGeometry args={[0.17, 48, 36]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0, 0.26, 0.02]} castShadow>
            <sphereGeometry args={[0.135, 40, 32]} />
            <SoftFur color={color} />
          </mesh>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.058, 24, 18]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0, 0.24, 0.125]} castShadow>
            <sphereGeometry args={[0.048, 20, 16]} />
            <SoftFur color={accent} roughness={0.98} />
          </mesh>
          {[-0.045, 0.045].map((x) => (
            <mesh key={`eye-${x}`} position={[x, 0.28, 0.12]}>
              <sphereGeometry args={[0.018, 14, 12]} />
              <Metal color="#1c1917" metalness={0.4} roughness={0.35} />
            </mesh>
          ))}
          {[-0.16, 0.16].map((x) => (
            <mesh key={`arm-${x}`} position={[x, 0.02, 0.02]} rotation={[0.2, 0, x > 0 ? -0.4 : 0.4]} castShadow>
              <capsuleGeometry args={[0.048, 0.1, 8, 16]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          {[-0.07, 0.07].map((x) => (
            <mesh key={`leg-${x}`} position={[x, -0.12, 0.02]} castShadow>
              <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0.14]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.07, 0.018, 12, 28]} />
            <Plastic color="#ef4444" clearcoat={1} />
          </mesh>
        </group>
      )}

      {kind === "doll" && (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.11, 36, 28]} />
            <Plastic color="#fde4d0" roughness={0.45} clearcoat={0.25} />
          </mesh>
          <mesh position={[0, 0.38, -0.01]} scale={[1.15, 0.85, 1.1]} castShadow>
            <sphereGeometry args={[0.12, 28, 20]} />
            <SoftFur color={accent} roughness={0.85} />
          </mesh>
          <mesh position={[0.1, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.03, 12, 10]} />
            <Plastic color="#f9a8d4" />
          </mesh>
          {[-0.04, 0.04].map((x) => (
            <mesh key={x} position={[x, 0.32, 0.095]}>
              <sphereGeometry args={[0.016, 12, 10]} />
              <meshStandardMaterial color="#1e3a8a" />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0]} castShadow>
            <coneGeometry args={[0.17, 0.3, 32]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <torusGeometry args={[0.095, 0.022, 12, 36]} />
            <Metal color="#fbbf24" />
          </mesh>
          <mesh position={[0, -0.05, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.06, 20]} />
            <Plastic color="#fde4d0" roughness={0.5} />
          </mesh>
        </group>
      )}

      {kind === "race-car" && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.46, 0.1, 0.22]} radius={0.04} smoothness={4} position={[0, 0.07, 0]} castShadow>
            <Plastic color={color} metalness={0.28} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.09, 0.18]} radius={0.03} smoothness={4} position={[-0.02, 0.155, 0]} castShadow>
            <Glass color="#7dd3fc" />
          </RoundedBox>
          <mesh position={[0.2, 0.09, 0]} castShadow>
            <boxGeometry args={[0.06, 0.035, 0.16]} />
            <Plastic color="#fde047" />
          </mesh>
          <mesh position={[-0.2, 0.09, 0]} castShadow>
            <boxGeometry args={[0.05, 0.03, 0.16]} />
            <meshStandardMaterial color="#ef4444" emissive="#f87171" emissiveIntensity={0.55} />
          </mesh>
          {[
            [-0.15, -0.11],
            [0.15, -0.11],
            [-0.15, 0.11],
            [0.15, 0.11],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0.045, z]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.045, 24]} />
                <Plastic color={accent} roughness={0.55} metalness={0.15} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
                <Metal color="#cbd5e1" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.075, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.08, 0.008, 8, 28]} />
            <Metal color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>
      )}

      {kind === "soccer-ball" && (
        <mesh castShadow>
          <sphereGeometry args={[0.18, 48, 36]} />
          <meshPhysicalMaterial
            map={soccerMap ?? undefined}
            color={soccerMap ? "#ffffff" : color}
            roughness={0.28}
            metalness={0.05}
            clearcoat={0.9}
            clearcoatRoughness={0.2}
            envMapIntensity={1.4}
          />
        </mesh>
      )}

      {kind === "robot" && (
        <group>
          <RoundedBox args={[0.18, 0.15, 0.15]} radius={0.03} smoothness={4} position={[0, 0.2, 0]} castShadow>
            <Metal color={color} metalness={0.78} roughness={0.22} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.2, 0.16]} radius={0.035} smoothness={4} position={[0, 0.02, 0]} castShadow>
            <Metal color={color} metalness={0.72} roughness={0.25} />
          </RoundedBox>
          {[-0.055, 0.055].map((x) => (
            <mesh key={x} position={[x, 0.22, 0.08]}>
              <sphereGeometry args={[0.028, 16, 14]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
            </mesh>
          ))}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
            <Metal color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.02, 12, 10]} />
            <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={0.9} />
          </mesh>
          {[-0.15, 0.15].map((x) => (
            <mesh key={`arm-${x}`} position={[x, 0.04, 0]} castShadow>
              <capsuleGeometry args={[0.032, 0.12, 6, 12]} />
              <Metal color={accent} metalness={0.65} roughness={0.28} />
            </mesh>
          ))}
          {[-0.06, 0.06].map((x) => (
            <mesh key={`leg-${x}`} position={[x, -0.14, 0]} castShadow>
              <capsuleGeometry args={[0.035, 0.08, 6, 12]} />
              <Metal color="#64748b" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "storybook" && (
        <group rotation={[0.12, 0.45, 0.05]}>
          <RoundedBox args={[0.24, 0.3, 0.055]} radius={0.012} smoothness={3} castShadow>
            <meshPhysicalMaterial
              map={bookMap ?? undefined}
              color={bookMap ? "#ffffff" : color}
              roughness={0.48}
              metalness={0.05}
              clearcoat={0.35}
              envMapIntensity={0.9}
            />
          </RoundedBox>
          <mesh position={[0.125, 0, 0]} castShadow>
            <boxGeometry args={[0.018, 0.3, 0.055]} />
            <Plastic color={accent} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.2, 0.26]} />
            <meshStandardMaterial color="#fffbeb" roughness={0.9} />
          </mesh>
        </group>
      )}

      {kind === "rocket" && (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.11, 0.32, 32]} />
            <Metal color={color} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.085, 0.16, 28]} />
            <Plastic color={accent} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.14, 0.09]}>
            <circleGeometry args={[0.035, 20]} />
            <Glass color="#38bdf8" />
          </mesh>
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((a, i) => (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.11, -0.02, Math.sin(a) * 0.11]}
              rotation={[0.35, a, 0]}
              castShadow
            >
              <coneGeometry args={[0.045, 0.12, 10]} />
              <Plastic color={accent} />
            </mesh>
          ))}
          <mesh position={[0, -0.1, 0]}>
            <coneGeometry args={[0.055, 0.12, 16]} />
            <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={1.1} />
          </mesh>
        </group>
      )}

      {kind === "unicorn" && (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.145, 36, 28]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0.12, 0.18, 0.03]} castShadow>
            <sphereGeometry args={[0.1, 32, 24]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0.16, 0.3, 0.02]} rotation={[0.25, 0, -0.35]} castShadow>
            <coneGeometry args={[0.028, 0.14, 16]} />
            <Metal color="#fde68a" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0.04, 0.24, -0.02]} castShadow>
            <sphereGeometry args={[0.085, 20, 16]} />
            <SoftFur color={accent} roughness={0.8} />
          </mesh>
          <mesh position={[-0.12, 0.12, -0.02]} rotation={[0.5, 0, 0.6]} castShadow>
            <coneGeometry args={[0.05, 0.16, 12]} />
            <SoftFur color={accent} />
          </mesh>
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.04]} castShadow>
              <capsuleGeometry args={[0.03, 0.08, 6, 12]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0.14, 0.2, 0.09]}>
            <sphereGeometry args={[0.015, 10, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      )}

      {kind === "dino" && (
        <group>
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.155, 36, 28]} />
            <SoftFur color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0.15, 0.16, 0.04]} castShadow>
            <sphereGeometry args={[0.095, 28, 22]} />
            <SoftFur color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0.22, 0.14, 0.08]} castShadow>
            <coneGeometry args={[0.04, 0.09, 12]} />
            <SoftFur color={color} />
          </mesh>
          {[-0.02, 0.04, 0.1].map((y, i) => (
            <mesh key={i} position={[-0.12 + i * 0.02, 0.14 + y * 0.2, -0.02]} rotation={[0.3, 0, 0.45]} castShadow>
              <coneGeometry args={[0.04 - i * 0.005, 0.1 - i * 0.01, 10]} />
              <SoftFur color={accent} />
            </mesh>
          ))}
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.05]} castShadow>
              <capsuleGeometry args={[0.032, 0.07, 6, 12]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0.18, 0.18, 0.12]}>
            <sphereGeometry args={[0.016, 10, 8]} />
            <meshStandardMaterial color="#14532d" />
          </mesh>
        </group>
      )}

      {kind === "drum" && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.17, 48]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, -0.02 + i * 0.04, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
              <torusGeometry args={[0.161, 0.008, 8, 48]} />
              <Metal color={accent} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.155, 0.155, 0.02, 48]} />
            <Plastic color="#fef3c7" roughness={0.55} clearcoat={0.4} />
          </mesh>
          <mesh position={[0.12, 0.18, 0.05]} rotation={[0.4, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 10]} />
            <Plastic color="#78350f" roughness={0.7} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0.06]} rotation={[-0.35, 0, -0.25]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
            <Plastic color="#78350f" roughness={0.7} />
          </mesh>
        </group>
      )}

      {kind === "paint-set" && (
        <group>
          <RoundedBox args={[0.3, 0.06, 0.22]} radius={0.02} smoothness={3} castShadow>
            <Plastic color={color} roughness={0.55} />
          </RoundedBox>
          {[
            ["#ef4444", -0.09, -0.04],
            ["#22c55e", 0, -0.04],
            ["#3b82f6", 0.09, -0.04],
            ["#fbbf24", -0.09, 0.05],
            ["#a855f7", 0, 0.05],
            ["#fb7185", 0.09, 0.05],
          ].map(([c, x, z]) => (
            <mesh key={`${c}-${x}`} position={[Number(x), 0.045, Number(z)]} castShadow>
              <cylinderGeometry args={[0.032, 0.035, 0.028, 20]} />
              <Plastic color={c as string} clearcoat={1} />
            </mesh>
          ))}
          <mesh position={[0.12, 0.1, 0.08]} rotation={[0.4, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
            <Plastic color="#f5d0c5" roughness={0.65} />
          </mesh>
          <mesh position={[0.12, 0.2, 0.11]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <Plastic color={accent} />
          </mesh>
        </group>
      )}

      {kind === "kite" && (
        <group rotation={[0.35, 0.5, 0.12]}>
          <mesh castShadow>
            <octahedronGeometry args={[0.2, 0]} />
            <Plastic color={color} clearcoat={1} envMapIntensity={1.6} />
          </mesh>
          <mesh scale={[0.98, 0.98, 0.98]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color={accent} wireframe transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.015, 0.22, 0.015]} />
            <Plastic color="#f8fafc" />
          </mesh>
          {[0.05, 0.1, 0.15].map((y, i) => (
            <mesh key={y} position={[0.04 * (i % 2 === 0 ? 1 : -1), -0.18 - y * 0.35, 0]}>
              <planeGeometry args={[0.05, 0.04]} />
              <meshStandardMaterial color={i % 2 ? accent : color} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "train" && (
        <group>
          <RoundedBox args={[0.22, 0.15, 0.16]} radius={0.03} smoothness={4} position={[-0.08, 0.1, 0]} castShadow>
            <Plastic color={color} metalness={0.35} clearcoat={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.11, 0.15]} radius={0.025} smoothness={4} position={[0.16, 0.08, 0]} castShadow>
            <Plastic color={accent} metalness={0.25} />
          </RoundedBox>
          <mesh position={[-0.08, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.09, 20]} />
            <Metal color="#94a3b8" />
          </mesh>
          <mesh position={[-0.08, 0.28, 0]}>
            <sphereGeometry args={[0.02, 12, 10]} />
            <meshStandardMaterial color="#64748b" emissive="#94a3b8" emissiveIntensity={0.4} />
          </mesh>
          {[-0.16, 0, 0.16].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.04, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.035, 20]} />
                <Plastic color="#1e293b" roughness={0.6} />
              </mesh>
              <mesh position={[x, 0.04, -0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.035, 20]} />
                <Plastic color="#1e293b" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "blocks" && (
        <group>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[-0.07, 0.065, 0]} castShadow>
            <meshPhysicalMaterial
              map={blockA ?? undefined}
              color={blockA ? "#ffffff" : color}
              roughness={0.35}
              clearcoat={0.7}
              envMapIntensity={1.1}
            />
          </RoundedBox>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[0.08, 0.065, 0.04]} castShadow>
            <meshPhysicalMaterial
              map={blockB ?? undefined}
              color={blockB ? "#ffffff" : accent}
              roughness={0.35}
              clearcoat={0.7}
              envMapIntensity={1.1}
            />
          </RoundedBox>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[0.01, 0.18, -0.02]} castShadow>
            <meshPhysicalMaterial
              map={blockC ?? undefined}
              color={blockC ? "#ffffff" : "#fbbf24"}
              roughness={0.35}
              clearcoat={0.7}
              envMapIntensity={1.1}
            />
          </RoundedBox>
        </group>
      )}

      {kind === "yacht" && (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.4, 0.07, 0.16]} />
            <Plastic color={color} metalness={0.2} clearcoat={1} />
          </mesh>
          <mesh position={[0.12, 0.04, 0]} rotation={[0, 0, -0.4]} castShadow>
            <coneGeometry args={[0.08, 0.18, 16]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <RoundedBox args={[0.18, 0.1, 0.12]} radius={0.02} smoothness={3} position={[0.02, 0.12, 0]} castShadow>
            <Glass color="#e0f2fe" />
          </RoundedBox>
          <mesh position={[-0.06, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.24, 10]} />
            <Metal color="#94a3b8" />
          </mesh>
          <mesh position={[-0.02, 0.2, 0]} rotation={[0, 0, 0.35]}>
            <planeGeometry args={[0.12, 0.16]} />
            <meshStandardMaterial color={accent} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {kind === "camera" && (
        <group>
          <RoundedBox args={[0.26, 0.15, 0.13]} radius={0.03} smoothness={4} castShadow>
            <Metal color={color} metalness={0.55} roughness={0.28} />
          </RoundedBox>
          <mesh position={[0.04, 0, 0.09]} castShadow>
            <cylinderGeometry args={[0.055, 0.06, 0.07, 32]} />
            <Metal color={accent} metalness={0.45} roughness={0.25} />
          </mesh>
          <mesh position={[0.04, 0, 0.13]}>
            <circleGeometry args={[0.035, 24]} />
            <Glass color="#0ea5e9" />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.07]}>
            <sphereGeometry args={[0.016, 12, 10]} />
            <meshStandardMaterial color="#f87171" emissive="#ef4444" emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.06]} />
            <Plastic color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[-0.1, -0.02, 0.07]}>
            <boxGeometry args={[0.04, 0.02, 0.01]} />
            <Plastic color="#22c55e" />
          </mesh>
        </group>
      )}
    </group>
  );
}
