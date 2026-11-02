![Dithering Avatar](_static/preview.svg)

<p align="center">Turn names into dithered avatars with zero dependencies</p>

<p align="center">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-222222.svg" alt="License" />
  </a>
  <a href="https://www.npmjs.com/package/dithering-avatar">
    <img src="https://img.shields.io/npm/v/dithering-avatar?color=222222&label=npm" alt="npm" />
  </a>
  <a href="https://inboxjot.com">
    <img src="https://img.shields.io/badge/%E2%9C%A8-Built%20for%20Inboxjot-0a0a0a.svg?style=flat&colorA=222222" alt="Built for Inboxjot" />
  </a>
</p>

Dithering Avatar turns a name or id into a 16×16 avatar with a gradient, a light spot and a shadow spot, dithered into three tones from one of 20 palettes. It was built for [Inboxjot](https://inboxjot.com) - Emails for builders and their agents.

### Quick Start

```sh
pnpm add dithering-avatar
```

```tsx
import { DitheringAvatar } from 'dithering-avatar';

<DitheringAvatar name="Acme Mail" />
<DitheringAvatar name="Acme Mail" size={48} shape="square" />
```

React 17 or later is a peer dependency.

### Props

- `name` - The string the avatar comes from. Required. Use an id if people can rename themselves, so their avatar stays the same.
- `size` - Width and height. Defaults to `32`.
- `shape` - `circle` or `square`. Defaults to `circle`.
- `palette` - Your own colors, as `{ dark: '#111111', mid: '#777777', light: '#EEEEEE' }`. Defaults to a palette from the name.

It also takes all other `<svg>` props. The avatar has `aria-hidden` by default.

### SVG String

Save the result to a CDN, or use it as an image source.

```ts
import { getAvatarSvg } from 'dithering-avatar';

const svg = getAvatarSvg('Acme Mail', { size: 64 });
const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
```

### Other Exports

- `getAvatarPaths` - Returns `{ d, fill }[]` for a `0 0 16 16` viewBox.
- `pickPalette` - Returns the palette for a name.
- `AVATAR_PALETTES` - The 20 palettes, as `{ name, dark, mid, light }`.
- `AVATAR_GRID` - The grid size.

### Stability

A name keeps its avatar. Only a major version can change the algorithm or the palettes.

### Contributing

Feel free to submit pull requests, create issues, or spread the word.

### License

[MIT](./LICENSE) &copy; [Arik Chakma](https://x.com/imarikchakma)
