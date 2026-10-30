export function CaseIllustration({ theme, className }: { theme: "sand" | "sea"; className?: string }) {
  if (theme === "sea") return <svg viewBox="0 0 600 340" className={className} role="img" aria-label="Navio ilustrado sobre o oceano">
    <circle cx="465" cy="83" r="37" fill="#ead7ae" />
    <path d="M0 271q50-21 100 0t100 0t100 0t100 0t100 0t100 0v69H0" fill="#769b9b" />
    <path d="M0 305q50-21 100 0t100 0t100 0t100 0t100 0t100 0" stroke="#d8e6dc" strokeWidth="3" fill="none" />
    <path d="m145 234 287-4-34 49H180Z" fill="#805a40" stroke="#374942" strokeWidth="3" />
    <path d="M264 230V61m100 172V117" stroke="#805a40" strokeWidth="7" />
    <path d="M252 70q-55 49-76 112h76Zm22 0q56 56 71 112h-71Zm81 55q-25 36-30 69h30Zm17 0q35 32 43 69h-43Z" fill="#f5e9cc" stroke="#bca882" strokeWidth="2" />
    <path d="m264 62 48 9-48 13" fill="#bd694a" />
    <path d="m131 114 20-8 20 8m266 52 14-7 14 7" stroke="#374942" strokeWidth="3" fill="none" />
  </svg>;
  return <svg viewBox="0 0 600 340" className={className} role="img" aria-label="Pirâmides ilustradas no deserto">
    <circle cx="460" cy="87" r="46" fill="#e8a85e" />
    <path d="M0 240q100-40 220-5t230-2 150 5v102H0Z" fill="#e8d1a6" />
    <path d="m109 262 119-177 132 177Z" fill="#d8ab6e" /><path d="m228 85 35 177h97Z" fill="#b98249" />
    <path d="m311 267 87-126 97 126Z" fill="#d8ab6e" /><path d="m398 141 25 126h72Z" fill="#b98249" />
    <path d="M144 210h107m-85-34h79m-55-34h49M343 222h78" stroke="#c5965c" strokeWidth="2" />
    <path d="M0 296q130-20 270 7t330-5" stroke="#ba955e" strokeWidth="2" fill="none" />
    <path d="M82 285v-75m0 25q-15-20-34-14m34 11q5-30 31-22m-31 16q21-15 40 0m-40-8q-17-20-33-7" stroke="#66866b" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M488 283v-35m0 16q-11-10-22-2m22-3q10-17 23-12" stroke="#7e8a61" strokeWidth="4" fill="none" />
  </svg>;
}
