# ExportFileResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**relativePath** | **string** |  | [default to undefined]
**size** | **number** |  | [default to undefined]
**modifiedAt** | **string** |  | [default to undefined]
**width** | **number** |  | [optional] [default to undefined]
**height** | **number** |  | [optional] [default to undefined]
**format** | **string** |  | [default to undefined]
**publishable** | **boolean** |  | [default to undefined]
**reason** | **string** |  | [optional] [default to undefined]
**status** | [**ExportFileStatus**](ExportFileStatus.md) |  | [default to undefined]
**publication** | [**ExportPublicationResponse**](ExportPublicationResponse.md) |  | [optional] [default to undefined]
**thumbUrl** | **string** |  | [optional] [default to undefined]
**previewUrl** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ExportFileResponse } from './api';

const instance: ExportFileResponse = {
    key,
    name,
    relativePath,
    size,
    modifiedAt,
    width,
    height,
    format,
    publishable,
    reason,
    status,
    publication,
    thumbUrl,
    previewUrl,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
