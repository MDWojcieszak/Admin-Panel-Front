# DashboardRecentProcessDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**status** | [**ServerProcessStatus**](ServerProcessStatus.md) |  | [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [default to undefined]
**progress** | **number** |  | [optional] [default to undefined]
**startedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { DashboardRecentProcessDto } from './api';

const instance: DashboardRecentProcessDto = {
    id,
    name,
    status,
    runtimeStatus,
    progress,
    startedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
