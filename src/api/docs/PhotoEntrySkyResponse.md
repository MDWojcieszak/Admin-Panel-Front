# PhotoEntrySkyResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**photoEntryId** | **string** |  | [default to undefined]
**location** | [**PhotoEntryLocationResponse**](PhotoEntryLocationResponse.md) |  | [default to undefined]
**timezone** | **string** |  | [default to undefined]
**days** | [**Array&lt;SkyDayResponse&gt;**](SkyDayResponse.md) |  | [default to undefined]
**truncated** | **boolean** |  | [default to undefined]
**eclipses** | [**Array&lt;SkyEclipseResponse&gt;**](SkyEclipseResponse.md) |  | [default to undefined]

## Example

```typescript
import { PhotoEntrySkyResponse } from './api';

const instance: PhotoEntrySkyResponse = {
    photoEntryId,
    location,
    timezone,
    days,
    truncated,
    eclipses,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
