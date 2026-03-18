# OllamaModelResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Model tag/name as shown by Ollama | [default to undefined]
**model** | **string** | Full model identifier (often same as name) | [default to undefined]
**modified_at** | **string** | Last modification timestamp in ISO 8601 | [default to undefined]
**size** | **number** | Model size in bytes | [default to undefined]
**digest** | **string** | SHA256 digest of the model | [default to undefined]
**details** | [**OllamaModelDetailsResponseDto**](OllamaModelDetailsResponseDto.md) | Additional model metadata | [default to undefined]

## Example

```typescript
import { OllamaModelResponseDto } from './api';

const instance: OllamaModelResponseDto = {
    name,
    model,
    modified_at,
    size,
    digest,
    details,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
