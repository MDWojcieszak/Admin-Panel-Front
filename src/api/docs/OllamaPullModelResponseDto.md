# OllamaPullModelResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** | Current status of the model pull process | [optional] [default to undefined]
**model** | **string** | Name of the model being pulled | [optional] [default to undefined]
**digest** | **string** | Unique digest (hash) of the pulled model | [optional] [default to undefined]
**total** | **number** | Total size of the model to be downloaded in bytes | [optional] [default to undefined]
**completed** | **number** | Number of bytes already downloaded | [optional] [default to undefined]
**error** | **string** | Error message if the pull process failed | [optional] [default to undefined]

## Example

```typescript
import { OllamaPullModelResponseDto } from './api';

const instance: OllamaPullModelResponseDto = {
    status,
    model,
    digest,
    total,
    completed,
    error,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
