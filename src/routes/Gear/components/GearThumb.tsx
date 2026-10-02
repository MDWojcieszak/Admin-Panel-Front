import { CSSProperties } from 'react';
import { GearCategory } from '~/api/api';
import { imgUrl } from '~/routes/Galleries/utils';
import { gearCategoryColor, gearCategoryIcon } from '~/utils/gearCategory';
import { useTheme } from '~/utils/theme';

type GearThumbProps = {
  gear: { category: GearCategory; coverUrl?: string | null; lowResUrl?: string | null };
  /** Edge length in px; the thumb is square unless `style` says otherwise. */
  size?: number;
  style?: CSSProperties;
};

/**
 * The picture of an item wherever one is shown small: its photo when it has
 * one, otherwise the icon of its category in that category's group colour.
 * Lists that only showed the icon made it impossible to tell two lenses apart
 * even though the photos were sitting right there.
 */
export const GearThumb = ({ gear, size = 44, style }: GearThumbProps) => {
  const theme = useTheme();
  // The low-res stream is plenty at these sizes and far cheaper to pull in bulk.
  const src = imgUrl(gear.lowResUrl) ?? imgUrl(gear.coverUrl);
  const Icon = gearCategoryIcon(gear.category);
  const color = theme.colors[gearCategoryColor(gear.category)];

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: theme.borderRadius.default,
        backgroundColor: src ? theme.colors.gray02 : color + theme.colorOpacity(0.12),
        border: `1px solid ${src ? theme.colors.gray01 + theme.colorOpacity(0.5) : color + theme.colorOpacity(0.28)}`,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=''
          loading='lazy'
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Icon size={Math.round(size * 0.45)} color={color} />
      )}
    </div>
  );
};
