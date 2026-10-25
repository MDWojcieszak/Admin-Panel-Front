# CreateShareLinkDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**label** | **string** |  | [optional] [default to undefined]
**access** | [**ShareLinkAccess**](ShareLinkAccess.md) |  | [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]
**password** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateShareLinkDto } from './api';

const instance: CreateShareLinkDto = {
    label,
    access,
    expiresAt,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
