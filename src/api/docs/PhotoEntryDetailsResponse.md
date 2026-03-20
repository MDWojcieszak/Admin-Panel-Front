# PhotoEntryDetailsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**type** | [**PhotoEntryType**](PhotoEntryType.md) |  | [default to undefined]
**status** | [**PhotoEntryStatus**](PhotoEntryStatus.md) |  | [default to undefined]
**startDate** | **string** |  | [optional] [default to undefined]
**endDate** | **string** |  | [optional] [default to undefined]
**rootPath** | **string** |  | [optional] [default to undefined]
**foldersCreated** | **boolean** |  | [default to undefined]
**uploadStatus** | [**MediaStatus**](MediaStatus.md) |  | [default to undefined]
**foldersCreatedAt** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**astroObjects** | [**Array&lt;PhotoEntryAstroObjectResponse&gt;**](PhotoEntryAstroObjectResponse.md) |  | [default to undefined]
**astroObjectsCount** | **number** |  | [default to undefined]

## Example

```typescript
import { PhotoEntryDetailsResponse } from './api';

const instance: PhotoEntryDetailsResponse = {
    id,
    name,
    type,
    status,
    startDate,
    endDate,
    rootPath,
    foldersCreated,
    uploadStatus,
    foldersCreatedAt,
    createdAt,
    updatedAt,
    astroObjects,
    astroObjectsCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
