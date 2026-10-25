# DocumentLinkResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**project** | [**DocumentLinkProjectResponse**](DocumentLinkProjectResponse.md) |  | [default to undefined]
**task** | [**DocumentLinkTaskResponse**](DocumentLinkTaskResponse.md) |  | [optional] [default to undefined]
**bomItem** | [**DocumentLinkBomItemResponse**](DocumentLinkBomItemResponse.md) |  | [optional] [default to undefined]
**journalEntry** | [**DocumentLinkJournalEntryResponse**](DocumentLinkJournalEntryResponse.md) |  | [optional] [default to undefined]
**addedBy** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]

## Example

```typescript
import { DocumentLinkResponse } from './api';

const instance: DocumentLinkResponse = {
    id,
    project,
    task,
    bomItem,
    journalEntry,
    addedBy,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
