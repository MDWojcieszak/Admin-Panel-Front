# SectionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**versionId** | **string** |  | [default to undefined]
**type** | [**BlogSectionType**](BlogSectionType.md) |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**minAccessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**headingLevel** | **number** |  | [optional] [default to undefined]
**quoteAuthor** | **string** |  | [optional] [default to undefined]
**calloutVariant** | [**CalloutVariant**](CalloutVariant.md) |  | [optional] [default to undefined]
**galleryLayout** | [**GalleryLayout**](GalleryLayout.md) |  | [optional] [default to undefined]
**embedUrl** | **string** |  | [optional] [default to undefined]
**embedProvider** | [**EmbedProvider**](EmbedProvider.md) |  | [optional] [default to undefined]
**parentId** | **string** | Parent section id (COLUMNS→COLUMN→block nesting); null at top level. | [optional] [default to undefined]
**columnWidth** | **number** | COLUMN width share, 0..1 (relative). | [optional] [default to undefined]
**translations** | [**Array&lt;SectionTranslationResponse&gt;**](SectionTranslationResponse.md) |  | [default to undefined]
**images** | [**Array&lt;SectionImageResponse&gt;**](SectionImageResponse.md) |  | [default to undefined]
**items** | [**Array&lt;SectionListItemResponse&gt;**](SectionListItemResponse.md) |  | [default to undefined]
**pois** | [**Array&lt;SectionPoiResponse&gt;**](SectionPoiResponse.md) |  | [default to undefined]
**collection** | [**SectionCollectionResponse**](SectionCollectionResponse.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { SectionResponse } from './api';

const instance: SectionResponse = {
    id,
    versionId,
    type,
    order,
    minAccessTier,
    headingLevel,
    quoteAuthor,
    calloutVariant,
    galleryLayout,
    embedUrl,
    embedProvider,
    parentId,
    columnWidth,
    translations,
    images,
    items,
    pois,
    collection,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
