import { CanvasTexture, SRGBColorSpace } from "three";

/** Name tag shown above the nearest point of interest. */
export function labelTexture(text: string, collected: boolean): CanvasTexture {
  const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 90;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Desenho 2D indisponível neste navegador.");
  context.fillStyle = "#1d2232"; context.beginPath(); context.roundRect(4, 10, 504, 76, 14); context.fill();
  context.fillStyle = collected ? "#2f5d43" : "#2b3150"; context.strokeStyle = collected ? "#7bd88f" : "#ffcc33"; context.lineWidth = 4;
  context.beginPath(); context.roundRect(4, 4, 504, 74, 14); context.fill(); context.stroke();
  context.fillStyle = "#fff8e6"; context.font = "bold 32px 'Trebuchet MS', Verdana, sans-serif"; context.textAlign = "center"; context.textBaseline = "middle";
  context.fillText(`${collected ? "✓ " : ""}${text}`, 256, 43);
  const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
}
