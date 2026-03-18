# GenerateTokenDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**expires** | **boolean** | Should the token expire? | [optional] [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]
**type** | [**ApiKeyType**](ApiKeyType.md) |  | [default to undefined]

## Example

```typescript
import { GenerateTokenDto } from './api';

const instance: GenerateTokenDto = {
    name,
    expires,
    expiresAt,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
