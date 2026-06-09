# CreateGrantDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userId** | **string** |  | [default to undefined]
**tier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]
**source** | [**AccessGrantSource**](AccessGrantSource.md) |  | [optional] [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]
**reference** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateGrantDto } from './api';

const instance: CreateGrantDto = {
    userId,
    tier,
    source,
    expiresAt,
    reference,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
