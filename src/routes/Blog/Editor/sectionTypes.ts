import {
  BlogSectionType,
  CalloutVariant,
  CreateSectionDto,
  EmbedProvider,
  GalleryLayout,
  BlogMediaPosition,
  BlogMediaSplit,
  BlogMobileStackOrder,
} from '~/api/api';

export type SectionGroup = 'Text' | 'Media' | 'Embed' | 'Layout';

export const SECTION_META: { type: BlogSectionType; label: string; group: SectionGroup; hint: string }[] = [
  { type: BlogSectionType.Heading, label: 'Heading', group: 'Text', hint: 'Section title (H1–H6)' },
  { type: BlogSectionType.Paragraph, label: 'Paragraph', group: 'Text', hint: 'Rich markdown text' },
  { type: BlogSectionType.Quote, label: 'Quote', group: 'Text', hint: 'Pull quote with author' },
  { type: BlogSectionType.Callout, label: 'Callout', group: 'Text', hint: 'Info / tip / warning box' },
  { type: BlogSectionType.List, label: 'List', group: 'Text', hint: 'Bulleted items' },
  { type: BlogSectionType.Image, label: 'Image', group: 'Media', hint: 'Single image with layout' },
  { type: BlogSectionType.Gallery, label: 'Gallery', group: 'Media', hint: 'Multiple images' },
  { type: BlogSectionType.MediaText, label: 'Media + text', group: 'Media', hint: 'Image beside markdown' },
  { type: BlogSectionType.Map, label: 'Map', group: 'Media', hint: 'Places on a map' },
  { type: BlogSectionType.Place, label: 'Place', group: 'Media', hint: 'Single point of interest' },
  { type: BlogSectionType.Embed, label: 'Embed', group: 'Embed', hint: 'YouTube / Vimeo / Spotify…' },
  { type: BlogSectionType.Divider, label: 'Divider', group: 'Layout', hint: 'Visual separator' },
];

export const TEXT_TYPES: BlogSectionType[] = [
  BlogSectionType.Paragraph,
  BlogSectionType.Quote,
  BlogSectionType.Callout,
];

/** Sensible language-neutral defaults applied when a block is added. */
export const sectionDefaults = (type: BlogSectionType): Partial<CreateSectionDto> => {
  switch (type) {
    case BlogSectionType.Heading:
      return { headingLevel: 2 };
    case BlogSectionType.Callout:
      return { calloutVariant: CalloutVariant.Info };
    case BlogSectionType.Gallery:
      return { galleryLayout: GalleryLayout.Grid };
    case BlogSectionType.MediaText:
      return {
        mediaPosition: BlogMediaPosition.Left,
        mediaSplit: BlogMediaSplit.Half,
        mobileStackOrder: BlogMobileStackOrder.MediaFirst,
      };
    case BlogSectionType.Embed:
      return { embedProvider: EmbedProvider.Youtube };
    default:
      return {};
  }
};
