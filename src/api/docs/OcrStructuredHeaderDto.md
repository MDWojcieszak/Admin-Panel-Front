# OcrStructuredHeaderDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**sellerName** | **string** | Seller/vendor name | [optional] [default to undefined]
**sellerTaxId** | **string** | Seller tax id (e.g., NIP/VATIN) | [optional] [default to undefined]
**date** | **string** | Document date (ISO-8601 if possible) | [optional] [default to undefined]
**documentNumber** | **string** | Document number (invoice no., receipt id, etc.) | [optional] [default to undefined]
**buyerName** | **string** | Buyer name if present | [optional] [default to undefined]
**buyerTaxId** | **string** | Buyer tax id if present | [optional] [default to undefined]

## Example

```typescript
import { OcrStructuredHeaderDto } from './api';

const instance: OcrStructuredHeaderDto = {
    sellerName,
    sellerTaxId,
    date,
    documentNumber,
    buyerName,
    buyerTaxId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
