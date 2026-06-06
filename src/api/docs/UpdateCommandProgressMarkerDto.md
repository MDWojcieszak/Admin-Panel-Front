# UpdateCommandProgressMarkerDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**label** | **string** |  | [optional] [default to undefined]
**pattern** | **string** |  | [optional] [default to undefined]
**matchType** | [**CommandMatchType**](CommandMatchType.md) |  | [optional] [default to undefined]
**progress** | **number** |  | [optional] [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [optional] [default to undefined]
**level** | [**ProcessLogLevel**](ProcessLogLevel.md) |  | [optional] [default to undefined]
**order** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { UpdateCommandProgressMarkerDto } from './api';

const instance: UpdateCommandProgressMarkerDto = {
    label,
    pattern,
    matchType,
    progress,
    runtimeStatus,
    level,
    order,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
