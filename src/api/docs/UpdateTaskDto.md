# UpdateTaskDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**statusId** | **string** |  | [optional] [default to undefined]
**priority** | [**TaskPriority**](TaskPriority.md) |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**reminderAt** | **string** |  | [optional] [default to undefined]
**repeat** | [**RepeatType**](RepeatType.md) |  | [optional] [default to undefined]
**quantity** | **number** |  | [optional] [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**assigneeId** | **string** |  | [optional] [default to undefined]
**parentTaskId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { UpdateTaskDto } from './api';

const instance: UpdateTaskDto = {
    title,
    notes,
    statusId,
    priority,
    dueDate,
    reminderAt,
    repeat,
    quantity,
    unit,
    assigneeId,
    parentTaskId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
