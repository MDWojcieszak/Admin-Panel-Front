# PoiHourEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**weekday** | [**Weekday**](Weekday.md) |  | [default to undefined]
**opensAt** | **string** | HH:mm (validated server-side); ignored when closed&#x3D;true. | [optional] [default to undefined]
**closesAt** | **string** | HH:mm (validated server-side); ignored when closed&#x3D;true. | [optional] [default to undefined]
**closed** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { PoiHourEntryDto } from './api';

const instance: PoiHourEntryDto = {
    weekday,
    opensAt,
    closesAt,
    closed,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
