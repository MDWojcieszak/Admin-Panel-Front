# OcrStructuredResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cleanedText** | **string** | Cleaned, human-readable text reconstructed from OCR | [default to undefined]
**header** | [**OcrStructuredHeaderDto**](OcrStructuredHeaderDto.md) | Document header fields | [default to undefined]
**items** | [**Array&lt;OcrStructuredItemDto&gt;**](OcrStructuredItemDto.md) | Detected line items | [default to undefined]
**totals** | [**OcrStructuredTotalsDto**](OcrStructuredTotalsDto.md) | Totals section | [default to undefined]
**warnings** | **Array&lt;string&gt;** | Non-fatal warnings the model produced while structuring | [optional] [default to undefined]

## Example

```typescript
import { OcrStructuredResponseDto } from './api';

const instance: OcrStructuredResponseDto = {
    cleanedText,
    header,
    items,
    totals,
    warnings,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
