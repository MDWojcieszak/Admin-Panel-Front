# AttentionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**pastPlanned** | [**Array&lt;PastPlannedEntryResponse&gt;**](PastPlannedEntryResponse.md) |  | [default to undefined]
**unsecuredOverdue** | [**Array&lt;PendingMediaEntryResponse&gt;**](PendingMediaEntryResponse.md) |  | [default to undefined]
**undeclared** | [**Array&lt;UndeclaredEntryResponse&gt;**](UndeclaredEntryResponse.md) |  | [default to undefined]
**wishlistDueSoon** | [**Array&lt;GearItemAdminResponse&gt;**](GearItemAdminResponse.md) |  | [default to undefined]
**openTodos** | [**Array&lt;OpenTodoResponse&gt;**](OpenTodoResponse.md) |  | [default to undefined]
**counts** | [**AttentionCountsResponse**](AttentionCountsResponse.md) |  | [default to undefined]

## Example

```typescript
import { AttentionResponse } from './api';

const instance: AttentionResponse = {
    pastPlanned,
    unsecuredOverdue,
    undeclared,
    wishlistDueSoon,
    openTodos,
    counts,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
