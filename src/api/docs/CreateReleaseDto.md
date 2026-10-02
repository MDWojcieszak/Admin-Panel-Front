# CreateReleaseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**composeHash** | **string** |  | [default to undefined]
**version** | **string** |  | [optional] [default to undefined]
**digest** | **string** |  | [optional] [default to undefined]
**trigger** | [**ReleaseTrigger**](ReleaseTrigger.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CreateReleaseDto } from './api';

const instance: CreateReleaseDto = {
    composeHash,
    version,
    digest,
    trigger,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
