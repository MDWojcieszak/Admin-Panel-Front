# PublicCollectionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**items** | [**Array&lt;PublicCollectionItemResponse&gt;**](PublicCollectionItemResponse.md) |  | [default to undefined]

## Example

```typescript
import { PublicCollectionResponse } from './api';

const instance: PublicCollectionResponse = {
    id,
    slug,
    country,
    region,
    coverImageId,
    title,
    description,
    untranslated,
    items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
