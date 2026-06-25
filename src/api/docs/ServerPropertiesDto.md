# ServerPropertiesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uptime** | **number** |  | [optional] [default to undefined]
**status** | [**ServerStatus**](ServerStatus.md) |  | [optional] [default to undefined]
**statusChangedAt** | **string** | When &#x60;status&#x60; last changed — for wake progress/elapsed. | [optional] [default to undefined]
**lastSeenAt** | **string** |  | [optional] [default to undefined]
**isOnline** | **boolean** |  | [optional] [default to undefined]
**startedBy** | [**UserDto**](UserDto.md) |  | [optional] [default to undefined]
**cpuInfo** | [**CpuDto**](CpuDto.md) |  | [optional] [default to undefined]
**memoryInfo** | [**MemoryDto**](MemoryDto.md) |  | [optional] [default to undefined]
**diskInfo** | [**Array&lt;DiskInfoDto&gt;**](DiskInfoDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ServerPropertiesDto } from './api';

const instance: ServerPropertiesDto = {
    uptime,
    status,
    statusChangedAt,
    lastSeenAt,
    isOnline,
    startedBy,
    cpuInfo,
    memoryInfo,
    diskInfo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
