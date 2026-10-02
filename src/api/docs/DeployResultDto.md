# DeployResultDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**releaseId** | **string** |  | [default to undefined]
**success** | **boolean** |  | [default to undefined]
**healthy** | **boolean** |  | [default to undefined]
**digest** | **string** |  | [optional] [default to undefined]
**homelabCommit** | **string** |  | [optional] [default to undefined]
**failureReason** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { DeployResultDto } from './api';

const instance: DeployResultDto = {
    releaseId,
    success,
    healthy,
    digest,
    homelabCommit,
    failureReason,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
