import { IconType } from 'react-icons';
import {
  FiAperture,
  FiBattery,
  FiBatteryCharging,
  FiCamera,
  FiCircle,
  FiCompass,
  FiDroplet,
  FiFilm,
  FiHardDrive,
  FiLayers,
  FiLink,
  FiMonitor,
  FiMoon,
  FiPackage,
  FiRadio,
  FiRotateCw,
  FiSun,
  FiTarget,
  FiThermometer,
  FiTool,
  FiTriangle,
  FiUmbrella,
  FiVideo,
  FiZap,
  FiZoomIn,
} from 'react-icons/fi';
import { BsBinoculars } from 'react-icons/bs';
import {
  TbBackpack,
  TbBolt,
  TbDeviceSdCard,
  TbDrone,
  TbLamp,
  TbPlug,
  TbPrism,
  TbRotate360,
  TbSatellite,
  TbTelescope,
  TbUsb,
} from 'react-icons/tb';
import { GearCategory, GearMediaSource, GearOwnership } from '~/api/api';
import { Theme } from '~/utils/theme';

/**
 * Grouping used to keep a 39-value select navigable. It mirrors the backend's
 * own grouping of the enum; the values themselves stay the source of truth.
 */
export const GEAR_CATEGORY_GROUPS: { label: string; color: keyof Theme['colors']; categories: GearCategory[] }[] = [
  {
    label: 'Cameras',
    color: 'blue',
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
    color: 'purple02',
    categories: [GearCategory.Lens, GearCategory.Teleconverter, GearCategory.Adapter, GearCategory.Filter],
  },
  {
    label: 'Astro',
    color: 'purple03',
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
  { label: 'Support', color: 'blue04', categories: [GearCategory.Tripod, GearCategory.Head, GearCategory.Gimbal] },
  {
    label: 'Light',
    color: 'yellow',
    categories: [GearCategory.Flash, GearCategory.Lighting, GearCategory.LightModifier],
  },
  {
    label: 'Power',
    color: 'lightGreen',
    categories: [GearCategory.Battery, GearCategory.Charger, GearCategory.PowerBank, GearCategory.PowerStation],
  },
  {
    label: 'Data',
    color: 'lightBlue',
    categories: [GearCategory.MemoryCard, GearCategory.CardReader, GearCategory.Storage, GearCategory.Computer],
  },
  {
    label: 'Carry & protect',
    color: 'mainGreen',
    categories: [GearCategory.Bag, GearCategory.Strap, GearCategory.RainCover, GearCategory.Cleaning],
  },
  {
    label: 'Other',
    color: 'dark05',
    categories: [GearCategory.Remote, GearCategory.Cable, GearCategory.Accessory, GearCategory.Other],
  },
];

/**
 * Chosen to say what the thing physically is: a tripod reads as the triangle its
 * legs make, a star diagonal as a prism, a mount as the pole it aligns to. Kept
 * to stroke-drawn sets (Feather and Tabler, plus Bootstrap where neither has the
 * concept) so the weights match at the small sizes these render at.
 *
 * A few icons repeat where the concepts genuinely overlap — adapters, cables and
 * straps are all "something that attaches" and no set draws them apart.
 */
const CATEGORY_ICONS: Record<GearCategory, IconType> = {
  [GearCategory.Camera]: FiCamera,
  [GearCategory.FilmCamera]: FiFilm,
  [GearCategory.AstroCamera]: FiMoon,
  [GearCategory.Drone]: TbDrone,
  [GearCategory.ActionCam]: FiVideo,
  [GearCategory.Lens]: FiAperture,
  [GearCategory.Teleconverter]: FiZoomIn,
  [GearCategory.Adapter]: FiLink,
  [GearCategory.Filter]: FiLayers,
  [GearCategory.Telescope]: TbTelescope,
  [GearCategory.SmartTelescope]: TbSatellite,
  [GearCategory.GuideScope]: FiTarget,
  [GearCategory.Mount]: FiCompass,
  [GearCategory.Eyepiece]: FiCircle,
  [GearCategory.Binoculars]: BsBinoculars,
  [GearCategory.Diagonal]: TbPrism,
  [GearCategory.DewHeater]: FiThermometer,
  [GearCategory.Tripod]: FiTriangle,
  [GearCategory.Head]: FiRotateCw,
  [GearCategory.Gimbal]: TbRotate360,
  [GearCategory.Flash]: FiZap,
  [GearCategory.Lighting]: TbLamp,
  [GearCategory.LightModifier]: FiSun,
  [GearCategory.Battery]: FiBattery,
  [GearCategory.Charger]: TbPlug,
  [GearCategory.PowerBank]: FiBatteryCharging,
  [GearCategory.PowerStation]: TbBolt,
  [GearCategory.MemoryCard]: TbDeviceSdCard,
  [GearCategory.CardReader]: TbUsb,
  [GearCategory.Storage]: FiHardDrive,
  [GearCategory.Computer]: FiMonitor,
  [GearCategory.Bag]: TbBackpack,
  [GearCategory.Strap]: FiLink,
  [GearCategory.RainCover]: FiUmbrella,
  [GearCategory.Cleaning]: FiDroplet,
  [GearCategory.Remote]: FiRadio,
  [GearCategory.Cable]: FiLink,
  [GearCategory.Accessory]: FiTool,
  [GearCategory.Other]: FiPackage,
};

/** `FILM_CAMERA` → `Film camera`, so a category added on the backend still reads well. */
export const gearCategoryLabel = (category: GearCategory | string): string => {
  const words = String(category).toLowerCase().split('_');
  if (!words.length) return String(category);
  return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(' ');
};

const CATEGORY_COLORS = new Map<GearCategory, keyof Theme['colors']>(
  GEAR_CATEGORY_GROUPS.flatMap((group) => group.categories.map((category) => [category, group.color] as const)),
);

/**
 * One colour per group, not per category: 39 hues would be noise, while nine
 * are enough to tell a camera from a lens from a battery at a glance.
 */
export const gearCategoryColor = (category: GearCategory): keyof Theme['colors'] =>
  CATEGORY_COLORS.get(category) ?? 'dark05';

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
