# IntegrationTokenResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**platform** | [**IntegrationPlatform**](IntegrationPlatform.md) |  | [default to undefined]
**lastFour** | **string** |  | [default to undefined]
**scopes** | **Array&lt;string&gt;** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]
**lastUsedAt** | **string** |  | [optional] [default to undefined]
**revokedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { IntegrationTokenResponse } from './api';

const instance: IntegrationTokenResponse = {
    id,
    name,
    platform,
    lastFour,
    scopes,
    createdAt,
    expiresAt,
    lastUsedAt,
    revokedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
