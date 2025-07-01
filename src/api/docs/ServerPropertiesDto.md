# ServerPropertiesDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**uptime** | **number** |  | [optional] [default to undefined]
**status** | [**ServerStatus**](ServerStatus.md) |  | [optional] [default to undefined]
**startedBy** | [**UserDto**](UserDto.md) |  | [optional] [default to undefined]
**cpuInfo** | [**CpuDto**](CpuDto.md) |  | [optional] [default to undefined]
**memoryInfo** | [**MemoryDto**](MemoryDto.md) |  | [optional] [default to undefined]
**disk** | [**Array&lt;DiskInfoDto&gt;**](DiskInfoDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ServerPropertiesDto } from './api';

const instance: ServerPropertiesDto = {
    uptime,
    status,
    startedBy,
    cpuInfo,
    memoryInfo,
    disk,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
