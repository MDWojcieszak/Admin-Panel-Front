import { FaAndroid, FaApple, FaLinux, FaWindows } from 'react-icons/fa6';
import { FiTerminal } from 'react-icons/fi';
import { IntegrationPlatform } from '~/api/api';

const LABELS: Record<IntegrationPlatform, string> = {
  [IntegrationPlatform.Windows]: 'Windows',
  [IntegrationPlatform.Macos]: 'macOS',
  [IntegrationPlatform.Linux]: 'Linux',
  [IntegrationPlatform.Ios]: 'iOS',
  [IntegrationPlatform.Android]: 'Android',
  [IntegrationPlatform.Other]: 'Other',
};

/** Falls back to the raw enum value so a platform added on the backend still reads sensibly. */
export const platformLabel = (platform: IntegrationPlatform): string => LABELS[platform] ?? platform;

export const PLATFORM_OPTIONS = Object.values(IntegrationPlatform).map((value) => ({
  label: platformLabel(value),
  value,
}));

type PlatformIconProps = {
  platform: IntegrationPlatform;
  size?: number;
  color?: string;
};

export const PlatformIcon = ({ platform, size = 18, color }: PlatformIconProps) => {
  switch (platform) {
    case IntegrationPlatform.Windows:
      return <FaWindows size={size} color={color} />;
    case IntegrationPlatform.Macos:
    case IntegrationPlatform.Ios:
      return <FaApple size={size} color={color} />;
    case IntegrationPlatform.Linux:
      return <FaLinux size={size} color={color} />;
    case IntegrationPlatform.Android:
      return <FaAndroid size={size} color={color} />;
    default:
      return <FiTerminal size={size} color={color} />;
  }
};
