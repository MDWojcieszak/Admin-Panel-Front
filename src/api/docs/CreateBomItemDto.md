# CreateBomItemDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**quantity** | **number** |  | [optional] [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**status** | [**BomStatus**](BomStatus.md) |  | [optional] [default to undefined]
**unitPrice** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**supplier** | **string** |  | [optional] [default to undefined]
**url** | **string** |  | [optional] [default to undefined]
**note** | **string** |  | [optional] [default to undefined]
**gearItemId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateBomItemDto } from './api';

const instance: CreateBomItemDto = {
    name,
    quantity,
    unit,
    status,
    unitPrice,
    currency,
    supplier,
    url,
    note,
    gearItemId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
