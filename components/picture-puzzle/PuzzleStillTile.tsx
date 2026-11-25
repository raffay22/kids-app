"use client";

type PuzzleStillTileProps = {
  imageSrc: string;
  rows: number;
  cols: number;
  row: number;
  col: number;
  opacity?: number;
  className?: string;
  alt?: string;
};

/**
 * One cardboard-style crop of a static phonics still (never a video).
 * CSS crop matches physical puzzle piece cutouts from the same photo.
 */
export default function PuzzleStillTile({
  imageSrc,
  rows,
  cols,
  row,
  col,
  opacity = 1,
  className = "",
  alt = "",
}: PuzzleStillTileProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-slate-100 ${className}`}
      style={{ opacity }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt}
        draggable={false}
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: `${cols * 100}%`,
          height: `${rows * 100}%`,
          left: `${-col * 100}%`,
          top: `${-row * 100}%`,
          objectFit: "cover",
        }}
      />
    </div>
  );
}
