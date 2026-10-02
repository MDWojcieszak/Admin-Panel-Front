import { CSSProperties } from 'react';
import { GearCategory } from '~/api/api';
import { gearCategoryColor, gearCategoryIcon, gearCategoryLabel } from '~/utils/gearCategory';
import { useTheme } from '~/utils/theme';

type GearCategoryChipProps = {
  category: GearCategory;
  style?: CSSProperties;
};

/**
 * The category as icon + label in its group's colour. Text alone made a camera
 * and a lens look the same at a glance; the backdrop stays dark so the chip is
 * readable over a photo as well as over the empty-thumbnail fill.
 */
export const GearCategoryChip = ({ category, style }: GearCategoryChipProps) => {
  const theme = useTheme();
  const color = theme.colors[gearCategoryColor(category)];
  const Icon = gearCategoryIcon(category);

  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        width: 'fit-content',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.3,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        padding: '3px 7px',
        borderRadius: 999,
        color,
        backgroundColor: theme.colors.gray05 + theme.colorOpacity(0.8),
        border: `1px solid ${color + theme.colorOpacity(0.45)}`,
        ...style,
      }}
    >
      <Icon size={11} />
      {gearCategoryLabel(category)}
    </span>
  );
};
