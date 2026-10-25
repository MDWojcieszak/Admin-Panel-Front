# ProjectSummaryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**type** | [**ProjectType**](ProjectType.md) |  | [default to undefined]
**status** | [**ProjectStatus**](ProjectStatus.md) |  | [default to undefined]
**key** | **string** |  | [default to undefined]
**startDate** | **string** |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**icon** | **string** |  | [optional] [default to undefined]
**isInbox** | **boolean** |  | [default to undefined]
**isTemplate** | **boolean** |  | [default to undefined]
**viewersCanCheck** | **boolean** |  | [default to undefined]
**photoEntry** | [**ProjectPhotoEntryResponse**](ProjectPhotoEntryResponse.md) |  | [optional] [default to undefined]
**archivedAt** | **string** |  | [optional] [default to undefined]
**role** | [**ProjectRole**](ProjectRole.md) |  | [default to undefined]
**owner** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [default to undefined]
**memberCount** | **number** |  | [default to undefined]
**progress** | [**ProjectProgressResponse**](ProjectProgressResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ProjectSummaryResponse } from './api';

const instance: ProjectSummaryResponse = {
    id,
    title,
    description,
    type,
    status,
    key,
    startDate,
    dueDate,
    color,
    icon,
    isInbox,
    isTemplate,
    viewersCanCheck,
    photoEntry,
    archivedAt,
    role,
    owner,
    memberCount,
    progress,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
