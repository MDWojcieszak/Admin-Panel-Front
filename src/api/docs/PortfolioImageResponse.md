# PortfolioImageResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**imageId** | **string** |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**role** | [**GalleryImageRole**](GalleryImageRole.md) |  | [default to undefined]
**coverUrl** | **string** |  | [default to undefined]
**lowResUrl** | **string** |  | [default to undefined]
**width** | **number** |  | [optional] [default to undefined]
**height** | **number** |  | [optional] [default to undefined]
**orientation** | [**ImageOrientation**](ImageOrientation.md) |  | [optional] [default to undefined]
**localization** | **string** |  | [optional] [default to undefined]
**exif** | [**ImageExifResponse**](ImageExifResponse.md) |  | [default to undefined]

## Example

```typescript
import { PortfolioImageResponse } from './api';

const instance: PortfolioImageResponse = {
    imageId,
    order,
    role,
    coverUrl,
    lowResUrl,
    width,
    height,
    orientation,
    localization,
    exif,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
