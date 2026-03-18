# CreatePhotoEntryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**type** | [**PhotoEntryType**](PhotoEntryType.md) |  | [default to undefined]
**status** | [**PhotoEntryStatus**](PhotoEntryStatus.md) |  | [default to undefined]
**startDate** | **string** |  | [optional] [default to undefined]
**endDate** | **string** |  | [optional] [default to undefined]
**astroObjectIds** | **Array&lt;string&gt;** |  | [optional] [default to undefined]

## Example

```typescript
import { CreatePhotoEntryDto } from './api';

const instance: CreatePhotoEntryDto = {
    name,
    type,
    status,
    startDate,
    endDate,
    astroObjectIds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
