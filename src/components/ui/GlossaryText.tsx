"use client";

import { useMemo, useState } from "react";
import { splitGlossary } from "@/game/glossary";
import type { GlossaryEntry } from "@/game/types";

/** Text with tappable glossary words: tapping one shows a short explanation right below. */
export function GlossaryText({ text, glossary }: { text: string; glossary: GlossaryEntry[] }) {
  const [open, setOpen] = useState<GlossaryEntry | null>(null);
  const parts = useMemo(() => splitGlossary(text, glossary), [text, glossary]);
  return <>
    {parts.map((part, index) => typeof part === "string" ? part
      : <button type="button" key={index} className={`glossary-term ${open === part.entry ? "active" : ""}`} aria-expanded={open === part.entry} onClick={() => setOpen(open === part.entry ? null : part.entry)}>{part.text}</button>)}
    {open && <span className="glossary-pop" role="note"><strong>{open.term[0].toUpperCase() + open.term.slice(1)}:</strong> {open.text}</span>}
  </>;
}
