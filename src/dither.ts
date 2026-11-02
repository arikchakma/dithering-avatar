export type AvatarPalette = readonly [
  name: string,
  dark: string,
  mid: string,
  light: string,
];

export type AvatarPath = {
  d: string;
  fill: string;
};

export const AVATAR_PALETTES: readonly AvatarPalette[] = [
  ['Red', '#5C120C', '#F13F34', '#FFB8AE'],
  ['Orange', '#5E2A07', '#F2711C', '#FFC9A3'],
  ['Amber', '#5A3D04', '#E5A00D', '#FBE3A1'],
  ['Green', '#0F3D22', '#2FA36B', '#B5EBCB'],
  ['Teal', '#0B3B3E', '#1C9AA5', '#ADE6EA'],
  ['Blue', '#0E2A5C', '#3B6FF0', '#B9CCFF'],
  ['Violet', '#2E1563', '#7A4DE8', '#D2C2FF'],
  ['Pink', '#5E1036', '#E5488F', '#FFC2DD'],
  ['Crimson', '#4E0A18', '#D42A4C', '#FFB3C2'],
  ['Coral', '#5C1E14', '#FF7A59', '#FFD0C2'],
  ['Rust', '#4A1E0B', '#C4561F', '#F4C3A3'],
  ['Lime', '#2C3D07', '#8CC21D', '#DDF3A8'],
  ['Olive', '#2E3210', '#8A8F2E', '#E1E3B4'],
  ['Mint', '#0D3B2E', '#3CC79A', '#C2F2E1'],
  ['Cyan', '#073A47', '#14B2D6', '#AEEBF7'],
  ['Sky', '#0B2F4F', '#3E9BE8', '#BFE0FF'],
  ['Indigo', '#1B1B5C', '#4F52D9', '#C8C9FF'],
  ['Plum', '#3D1240', '#A23BB0', '#EBC3F0'],
  ['Rose', '#4F1427', '#E2577A', '#FFC9D6'],
  ['Slate', '#1E2530', '#5B6B80', '#D3DAE3'],
];

export const AVATAR_GRID = 16;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function createRandom(seed: string) {
  let h = 2166136261;
  for (const c of seed) {
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

export function pickPalette(seed: string): AvatarPalette {
  let h = 7;
  for (const c of seed) {
    h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  }

  return AVATAR_PALETTES[h % AVATAR_PALETTES.length]!;
}

type AvatarPathsOptions = {
  palette?: AvatarPalette;
};

export function getAvatarPaths(
  seed: string,
  options: AvatarPathsOptions = {}
): AvatarPath[] {
  const { palette = pickPalette(seed) } = options;

  const r = createRandom(seed);
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

  return paths
    .map((d, index) => ({ d, fill: palette[index + 1]! }))
    .filter((path) => path.d);
}

type AvatarSvgOptions = AvatarPathsOptions & {
  size?: number;
};

export function getAvatarSvg(
  seed: string,
  options: AvatarSvgOptions = {}
): string {
  const { size = 64, palette } = options;

  const body = getAvatarPaths(seed, { palette })
    .map((path) => `<path d="${path.d}" fill="${path.fill}"/>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${AVATAR_GRID} ${AVATAR_GRID}" shape-rendering="crispEdges">${body}</svg>`;
}
