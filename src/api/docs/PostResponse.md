# PostResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**status** | [**BlogPostStatus**](BlogPostStatus.md) |  | [default to undefined]
**accessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**order** | **number** |  | [optional] [default to undefined]
**viewCount** | **number** |  | [default to undefined]
**likeCount** | **number** |  | [default to undefined]
**helpfulCount** | **number** |  | [default to undefined]
**notHelpfulCount** | **number** |  | [default to undefined]
**createdById** | **string** |  | [default to undefined]
**seriesId** | **string** |  | [optional] [default to undefined]
**seriesOrder** | **number** |  | [optional] [default to undefined]
**draftVersionId** | **string** |  | [optional] [default to undefined]
**publishedVersionId** | **string** |  | [optional] [default to undefined]
**hasUnpublishedChanges** | **boolean** |  | [default to undefined]
**firstPublishedAt** | **string** |  | [optional] [default to undefined]
**lastPublishedAt** | **string** |  | [optional] [default to undefined]
**scheduledFor** | **string** |  | [optional] [default to undefined]
**archivedAt** | **string** |  | [optional] [default to undefined]
**authors** | [**Array&lt;PostAuthorResponse&gt;**](PostAuthorResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { PostResponse } from './api';

const instance: PostResponse = {
    id,
    slug,
    status,
    accessTier,
    order,
    viewCount,
    likeCount,
    helpfulCount,
    notHelpfulCount,
    createdById,
    seriesId,
    seriesOrder,
    draftVersionId,
    publishedVersionId,
    hasUnpublishedChanges,
    firstPublishedAt,
    lastPublishedAt,
    scheduledFor,
    archivedAt,
    authors,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
