"use client";

import { useMemo, useState } from "react";

export interface CloudWord {
  text: string;
  count: number;
}

interface PlacedWord extends CloudWord {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width: number;
  height: number;
}

// Rampa secuencial selapp (claro → oscuro = menos → más menciones).
// Todas ≥ 4:1 de contraste sobre blanco; el accent no se usa para texto.
const COLOR_RAMP = ["#8B6F5C", "#7A5D4A", "#5B4033", "#4A3429"];

const MIN_FONT = 14;
const MAX_FONT = 50;

function measure(text: string, fontSize: number): { width: number; height: number } {
  if (typeof document !== "undefined") {
    const canvas = measure._canvas ?? (measure._canvas = document.createElement("canvas"));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = `700 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      return { width: ctx.measureText(text).width, height: fontSize * 1.15 };
    }
  }
  // Aproximación para SSR
  return { width: text.length * fontSize * 0.58, height: fontSize * 1.15 };
}
measure._canvas = null as HTMLCanvasElement | null;

function collides(a: PlacedWord, b: PlacedWord, pad = 3): boolean {
  return !(
    a.x + a.width / 2 + pad < b.x - b.width / 2 ||
    a.x - a.width / 2 - pad > b.x + b.width / 2 ||
    a.y + a.height / 2 + pad < b.y - b.height / 2 ||
    a.y - a.height / 2 - pad > b.y + b.height / 2
  );
}

/** Coloca las palabras sobre una espiral de Arquímedes evitando solapamientos. */
function layoutWords(words: CloudWord[]): { placed: PlacedWord[]; bounds: [number, number, number, number] } {
  if (words.length === 0) return { placed: [], bounds: [0, 0, 100, 40] };

  const max = Math.max(...words.map((w) => w.count));
  const min = Math.min(...words.map((w) => w.count));
  const scale = (count: number) => {
    if (max === min) return (MIN_FONT + MAX_FONT) / 2;
    const t = Math.sqrt((count - min) / (max - min)); // sqrt: área ~ valor
    return MIN_FONT + t * (MAX_FONT - MIN_FONT);
  };
  const colorFor = (count: number) => {
    if (max === min) return COLOR_RAMP[2];
    // sqrt igual que el tamaño: sin esto un outlier deja todo lo demás en el tono más claro
    const t = Math.sqrt((count - min) / (max - min));
    return COLOR_RAMP[Math.min(COLOR_RAMP.length - 1, Math.floor(t * COLOR_RAMP.length))];
  };

  const sorted = [...words].sort((a, b) => b.count - a.count);
  const placed: PlacedWord[] = [];

  for (const word of sorted) {
    const fontSize = scale(word.count);
    const { width, height } = measure(word.text, fontSize);
    const candidate: PlacedWord = {
      ...word,
      fontSize,
      width,
      height,
      color: colorFor(word.count),
      x: 0,
      y: 0,
    };

    // Espiral: r crece con el ángulo; elipse achatada para formato horizontal
    let placedOk = false;
    for (let i = 0; i < 3000; i++) {
      const angle = 0.35 * i;
      const radius = 2.2 * angle;
      candidate.x = radius * Math.cos(angle) * 1.6;
      candidate.y = radius * Math.sin(angle) * 0.75;
      if (!placed.some((p) => collides(candidate, p))) {
        placedOk = true;
        break;
      }
    }
    if (placedOk) placed.push({ ...candidate });
  }

  const minX = Math.min(...placed.map((p) => p.x - p.width / 2));
  const maxX = Math.max(...placed.map((p) => p.x + p.width / 2));
  const minY = Math.min(...placed.map((p) => p.y - p.height / 2));
  const maxY = Math.max(...placed.map((p) => p.y + p.height / 2));
  const padding = 12;

  return {
    placed,
    bounds: [minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2],
  };
}

export default function WordCloud({ words }: { words: CloudWord[] }) {
  const [hovered, setHovered] = useState<PlacedWord | null>(null);
  const { placed, bounds } = useMemo(() => layoutWords(words), [words]);

  if (words.length === 0) {
    return (
      <p className="text-center text-selapp-brown-light/60 text-sm py-10">
        Aún no hay suficiente texto para generar la nube de palabras.
      </p>
    );
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox={bounds.join(" ")}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`Nube de palabras: ${placed
          .slice(0, 5)
          .map((p) => p.text)
          .join(", ")} y más`}
      >
        {placed.map((p) => (
          <text
            key={p.text}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={p.fontSize}
            fontWeight={700}
            fill={p.color}
            opacity={hovered && hovered.text !== p.text ? 0.35 : 1}
            className="transition-opacity duration-150 cursor-default"
            onMouseEnter={() => setHovered(p)}
            onMouseLeave={() => setHovered(null)}
            style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
          >
            {p.text}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-2 right-2 bg-selapp-brown-dark text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg pointer-events-none">
          <span className="font-bold">{hovered.text}</span> · {hovered.count} menci
          {hovered.count === 1 ? "ón" : "ones"}
        </div>
      )}
    </div>
  );
}
