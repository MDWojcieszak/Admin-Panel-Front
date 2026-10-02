import { IconType } from 'react-icons';
import {
  FiAperture,
  FiBatteryCharging,
  FiCamera,
  FiCpu,
  FiCrop,
  FiDroplet,
  FiFilm,
  FiHardDrive,
  FiLayers,
  FiLink,
  FiMonitor,
  FiMoon,
  FiPackage,
  FiRadio,
  FiSave,
  FiSun,
  FiTarget,
  FiThermometer,
  FiTool,
  FiUmbrella,
  FiVideo,
  FiZap,
} from 'react-icons/fi';
import { GearCategory, GearMediaSource, GearOwnership } from '~/api/api';

/**
 * Grouping used to keep a 39-value select navigable. It mirrors the backend's
 * own grouping of the enum; the values themselves stay the source of truth.
 */
export const GEAR_CATEGORY_GROUPS: { label: string; categories: GearCategory[] }[] = [
  {
    label: 'Cameras',
    categories: [
      GearCategory.Camera,
      GearCategory.FilmCamera,
      GearCategory.AstroCamera,
      GearCategory.Drone,
      GearCategory.ActionCam,
    ],
  },
  {
    label: 'Optics',
    categories: [GearCategory.Lens, GearCategory.Teleconverter, GearCategory.Adapter, GearCategory.Filter],
  },
  {
    label: 'Astro',
    categories: [
      GearCategory.Telescope,
      GearCategory.SmartTelescope,
      GearCategory.GuideScope,
      GearCategory.Mount,
      GearCategory.Eyepiece,
      GearCategory.Binoculars,
      GearCategory.Diagonal,
      GearCategory.DewHeater,
    ],
  },
  { label: 'Support', categories: [GearCategory.Tripod, GearCategory.Head, GearCategory.Gimbal] },
  { label: 'Light', categories: [GearCategory.Flash, GearCategory.Lighting, GearCategory.LightModifier] },
  {
    label: 'Power',
    categories: [GearCategory.Battery, GearCategory.Charger, GearCategory.PowerBank, GearCategory.PowerStation],
  },
  {
    label: 'Data',
    categories: [GearCategory.MemoryCard, GearCategory.CardReader, GearCategory.Storage, GearCategory.Computer],
  },
  {
    label: 'Carry & protect',
    categories: [GearCategory.Bag, GearCategory.Strap, GearCategory.RainCover, GearCategory.Cleaning],
  },
  { label: 'Other', categories: [GearCategory.Remote, GearCategory.Cable, GearCategory.Accessory, GearCategory.Other] },
];

const CATEGORY_ICONS: Record<GearCategory, IconType> = {
  [GearCategory.Camera]: FiCamera,
  [GearCategory.FilmCamera]: FiFilm,
  [GearCategory.AstroCamera]: FiMoon,
  [GearCategory.Drone]: FiRadio,
  [GearCategory.ActionCam]: FiVideo,
  [GearCategory.Lens]: FiAperture,
  [GearCategory.Teleconverter]: FiAperture,
  [GearCategory.Adapter]: FiLink,
  [GearCategory.Filter]: FiLayers,
  [GearCategory.Telescope]: FiTarget,
  [GearCategory.SmartTelescope]: FiTarget,
  [GearCategory.GuideScope]: FiTarget,
  [GearCategory.Mount]: FiCrop,
  [GearCategory.Eyepiece]: FiAperture,
  [GearCategory.Binoculars]: FiTarget,
  [GearCategory.Diagonal]: FiCrop,
  [GearCategory.DewHeater]: FiThermometer,
  [GearCategory.Tripod]: FiCrop,
  [GearCategory.Head]: FiCrop,
  [GearCategory.Gimbal]: FiCrop,
  [GearCategory.Flash]: FiZap,
  [GearCategory.Lighting]: FiSun,
  [GearCategory.LightModifier]: FiUmbrella,
  [GearCategory.Battery]: FiBatteryCharging,
  [GearCategory.Charger]: FiBatteryCharging,
  [GearCategory.PowerBank]: FiBatteryCharging,
  [GearCategory.PowerStation]: FiZap,
  [GearCategory.MemoryCard]: FiSave,
  [GearCategory.CardReader]: FiCpu,
  [GearCategory.Storage]: FiHardDrive,
  [GearCategory.Computer]: FiMonitor,
  [GearCategory.Bag]: FiPackage,
  [GearCategory.Strap]: FiLink,
  [GearCategory.RainCover]: FiUmbrella,
  [GearCategory.Cleaning]: FiDroplet,
  [GearCategory.Remote]: FiRadio,
  [GearCategory.Cable]: FiLink,
  [GearCategory.Accessory]: FiTool,
  [GearCategory.Other]: FiTool,
};

/** `FILM_CAMERA` → `Film camera`, so a category added on the backend still reads well. */
export const gearCategoryLabel = (category: GearCategory | string): string => {
  const words = String(category).toLowerCase().split('_');
  if (!words.length) return String(category);
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(' ');
};

export const gearCategoryIcon = (category: GearCategory): IconType => CATEGORY_ICONS[category] ?? FiTool;

export const gearItemLabel = (gear: { brand: string; model: string }): string => `${gear.brand} ${gear.model}`.trim();

export const OWNERSHIP_LABELS: Record<GearOwnership, string> = {
  [GearOwnership.Owned]: 'Owned',
  [GearOwnership.Wishlist]: 'Wishlist',
  [GearOwnership.Retired]: 'Retired',
};

/**
 * Whether an item holds material that has to come off it after a shoot. Never
 * hard-code the category list for this — it is the backend's call, surfaced per
 * item and in `GET /gear/categories`.
 */
export const holdsMedia = (mediaSource: GearMediaSource): boolean => mediaSource !== GearMediaSource.None;
