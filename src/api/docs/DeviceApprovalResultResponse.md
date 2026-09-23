# DeviceApprovalResultResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userCode** | **string** |  | [default to undefined]
**clientName** | **string** |  | [default to undefined]
**platform** | [**IntegrationPlatform**](IntegrationPlatform.md) |  | [default to undefined]
**scopes** | **Array&lt;string&gt;** |  | [default to undefined]
**status** | [**DeviceAuthorizationStatus**](DeviceAuthorizationStatus.md) |  | [default to undefined]

## Example

```typescript
import { DeviceApprovalResultResponse } from './api';

const instance: DeviceApprovalResultResponse = {
    userCode,
    clientName,
    platform,
    scopes,
    status,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
