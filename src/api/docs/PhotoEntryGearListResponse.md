# PhotoEntryGearListResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**photoEntryId** | **string** |  | [default to undefined]
**status** | [**PhotoEntryStatus**](PhotoEntryStatus.md) |  | [default to undefined]
**phase** | [**EntryGearPhase**](EntryGearPhase.md) |  | [default to undefined]
**gearConfirmedAt** | **string** |  | [optional] [default to undefined]
**needsGearConfirmation** | **boolean** |  | [default to undefined]
**mediaSecured** | **boolean** |  | [optional] [default to undefined]
**items** | [**Array&lt;PhotoEntryGearItemResponse&gt;**](PhotoEntryGearItemResponse.md) |  | [default to undefined]

## Example

```typescript
import { PhotoEntryGearListResponse } from './api';

const instance: PhotoEntryGearListResponse = {
    photoEntryId,
    status,
    phase,
    gearConfirmedAt,
    needsGearConfirmation,
    mediaSecured,
    items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
