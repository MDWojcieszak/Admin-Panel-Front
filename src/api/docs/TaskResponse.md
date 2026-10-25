# TaskResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**key** | **string** |  | [default to undefined]
**number** | **number** |  | [default to undefined]
**project** | [**TaskProjectRefResponse**](TaskProjectRefResponse.md) |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**status** | [**TaskStatusRefResponse**](TaskStatusRefResponse.md) |  | [default to undefined]
**priority** | [**TaskPriority**](TaskPriority.md) |  | [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**reminderAt** | **string** |  | [optional] [default to undefined]
**repeat** | [**RepeatType**](RepeatType.md) |  | [default to undefined]
**quantity** | **number** |  | [optional] [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**order** | **number** |  | [default to undefined]
**completedAt** | **string** |  | [optional] [default to undefined]
**completedBy** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [optional] [default to undefined]
**assignee** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [optional] [default to undefined]
**createdBy** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [optional] [default to undefined]
**parentTaskId** | **string** |  | [optional] [default to undefined]
**checklist** | [**ChecklistCountResponse**](ChecklistCountResponse.md) |  | [default to undefined]
**subtaskCount** | **number** |  | [default to undefined]
**commentCount** | **number** |  | [default to undefined]
**documentCount** | **number** |  | [default to undefined]
**overdue** | **boolean** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { TaskResponse } from './api';

const instance: TaskResponse = {
    id,
    key,
    number,
    project,
    title,
    notes,
    status,
    priority,
    dueDate,
    reminderAt,
    repeat,
    quantity,
    unit,
    order,
    completedAt,
    completedBy,
    assignee,
    createdBy,
    parentTaskId,
    checklist,
    subtaskCount,
    commentCount,
    documentCount,
    overdue,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
