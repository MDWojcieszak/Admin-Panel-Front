# AgentHealthResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**online** | **boolean** |  | [default to undefined]
**lastSeenAt** | **string** |  | [optional] [default to undefined]
**version** | **string** |  | [optional] [default to undefined]
**uptimeSeconds** | **number** |  | [optional] [default to undefined]
**containerCount** | **number** |  | [optional] [default to undefined]
**dockerReachable** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { AgentHealthResponse } from './api';

const instance: AgentHealthResponse = {
    online,
    lastSeenAt,
    version,
    uptimeSeconds,
    containerCount,
    dockerReachable,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
