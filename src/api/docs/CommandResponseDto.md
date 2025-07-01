# CommandResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**value** | **string** |  | [default to undefined]
**status** | [**CommandStatus**](CommandStatus.md) |  | [default to undefined]
**runningProgress** | **number** |  | [optional] [default to undefined]
**type** | [**CommandType**](CommandType.md) |  | [default to undefined]

## Example

```typescript
import { CommandResponseDto } from './api';

const instance: CommandResponseDto = {
    id,
    name,
    value,
    status,
    runningProgress,
    type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
