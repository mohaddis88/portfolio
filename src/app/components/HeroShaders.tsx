"use client";
// app/components/HeroShaders.tsx
// Pulled out of page.tsx so these can be next/dynamic-imported with
// { ssr: false }. This keeps the ~heavy WebGL shader bundle out of the
// initial JS payload — it loads only after the shell is interactive.

import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";

export function HeroShaderLayer() {
  return (
    <Shader style={{ position:"absolute", inset:0, zIndex:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <Swirl colorA="#FDFBF7" colorB="#F0E8DC" detail={1.4} />
      <ChromaFlow baseColor="#FDFBF7" downColor="#C19A6B22" leftColor="#C19A6B11"
                  rightColor="#C19A6B22" upColor="#C19A6B11" momentum={9} radius={3} />
      <FlutedGlass aberration={0.5} angle={31} frequency={7} highlight={0.13}
                   highlightSoftness={0} lightAngle={-90} refraction={3.5}
                   shape="rounded" softness={1} speed={0.12} />
      <FilmGrain strength={0.035} />
    </Shader>
  );
}

export function HeroShaderLayerDark() {
  return (
    <Shader style={{ position:"absolute", inset:0, zIndex:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <Swirl colorA="#1A1614" colorB="#2A2018" detail={1.4} />
      <ChromaFlow baseColor="#1A1614" downColor="#D4B89622" leftColor="#D4B89611"
                  rightColor="#D4B89622" upColor="#D4B89611" momentum={9} radius={3} />
      <FlutedGlass aberration={0.5} angle={31} frequency={7} highlight={0.08}
                   highlightSoftness={0} lightAngle={-90} refraction={3.5}
                   shape="rounded" softness={1} speed={0.12} />
      <FilmGrain strength={0.04} />
    </Shader>
  );
}
