# PublicPostResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**postId** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**status** | [**BlogPostStatus**](BlogPostStatus.md) |  | [default to undefined]
**accessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**locale** | **string** |  | [default to undefined]
**isTeaser** | **boolean** |  | [default to undefined]
**versionId** | **string** |  | [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**ogImageId** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**subtitle** | **string** |  | [optional] [default to undefined]
**excerpt** | **string** |  | [optional] [default to undefined]
**readingMinutes** | **number** |  | [optional] [default to undefined]
**metaTitle** | **string** |  | [optional] [default to undefined]
**metaDescription** | **string** |  | [optional] [default to undefined]
**canonicalUrl** | **string** |  | [optional] [default to undefined]
**seoKeywords** | **Array&lt;string&gt;** |  | [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**hreflangs** | [**Array&lt;HreflangAlternateResponse&gt;**](HreflangAlternateResponse.md) |  | [default to undefined]
**authors** | [**Array&lt;PostAuthorResponse&gt;**](PostAuthorResponse.md) |  | [default to undefined]
**firstPublishedAt** | **string** |  | [optional] [default to undefined]
**lastPublishedAt** | **string** |  | [optional] [default to undefined]
**sections** | [**Array&lt;VisibleSectionResponse&gt;**](VisibleSectionResponse.md) |  | [default to undefined]

## Example

```typescript
import { PublicPostResponse } from './api';

const instance: PublicPostResponse = {
    postId,
    slug,
    status,
    accessTier,
    locale,
    isTeaser,
    versionId,
    country,
    region,
    coverImageId,
    ogImageId,
    title,
    subtitle,
    excerpt,
    readingMinutes,
    metaTitle,
    metaDescription,
    canonicalUrl,
    seoKeywords,
    untranslated,
    hreflangs,
    authors,
    firstPublishedAt,
    lastPublishedAt,
    sections,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
