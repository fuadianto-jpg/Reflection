/**
 * Auto-generate a book-style cover art (SVG) from app text + colors.
 * Returns a data URL usable directly in <img src>. No upload needed.
 */

export interface CoverInput {
  title: string;
  book: string;
  author: string;
  bg: string; // warna tema (latar)
  text: string; // warna tulisan
}

const W = 600;
const H = 600; // kotak 1:1

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Simple greedy word-wrap into at most `maxLines` lines of ~`maxChars`. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // if truncated, add ellipsis to last line
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/…?$/, "…");
  }
  return lines;
}

export function generateCoverSvg(input: CoverInput): string {
  const bg = input.bg || "#1a4b28";
  const text = input.text || "#f8f3e6";

  const titleLines = wrap((input.title || "Untitled").toUpperCase(), 11, 3);
  const bookLines = wrap(input.book || "", 26, 2);
  const author = input.author && input.author !== "—" ? input.author : "";

  // ----- Title block (from top) -----
  const titleFont = titleLines.length >= 3 ? 56 : 64;
  const titleLH = titleFont + 12;
  const titleStartY = 160;
  const titleTspans = titleLines
    .map(
      (l, i) =>
        `<tspan x="60" y="${titleStartY + i * titleLH}">${escapeXml(l)}</tspan>`
    )
    .join("");

  // ----- Metadata block (anchored lower) -----
  const metaTop = 408;
  const bookFirstY = metaTop + 66; // extra gap below "INSPIRED BY"
  const bookTspans = bookLines
    .map(
      (l, i) => `<tspan x="60" y="${bookFirstY + i * 38}">${escapeXml(l)}</tspan>`
    )
    .join("");
  const authorY = bookFirstY + (bookLines.length - 1) * 38 + 34;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="22" y="22" width="${W - 44}" height="${H - 44}" rx="10"
        fill="none" stroke="${text}" stroke-opacity="0.22" stroke-width="2"/>
  <text font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="${titleFont}" fill="${text}" letter-spacing="1">
    ${titleTspans}
  </text>
  <line x1="60" y1="${metaTop}" x2="200" y2="${metaTop}"
        stroke="${text}" stroke-opacity="0.5" stroke-width="2"/>
  <text x="60" y="${metaTop + 20}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="18" letter-spacing="3" fill="${text}" fill-opacity="0.75">INSPIRED BY</text>
  <text font-family="Georgia, serif" font-style="italic" font-weight="600"
        font-size="30" fill="${text}">
    ${bookTspans}
  </text>
  ${
    author
      ? `<text x="60" y="${authorY}" font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="22" fill="${text}" fill-opacity="0.85">${escapeXml(author)}</text>`
      : ""
  }
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
