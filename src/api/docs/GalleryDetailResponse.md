# GalleryDetailResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**status** | [**GalleryStatus**](GalleryStatus.md) |  | [default to undefined]
**sortOrder** | **number** |  | [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**coverUrl** | **string** |  | [optional] [default to undefined]
**imageCount** | **number** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**publishedAt** | **string** |  | [optional] [default to undefined]
**items** | [**Array&lt;GalleryImageItemResponse&gt;**](GalleryImageItemResponse.md) |  | [default to undefined]

## Example

```typescript
import { GalleryDetailResponse } from './api';

const instance: GalleryDetailResponse = {
    id,
    title,
    slug,
    description,
    status,
    sortOrder,
    coverImageId,
    coverUrl,
    imageCount,
    createdAt,
    updatedAt,
    publishedAt,
    items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
