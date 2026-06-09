# SectionImageResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**imageId** | **string** |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**size** | [**BlogImageSize**](BlogImageSize.md) |  | [default to undefined]
**aspectRatio** | [**BlogAspectRatio**](BlogAspectRatio.md) |  | [default to undefined]
**focalX** | **number** |  | [optional] [default to undefined]
**focalY** | **number** |  | [optional] [default to undefined]
**overlayPosition** | [**BlogOverlayPosition**](BlogOverlayPosition.md) |  | [optional] [default to undefined]
**overlayTheme** | [**BlogOverlayTheme**](BlogOverlayTheme.md) |  | [optional] [default to undefined]
**overlayBackdrop** | [**BlogOverlayBackdrop**](BlogOverlayBackdrop.md) |  | [optional] [default to undefined]
**translations** | [**Array&lt;SectionImageTranslationResponse&gt;**](SectionImageTranslationResponse.md) |  | [default to undefined]

## Example

```typescript
import { SectionImageResponse } from './api';

const instance: SectionImageResponse = {
    id,
    imageId,
    order,
    size,
    aspectRatio,
    focalX,
    focalY,
    overlayPosition,
    overlayTheme,
    overlayBackdrop,
    translations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
