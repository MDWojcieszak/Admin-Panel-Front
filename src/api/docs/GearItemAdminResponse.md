# GearItemAdminResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**category** | [**GearCategory**](GearCategory.md) |  | [default to undefined]
**brand** | **string** |  | [default to undefined]
**model** | **string** |  | [default to undefined]
**ownership** | [**GearOwnership**](GearOwnership.md) |  | [default to undefined]
**mediaSource** | [**GearMediaSource**](GearMediaSource.md) |  | [default to undefined]
**systemId** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**coverUrl** | **string** |  | [optional] [default to undefined]
**lowResUrl** | **string** |  | [optional] [default to undefined]
**thumbUrl** | **string** |  | [optional] [default to undefined]
**order** | **number** |  | [default to undefined]
**visible** | **boolean** |  | [default to undefined]
**acquiredAt** | **string** |  | [optional] [default to undefined]
**retiredAt** | **string** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**estimatedPrice** | **number** |  | [optional] [default to undefined]
**purchaseUrl** | **string** |  | [optional] [default to undefined]
**neededBy** | **string** |  | [optional] [default to undefined]
**neededFor** | [**GearEntryRefResponse**](GearEntryRefResponse.md) |  | [optional] [default to undefined]
**missedFor** | [**Array&lt;GearEntryRefResponse&gt;**](GearEntryRefResponse.md) |  | [default to undefined]

## Example

```typescript
import { GearItemAdminResponse } from './api';

const instance: GearItemAdminResponse = {
    id,
    category,
    brand,
    model,
    ownership,
    mediaSource,
    systemId,
    description,
    coverUrl,
    lowResUrl,
    thumbUrl,
    order,
    visible,
    acquiredAt,
    retiredAt,
    priority,
    estimatedPrice,
    purchaseUrl,
    neededBy,
    neededFor,
    missedFor,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
