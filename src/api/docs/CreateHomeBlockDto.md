# CreateHomeBlockDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | [**HomeBlockType**](HomeBlockType.md) |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**categoryId** | **string** | Required for CATEGORY_ROW; must be kind&#x3D;POST. | [optional] [default to undefined]
**imageId** | **string** |  | [optional] [default to undefined]
**limit** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateHomeBlockDto } from './api';

const instance: CreateHomeBlockDto = {
    type,
    order,
    categoryId,
    imageId,
    limit,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
