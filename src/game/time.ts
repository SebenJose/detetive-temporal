// Helpers to talk about dates in a way 11-year-olds can picture ("há uns 4.500 anos").
export const CURRENT_YEAR = new Date().getFullYear();

export const formatYear = (year: number) => year < 0 ? `${(-year).toLocaleString("pt-BR")} a.C.` : year === 1 ? "ano 1" : String(year);

/** Years between `year` and now, rounded to the hundred. */
export const yearsAgo = (year: number, now = CURRENT_YEAR) => Math.max(100, Math.round((now - year) / 100) * 100);

/** Smallest round number of years that covers every given year ("dos últimos 200 anos"). */
export const withinLast = (years: number[], now = CURRENT_YEAR) => Math.ceil(Math.max(...years.map((year) => now - year)) / 100) * 100;
