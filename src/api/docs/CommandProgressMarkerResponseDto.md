# CommandProgressMarkerResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**commandId** | **string** |  | [default to undefined]
**label** | **string** |  | [optional] [default to undefined]
**pattern** | **string** |  | [default to undefined]
**matchType** | [**CommandMatchType**](CommandMatchType.md) |  | [default to undefined]
**progress** | **number** |  | [optional] [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [optional] [default to undefined]
**level** | [**ProcessLogLevel**](ProcessLogLevel.md) |  | [optional] [default to undefined]
**order** | **number** |  | [default to undefined]

## Example

```typescript
import { CommandProgressMarkerResponseDto } from './api';

const instance: CommandProgressMarkerResponseDto = {
    id,
    commandId,
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
