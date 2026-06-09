# CreateCollectionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** | Unique slug. | [default to undefined]
**title** | **string** | Title for the initial locale. | [default to undefined]
**locale** | **string** | Initial locale. Defaults to the default locale. | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**country** | **string** | Scope country. | [optional] [default to undefined]
**region** | **string** | Scope region. | [optional] [default to undefined]
**isPublic** | **boolean** | Public (blog) vs internal (planning). Default true. | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateCollectionDto } from './api';

const instance: CreateCollectionDto = {
    slug,
    title,
    locale,
    description,
    country,
    region,
    isPublic,
    coverImageId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
