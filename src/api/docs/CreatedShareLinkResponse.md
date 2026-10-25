# CreatedShareLinkResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**label** | **string** |  | [optional] [default to undefined]
**access** | [**ShareLinkAccess**](ShareLinkAccess.md) |  | [default to undefined]
**hasPassword** | **boolean** |  | [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]
**revokedAt** | **string** |  | [optional] [default to undefined]
**lastUsedAt** | **string** |  | [optional] [default to undefined]
**openCount** | **number** |  | [default to undefined]
**active** | **boolean** |  | [default to undefined]
**createdBy** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**token** | **string** |  | [default to undefined]

## Example

```typescript
import { CreatedShareLinkResponse } from './api';

const instance: CreatedShareLinkResponse = {
    id,
    label,
    access,
    hasPassword,
    expiresAt,
    revokedAt,
    lastUsedAt,
    openCount,
    active,
    createdBy,
    createdAt,
    token,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
