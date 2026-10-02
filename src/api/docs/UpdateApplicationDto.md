# UpdateApplicationDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**displayName** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tier** | [**ApplicationTier**](ApplicationTier.md) |  | [optional] [default to undefined]
**image** | **string** |  | [optional] [default to undefined]
**gitRepoId** | **string** |  | [optional] [default to undefined]
**webhookEnabled** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { UpdateApplicationDto } from './api';

const instance: UpdateApplicationDto = {
    displayName,
    description,
    tier,
    image,
    gitRepoId,
    webhookEnabled,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
