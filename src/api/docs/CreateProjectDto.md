# CreateProjectDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**type** | [**ProjectType**](ProjectType.md) |  | [optional] [default to undefined]
**status** | [**ProjectStatus**](ProjectStatus.md) |  | [optional] [default to undefined]
**key** | **string** |  | [optional] [default to undefined]
**startDate** | **string** |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**icon** | **string** |  | [optional] [default to undefined]
**viewersCanCheck** | **boolean** |  | [optional] [default to undefined]
**photoEntryId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateProjectDto } from './api';

const instance: CreateProjectDto = {
    title,
    description,
    type,
    status,
    key,
    startDate,
    dueDate,
    color,
    icon,
    viewersCanCheck,
    photoEntryId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
