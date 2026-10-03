# DiscoveredStackResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**project** | **string** |  | [default to undefined]
**origin** | [**ContainerOrigin**](ContainerOrigin.md) |  | [default to undefined]
**slug** | **string** |  | [optional] [default to undefined]
**workingDir** | **string** |  | [optional] [default to undefined]
**configFiles** | **Array&lt;string&gt;** |  | [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [default to undefined]
**containers** | [**Array&lt;DiscoveredContainerResponse&gt;**](DiscoveredContainerResponse.md) |  | [default to undefined]
**allowedActions** | [**Array&lt;StackActionKind&gt;**](StackActionKind.md) |  | [default to undefined]

## Example

```typescript
import { DiscoveredStackResponse } from './api';

const instance: DiscoveredStackResponse = {
    project,
    origin,
    slug,
    workingDir,
    configFiles,
    runtimeStatus,
    containers,
    allowedActions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
