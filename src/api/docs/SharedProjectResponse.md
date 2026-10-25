# SharedProjectResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**type** | [**ProjectType**](ProjectType.md) |  | [default to undefined]
**status** | [**ProjectStatus**](ProjectStatus.md) |  | [default to undefined]
**key** | **string** |  | [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**sharedBy** | **string** |  | [optional] [default to undefined]
**label** | **string** |  | [optional] [default to undefined]
**access** | [**ShareLinkAccess**](ShareLinkAccess.md) |  | [default to undefined]
**progress** | [**ProjectProgressResponse**](ProjectProgressResponse.md) |  | [default to undefined]
**statuses** | [**Array&lt;SharedStatusResponse&gt;**](SharedStatusResponse.md) |  | [default to undefined]
**tasks** | [**Array&lt;SharedTaskResponse&gt;**](SharedTaskResponse.md) |  | [default to undefined]
**liveToken** | **string** |  | [default to undefined]

## Example

```typescript
import { SharedProjectResponse } from './api';

const instance: SharedProjectResponse = {
    title,
    description,
    type,
    status,
    key,
    color,
    dueDate,
    sharedBy,
    label,
    access,
    progress,
    statuses,
    tasks,
    liveToken,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
