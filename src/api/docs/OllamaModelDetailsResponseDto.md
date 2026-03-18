# OllamaModelDetailsResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**parent_model** | **string** | Parent model tag if present, otherwise empty string | [optional] [default to undefined]
**format** | **string** | On-disk format of the model | [default to undefined]
**family** | **string** | Primary model family | [default to undefined]
**families** | **Array&lt;string&gt;** | All families this model belongs to | [default to undefined]
**parameter_size** | **string** | Human-readable parameter size | [default to undefined]
**quantization_level** | **string** | Quantization level used for the model | [default to undefined]

## Example

```typescript
import { OllamaModelDetailsResponseDto } from './api';

const instance: OllamaModelDetailsResponseDto = {
    parent_model,
    format,
    family,
    families,
    parameter_size,
    quantization_level,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
