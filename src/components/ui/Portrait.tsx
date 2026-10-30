import type { PortraitId } from "@/game/types";

export function Portrait({ character, className, showAnomaly = true }: { character: PortraitId; className?: string; showAnomaly?: boolean }) {
  const mummy = character === "mummy";
  const detective = character === "detective";
  const scribe = character === "scribe";
  const skin = mummy ? "#f4e7c9" : scribe ? "#a66340" : "#cb906b";
  const coat = detective ? "#425b84" : scribe ? "#efdfba" : "#bc694e";
  return <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
    <ellipse cx="50" cy="132" rx="27" ry="5" fill="#222b39" opacity=".16" />
    <path d="M34 104 31 129h15l4-24 4 24h15l-3-25" fill={mummy ? "#e3d1a8" : "#293647"} stroke="#293647" strokeWidth="2" />
    <path d="M29 65q21-13 42 0l8 37-13 3-2-22v31H35V83l-3 22-13-3Z" fill={mummy ? skin : coat} stroke="#293647" strokeWidth="2" />
    <rect x="28" y="23" width="44" height="47" rx="20" fill={skin} stroke="#293647" strokeWidth="2" />
    {mummy ? <g stroke="#bca77e" strokeWidth="2"><path d="m31 30 38 7m-40 6 42 7m-42 4 41 8M34 77l31 7m-31 6 31 7m-31 6 31 7m-28 9 9 2m8-2 10 2" /><path d="M31 37h37v16H31Z" fill="#293647" stroke="none" /></g> : <path d="M28 41V27q21-26 44 0v14l-11-9-27 5Z" fill="#293647" />}
    <circle cx="40" cy="45" r="2.7" fill={mummy ? "#efb663" : "#293647"} /><circle cx="59" cy="45" r="2.7" fill={mummy ? "#efb663" : "#293647"} />
    <path d="M45 58q6 5 11-1" stroke="#293647" strokeWidth="2" fill="none" strokeLinecap="round" />
    {detective && <><path d="m28 28 6-17h32l7 17Z" fill="#bd865b" stroke="#293647" strokeWidth="2" /><path d="M20 30h62" stroke="#293647" strokeWidth="5" strokeLinecap="round" /><path d="m43 70 7 13 7-13M50 83v26" stroke="#273956" strokeWidth="2" fill="none" /><circle cx="65" cy="88" r="12" stroke="#daba76" strokeWidth="4" fill="#d2e9e3" fillOpacity=".5" /><path d="m72 97 10 15" stroke="#293647" strokeWidth="5" /></>}
    {scribe && <><path d="M29 25q21-13 42 0" stroke="#d9b66b" strokeWidth="6" /><path d="M40 74h20v17H40Z" fill="#d9b66b" /><path d="m68 90 9-10 8 13-9 10Z" fill="#f5e7c5" stroke="#293647" strokeWidth="2" /></>}
    {character === "navigator" && <><path d="m28 27 3-15 22 4 16-4 4 15Z" fill="#293647" /><path d="M46 58h12" stroke="#293647" strokeWidth="3" /><path d="m42 73 8 17 9-17" stroke="#f6e6c1" strokeWidth="4" fill="none" /></>}
    {mummy && showAnomaly && <g data-anomaly="celular"><rect x="74" y="69" width="16" height="27" rx="3" fill="#293647" transform="rotate(10 82 82)" /><path d="M77 74h9v15h-9Z" fill="#8ca0e7" /><circle cx="82" cy="93" r="1" fill="#fff" /></g>}
  </svg>;
}
