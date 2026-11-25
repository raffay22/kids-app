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

const textureCache = new Map<string, THREE.CanvasTexture>();

function getCachedCanvasTexture(
  key: string,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size = 256,
) {
  if (typeof document === "undefined") return null;
  const hit = textureCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

function useSoccerTexture(accent: string) {
  return useMemo(
    () =>
      getCachedCanvasTexture(`soccer-${accent}`, (ctx, size) => {
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
      getCachedCanvasTexture(`book-${color}-${accent}`, (ctx, size) => {
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
      }),
    [color, accent],
  );
}

function useBlockLetter(letter: string, face: string) {
  return useMemo(
    () =>
      getCachedCanvasTexture(
        `block-${letter}-${face}`,
        (ctx, size) => {
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
        },
        128,
      ),
    [letter, face],
  );
}

/** Shared plush animal base for bunny, panda, puppy, kitty with distinct ears/snouts/tails. */
function PlushPet({
  species,
  color,
  accent,
}: {
  species: "bunny" | "panda" | "puppy" | "kitty";
  color: string;
  accent: string;
}) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.16, 32, 24]} />
        <SoftFur color={color} />
      </mesh>
      {/* Belly patch */}
      <mesh position={[0, 0.01, 0.11]} scale={[0.72, 0.82, 0.5]}>
        <sphereGeometry args={[0.12, 20, 16]} />
        <SoftFur color={species === "panda" ? "#1e293b" : "#fff7ed"} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.25, 0.02]} castShadow>
        <sphereGeometry args={[0.135, 32, 24]} />
        <SoftFur color={color} />
      </mesh>
      {/* Species ears */}
      {species === "bunny" &&
        [-0.065, 0.065].map((x) => (
          <group key={x} position={[x, 0.43, 0]} rotation={[0.08, 0, x < 0 ? 0.12 : -0.12]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.032, 0.15, 6, 12]} />
              <SoftFur color={color} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <capsuleGeometry args={[0.018, 0.11, 4, 8]} />
              <SoftFur color={accent} />
            </mesh>
          </group>
        ))}
      {species === "panda" &&
        [-0.11, 0.11].map((x) => (
          <mesh key={x} position={[x, 0.36, 0]} castShadow>
            <sphereGeometry args={[0.055, 18, 14]} />
            <SoftFur color={accent} />
          </mesh>
        ))}
      {species === "puppy" &&
        [-0.13, 0.13].map((x) => (
          <mesh key={x} position={[x, 0.24, 0.01]} rotation={[0.15, 0, x < 0 ? 0.35 : -0.35]} castShadow>
            <capsuleGeometry args={[0.036, 0.11, 6, 12]} />
            <SoftFur color={accent} />
          </mesh>
        ))}
      {species === "kitty" &&
        [-0.095, 0.095].map((x) => (
          <mesh key={x} position={[x, 0.37, 0.01]} rotation={[0, 0, x < 0 ? 0.22 : -0.22]} castShadow>
            <coneGeometry args={[0.052, 0.11, 12]} />
            <SoftFur color={accent} />
          </mesh>
        ))}
      {/* Panda eye patches */}
      {species === "panda" &&
        [-0.05, 0.05].map((x) => (
          <mesh key={`patch-${x}`} position={[x, 0.27, 0.115]} scale={[1.1, 1.3, 0.4]}>
            <sphereGeometry args={[0.032, 12, 10]} />
            <SoftFur color={accent} />
          </mesh>
        ))}
      {/* Eyes */}
      {[-0.048, 0.048].map((x) => (
        <mesh key={`eye-${x}`} position={[x, 0.275, 0.132]}>
          <sphereGeometry args={[0.018, 12, 10]} />
          <Metal color="#111827" metalness={0.35} roughness={0.2} />
        </mesh>
      ))}
      {/* Snout & nose */}
      <mesh position={[0, 0.23, 0.13]}>
        <sphereGeometry args={[0.042, 16, 12]} />
        <SoftFur color="#fffbeb" />
      </mesh>
      <mesh position={[0, 0.242, 0.168]}>
        <sphereGeometry args={[0.016, 10, 8]} />
        <Plastic color={species === "bunny" || species === "kitty" ? "#fb7185" : "#1e293b"} />
      </mesh>
      {/* Arms & Legs */}
      {[-0.15, 0.15].map((x) => (
        <mesh key={`arm-${x}`} position={[x, 0.03, 0.02]} rotation={[0.2, 0, x > 0 ? -0.4 : 0.4]} castShadow>
          <capsuleGeometry args={[0.042, 0.09, 6, 12]} />
          <SoftFur color={species === "panda" ? accent : color} />
        </mesh>
      ))}
      {[-0.07, 0.07].map((x) => (
        <mesh key={`leg-${x}`} position={[x, -0.11, 0.03]} castShadow>
          <capsuleGeometry args={[0.046, 0.07, 6, 12]} />
          <SoftFur color={species === "panda" ? accent : color} />
        </mesh>
      ))}
      {/* Collar bow */}
      <mesh position={[0, 0.11, 0.12]}>
        <torusGeometry args={[0.055, 0.015, 10, 24]} />
        <Plastic color={accent} clearcoat={1} />
      </mesh>
    </group>
  );
}

/** High-detail procedural 3D toys for all 60 unique items in the 30-row Amazon Coin Mart. */
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
            <sphereGeometry args={[0.17, 36, 28]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0, 0.26, 0.02]} castShadow>
            <sphereGeometry args={[0.135, 32, 24]} />
            <SoftFur color={color} />
          </mesh>
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.058, 20, 16]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0, 0.24, 0.125]} castShadow>
            <sphereGeometry args={[0.048, 16, 14]} />
            <SoftFur color={accent} roughness={0.98} />
          </mesh>
          {[-0.045, 0.045].map((x) => (
            <mesh key={`eye-${x}`} position={[x, 0.28, 0.12]}>
              <sphereGeometry args={[0.018, 12, 10]} />
              <Metal color="#1c1917" metalness={0.4} roughness={0.35} />
            </mesh>
          ))}
          {[-0.16, 0.16].map((x) => (
            <mesh key={`arm-${x}`} position={[x, 0.02, 0.02]} rotation={[0.2, 0, x > 0 ? -0.4 : 0.4]} castShadow>
              <capsuleGeometry args={[0.048, 0.1, 6, 12]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          {[-0.07, 0.07].map((x) => (
            <mesh key={`leg-${x}`} position={[x, -0.12, 0.02]} castShadow>
              <capsuleGeometry args={[0.05, 0.08, 6, 12]} />
              <SoftFur color={color} />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0.14]} rotation={[0.15, 0, 0]}>
            <torusGeometry args={[0.07, 0.018, 10, 24]} />
            <Plastic color="#ef4444" clearcoat={1} />
          </mesh>
        </group>
      )}

      {(kind === "bunny" || kind === "panda" || kind === "puppy" || kind === "kitty") && (
        <PlushPet species={kind} color={color} accent={accent} />
      )}

      {kind === "doll" && (
        <group>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.11, 28, 22]} />
            <Plastic color="#fde4d0" roughness={0.45} clearcoat={0.25} />
          </mesh>
          <mesh position={[0, 0.38, -0.01]} scale={[1.15, 0.85, 1.1]} castShadow>
            <sphereGeometry args={[0.12, 24, 18]} />
            <SoftFur color={accent} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.44, 0]} castShadow>
            <coneGeometry args={[0.055, 0.07, 6]} />
            <Metal color="#facc15" />
          </mesh>
          {[-0.04, 0.04].map((x) => (
            <mesh key={x} position={[x, 0.32, 0.095]}>
              <sphereGeometry args={[0.016, 10, 8]} />
              <meshStandardMaterial color="#1e3a8a" />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0]} castShadow>
            <coneGeometry args={[0.17, 0.3, 28]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <torusGeometry args={[0.095, 0.022, 10, 28]} />
            <Metal color="#fbbf24" />
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
          {[
            [-0.15, -0.11],
            [0.15, -0.11],
            [-0.15, 0.11],
            [0.15, 0.11],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0.045, z]}>
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.045, 20]} />
                <Plastic color={accent} roughness={0.55} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.022, 0.022, 0.05, 12]} />
                <Metal color="#cbd5e1" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "firetruck" && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.48, 0.16, 0.22]} radius={0.03} smoothness={3} position={[0, 0.1, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.16, 0.14, 0.21]} radius={0.025} smoothness={3} position={[0.15, 0.2, 0]} castShadow>
            <Glass color="#bae6fd" />
          </RoundedBox>
          {/* Fire ladder on roof */}
          <mesh position={[-0.06, 0.21, 0]} rotation={[0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.34, 0.03, 0.1]} />
            <Metal color={accent} />
          </mesh>
          {/* Siren */}
          <mesh position={[0.16, 0.28, 0]}>
            <cylinderGeometry args={[0.025, 0.028, 0.04, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
          </mesh>
          {[-0.16, 0.16].map((x) =>
            [-0.11, 0.11].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.045, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.052, 0.052, 0.042, 18]} />
                <Plastic color="#1e293b" />
              </mesh>
            )),
          )}
        </group>
      )}

      {kind === "schoolbus" && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.5, 0.2, 0.22]} radius={0.035} smoothness={3} position={[0, 0.13, 0]} castShadow>
            <Plastic color={color} clearcoat={0.95} />
          </RoundedBox>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.46, 0.065, 0.225]} />
            <Glass color="#bae6fd" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.505, 0.022, 0.224]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.16, 0.16].map((x) =>
            [-0.11, 0.11].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.045, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.04, 18]} />
                <Plastic color={accent} />
              </mesh>
            )),
          )}
        </group>
      )}

      {kind === "helicopter" && (
        <group>
          <mesh position={[0, 0.12, 0]} scale={[1.35, 1, 0.95]} castShadow>
            <sphereGeometry args={[0.13, 28, 22]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0.06, 0.14, 0]}>
            <sphereGeometry args={[0.095, 22, 18]} />
            <Glass color={accent} />
          </mesh>
          <mesh position={[-0.22, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.035, 0.22, 12]} />
            <Plastic color={color} />
          </mesh>
          {/* Main rotor */}
          <mesh position={[0, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.06, 10]} />
            <Metal color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.44, 0.012, 0.04]} />
            <Metal color="#e2e8f0" />
          </mesh>
          <mesh position={[0, 0.28, 0]} rotation={[0, 1.97, 0]}>
            <boxGeometry args={[0.44, 0.012, 0.04]} />
            <Metal color="#e2e8f0" />
          </mesh>
          {/* Landing skids */}
          {[-0.08, 0.08].map((z) => (
            <mesh key={z} position={[0, 0.01, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
              <Metal color="#475569" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "airplane" && (
        <group rotation={[0.1, -0.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.12, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.3, 8, 18]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          {/* Wings */}
          <RoundedBox args={[0.12, 0.02, 0.48]} radius={0.008} position={[0.02, 0.12, 0]} castShadow>
            <Plastic color={accent} clearcoat={1} />
          </RoundedBox>
          {/* Tail fin */}
          <mesh position={[-0.17, 0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
            <boxGeometry args={[0.08, 0.11, 0.02]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0.11, 0.15, 0]}>
            <sphereGeometry args={[0.048, 16, 12]} />
            <Glass color="#38bdf8" />
          </mesh>
        </group>
      )}

      {kind === "tractor" && (
        <group rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.3, 0.14, 0.18]} radius={0.025} position={[0.04, 0.12, 0]} castShadow>
            <Plastic color={color} clearcoat={0.95} />
          </RoundedBox>
          <RoundedBox args={[0.16, 0.16, 0.17]} radius={0.02} position={[-0.06, 0.24, 0]} castShadow>
            <Glass color="#bae6fd" />
          </RoundedBox>
          {/* Exhaust chimney */}
          <mesh position={[0.13, 0.24, 0.05]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.12, 10]} />
            <Metal color="#334155" />
          </mesh>
          {/* Big rear wheels + front wheels */}
          {[-0.11, 0.11].map((z) => (
            <group key={z}>
              <mesh position={[-0.09, 0.09, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.05, 20]} />
                <Plastic color="#1e293b" />
              </mesh>
              <mesh position={[-0.09, 0.09, z * 1.05]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.048, 0.048, 0.052, 14]} />
                <Plastic color={accent} />
              </mesh>
              <mesh position={[0.13, 0.055, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.055, 0.055, 0.04, 16]} />
                <Plastic color="#1e293b" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "scooter" && (
        <group>
          <RoundedBox args={[0.34, 0.03, 0.11]} radius={0.012} position={[0, 0.05, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0.13, 0.2, 0]} rotation={[0, 0, -0.15]} castShadow>
            <cylinderGeometry args={[0.014, 0.016, 0.3, 12]} />
            <Metal color="#e2e8f0" />
          </mesh>
          <mesh position={[0.15, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.2, 12]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 18]} />
              <Plastic color={accent} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "soccer-ball" && (
        <mesh castShadow>
          <sphereGeometry args={[0.18, 36, 28]} />
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

      {kind === "basketball" && (
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.18, 36, 28]} />
            <Plastic color={color} roughness={0.42} clearcoat={0.5} />
          </mesh>
          {[0, Math.PI / 2].map((rot, idx) => (
            <mesh key={idx} rotation={[0, rot, 0]}>
              <torusGeometry args={[0.181, 0.007, 8, 36]} />
              <Plastic color={accent} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "skateboard" && (
        <group rotation={[0.2, 0.3, 0]}>
          <RoundedBox args={[0.44, 0.025, 0.14]} radius={0.012} position={[0, 0.07, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0, 0.084, 0]}>
            <boxGeometry args={[0.34, 0.005, 0.09]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.13, 0.13].map((x) =>
            [-0.06, 0.06].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.035, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.028, 0.028, 0.028, 14]} />
                <Plastic color={accent} />
              </mesh>
            )),
          )}
        </group>
      )}

      {kind === "tricycle" && (
        <group>
          <mesh position={[0.08, 0.16, 0]} rotation={[0, 0, -0.35]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.26, 12]} />
            <Plastic color={color} />
          </mesh>
          <mesh position={[-0.04, 0.18, 0]} castShadow>
            <boxGeometry args={[0.1, 0.035, 0.09]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0.14, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 12]} />
            <Metal color="#e2e8f0" />
          </mesh>
          <mesh position={[0.15, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.035, 20]} />
            <Plastic color="#1e293b" />
          </mesh>
          {[-0.09, 0.09].map((z) => (
            <mesh key={z} position={[-0.12, 0.055, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
              <Plastic color="#1e293b" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "bowling" && (
        <group>
          {[
            [-0.08, 0],
            [0.02, -0.05],
            [0.02, 0.06],
          ].map(([x, z], idx) => (
            <group key={idx} position={[x, 0, z]}>
              <mesh position={[0, 0.08, 0]} castShadow>
                <capsuleGeometry args={[0.036, 0.11, 6, 14]} />
                <Plastic color={color} clearcoat={1} />
              </mesh>
              <mesh position={[0, 0.13, 0]}>
                <torusGeometry args={[0.032, 0.007, 8, 20]} />
                <Plastic color={accent} />
              </mesh>
            </group>
          ))}
          <mesh position={[0.11, 0.05, 0.02]} castShadow>
            <sphereGeometry args={[0.065, 20, 16]} />
            <Plastic color={accent} clearcoat={1} />
          </mesh>
        </group>
      )}

      {kind === "bucket" && (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.1, 0.22, 28]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <torusGeometry args={[0.142, 0.015, 10, 28]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0.08, 0.24, 0]} rotation={[0, 0, -0.35]} castShadow>
            <boxGeometry args={[0.03, 0.18, 0.05]} />
            <Plastic color={accent} />
          </mesh>
        </group>
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
              <sphereGeometry args={[0.028, 14, 12]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
            </mesh>
          ))}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
            <Metal color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.02, 10, 8]} />
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

      {kind === "ufo" && (
        <group>
          <mesh position={[0, 0.1, 0]} scale={[1.3, 0.38, 1.3]} castShadow>
            <sphereGeometry args={[0.17, 28, 20]} />
            <Metal color={color} metalness={0.8} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.11, 24, 18]} />
            <Glass color={accent} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.21, 0.018, 10, 32]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.1} />
          </mesh>
        </group>
      )}

      {kind === "astronaut" && (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.125, 28, 22]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.25, 0.045]}>
            <sphereGeometry args={[0.095, 22, 18]} />
            <Metal color="#fbbf24" metalness={0.95} roughness={0.1} />
          </mesh>
          <RoundedBox args={[0.2, 0.2, 0.14]} radius={0.04} position={[0, 0.04, 0]} castShadow>
            <Plastic color={color} clearcoat={0.9} />
          </RoundedBox>
          <mesh position={[0, 0.05, 0.075]}>
            <boxGeometry args={[0.1, 0.07, 0.02]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.13, 0.13].map((x) => (
            <mesh key={x} position={[x, 0.04, 0]} castShadow>
              <capsuleGeometry args={[0.034, 0.1, 6, 12]} />
              <Plastic color={color} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "laptop" && (
        <group rotation={[0, 0.25, 0]}>
          <RoundedBox args={[0.3, 0.025, 0.22]} radius={0.01} position={[0, 0.02, 0.04]} castShadow>
            <Plastic color={color} clearcoat={0.9} />
          </RoundedBox>
          <RoundedBox
            args={[0.3, 0.21, 0.02]}
            radius={0.01}
            position={[0, 0.12, -0.06]}
            rotation={[-0.2, 0, 0]}
            castShadow
          >
            <Plastic color={color} clearcoat={0.9} />
          </RoundedBox>
          <mesh position={[0, 0.12, -0.048]} rotation={[-0.2, 0, 0]}>
            <planeGeometry args={[0.25, 0.16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} />
          </mesh>
        </group>
      )}

      {kind === "walkie" && (
        <group>
          <RoundedBox args={[0.16, 0.26, 0.08]} radius={0.025} position={[0, 0.08, 0]} castShadow>
            <Plastic color={color} clearcoat={0.95} />
          </RoundedBox>
          <mesh position={[0.04, 0.26, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.016, 0.14, 10]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.13, 0.042]}>
            <planeGeometry args={[0.1, 0.07]} />
            <Glass color="#38bdf8" />
          </mesh>
          <mesh position={[0, 0.02, 0.042]}>
            <circleGeometry args={[0.045, 18]} />
            <Metal color={accent} />
          </mesh>
        </group>
      )}

      {kind === "telescope" && (
        <group>
          <mesh position={[0, 0.18, 0]} rotation={[0.3, 0.4, -0.95]} castShadow>
            <cylinderGeometry args={[0.038, 0.055, 0.34, 20]} />
            <Metal color={color} metalness={0.65} roughness={0.25} />
          </mesh>
          <mesh position={[0.12, 0.25, 0.06]} rotation={[0.3, 0.4, -0.95]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 20]} />
            <Metal color={accent} />
          </mesh>
          {[-0.35, 0, 0.35].map((a, i) => (
            <mesh key={i} position={[Math.sin(a) * 0.08, 0.06, Math.cos(a) * 0.08]} rotation={[a * 0.6, 0, -a * 0.8]}>
              <cylinderGeometry args={[0.01, 0.01, 0.24, 8]} />
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
        </group>
      )}

      {kind === "rocket" && (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.11, 0.32, 28]} />
            <Metal color={color} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <coneGeometry args={[0.085, 0.16, 24]} />
            <Plastic color={accent} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.14, 0.09]}>
            <circleGeometry args={[0.035, 18]} />
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
        </group>
      )}

      {kind === "unicorn" && (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <sphereGeometry args={[0.145, 30, 24]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0.12, 0.18, 0.03]} castShadow>
            <sphereGeometry args={[0.1, 28, 22]} />
            <SoftFur color={color} />
          </mesh>
          <mesh position={[0.16, 0.3, 0.02]} rotation={[0.25, 0, -0.35]} castShadow>
            <coneGeometry args={[0.028, 0.14, 14]} />
            <Metal color="#fde68a" metalness={0.85} roughness={0.15} />
          </mesh>
          <mesh position={[0.04, 0.24, -0.02]} castShadow>
            <sphereGeometry args={[0.085, 18, 14]} />
            <SoftFur color={accent} roughness={0.8} />
          </mesh>
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.04]} castShadow>
              <capsuleGeometry args={[0.03, 0.08, 6, 10]} />
              <SoftFur color={color} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "dino" && (
        <group>
          <mesh position={[0, 0.07, 0]} castShadow>
            <sphereGeometry args={[0.155, 30, 24]} />
            <SoftFur color={color} roughness={0.75} />
          </mesh>
          <mesh position={[0.15, 0.16, 0.04]} castShadow>
            <sphereGeometry args={[0.095, 24, 18]} />
            <SoftFur color={color} roughness={0.75} />
          </mesh>
          {[-0.02, 0.04, 0.1].map((y, i) => (
            <mesh key={i} position={[-0.12 + i * 0.02, 0.14 + y * 0.2, -0.02]} rotation={[0.3, 0, 0.45]} castShadow>
              <coneGeometry args={[0.04 - i * 0.005, 0.1 - i * 0.01, 10]} />
              <SoftFur color={accent} />
            </mesh>
          ))}
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, -0.08, 0.05]} castShadow>
              <capsuleGeometry args={[0.032, 0.07, 6, 10]} />
              <SoftFur color={color} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "drum" && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.17, 36]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          {[0, 1].map((i) => (
            <mesh key={i} position={[0, -0.03 + i * 0.08, 0]}>
              <torusGeometry args={[0.161, 0.009, 8, 36]} />
              <Metal color={accent} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.155, 0.155, 0.02, 36]} />
            <Plastic color="#fef3c7" roughness={0.55} />
          </mesh>
          <mesh position={[0.1, 0.16, 0.05]} rotation={[0.4, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
            <Plastic color="#78350f" />
          </mesh>
        </group>
      )}

      {kind === "xylophone" && (
        <group rotation={[0.35, 0.2, 0]}>
          <RoundedBox args={[0.34, 0.035, 0.2]} radius={0.01} position={[0, 0.03, 0]} castShadow>
            <Plastic color="#92400e" />
          </RoundedBox>
          {["#ef4444", "#f97316", "#facc15", "#22c55e", "#38bdf8", "#a855f7"].map((barColor, idx) => (
            <RoundedBox
              key={barColor}
              args={[0.042, 0.022, 0.18 - idx * 0.012]}
              radius={0.006}
              position={[-0.125 + idx * 0.05, 0.058, 0]}
              castShadow
            >
              <Metal color={barColor} metalness={0.5} roughness={0.2} />
            </RoundedBox>
          ))}
        </group>
      )}

      {kind === "guitar" && (
        <group rotation={[0.1, 0.2, -0.45]}>
          <mesh position={[0, -0.06, 0]} scale={[1.1, 1.25, 0.45]} castShadow>
            <sphereGeometry args={[0.13, 24, 18]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.04, 0]} scale={[0.85, 0.95, 0.42]} castShadow>
            <sphereGeometry args={[0.11, 20, 16]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.045, 0.26, 0.03]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, -0.02, 0.058]}>
            <circleGeometry args={[0.042, 18]} />
            <Plastic color="#1e293b" />
          </mesh>
        </group>
      )}

      {kind === "piano" && (
        <group>
          <RoundedBox args={[0.32, 0.16, 0.24]} radius={0.025} position={[0, 0.09, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.28, 0.03, 0.09]} radius={0.006} position={[0, 0.12, 0.09]} castShadow>
            <Plastic color={accent} />
          </RoundedBox>
          {[-0.09, -0.045, 0, 0.045, 0.09].map((x) => (
            <mesh key={x} position={[x, 0.14, 0.075]}>
              <boxGeometry args={[0.022, 0.015, 0.05]} />
              <Plastic color="#1e293b" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "trumpet" && (
        <group rotation={[0, 0, 0.35]}>
          <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.28, 16]} />
            <Metal color={color} metalness={0.92} roughness={0.12} />
          </mesh>
          <mesh position={[0.16, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.09, 0.12, 24]} />
            <Metal color={color} metalness={0.92} roughness={0.12} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[0.06, 0.012, 10, 24]} />
            <Metal color={accent} />
          </mesh>
        </group>
      )}

      {kind === "crayons" && (
        <group>
          <RoundedBox args={[0.24, 0.22, 0.09]} radius={0.018} position={[0, 0.08, 0]} castShadow>
            <Plastic color={color} clearcoat={0.9} />
          </RoundedBox>
          {["#ef4444", "#22c55e", "#3b82f6", "#facc15"].map((c, idx) => (
            <group key={c} position={[-0.075 + idx * 0.05, 0.22, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.08, 12]} />
                <Plastic color={c} />
              </mesh>
              <mesh position={[0, 0.055, 0]}>
                <coneGeometry args={[0.018, 0.035, 12]} />
                <Plastic color={c} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "easel" && (
        <group>
          <RoundedBox args={[0.26, 0.24, 0.03]} radius={0.01} position={[0, 0.18, 0]} rotation={[-0.1, 0, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          <mesh position={[0, 0.18, 0.018]} rotation={[-0.1, 0, 0]}>
            <planeGeometry args={[0.21, 0.18]} />
            <Plastic color="#fffbeb" />
          </mesh>
          <mesh position={[0, 0.18, 0.022]} rotation={[-0.1, 0, 0]}>
            <circleGeometry args={[0.055, 18]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.09, 0.09].map((x) => (
            <mesh key={x} position={[x, 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.16, 10]} />
              <Plastic color="#92400e" />
            </mesh>
          ))}
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
              <cylinderGeometry args={[0.032, 0.035, 0.028, 16]} />
              <Plastic color={c as string} clearcoat={1} />
            </mesh>
          ))}
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
            <cylinderGeometry args={[0.045, 0.055, 0.09, 16]} />
            <Metal color="#94a3b8" />
          </mesh>
          {[-0.16, 0, 0.16].map((x) => (
            <group key={x}>
              <mesh position={[x, 0.04, 0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.035, 16]} />
                <Plastic color="#1e293b" />
              </mesh>
              <mesh position={[x, 0.04, -0.09]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 0.035, 16]} />
                <Plastic color="#1e293b" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "blocks" && (
        <group>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[-0.07, 0.065, 0]} castShadow>
            <meshPhysicalMaterial map={blockA ?? undefined} color={blockA ? "#ffffff" : color} roughness={0.35} clearcoat={0.7} />
          </RoundedBox>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[0.08, 0.065, 0.04]} castShadow>
            <meshPhysicalMaterial map={blockB ?? undefined} color={blockB ? "#ffffff" : accent} roughness={0.35} clearcoat={0.7} />
          </RoundedBox>
          <RoundedBox args={[0.13, 0.13, 0.13]} radius={0.02} smoothness={3} position={[0.01, 0.18, -0.02]} castShadow>
            <meshPhysicalMaterial map={blockC ?? undefined} color={blockC ? "#ffffff" : "#fbbf24"} roughness={0.35} clearcoat={0.7} />
          </RoundedBox>
        </group>
      )}

      {kind === "castle" && (
        <group>
          <RoundedBox args={[0.26, 0.18, 0.2]} radius={0.015} position={[0, 0.09, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          {[-0.1, 0, 0.1].map((x, idx) => (
            <group key={x} position={[x, 0.24 + (idx === 1 ? 0.05 : 0), 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.045, 0.048, 0.14, 16]} />
                <Plastic color={color} />
              </mesh>
              <mesh position={[0, 0.11, 0]} castShadow>
                <coneGeometry args={[0.055, 0.1, 16]} />
                <Plastic color={accent} clearcoat={1} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "rings" && (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.15, 0.035, 24]} />
            <Plastic color="#f8fafc" />
          </mesh>
          {[
            ["#ef4444", 0.12, 0.06],
            ["#f59e0b", 0.1, 0.11],
            ["#22c55e", 0.08, 0.16],
            ["#38bdf8", 0.06, 0.21],
          ].map(([c, r, y]) => (
            <mesh key={c as string} position={[0, Number(y), 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[Number(r), 0.026, 12, 24]} />
              <Plastic color={c as string} clearcoat={1} />
            </mesh>
          ))}
          <mesh position={[0, 0.27, 0]}>
            <sphereGeometry args={[0.042, 16, 12]} />
            <Plastic color="#facc15" />
          </mesh>
        </group>
      )}

      {kind === "shapesorter" && (
        <group>
          <RoundedBox args={[0.24, 0.24, 0.24]} radius={0.025} position={[0, 0.12, 0]} castShadow>
            <Plastic color={color} clearcoat={0.9} />
          </RoundedBox>
          <mesh position={[0, 0.245, 0]}>
            <boxGeometry args={[0.22, 0.02, 0.22]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[-0.05, 0.13, 0.125]}>
            <circleGeometry args={[0.038, 16]} />
            <Plastic color="#facc15" />
          </mesh>
          <mesh position={[0.05, 0.13, 0.125]}>
            <planeGeometry args={[0.068, 0.068]} />
            <Plastic color="#22c55e" />
          </mesh>
        </group>
      )}

      {kind === "globe" && (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.145, 28, 22]} />
            <Plastic color={color} clearcoat={0.95} />
          </mesh>
          <mesh position={[0.04, 0.22, 0.11]}>
            <sphereGeometry args={[0.06, 14, 12]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[-0.06, 0.18, 0.1]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.35]}>
            <torusGeometry args={[0.17, 0.012, 10, 28, Math.PI]} />
            <Metal color="#fbbf24" />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.035, 20]} />
            <Metal color="#fbbf24" />
          </mesh>
        </group>
      )}

      {kind === "abacus" && (
        <group>
          <RoundedBox args={[0.28, 0.24, 0.05]} radius={0.015} position={[0, 0.12, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          {[0.06, 0.12, 0.18].map((y, row) => (
            <group key={y}>
              <mesh position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.006, 0.006, 0.24, 8]} />
                <Metal color="#cbd5e1" />
              </mesh>
              {[-0.08, -0.04, 0, 0.04].map((x, col) => (
                <mesh key={x} position={[x + (row % 2) * 0.03, y, 0]} castShadow>
                  <sphereGeometry args={[0.018, 12, 10]} />
                  <Plastic color={col % 2 === 0 ? accent : "#38bdf8"} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {kind === "magnifying" && (
        <group rotation={[0, 0, -0.45]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <torusGeometry args={[0.11, 0.024, 12, 28]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <circleGeometry args={[0.1, 24]} />
            <Glass color="#bae6fd" />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.024, 0.02, 0.15, 14]} />
            <Plastic color={accent} />
          </mesh>
        </group>
      )}

      {kind === "teapot" && (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.14, 28, 22]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.032, 14, 12]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0.14, 0.15, 0]} rotation={[0, 0, -0.6]} castShadow>
            <cylinderGeometry args={[0.018, 0.032, 0.12, 14]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[-0.13, 0.13, 0]}>
            <torusGeometry args={[0.055, 0.015, 10, 20]} />
            <Plastic color={accent} />
          </mesh>
        </group>
      )}

      {kind === "mixer" && (
        <group>
          <RoundedBox args={[0.24, 0.04, 0.18]} radius={0.012} position={[0, 0.02, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          <RoundedBox args={[0.09, 0.22, 0.14]} radius={0.02} position={[-0.07, 0.14, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.08, 0.14]} radius={0.025} position={[0, 0.24, 0]} castShadow>
            <Plastic color={color} clearcoat={1} />
          </RoundedBox>
          <mesh position={[0.04, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.055, 0.12, 22]} />
            <Metal color={accent} />
          </mesh>
        </group>
      )}

      {kind === "cupcake-stand" && (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.22, 12]} />
            <Metal color="#fbbf24" />
          </mesh>
          {[-0.07, 0.07].map((x) => (
            <group key={x} position={[x, 0.1, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.032, 0.024, 0.045, 14]} />
                <Plastic color="#fde047" />
              </mesh>
              <mesh position={[0, 0.035, 0]}>
                <sphereGeometry args={[0.034, 14, 12]} />
                <Plastic color={color} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {kind === "icecream-cart" && (
        <group>
          <RoundedBox args={[0.28, 0.18, 0.18]} radius={0.02} position={[0, 0.11, 0]} castShadow>
            <Plastic color={color} clearcoat={0.95} />
          </RoundedBox>
          <mesh position={[0, 0.34, 0]} castShadow>
            <coneGeometry args={[0.18, 0.1, 16]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.09, 0.09].map((z) => (
            <mesh key={z} position={[0, 0.05, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.055, 0.025, 18]} />
              <Plastic color={accent} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "cashregister" && (
        <group>
          <RoundedBox args={[0.26, 0.14, 0.22]} radius={0.02} position={[0, 0.08, 0]} castShadow>
            <Plastic color={color} clearcoat={0.95} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.08, 0.04]} radius={0.01} position={[0, 0.2, -0.05]} castShadow>
            <Plastic color={accent} />
          </RoundedBox>
          {[-0.06, 0, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.155, 0.04]}>
              <boxGeometry args={[0.035, 0.02, 0.035]} />
              <Plastic color="#fffbeb" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "shoppingbasket" && (
        <group>
          <RoundedBox args={[0.28, 0.14, 0.2]} radius={0.02} position={[0, 0.08, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          <mesh position={[0, 0.18, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.11, 0.015, 10, 24, Math.PI]} />
            <Plastic color={accent} />
          </mesh>
          {[-0.06, 0.06].map((x, idx) => (
            <mesh key={x} position={[x, 0.15, 0]}>
              <sphereGeometry args={[0.042, 14, 12]} />
              <Plastic color={idx === 0 ? "#ef4444" : "#facc15"} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "popcorn-maker" && (
        <group>
          <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.015} position={[0, 0.05, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.16, 0.18]} radius={0.01} position={[0, 0.18, 0]}>
            <Glass color="#fef9c3" />
          </RoundedBox>
          <RoundedBox args={[0.21, 0.04, 0.21]} radius={0.01} position={[0, 0.27, 0]} castShadow>
            <Plastic color={color} />
          </RoundedBox>
          {[-0.04, 0.03, 0].map((x, i) => (
            <mesh key={i} position={[x, 0.14 + i * 0.02, (i - 1) * 0.03]}>
              <sphereGeometry args={[0.032, 10, 8]} />
              <Plastic color={accent} />
            </mesh>
          ))}
        </group>
      )}

      {kind === "juice-blender" && (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.095, 0.11, 20]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.085, 0.065, 0.18, 20]} />
            <Glass color="#bae6fd" />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.072, 0.058, 0.12, 18]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.088, 0.088, 0.03, 20]} />
            <Plastic color={color} />
          </mesh>
        </group>
      )}

      {kind === "ferriswheel" && (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <torusGeometry args={[0.15, 0.015, 12, 32]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <mesh
                key={i}
                position={[Math.cos(angle) * 0.15, 0.2 + Math.sin(angle) * 0.15, 0]}
                castShadow
              >
                <sphereGeometry args={[0.032, 12, 10]} />
                <Plastic color={i % 2 === 0 ? accent : "#38bdf8"} />
              </mesh>
            );
          })}
          <mesh position={[0, 0.09, 0]} castShadow>
            <coneGeometry args={[0.11, 0.2, 4]} />
            <Metal color="#cbd5e1" />
          </mesh>
        </group>
      )}

      {kind === "carousel" && (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.17, 0.04, 24]} />
            <Plastic color={accent} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.2, 12]} />
            <Metal color="#facc15" />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <coneGeometry args={[0.17, 0.11, 24]} />
            <Plastic color={color} clearcoat={1} />
          </mesh>
          {[0, 2.09, 4.18].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 0.1, 0.12, Math.sin(a) * 0.1]} castShadow>
              <sphereGeometry args={[0.035, 12, 10]} />
              <Plastic color="#fffbeb" />
            </mesh>
          ))}
        </group>
      )}

      {kind === "treasurechest" && (
        <group>
          <RoundedBox args={[0.28, 0.14, 0.18]} radius={0.015} position={[0, 0.07, 0]} castShadow>
            <Plastic color={color} roughness={0.65} />
          </RoundedBox>
          <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.28, 18, 1, false, 0, Math.PI]} />
            <Plastic color={color} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.12, 0.092]}>
            <boxGeometry args={[0.05, 0.06, 0.02]} />
            <Metal color={accent} />
          </mesh>
        </group>
      )}

      {kind === "crown" && (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.13, 0.12, 24]} />
            <Metal color={color} metalness={0.95} roughness={0.12} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i * Math.PI * 2) / 5;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.13, 0.17, Math.sin(a) * 0.13]}
                castShadow
              >
                <sphereGeometry args={[0.028, 12, 10]} />
                <Plastic color={accent} clearcoat={1} />
              </mesh>
            );
          })}
        </group>
      )}

      {kind === "yacht" && (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[0.4, 0.07, 0.16]} />
            <Plastic color={color} metalness={0.2} clearcoat={1} />
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
            <cylinderGeometry args={[0.055, 0.06, 0.07, 24]} />
            <Metal color={accent} metalness={0.45} roughness={0.25} />
          </mesh>
          <mesh position={[0.04, 0, 0.13]}>
            <circleGeometry args={[0.035, 18]} />
            <Glass color="#0ea5e9" />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.06]} />
            <Plastic color="#334155" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}
