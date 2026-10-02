# AgentHeartbeatDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **string** |  | [optional] [default to undefined]
**uptimeSeconds** | **number** |  | [optional] [default to undefined]
**containerCount** | **number** |  | [optional] [default to undefined]
**dockerReachable** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { AgentHeartbeatDto } from './api';

const instance: AgentHeartbeatDto = {
    version,
    uptimeSeconds,
    containerCount,
    dockerReachable,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
