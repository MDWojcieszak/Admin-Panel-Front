# DeviceAuthorizeDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**clientName** | **string** | Shown to the user on the approval screen | [default to undefined]
**platform** | [**IntegrationPlatform**](IntegrationPlatform.md) |  | [default to undefined]
**scopes** | **Array&lt;string&gt;** | Permission keys from the ACL catalog | [default to undefined]

## Example

```typescript
import { DeviceAuthorizeDto } from './api';

const instance: DeviceAuthorizeDto = {
    clientName,
    platform,
    scopes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
