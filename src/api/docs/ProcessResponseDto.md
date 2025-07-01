# ProcessResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**status** | [**ServerProcessStatus**](ServerProcessStatus.md) |  | [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**startedAt** | **string** |  | [default to undefined]
**stoppedAt** | **string** |  | [optional] [default to undefined]
**startedBy** | [**User**](User.md) |  | [optional] [default to undefined]
**category** | [**Category**](Category.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ProcessResponseDto } from './api';

const instance: ProcessResponseDto = {
    id,
    status,
    name,
    startedAt,
    stoppedAt,
    startedBy,
    category,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
