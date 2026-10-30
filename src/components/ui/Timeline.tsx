import type { CSSProperties } from "react";
import { missionList } from "@/content/missions";
import { CURRENT_YEAR, formatYear, withinLast, yearsAgo } from "@/game/time";
import type { Mission, PointOfInterest } from "@/game/types";

const START = -3000;
const TICKS = [-3000, -2000, -1000, 1, 1000];
const at = (year: number) => (year - START) / (CURRENT_YEAR - START) * 100;
const edge = (percent: number) => percent < 15 ? "start" : percent > 85 ? "end" : "";

/** To-scale timeline: where the case happens, the other cases, and where the out-of-time objects really belong. */
export function Timeline({ current, found = [] }: { current: Mission; found?: PointOfInterest[] }) {
  const objects = found.filter((point) => point.suspect);
  const here = at(current.year);
  return <figure className="timeline" aria-label="Linha do tempo">
    <div className="timeline-track">
      {TICKS.map((year) => <span key={year} className="timeline-tick" style={{ left: `${at(year)}%` }}><small>{formatYear(year)}</small></span>)}
      {missionList.filter((mission) => mission.id !== current.id).map((mission) => <span key={mission.id} className="timeline-case" style={{ left: `${at(mission.year)}%` }} title={`${mission.location}, ${mission.period}`} />)}
      {objects.map((point, index) => <span key={point.id} className="timeline-object" style={{ left: `${at(point.suspect!.year)}%`, "--row": index % 3 } as CSSProperties} title={point.label}>{index + 1}</span>)}
      <span className={`timeline-case current ${edge(here)}`} style={{ left: `${here}%` }}><b>Você está aqui · {formatYear(current.year)}</b></span>
      <span className="timeline-now"><b>Hoje</b></span>
    </div>
    <figcaption>
      Este caso se passa há uns <strong>{yearsAgo(current.year).toLocaleString("pt-BR")} anos</strong>.
      {objects.length > 0 && <> Os objetos fora de época que você achou são todos dos <strong>últimos {withinLast(objects.map((point) => point.suspect!.year)).toLocaleString("pt-BR")} anos</strong>: muito, muito depois!</>}
    </figcaption>
    {objects.length > 0 && <ol className="timeline-legend">{objects.map((point) => <li key={point.id}>{point.label} · <span>{point.suspect!.era}</span></li>)}</ol>}
  </figure>;
}
