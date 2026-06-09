import { BlogAccessTier, BlogPostStatus } from '~/api/api';
import { BadgeTone } from '~/components/Badge';

export const postStatusTone = (status: BlogPostStatus): BadgeTone => {
  switch (status) {
    case BlogPostStatus.Published:
      return 'green';
    case BlogPostStatus.Scheduled:
      return 'blue';
    case BlogPostStatus.Archived:
      return 'red';
    case BlogPostStatus.Draft:
    default:
      return 'neutral';
  }
};

export const accessTierTone = (tier: BlogAccessTier): BadgeTone => {
  switch (tier) {
    case BlogAccessTier.Premium:
      return 'purple';
    case BlogAccessTier.Registered:
      return 'yellow';
    case BlogAccessTier.Public:
    default:
      return 'neutral';
  }
};
