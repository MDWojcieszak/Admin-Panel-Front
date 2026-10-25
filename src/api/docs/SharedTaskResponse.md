# SharedTaskResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**key** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**statusId** | **string** |  | [default to undefined]
**quantity** | **number** |  | [optional] [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**completedAt** | **string** |  | [optional] [default to undefined]
**parentTaskId** | **string** |  | [optional] [default to undefined]
**checklist** | [**Array&lt;SharedChecklistItemResponse&gt;**](SharedChecklistItemResponse.md) |  | [default to undefined]

## Example

```typescript
import { SharedTaskResponse } from './api';

const instance: SharedTaskResponse = {
    id,
    key,
    title,
    notes,
    statusId,
    quantity,
    unit,
    dueDate,
    completedAt,
    parentTaskId,
    checklist,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
