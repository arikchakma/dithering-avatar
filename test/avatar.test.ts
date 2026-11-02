import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  AVATAR_GRID,
  AVATAR_PALETTES,
  DitheringAvatar,
  getAvatarPaths,
  getAvatarSvg,
  pickPalette,
} from 'dithering-avatar';
import type { AvatarPalette } from 'dithering-avatar';

const GOLDEN = [
  {
    seed: 'Acme Mail',
    palette: 'Cyan',
    rows: [
      '0101111212222222',
      '1011112122222222',
      '0101111222222222',
      '1011112122222222',
      '0001011212222222',
      '1011112122222222',
      '0101011212222212',
      '1010111122212222',
      '0001011111121212',
      '0010101111212122',
      '0000010111111212',
      '0000101111112121',
      '0000000101111112',
      '0000101111111121',
      '0000010101111112',
      '0000101011112121',
    ],
  },
  {
    seed: 'Quiet Pine',
    palette: 'Green',
    rows: [
      '0111111212122222',
      '1111112121222222',
      '0101111112122222',
      '1111112122222222',
      '0101011112222222',
      '1011111121222222',
      '0101011112222222',
      '1010111122222222',
      '0001011112122222',
      '0010101111222222',
      '0000010111111212',
      '0000101111112121',
      '0000000101010112',
      '0000001010111111',
      '0000000001010111',
      '0000101010101111',
    ],
  },
  {
    seed: 'sukha-moy',
    palette: 'Mint',
    rows: [
      '1111110100000000',
      '2121111110100000',
      '1211111101000000',
      '2121211111101000',
      '1211111111010000',
      '2121212111111010',
      '1211121212110100',
      '2221212122211110',
      '1211111212121100',
      '2121212222211110',
      '2211121222121100',
      '2221212222212110',
      '2212121212111101',
      '2222212221211110',
      '2222121212111101',
      '2222222121211110',
    ],
  },
];

function getRows(seed: string, palette: AvatarPalette) {
  const rows = Array.from({ length: AVATAR_GRID }, () =>
    Array<string>(AVATAR_GRID).fill('.')
  );

  for (const path of getAvatarPaths(seed, { palette })) {
    const tone = palette.indexOf(path.fill) - 1;
    for (const match of path.d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
      const [, x, y, width] = match.map(Number) as [number, number, number, number];
      for (let i = 0; i < width; i++) {
        assert.equal(rows[y]![x + i], '.', 'cells must not overlap');
        rows[y]![x + i] = String(tone);
      }
    }
  }

  return rows.map((row) => row.join(''));
}

for (const { seed, palette, rows } of GOLDEN) {
  test(`keeps the avatar of "${seed}" stable`, () => {
    const picked = pickPalette(seed);
    assert.equal(picked[0], palette);
    assert.deepEqual(getRows(seed, picked), rows);
  });
}

test('keeps the palette order stable', () => {
  assert.equal(AVATAR_PALETTES.length, 20);
  assert.equal(AVATAR_PALETTES[0]?.[0], 'Red');
  assert.equal(AVATAR_PALETTES[19]?.[0], 'Slate');
});

test('accepts a custom palette', () => {
  const palette: AvatarPalette = ['Mono', '#000000', '#777777', '#ffffff'];
  const fills = getAvatarPaths('Acme Mail', { palette }).map((path) => path.fill);
  assert.deepEqual(fills, ['#000000', '#777777', '#ffffff']);
});

test('builds a standalone SVG string', () => {
  const svg = getAvatarSvg('Acme Mail', { size: 48 });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="48" height="48"/);
  assert.match(svg, /<\/svg>$/);
});

test('renders the same paths in React', () => {
  const html = renderToStaticMarkup(
    createElement(DitheringAvatar, {
      seed: 'Acme Mail',
      shape: 'square',
      'aria-label': 'Acme Mail',
    })
  );

  for (const path of getAvatarPaths('Acme Mail')) {
    assert.ok(html.includes(`d="${path.d}"`));
  }
  assert.ok(html.includes('border-radius:25%'));
  assert.ok(html.includes('aria-label="Acme Mail"'));
});
