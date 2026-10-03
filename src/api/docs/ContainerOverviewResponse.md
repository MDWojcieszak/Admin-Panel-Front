# ContainerOverviewResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**stacks** | [**Array&lt;DiscoveredStackResponse&gt;**](DiscoveredStackResponse.md) |  | [default to undefined]
**receivedAt** | **string** |  | [optional] [default to undefined]
**known** | **boolean** |  | [default to undefined]
**agent** | [**AgentHealthResponse**](AgentHealthResponse.md) |  | [default to undefined]

## Example

```typescript
import { ContainerOverviewResponse } from './api';

const instance: ContainerOverviewResponse = {
    stacks,
    receivedAt,
    known,
    agent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
