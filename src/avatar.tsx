import type { ComponentProps, ReactElement } from 'react';
import { AVATAR_GRID, getAvatarPaths } from './dither';
import type { AvatarPalette } from './dither';

export type DitheringAvatarProps = Omit<ComponentProps<'svg'>, 'children'> & {
  seed: string;
  size?: number | string;
  shape?: 'circle' | 'square';
  palette?: AvatarPalette;
};

export function DitheringAvatar(props: DitheringAvatarProps): ReactElement {
  const { seed, size = 32, shape = 'circle', palette, style, ...rest } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${AVATAR_GRID} ${AVATAR_GRID}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ borderRadius: shape === 'circle' ? '50%' : '25%', ...style }}
      {...rest}
    >
      {getAvatarPaths(seed, { palette }).map((path) => (
        <path key={path.d} d={path.d} fill={path.fill} />
      ))}
    </svg>
  );
}
