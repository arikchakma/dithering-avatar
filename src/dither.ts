export type AvatarPalette = {
  name?: string;
  dark: string;
  mid: string;
  light: string;
};

export type AvatarPath = {
  d: string;
  fill: string;
};

export const AVATAR_PALETTES: readonly AvatarPalette[] = [
  { name: 'Red', dark: '#5C120C', mid: '#F13F34', light: '#FFB8AE' },
  { name: 'Orange', dark: '#5E2A07', mid: '#F2711C', light: '#FFC9A3' },
  { name: 'Amber', dark: '#5A3D04', mid: '#E5A00D', light: '#FBE3A1' },
  { name: 'Green', dark: '#0F3D22', mid: '#2FA36B', light: '#B5EBCB' },
  { name: 'Teal', dark: '#0B3B3E', mid: '#1C9AA5', light: '#ADE6EA' },
  { name: 'Blue', dark: '#0E2A5C', mid: '#3B6FF0', light: '#B9CCFF' },
  { name: 'Violet', dark: '#2E1563', mid: '#7A4DE8', light: '#D2C2FF' },
  { name: 'Pink', dark: '#5E1036', mid: '#E5488F', light: '#FFC2DD' },
  { name: 'Crimson', dark: '#4E0A18', mid: '#D42A4C', light: '#FFB3C2' },
  { name: 'Coral', dark: '#5C1E14', mid: '#FF7A59', light: '#FFD0C2' },
  { name: 'Rust', dark: '#4A1E0B', mid: '#C4561F', light: '#F4C3A3' },
  { name: 'Lime', dark: '#2C3D07', mid: '#8CC21D', light: '#DDF3A8' },
  { name: 'Olive', dark: '#2E3210', mid: '#8A8F2E', light: '#E1E3B4' },
  { name: 'Mint', dark: '#0D3B2E', mid: '#3CC79A', light: '#C2F2E1' },
  { name: 'Cyan', dark: '#073A47', mid: '#14B2D6', light: '#AEEBF7' },
  { name: 'Sky', dark: '#0B2F4F', mid: '#3E9BE8', light: '#BFE0FF' },
  { name: 'Indigo', dark: '#1B1B5C', mid: '#4F52D9', light: '#C8C9FF' },
  { name: 'Plum', dark: '#3D1240', mid: '#A23BB0', light: '#EBC3F0' },
  { name: 'Rose', dark: '#4F1427', mid: '#E2577A', light: '#FFC9D6' },
  { name: 'Slate', dark: '#1E2530', mid: '#5B6B80', light: '#D3DAE3' },
];

export const AVATAR_GRID = 16;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function createRandom(name: string) {
  let h = 2166136261;
  for (const c of name) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }

  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;

    return ((h >>> 0) % 10000) / 10000;
  };
}

export function pickPalette(name: string): AvatarPalette {
  let h = 7;
  for (const c of name) {
    h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  }

  return AVATAR_PALETTES[h % AVATAR_PALETTES.length]!;
}

type AvatarPathsOptions = {
  palette?: AvatarPalette;
};

export function getAvatarPaths(
  name: string,
  options: AvatarPathsOptions = {}
): AvatarPath[] {
  const { palette = pickPalette(name) } = options;

  const r = createRandom(name);
  const angle = r() * Math.PI * 2;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const light = [2 + r() * 12, 2 + r() * 12] as const;
  const shadow = [2 + r() * 12, 2 + r() * 12] as const;

  const getTone = (x: number, y: number) => {
    let v =
      ((x - AVATAR_GRID / 2) * dx + (y - AVATAR_GRID / 2) * dy) / AVATAR_GRID +
      0.5;
    v +=
      0.55 *
      Math.exp(
        -((x - light[0]) ** 2 + (y - light[1]) ** 2) /
          (AVATAR_GRID * AVATAR_GRID * 0.06)
      );
    v -=
      0.25 *
      Math.exp(
        -((x - shadow[0]) ** 2 + (y - shadow[1]) ** 2) /
          (AVATAR_GRID * AVATAR_GRID * 0.05)
      );
    v = Math.min(1, Math.max(0, v));

    const q = v * 2 + (BAYER[y % 4]![x % 4]! / 16 - 0.47) * 0.95;

    return Math.min(2, Math.max(0, Math.round(q)));
  };

  const paths = ['', '', ''];

  for (let y = 0; y < AVATAR_GRID; y++) {
    let x = 0;
    while (x < AVATAR_GRID) {
      const tone = getTone(x, y);
      let end = x + 1;
      while (end < AVATAR_GRID && getTone(end, y) === tone) {
        end++;
      }

      const width = end - x;
      paths[tone] += `M${x} ${y}h${width}v1h-${width}z`;
      x = end;
    }
  }

  const fills = [palette.dark, palette.mid, palette.light];

  return paths
    .map((d, index) => ({ d, fill: fills[index]! }))
    .filter((path) => path.d);
}

type AvatarSvgOptions = AvatarPathsOptions & {
  size?: number;
};

export function getAvatarSvg(
  name: string,
  options: AvatarSvgOptions = {}
): string {
  const { size = 64, palette } = options;

  const body = getAvatarPaths(name, { palette })
    .map((path) => `<path d="${path.d}" fill="${path.fill}"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${AVATAR_GRID} ${AVATAR_GRID}" shape-rendering="crispEdges">${body}</svg>`;
}
