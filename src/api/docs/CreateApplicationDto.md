# CreateApplicationDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** |  | [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tier** | [**ApplicationTier**](ApplicationTier.md) |  | [optional] [default to undefined]
**sourceType** | [**AppSourceType**](AppSourceType.md) |  | [optional] [default to undefined]
**image** | **string** |  | [optional] [default to undefined]
**gitRepoId** | **string** |  | [optional] [default to undefined]
**serverCategoryId** | **string** |  | [default to undefined]

## Example

```typescript
import { CreateApplicationDto } from './api';

const instance: CreateApplicationDto = {
    slug,
    displayName,
    description,
    tier,
    sourceType,
    image,
    gitRepoId,
    serverCategoryId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
