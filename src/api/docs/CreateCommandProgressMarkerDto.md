# CreateCommandProgressMarkerDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**label** | **string** |  | [optional] [default to undefined]
**pattern** | **string** |  | [default to undefined]
**matchType** | [**CommandMatchType**](CommandMatchType.md) |  | [optional] [default to undefined]
**progress** | **number** |  | [optional] [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [optional] [default to undefined]
**level** | [**ProcessLogLevel**](ProcessLogLevel.md) |  | [optional] [default to undefined]
**order** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateCommandProgressMarkerDto } from './api';

const instance: CreateCommandProgressMarkerDto = {
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
