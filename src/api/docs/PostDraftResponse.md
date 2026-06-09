# PostDraftResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**postId** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**status** | [**BlogPostStatus**](BlogPostStatus.md) |  | [default to undefined]
**accessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**locale** | **string** |  | [default to undefined]
**hasUnpublishedChanges** | **boolean** |  | [default to undefined]
**versionId** | **string** |  | [default to undefined]
**versionNumber** | **number** |  | [default to undefined]
**versionState** | [**VersionState**](VersionState.md) |  | [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**ogImageId** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**subtitle** | **string** |  | [optional] [default to undefined]
**excerpt** | **string** |  | [optional] [default to undefined]
**seoKeywords** | **Array&lt;string&gt;** |  | [default to undefined]
**metaTitle** | **string** |  | [optional] [default to undefined]
**metaDescription** | **string** |  | [optional] [default to undefined]
**canonicalUrl** | **string** |  | [optional] [default to undefined]
**wordCount** | **number** |  | [optional] [default to undefined]
**readingMinutes** | **number** |  | [optional] [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**sections** | [**Array&lt;ResolvedSectionResponse&gt;**](ResolvedSectionResponse.md) |  | [default to undefined]

## Example

```typescript
import { PostDraftResponse } from './api';

const instance: PostDraftResponse = {
    postId,
    slug,
    status,
    accessTier,
    locale,
    hasUnpublishedChanges,
    versionId,
    versionNumber,
    versionState,
    country,
    region,
    coverImageId,
    ogImageId,
    title,
    subtitle,
    excerpt,
    seoKeywords,
    metaTitle,
    metaDescription,
    canonicalUrl,
    wordCount,
    readingMinutes,
    untranslated,
    sections,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
