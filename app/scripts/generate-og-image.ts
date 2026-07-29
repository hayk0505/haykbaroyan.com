import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/assets/og-image.png');
mkdirSync(dirname(outputPath), { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="85%" cy="12%" r="60%">
      <stop offset="0%" stop-color="#a68763" stop-opacity="0.28" />
      <stop offset="100%" stop-color="#a68763" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#26251f" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />

  <g transform="translate(80,80) scale(0.32)">
    <rect x="0" y="0" width="200" height="200" rx="44" fill="#2d2d2d" />
    <g stroke="#ece3d0" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <line x1="64" y1="38" x2="64" y2="162" />
      <path d="M64 110 Q64 88 92 88 Q126 88 126 125 Q126 162 92 162 Q64 162 64 144" />
    </g>
    <circle cx="140" cy="62" r="13" fill="#ece3d0" />
  </g>

  <text x="80" y="290" font-family="monospace" font-weight="700" font-size="76" fill="#eae0d2">Hayk Baroyan</text>
  <text x="80" y="345" font-family="monospace" font-weight="700" font-size="34" fill="#a68763">Senior Front-End Engineer</text>

  <text x="80" y="410" font-family="monospace" font-size="24" fill="#eae0d2" fill-opacity="0.72">
    <tspan x="80" dy="0">Deep React &amp; Angular experience, now going deep</tspan>
    <tspan x="80" dy="34">on .NET 10 to build and ship complete systems.</tspan>
  </text>

  <text x="80" y="560" font-family="monospace" font-weight="700" font-size="26" fill="#a68763">◑ haykbaroyan.com</text>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath)
  .then(() => console.log(`OG image written to ${outputPath}`));
