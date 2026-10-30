"use client";

import dynamic from "next/dynamic";

const GameExperience = dynamic(() => import("./GameExperience"), {
  ssr: false,
  loading: () => <main className="loading-screen"><span className="loading-compass">✧</span><p>Ajustando as coordenadas temporais…</p></main>,
});

export function GameClient() { return <GameExperience />; }
