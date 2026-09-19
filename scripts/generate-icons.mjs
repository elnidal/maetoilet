// İkonları yeniden üretmek için önce: npm i -D sharp
// (sharp runtime'da gerekmediği için repo'da devDependency olarak tutulmuyor)
import sharp from "sharp"
import { mkdirSync } from "fs"
import { fileURLToPath } from "url"

const outDir = new URL("../public/icons/", import.meta.url)
mkdirSync(outDir, { recursive: true })

// Basit geometrik tuvalet silueti — emoji font'a bağımlı değil, her ortamda
// aynı render eder. Şekil merkez ~66% güvenli alan içinde (maskable ikon için).
const glyph = `
<g fill="#ffffff">
  <rect x="196" y="100" width="120" height="90" rx="18"/>
  <rect x="156" y="190" width="200" height="32" rx="16"/>
  <ellipse cx="256" cy="300" rx="100" ry="100"/>
  <rect x="226" y="380" width="60" height="30" rx="10"/>
</g>`

const gradientDef = `
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#6366f1"/>
  <stop offset="100%" stop-color="#9333ea"/>
</linearGradient>`

const regularSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradientDef}</defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  ${glyph}
</svg>`

const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradientDef}</defs>
  <rect width="512" height="512" fill="url(#g)"/>
  ${glyph}
</svg>`

const targets = [
  { name: "icon-192.png", size: 192, svg: regularSvg },
  { name: "icon-512.png", size: 512, svg: regularSvg },
  { name: "apple-touch-icon.png", size: 180, svg: regularSvg },
  { name: "icon-maskable-512.png", size: 512, svg: maskableSvg },
]

for (const t of targets) {
  await sharp(Buffer.from(t.svg))
    .resize(t.size, t.size)
    .png()
    .toFile(fileURLToPath(new URL(t.name, outDir)))
  console.log("generated", t.name)
}
