# BomItemResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**quantity** | **number** |  | [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**status** | [**BomStatus**](BomStatus.md) |  | [default to undefined]
**unitPrice** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**cost** | **number** |  | [optional] [default to undefined]
**supplier** | **string** |  | [optional] [default to undefined]
**url** | **string** |  | [optional] [default to undefined]
**note** | **string** |  | [optional] [default to undefined]
**gearItem** | [**BomGearResponse**](BomGearResponse.md) |  | [optional] [default to undefined]
**order** | **number** |  | [default to undefined]
**commentCount** | **number** |  | [default to undefined]
**documentCount** | **number** |  | [default to undefined]

## Example

```typescript
import { BomItemResponse } from './api';

const instance: BomItemResponse = {
    id,
    name,
    quantity,
    unit,
    status,
    unitPrice,
    currency,
    cost,
    supplier,
    url,
    note,
    gearItem,
    order,
    commentCount,
    documentCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
