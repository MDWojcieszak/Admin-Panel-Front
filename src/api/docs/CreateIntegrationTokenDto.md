# CreateIntegrationTokenDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**platform** | [**IntegrationPlatform**](IntegrationPlatform.md) |  | [optional] [default to undefined]
**scopes** | **Array&lt;string&gt;** | Permission keys from the ACL catalog | [default to undefined]
**expires** | **boolean** | Defaults to true (one year). Set false for a non-expiring token. | [optional] [default to undefined]
**expiresAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateIntegrationTokenDto } from './api';

const instance: CreateIntegrationTokenDto = {
    name,
    platform,
    scopes,
    expires,
    expiresAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
