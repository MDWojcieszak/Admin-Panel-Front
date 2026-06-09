# HomeBlockResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**layoutId** | **string** |  | [default to undefined]
**type** | [**HomeBlockType**](HomeBlockType.md) |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**categoryId** | **string** |  | [optional] [default to undefined]
**imageId** | **string** |  | [optional] [default to undefined]
**limit** | **number** |  | [optional] [default to undefined]
**translations** | [**Array&lt;HomeBlockTranslationResponse&gt;**](HomeBlockTranslationResponse.md) |  | [default to undefined]
**posts** | [**Array&lt;HomeBlockPostResponse&gt;**](HomeBlockPostResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { HomeBlockResponse } from './api';

const instance: HomeBlockResponse = {
    id,
    layoutId,
    type,
    order,
    categoryId,
    imageId,
    limit,
    translations,
    posts,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
