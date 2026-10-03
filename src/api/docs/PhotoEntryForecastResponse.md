# PhotoEntryForecastResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**photoEntryId** | **string** |  | [default to undefined]
**location** | [**PhotoEntryLocationResponse**](PhotoEntryLocationResponse.md) |  | [default to undefined]
**timezone** | **string** |  | [default to undefined]
**available** | **boolean** |  | [default to undefined]
**reason** | **string** |  | [optional] [default to undefined]
**availableFrom** | **string** |  | [optional] [default to undefined]
**fetchedAt** | **string** |  | [optional] [default to undefined]
**source** | **string** |  | [default to undefined]
**days** | [**Array&lt;ForecastDayResponse&gt;**](ForecastDayResponse.md) |  | [default to undefined]

## Example

```typescript
import { PhotoEntryForecastResponse } from './api';

const instance: PhotoEntryForecastResponse = {
    photoEntryId,
    location,
    timezone,
    available,
    reason,
    availableFrom,
    fetchedAt,
    source,
    days,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
