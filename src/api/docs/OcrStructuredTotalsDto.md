# OcrStructuredTotalsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**subtotal** | **number** | Subtotal amount before taxes (if present) | [optional] [default to undefined]
**vatTotal** | **number** | Total VAT amount (if present) | [optional] [default to undefined]
**total** | **number** | Grand total amount | [optional] [default to undefined]
**currency** | **string** | Currency code inferred from the document | [optional] [default to undefined]

## Example

```typescript
import { OcrStructuredTotalsDto } from './api';

const instance: OcrStructuredTotalsDto = {
    subtotal,
    vatTotal,
    total,
    currency,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
