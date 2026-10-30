import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Detetive Temporal · Casos fora de época",
  description: "Uma aventura educativa de investigação histórica. Explore, reúna pistas e devolva cada coisa ao seu tempo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
