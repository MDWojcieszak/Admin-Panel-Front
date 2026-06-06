# PatchPhotoEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**type** | [**PhotoEntryType**](PhotoEntryType.md) |  | [optional] [default to undefined]
**startDate** | **string** |  | [optional] [default to undefined]
**endDate** | **string** |  | [optional] [default to undefined]
**astroObjectIds** | **Array&lt;string&gt;** | ASTRO entries only. Replaces the linked objects; send an empty array to clear them (general astro session). Omit to leave links unchanged. Cannot be changed after folders are created. | [optional] [default to undefined]

## Example

```typescript
import { PatchPhotoEntryDto } from './api';

const instance: PatchPhotoEntryDto = {
    name,
    type,
    startDate,
    endDate,
    astroObjectIds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
