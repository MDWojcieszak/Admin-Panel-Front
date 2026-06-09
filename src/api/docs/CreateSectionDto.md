# CreateSectionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | [**BlogSectionType**](BlogSectionType.md) |  | [default to undefined]
**order** | **number** | Position; appended to the end when omitted. | [optional] [default to undefined]
**minAccessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]
**headingLevel** | **number** |  | [optional] [default to undefined]
**quoteAuthor** | **string** |  | [optional] [default to undefined]
**calloutVariant** | [**CalloutVariant**](CalloutVariant.md) |  | [optional] [default to undefined]
**galleryLayout** | [**GalleryLayout**](GalleryLayout.md) |  | [optional] [default to undefined]
**embedUrl** | **string** |  | [optional] [default to undefined]
**embedProvider** | [**EmbedProvider**](EmbedProvider.md) |  | [optional] [default to undefined]
**mediaPosition** | [**BlogMediaPosition**](BlogMediaPosition.md) |  | [optional] [default to undefined]
**mediaSplit** | [**BlogMediaSplit**](BlogMediaSplit.md) |  | [optional] [default to undefined]
**mobileStackOrder** | [**BlogMobileStackOrder**](BlogMobileStackOrder.md) |  | [optional] [default to undefined]
**locale** | **string** | Locale for the initial translation. Defaults to the default locale. | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**body** | **string** | Markdown body for the initial locale. | [optional] [default to undefined]
**keywords** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateSectionDto } from './api';

const instance: CreateSectionDto = {
    type,
    order,
    minAccessTier,
    headingLevel,
    quoteAuthor,
    calloutVariant,
    galleryLayout,
    embedUrl,
    embedProvider,
    mediaPosition,
    mediaSplit,
    mobileStackOrder,
    locale,
    title,
    body,
    keywords,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
