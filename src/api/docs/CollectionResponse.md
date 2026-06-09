# CollectionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**isPublic** | **boolean** |  | [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**translations** | [**Array&lt;CollectionTranslationResponse&gt;**](CollectionTranslationResponse.md) |  | [default to undefined]
**items** | [**Array&lt;CollectionItemAdminResponse&gt;**](CollectionItemAdminResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { CollectionResponse } from './api';

const instance: CollectionResponse = {
    id,
    slug,
    country,
    region,
    isPublic,
    coverImageId,
    translations,
    items,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
