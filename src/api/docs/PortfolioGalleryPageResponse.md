# PortfolioGalleryPageResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**coverUrl** | **string** |  | [optional] [default to undefined]
**imageCount** | **number** |  | [default to undefined]
**items** | [**Array&lt;PortfolioImageResponse&gt;**](PortfolioImageResponse.md) |  | [default to undefined]
**contact** | [**PublicContactResponse**](PublicContactResponse.md) |  | [default to undefined]

## Example

```typescript
import { PortfolioGalleryPageResponse } from './api';

const instance: PortfolioGalleryPageResponse = {
    id,
    title,
    slug,
    description,
    coverUrl,
    imageCount,
    items,
    contact,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
