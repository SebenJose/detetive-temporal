import type { CSSProperties } from "react";

const paths: Record<string, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  book: "M12 6C8 3 4 4 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 2Zm0 0v14",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-16-2 8-8 4 4-8 6-4Z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  pause: "M8 5v14M16 5v14",
  clue: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 6 6",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM9 8a3 3 0 0 1 6 0c0 3-3 2-3 5m0 3v.1",
  reset: "M3 10a9 9 0 1 1 1 7M3 4v6h6",
  sparkle: "m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z",
  flag: "M5 22V3c5-3 9 3 14 0v10c-5 3-9-3-14 0",
  door: "M3 21h18M6 21V3h12v18m-3-10v2",
  home: "M3 11 12 3l9 8M5 9.5V21h5v-6h4v6h5V9.5",
  sound: "M4 9v6h4l5 4V5L8 9H4Zm12 0a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11",
  mute: "M4 9v6h4l5 4V5L8 9H4Zm12 0 5 6m0-6-5 6",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  star: "m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8L12 3Z",
  play: "M7 4v16l13-8L7 4Z",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
};

export function Icon({ name, size = 20, style }: { name: string; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] ?? paths.sparkle} /></svg>;
}
