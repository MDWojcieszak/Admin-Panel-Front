# VisibleSectionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**type** | [**BlogSectionType**](BlogSectionType.md) |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**minAccessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**headingLevel** | **number** |  | [optional] [default to undefined]
**quoteAuthor** | **string** |  | [optional] [default to undefined]
**calloutVariant** | [**CalloutVariant**](CalloutVariant.md) |  | [optional] [default to undefined]
**galleryLayout** | [**GalleryLayout**](GalleryLayout.md) |  | [optional] [default to undefined]
**embedUrl** | **string** |  | [optional] [default to undefined]
**embedProvider** | [**EmbedProvider**](EmbedProvider.md) |  | [optional] [default to undefined]
**parentId** | **string** | Parent section id (COLUMNS→COLUMN nesting); null at top level. | [optional] [default to undefined]
**columnWidth** | **number** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**body** | **string** |  | [optional] [default to undefined]
**keywords** | **Array&lt;string&gt;** |  | [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**images** | [**Array&lt;ResolvedSectionImageResponse&gt;**](ResolvedSectionImageResponse.md) |  | [default to undefined]
**items** | [**Array&lt;ResolvedSectionListItemResponse&gt;**](ResolvedSectionListItemResponse.md) |  | [default to undefined]
**pois** | [**Array&lt;ResolvedSectionPoiResponse&gt;**](ResolvedSectionPoiResponse.md) |  | [default to undefined]
**locked** | **boolean** |  | [default to undefined]

## Example

```typescript
import { VisibleSectionResponse } from './api';

const instance: VisibleSectionResponse = {
    id,
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
    title,
    body,
    keywords,
    untranslated,
    images,
    items,
    pois,
    locked,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
