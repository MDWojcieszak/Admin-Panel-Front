# ReleaseResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**version** | **string** |  | [optional] [default to undefined]
**digest** | **string** |  | [optional] [default to undefined]
**commit** | **string** |  | [optional] [default to undefined]
**status** | [**ReleaseStatus**](ReleaseStatus.md) |  | [default to undefined]
**trigger** | [**ReleaseTrigger**](ReleaseTrigger.md) |  | [default to undefined]
**failureReason** | **string** |  | [optional] [default to undefined]
**homelabCommit** | **string** |  | [optional] [default to undefined]
**processId** | **string** |  | [optional] [default to undefined]
**triggeredBy** | [**ReleaseActorResponse**](ReleaseActorResponse.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**deployedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ReleaseResponse } from './api';

const instance: ReleaseResponse = {
    id,
    version,
    digest,
    commit,
    status,
    trigger,
    failureReason,
    homelabCommit,
    processId,
    triggeredBy,
    createdAt,
    deployedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
