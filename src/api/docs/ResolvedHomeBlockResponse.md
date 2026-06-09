# ResolvedHomeBlockResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**type** | [**HomeBlockType**](HomeBlockType.md) |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**imageId** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**body** | **string** |  | [optional] [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**posts** | [**Array&lt;PublicPostCardResponse&gt;**](PublicPostCardResponse.md) |  | [optional] [default to undefined]
**category** | [**ResolvedCategoryResponse**](ResolvedCategoryResponse.md) |  | [optional] [default to undefined]
**pois** | [**Array&lt;PoiPublicResponse&gt;**](PoiPublicResponse.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ResolvedHomeBlockResponse } from './api';

const instance: ResolvedHomeBlockResponse = {
    id,
    type,
    order,
    imageId,
    title,
    body,
    untranslated,
    posts,
    category,
    pois,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
