# CreateCodeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **string** | Auto-generated when omitted; normalized. | [optional] [default to undefined]
**tier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]
**durationDays** | **number** | Access length in days after redemption; null &#x3D; unlimited. | [optional] [default to undefined]
**expiresAt** | **string** | Code usable until this instant. | [optional] [default to undefined]

## Example

```typescript
import { CreateCodeDto } from './api';

const instance: CreateCodeDto = {
    code,
    tier,
    durationDays,
    expiresAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
