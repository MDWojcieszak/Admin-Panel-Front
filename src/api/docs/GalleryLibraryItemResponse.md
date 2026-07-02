# GalleryLibraryItemResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**imageId** | **string** |  | [default to undefined]
**coverUrl** | **string** |  | [default to undefined]
**lowResUrl** | **string** |  | [default to undefined]
**width** | **number** |  | [optional] [default to undefined]
**height** | **number** |  | [optional] [default to undefined]
**orientation** | [**ImageOrientation**](ImageOrientation.md) |  | [optional] [default to undefined]
**processingStatus** | [**ImageProcessingStatus**](ImageProcessingStatus.md) |  | [default to undefined]
**usageCount** | **number** |  | [default to undefined]
**localization** | **string** |  | [optional] [default to undefined]
**exif** | [**ImageExifResponse**](ImageExifResponse.md) |  | [default to undefined]

## Example

```typescript
import { GalleryLibraryItemResponse } from './api';

const instance: GalleryLibraryItemResponse = {
    imageId,
    coverUrl,
    lowResUrl,
    width,
    height,
    orientation,
    processingStatus,
    usageCount,
    localization,
    exif,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
