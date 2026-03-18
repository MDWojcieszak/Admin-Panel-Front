# OcrStructuredItemDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Item name as seen on the document | [default to undefined]
**quantity** | **number** | Quantity (if available) | [optional] [default to undefined]
**unit** | **string** | Unit of measure (e.g., kg, pcs) | [optional] [default to undefined]
**unitPrice** | **number** | Unit price (if available) | [optional] [default to undefined]
**lineTotal** | **number** | Line total (sum for this item) | [optional] [default to undefined]
**vatRate** | **number** | VAT rate in percent (if present) | [optional] [default to undefined]
**currency** | **string** | Currency code inferred from the document | [optional] [default to undefined]

## Example

```typescript
import { OcrStructuredItemDto } from './api';

const instance: OcrStructuredItemDto = {
    name,
    quantity,
    unit,
    unitPrice,
    lineTotal,
    vatRate,
    currency,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
