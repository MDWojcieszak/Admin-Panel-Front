# RegisterDeviceDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**installationId** | **string** | Stable per-installation id. | [default to undefined]
**platform** | [**AppPlatform**](AppPlatform.md) |  | [default to undefined]
**name** | **string** | Friendly device name. | [optional] [default to undefined]

## Example

```typescript
import { RegisterDeviceDto } from './api';

const instance: RegisterDeviceDto = {
    installationId,
    platform,
    name,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
