# PatchSectionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**order** | **number** |  | [optional] [default to undefined]
**minAccessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]
**headingLevel** | **number** |  | [optional] [default to undefined]
**quoteAuthor** | **string** |  | [optional] [default to undefined]
**calloutVariant** | [**CalloutVariant**](CalloutVariant.md) |  | [optional] [default to undefined]
**galleryLayout** | [**GalleryLayout**](GalleryLayout.md) |  | [optional] [default to undefined]
**embedUrl** | **string** |  | [optional] [default to undefined]
**embedProvider** | [**EmbedProvider**](EmbedProvider.md) |  | [optional] [default to undefined]
**collectionId** | **string** | PoiCollection id (FK) for a COLLECTION section; null clears. | [optional] [default to undefined]

## Example

```typescript
import { PatchSectionDto } from './api';

const instance: PatchSectionDto = {
    order,
    minAccessTier,
    headingLevel,
    quoteAuthor,
    calloutVariant,
    galleryLayout,
    embedUrl,
    embedProvider,
    collectionId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
