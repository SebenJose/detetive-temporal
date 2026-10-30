import type { GlossaryEntry } from "./types.ts";

export type GlossaryPart = string | { text: string; entry: GlossaryEntry };

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Splits a text into plain strings and glossary terms. Only the first occurrence of each term is marked. */
export function splitGlossary(text: string, glossary: GlossaryEntry[]): GlossaryPart[] {
  const byForm = new Map(glossary.flatMap((entry) => entry.forms.map((form) => [form.toLowerCase(), entry] as const)));
  if (!byForm.size) return [text];
  const forms = [...byForm.keys()].sort((a, b) => b.length - a.length).map(escape);
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${forms.join("|")})(?![\\p{L}\\p{N}])`, "giu");
  const parts: GlossaryPart[] = [], seen = new Set<GlossaryEntry>();
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const entry = byForm.get(match[0].toLowerCase())!;
    if (seen.has(entry)) continue;
    seen.add(entry);
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ text: match[0], entry });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
