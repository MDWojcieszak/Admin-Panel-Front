# DocumentBlockDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Existing sectionId (update). | [optional] [default to undefined]
**clientKey** | **string** | Client key for a new block. | [optional] [default to undefined]
**type** | [**DocumentBlockType**](DocumentBlockType.md) |  | [default to undefined]
**markdown** | **string** | Markdown body (prose/callout/mediaText/quote). | [optional] [default to undefined]
**text** | **string** | Heading text (heading block). | [optional] [default to undefined]
**caption** | **string** | Caption for a single-image block (image/mediaText). | [optional] [default to undefined]
**alt** | **string** | Alt text for a single-image block (per-locale). | [optional] [default to undefined]
**overlayText** | **string** | Overlay text rendered on the image (per-locale). | [optional] [default to undefined]
**variant** | [**CalloutVariant**](CalloutVariant.md) |  | [optional] [default to undefined]
**imageId** | **string** |  | [optional] [default to undefined]
**imageIds** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**galleryLayout** | [**GalleryLayout**](GalleryLayout.md) |  | [optional] [default to undefined]
**imageSize** | [**BlogImageSize**](BlogImageSize.md) |  | [optional] [default to undefined]
**aspectRatio** | [**BlogAspectRatio**](BlogAspectRatio.md) |  | [optional] [default to undefined]
**focalX** | **number** | Focal point X, 0..1 (left→right). image/mediaText only. | [optional] [default to undefined]
**focalY** | **number** | Focal point Y, 0..1 (top→bottom). | [optional] [default to undefined]
**overlayPosition** | [**BlogOverlayPosition**](BlogOverlayPosition.md) |  | [optional] [default to undefined]
**overlayTheme** | [**BlogOverlayTheme**](BlogOverlayTheme.md) |  | [optional] [default to undefined]
**overlayBackdrop** | [**BlogOverlayBackdrop**](BlogOverlayBackdrop.md) |  | [optional] [default to undefined]
**mediaPosition** | [**BlogMediaPosition**](BlogMediaPosition.md) |  | [optional] [default to undefined]
**mediaSplit** | [**BlogMediaSplit**](BlogMediaSplit.md) |  | [optional] [default to undefined]
**mobileStackOrder** | [**BlogMobileStackOrder**](BlogMobileStackOrder.md) |  | [optional] [default to undefined]
**provider** | [**EmbedProvider**](EmbedProvider.md) |  | [optional] [default to undefined]
**url** | **string** |  | [optional] [default to undefined]
**poiId** | **string** |  | [optional] [default to undefined]
**poiIds** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**level** | **number** |  | [optional] [default to undefined]
**author** | **string** |  | [optional] [default to undefined]
**items** | [**Array&lt;DocumentListItemInputDto&gt;**](DocumentListItemInputDto.md) |  | [optional] [default to undefined]
**minAccessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]

## Example

```typescript
import { DocumentBlockDto } from './api';

const instance: DocumentBlockDto = {
    id,
    clientKey,
    type,
    markdown,
    text,
    caption,
    alt,
    overlayText,
    variant,
    imageId,
    imageIds,
    galleryLayout,
    imageSize,
    aspectRatio,
    focalX,
    focalY,
    overlayPosition,
    overlayTheme,
    overlayBackdrop,
    mediaPosition,
    mediaSplit,
    mobileStackOrder,
    provider,
    url,
    poiId,
    poiIds,
    level,
    author,
    items,
    minAccessTier,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
