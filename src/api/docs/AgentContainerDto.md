# AgentContainerDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**image** | **string** |  | [default to undefined]
**imageDigest** | **string** |  | [optional] [default to undefined]
**state** | **string** |  | [default to undefined]
**health** | **string** |  | [optional] [default to undefined]
**exitCode** | **number** |  | [optional] [default to undefined]
**labels** | **object** |  | [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { AgentContainerDto } from './api';

const instance: AgentContainerDto = {
    id,
    name,
    image,
    imageDigest,
    state,
    health,
    exitCode,
    labels,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
