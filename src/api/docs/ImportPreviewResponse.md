# ImportPreviewResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**serviceName** | **string** |  | [default to undefined]
**image** | **string** |  | [optional] [default to undefined]
**spec** | **object** |  | [default to undefined]
**env** | [**Array&lt;ImportedEnvResponse&gt;**](ImportedEnvResponse.md) |  | [default to undefined]
**warnings** | **Array&lt;string&gt;** |  | [default to undefined]
**currentCompose** | **string** |  | [default to undefined]
**secretKeysToFill** | **Array&lt;string&gt;** |  | [default to undefined]
**recommended** | **boolean** |  | [default to undefined]

## Example

```typescript
import { ImportPreviewResponse } from './api';

const instance: ImportPreviewResponse = {
    serviceName,
    image,
    spec,
    env,
    warnings,
    currentCompose,
    secretKeysToFill,
    recommended,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
